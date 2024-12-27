import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, UntypedFormGroup, Validators } from '@angular/forms';
import { AuthService } from '@app/core/services/auth.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  forgotPasswordForm!: UntypedFormGroup;
  showAlert: boolean = false;
  isSubmitted: boolean = false;
  alert: any;
  constructor(private _formBuilder: FormBuilder,
    private _authService: AuthService
  ) {
  }

  ngOnInit(): void {
    // Create the form
    this.forgotPasswordForm = this._formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  sendResetLink(): void {
    // Return if the form is invalid
    if (this.forgotPasswordForm.invalid) {
      return;
    }

    // Disable the form
    this.forgotPasswordForm.disable();

    // Hide the alert
    this.showAlert = false;

    // Forgot password
    this._authService.forgotPassword(this.forgotPasswordForm.get('email')?.value)
      .pipe(
        finalize(() => {
          // Re-enable the form
          this.forgotPasswordForm.enable();

          // Reset the form
          this.forgotPasswordForm.reset();

          // Show the alert
          this.showAlert = true;
        }),
      )
      .subscribe(
        (response) => {
          // Set the alert
          this.alert = {
            type: 'success',
            message: 'Password reset sent! You\'ll receive an email if you are registered on our system.',
          };
        },
        (error) => {
          // Set the alert
          this.alert = {
            type: 'error',
            message: 'Email does not found! Are you sure you are already a member?',
          };
        },
      );
  }
}

