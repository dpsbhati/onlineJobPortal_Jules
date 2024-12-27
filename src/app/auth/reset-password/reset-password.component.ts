import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '@app/core/services/auth.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
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
    private _authService: AuthService
  ) { }

  ngOnInit(): void {
    // Extract token from query parameters
    this.token = this._route.snapshot.queryParamMap.get('token') || '';

    if (!this.token) {
      this.alert = { type: 'error', message: 'Invalid or missing reset token.' };
      return;
    }

    // Initialize the form
    this.resetPasswordForm = this._formBuilder.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      passwordConfirm: ['', Validators.required],
    });
  }

  resetPassword(): void {
    if (this.resetPasswordForm.invalid) {
      this.alert = { type: 'error', message: 'Please fill in all required fields correctly.' };
      return;
    }

    const password = this.resetPasswordForm.get('password')?.value;
    const confirmPassword = this.resetPasswordForm.get('passwordConfirm')?.value;

    if (password !== confirmPassword) {
      this.alert = { type: 'error', message: 'Passwords do not match.' };
      return;
    }

    this.isSubmitting = true;

    const payload = {
      token: this.token,
      newPassword: password,
    };

    this._authService
      .resetPassword(payload)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe(
        () => {
          this.alert = { type: 'success', message: 'Password reset successfully.' };
          this.resetPasswordForm.reset();
        },
        (error) => {
          this.alert = { type: 'error', message: error?.error?.message || 'Failed to reset password. Please try again.' };
        }
      );
  }



}

