import { Component, OnInit } from '@angular/core';
import { CoreService } from 'src/app/services/core.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AppAuthBrandingComponent } from 'src/app/layouts/full/vertical/sidebar/auth-branding.component';
import { AuthService } from 'src/app/core/services/authentication/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserRole } from 'src/app/core/enums/roles.enum';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ToastrModule, ToastrService } from 'ngx-toastr';
interface RememberMeData {
  email: string;
  password: string;
  timestamp: number;
  remember: boolean;
}

@Component({
  selector: 'app-side-login',
  standalone: true,
  imports: [
    RouterModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    AppAuthBrandingComponent,
    CommonModule,
    MatProgressSpinnerModule,
    ToastrModule
  ],
  templateUrl: './side-login.component.html',
  styles: [`
    ::ng-deep .success-snackbar {
      background: #E8F5E9 !important;
      color: #2E7D32 !important;
      border-radius: 8px !important;
    }
    ::ng-deep .error-snackbar {
      background: #FFEBEE !important;
      color: #C62828 !important;
      border-radius: 8px !important;
    }
    ::ng-deep .mat-mdc-snack-bar-action {
      color: inherit !important;
    }
    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    }
    .loading-text {
      color: white;
      margin-top: 16px;
    }
  `]
})
export class AppSideLoginComponent implements OnInit {
  options = this.settings.getOptions();
  showPassword: boolean = false;
  isLoading: boolean = false;
  form: FormGroup;
  private readonly STORAGE_KEY = 'rememberMeData';
  private readonly EXPIRY_DAYS = 7;

  constructor(
    private settings: CoreService,
    private _router: Router,
    private _authService: AuthService,
    private _snackBar: MatSnackBar,
    private toastr: ToastrService
  ) {
    this.initializeForm();
  }

  ngOnInit() {
    this.loadSavedCredentials();
  }

  initializeForm(): void {
    this.form = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required]),
      rememberDevice: new FormControl(false)
    });

    // Subscribe to remember device changes
    this.form.get('rememberDevice')?.valueChanges.subscribe(checked => {
      // console.log('Remember device changed:', checked);
      this.handleRememberDeviceChange(checked);
    });
  }

  loadSavedCredentials(): void {
    // console.log('Loading saved credentials');
    const savedData = localStorage.getItem(this.STORAGE_KEY);

    if (savedData) {
      try {
        const data: RememberMeData = JSON.parse(savedData);
        const expiryTime = data.timestamp + (this.EXPIRY_DAYS * 24 * 60 * 60 * 1000);

        if (new Date().getTime() < expiryTime) {
          this.form.patchValue({
            email: data.email,
            password: data.password,
            rememberDevice: true
          });
          // console.log('Credentials loaded into form');
        } else {
          // console.log('Saved credentials expired');
          this.clearSavedCredentials();
        }
      } catch (error) {
        console.error('Error loading saved credentials:', error);
        this.clearSavedCredentials();
      }
    }
  }

  saveCredentials(): void {
    // console.log('Saving credentials');
    const rememberDevice = this.form.get('rememberDevice')?.value;

    if (rememberDevice) {
      const rememberMeData: RememberMeData = {
        email: this.form.get('email')?.value,
        password: this.form.get('password')?.value,
        timestamp: new Date().getTime(),
        remember:this.form.get('rememberDevice')?.value
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(rememberMeData));
      // console.log('Credentials saved to localStorage');
    } else {
      this.clearSavedCredentials();
    }
  }

  clearSavedCredentials(): void {
    // console.log('Clearing saved credentials');
    localStorage.removeItem(this.STORAGE_KEY);
  }

  get f() {
    return this.form.controls;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  showMessage(message: string, isError: boolean = false): void {
    this._snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: isError ? 'error-snackbar' : 'success-snackbar',
    });
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      if (this.form.get('email')?.hasError('required') || this.form.get('password')?.hasError('required')) {
        this.toastr.warning('Please fill in all required fields.');
      } else if (this.form.get('email')?.hasError('email')) {
        this.toastr.warning('Please enter a valid email address.');
      }
      return;
    }

    this.isLoading = true;

    try {
      const { email, password } = this.form.value;
      const response = await this._authService.login({ email, password }).toPromise();

      if (response && response.statusCode === 200) {
        // console.log('Login successful, handling remember me');
        this.saveCredentials(); // This will check rememberDevice value internally
        // this.toastr.success(response.message);
        // Set token and user data
        this._authService.accessToken = response.data.token;
        const userData = response.data.User;
        await this._authService.setCurrentUser(userData);

        // this.showMessage('Login successful!');

        // Navigate based on role
        if (userData.role === UserRole.ADMIN) {
          await this._router.navigate(['/applications'], { replaceUrl: true });
        } else if (userData.role === UserRole.APPLICANT) {
          await this._router.navigate(['/applicant'], { replaceUrl: true }); // Assuming /applicant-dashboard for Applicant
        }
      } else {
        this.toastr.warning(response?.message || 'Invalid credentials. Please try again.',);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.error && error.error.message) {
        this.toastr.error(error.error.message,);
      } else {
        this.toastr.warning('Unable to connect to the server. Please try again later.',);
      }
    } finally {
      this.isLoading = false;
    }
  }

  handleRememberDeviceChange(checked: boolean): void {
    if (checked) {
      this.saveCredentials();
    } else {
      this.clearSavedCredentials();
    }
  }

  navigateToForgotPassword(): void {
    this._router.navigate(['/auth/forgot-password']);
  }

  navigateToNewuserRegistartion(): void {
    this._router.navigate(['/auth/new-user-registration']);
  }
}
