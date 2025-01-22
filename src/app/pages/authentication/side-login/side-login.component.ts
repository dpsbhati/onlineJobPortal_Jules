import { Component } from '@angular/core';
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
    MatProgressSpinnerModule
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
export class AppSideLoginComponent {
  options = this.settings.getOptions();
  showPassword: boolean = false;
  isLoading: boolean = false;
  form: FormGroup;

  constructor(
    private settings: CoreService,
    private _router: Router,
    private _authService: AuthService,
    private _snackBar: MatSnackBar
  ) {
    this.initializeForm();
  }

  initializeForm(): void {
    this.form = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required]),
    });
  }

  get f() {
    return this.form.controls;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  private showMessage(message: string, isError: boolean = false): void {
    this._snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: isError ? ['error-snackbar'] : ['success-snackbar']
    });
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      if (this.form.get('email')?.hasError('required') || this.form.get('password')?.hasError('required')) {
        this.showMessage('Please fill in all required fields.', true);
      } else if (this.form.get('email')?.hasError('email')) {
        this.showMessage('Please enter a valid email address.', true);
      }
      return;
    }

    this.isLoading = true;

    try {
      const { email, password } = this.form.value;
      const response = await this._authService.login({ email, password }).toPromise();
      
      if (response && response.statusCode === 200) {
        const userData = response.data.User;
        
        // Set token
        this._authService.accessToken = response.data.token;
        
        // Wait for user data to be set
        await this._authService.setCurrentUser(userData);

        this.showMessage(response.message || 'Login successful!');

        // Navigate based on role
        if (userData.role === UserRole.ADMIN) {
          await this._router.navigate(['/starter'], { replaceUrl: true });
        } else {
          await this._router.navigate(['/starter'], { replaceUrl: true });
        }
      } else {
        // Handle error response
        this.showMessage(response?.message || 'Invalid credentials. Please try again.', true);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      // Handle error response from the server
      if (error.error && error.error.message) {
        this.showMessage(error.error.message, true);
      } else {
        this.showMessage('Unable to connect to the server. Please try again later.', true);
      }
    } finally {
      this.isLoading = false;
    }
  }

  navigateToForgotPassword(): void {
    this._router.navigate(['auth/forgot-password']);
  }

  navigateToNewuserRegistartion(): void {
    this._router.navigate(['/auth/new-user-registration']);
  }
}
