import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
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
  resetPasswordForm!: UntypedFormGroup;
  showAlert: boolean = false;
  alert: any;
  isSubmitting: any
  constructor(
    private _authService: AuthService,
    private _formBuilder: UntypedFormBuilder,
  ) {
  }
  ngOnInit(): void {
    // Create the form
    this.resetPasswordForm = this._formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      passwordConfirm: ['', Validators.required],
    });
  }

  resetPassword(): void {
    console.log('resetPassword method called');

    // Return if the form is invalid
    if (this.resetPasswordForm.invalid) {
      console.log('Form is invalid');
      return;
    }

    // Check if passwords match
    if (this.resetPasswordForm.get('password')?.value !== this.resetPasswordForm.get('passwordConfirm')?.value) {
      this.alert = {
        type: 'error',
        message: 'Passwords do not match.',
      };
      return;
    }

    // Disable the form
    this.resetPasswordForm.disable();
    this.isSubmitting = true;
    console.log('Form is valid, sending reset request...');

    // Hide the alert
    this.showAlert = false;

    // Get email and new password from the form
    const payload = {
      email: this.resetPasswordForm.get('email')?.value,
      newPassword: this.resetPasswordForm.get('password')?.value, // Ensure 'newPassword' is used
    };

    console.log('Payload:', payload); // Check the payload being sent

    // Send the request to the server
    this._authService.resetPassword(payload)
      .pipe(
        finalize(() => {
          // Re-enable the form
          this.resetPasswordForm.enable();
          this.resetPasswordForm.reset();
          this.isSubmitting = false;
          this.showAlert = true;
        }),
      )
      .subscribe(
        (response) => {
          console.log('API call successful', response);
          this.alert = {
            type: 'success',
            message: 'Your password has been reset.',
          };
        },
        (error) => {
          console.error('API call failed', error);
          this.alert = {
            type: 'error',
            message: 'Something went wrong, please try again.',
          };
        }
      );
  }


}

