import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@app/core/services/auth.service';
import { NotifyService } from '@app/core/services/notify.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent {
  resetPasswordForm!: FormGroup;
  token: string = '';
  isSubmitting: boolean = false;
  alert: { type: string; message: string } | null = null;
  showAlert: boolean = false;

  constructor(
    private _route: ActivatedRoute,
    private _formBuilder: FormBuilder,
    private _authService: AuthService,
    private _notifyService: NotifyService,
    private _spinner: NgxSpinnerService,
    private _router: Router
  ) { }

  ngOnInit(): void {
    // Extract token from query parameters
    this.token = this._route.snapshot.queryParamMap.get('token') || '';

    if (!this.token) {
      this.alert = { type: 'error', message: 'Invalid or missing reset token.' };
      return;
    }

    // Initialize the form with password matching validation
    this.resetPasswordForm = this._formBuilder.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      passwordConfirm: ['', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  // Custom validator to check password matching
  private passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('passwordConfirm')?.value;

    return password === confirmPassword ? null : { passwordMismatch: true };
  }


  resetPassword(): void {
    // Validate the form before proceeding
    if (this.resetPasswordForm.invalid) {
      // Check for specific validation errors
      if (this.resetPasswordForm.hasError('passwordMismatch')) {
        this._notifyService.showWarning('Passwords do not match. Please ensure both passwords are the same.');
        return;
      } else if (this.resetPasswordForm.get('password')?.hasError('required')) {
        this._notifyService.showWarning('Password is required.');
        return;
      } else if (this.resetPasswordForm.get('password')?.hasError('minlength')) {
        this._notifyService.showWarning('Password must be at least 8 characters long.');
        return;
      } else if (this.resetPasswordForm.get('passwordConfirm')?.hasError('required')) {
        this._notifyService.showWarning('Confirm Password is required.');
        return;
      }
      this._notifyService.showWarning('Please fill in all required fields correctly.');
      return;
    }

    // Explicitly stop if custom validator detects a mismatch
    if (this.resetPasswordForm.errors?.['passwordMismatch']) {
      this._notifyService.showWarning('Passwords do not match. Please correct them.');
      return;
    }

    // Show spinner
    this._spinner.show();

    // Disable the form to prevent multiple submissions
    this.resetPasswordForm.disable();

    const password = this.resetPasswordForm.get('password')?.value;

    const payload = {
      token: this.token,
      newPassword: password,
    };

    this._authService.resetPassword(payload)
      .pipe(
        finalize(() => {
          this._spinner.hide();
          this.resetPasswordForm.enable();
        })
      )
      .subscribe({
        next: (response) => {
          if (response.statusCode === 200) {
            this._notifyService.showSuccess('Password reset successful. Please login.');
            this._router.navigate(['/auth/login']);
          } else {
            this._notifyService.showError(response.message || 'Failed to reset password. Please try again.');
          }
        },
        error: (error) => {
          console.error('Reset Password Error:', error);
          this._notifyService.showError(error.error?.message || 'An unexpected error occurred');
        }
      });
  }
}  
