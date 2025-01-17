import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";

import { NgxSpinnerService } from 'ngx-spinner';
import { finalize } from 'rxjs/operators';
import { AuthService } from "../../core/services/auth.service";
import { NotifyService } from "../../core/services/notify.service";
import { UserRole } from '../../core/enums/roles.enum';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  showPassword: boolean = false;
  loginForm!: FormGroup;

  constructor(
    private _formBuilder: FormBuilder,
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _authService: AuthService,
    private spinner: NgxSpinnerService,
    private notify: NotifyService
  ) { }
  ngOnInit(): void {
    this.initializeLoginForm();
    // Load remembered credentials after form initialization
    this.loadRememberedCredentials();
  }
  initializeLoginForm(): void {
    this.loginForm = this._formBuilder.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });

    // Listen to rememberMe changes
    this.loginForm.get('rememberMe')?.valueChanges.subscribe((checked: boolean) => {
      if (!checked) {
        this.clearSavedCredentials();
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
  
  async signIn(): Promise<void> {
    if (this.loginForm.invalid) {
      this.notify.showWarning('Please fill in all required fields correctly.');
      return;
    }

    this.spinner.show();

    try {
      const { email, password, rememberMe } = this.loginForm.value;
      const response = await this._authService.login({ email, password }).toPromise();
      
      if (response.statusCode === 200) {
        const userData = response.data.User;
        
        // Set token
        this._authService.accessToken = response.data.token;
        
        // Wait for user data to be set
        await this._authService.setCurrentUser(userData);

        // Handle remember me
        if (rememberMe) {
          this.saveCredentials(email);
        } else {
          this.clearSavedCredentials();
        }

        // Navigate after ensuring user data is set
        if (userData.role === UserRole.ADMIN) {
          await this._router.navigate(['/job-list'], { replaceUrl: true });
        } else {
          await this._router.navigate(['/job-list'], { replaceUrl: true });
        }
      } else {
        this.notify.showError(response.message);
      }
    } catch (error) {
      console.error('Login error:', error);
      this.notify.showError('Login failed. Please check your credentials and try again.');
    } finally {
      this.spinner.hide();
    }
  }

  // Remember Me functionality
  private saveCredentials(email: string): void {
    try {
      localStorage.setItem('rememberedEmail', email);
      localStorage.setItem('rememberMe', 'true');
    } catch (error) {
      console.error('Error saving credentials:', error);
    }
  }

  private clearSavedCredentials(): void {
    try {
      localStorage.removeItem('rememberedEmail');
      localStorage.removeItem('rememberMe');
    } catch (error) {
      console.error('Error clearing credentials:', error);
    }
  }

  private loadRememberedCredentials(): void {
    try {
      const rememberedEmail = localStorage.getItem('rememberedEmail');
      const rememberMe = localStorage.getItem('rememberMe') === 'true';

      if (rememberedEmail && rememberMe && this.loginForm) {
        this.loginForm.patchValue({
          email: rememberedEmail,
          rememberMe: true
        }, { emitEvent: false });
      }
    } catch (error) {
      console.error('Error loading remembered credentials:', error);
    }
  }

  navigateToForgotPassword(): void {
    this._router.navigate(['auth/forgot-password']);
  }

  navigateToNewuserRegistartion(): void {
    this._router.navigate(['/auth/new-user-registration']);
  }
}
