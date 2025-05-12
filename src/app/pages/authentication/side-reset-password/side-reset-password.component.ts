import { Component, OnInit } from '@angular/core';
import { CoreService } from 'src/app/services/core.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AppAuthBrandingComponent } from 'src/app/layouts/full/vertical/sidebar/auth-branding.component';
import { AuthService } from 'src/app/core/services/authentication/auth.service';
import { NotifyService } from 'src/app/core/services/notify.service';
import { finalize } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-side-reset-password',
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
  templateUrl: './side-reset-password.component.html',
  styles: [`
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
    .highlight-message {
      background-color: #E3F2FD;
      color: #1565C0;
      padding: 12px 16px;
      border-radius: 4px;
      border-left: 4px solid #1565C0;
      margin: 16px 0;
      display: inline-block;
      width: 100%;
    }
  `]
})
export class SideResetPasswordComponent implements OnInit {
  options = this.settings.getOptions();
  isLoading: boolean = false;
  form: FormGroup;
  token: string = '';
  hidePassword: boolean = true;
  hideConfirmPassword: boolean = true;

  constructor(
    private settings: CoreService,
    private _formBuilder: FormBuilder,
    private _router: Router,
    private _route: ActivatedRoute,
    private _authService: AuthService,
    private _notifyService: NotifyService,
    private toastr : ToastrService,
  ) {}

  ngOnInit(): void {
    // Get token from URL
    this._route.queryParams.subscribe(params => {
      this.token = params['token'];
      if (!this.token) {
        this._notifyService.showError('Invalid or expired reset token');
        this._router.navigate(['/authentication/login']);
      }
    });
    this.initializeForm();
  }

  initializeForm(): void {
    this.form = this._formBuilder.group({
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      ]],
      confirmPassword: ['', Validators.required]
    }, {
      // validators: this.passwordMatchValidator
    });
  }

  passwordMatchValidator() {
    const password = this.form.get('password')?.value;
    const confirmPassword = this.form.get('confirmPassword')?.value;
    // Manually trigger mismatch error if passwords don't match
    if (password !== confirmPassword) {
      this.form.get('confirmPassword')?.setErrors({ mismatch: true });
    } else {
      // Remove the mismatch error when passwords match
      this.form.get('confirmPassword')?.setErrors(null);
    }
  }

  // Called on input change to trigger validation
  onInputChange() {
    this.passwordMatchValidator();
  }

  get f() {
    return this.form.controls;
  }

  getPasswordErrorMessage() {
    if (this.f['password'].hasError('required')) {
      return 'Password is required';
    }
    if (this.f['password'].hasError('minlength')) {
      return 'Password must be at least 8 characters';
    }
    if (this.f['password'].hasError('pattern')) {
      return 'Password must be in valid format';
    }
    return '';
  }

  // async submit(): Promise<void> {
  //   if (this.form.invalid) {
  //     if (this.form.errors?.['mismatch']) {
  //       this._notifyService.showError('Passwords do not match');
  //     }
  //     return;
  //   }

  //   this.form.disable();
  //   this.isLoading = true;

  //   const password = this.form.get('password')?.value;

  //   // Call reset password service
  //   this._authService.resetPassword({ newPassword: password })
  //     .pipe(
  //       finalize(() => {
  //         this.form.enable();
  //         this.isLoading = false;
  //       })
  //     )
  //     .subscribe({
  //       next: (response) => {
  //         if (response.statusCode === 200) {
  //           this.toastr.success('Password reset successfully');
  //           this._router.navigate(['/authentication/login']);
  //         } else {
  //           this.toastr.warning(response.message);
  //         }
  //       },
  //       error: (error) => {
  //         console.error('Reset Password Error:', error);
  //         this.toastr.error(error.error?.message || 'Failed to reset password');
  //       }
  //     });
  // }
  async submit(): Promise<void> {
    if (!this.token) {
      this.toastr.error('Reset token missing');
      return;
    }

    if (this.form.invalid) {
      if (this.form.errors?.['mismatch']) {
        this._notifyService.showError('New password and confirm password do not match');
      }
      return;
    }

    this.form.disable();
    this.isLoading = true;

    const password = this.form.get('password')?.value;

    // ✅ Correct Payload with token
    const payload = {
      newPassword: password,
      token: this.token
    };

    this._authService.resetPassword(payload)
      .pipe(
        finalize(() => {
          this.form.enable();
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (response) => {
          if (response.statusCode === 200 || response.statusCode === 201) {
            this.toastr.success('Password reset successfully');
            this._router.navigate(['/authentication/login']);
          } else {
            this.toastr.warning(response.message || 'Something went wrong');
          }
        },
        error: (error) => {
          console.error('Reset Password Error:', error);
          this.toastr.error(error.error?.message || 'Failed to reset password');
        }
      });
  }

  navigateToLogin(): void {
    this._router.navigate(['/authentication/login']);
  }
}
