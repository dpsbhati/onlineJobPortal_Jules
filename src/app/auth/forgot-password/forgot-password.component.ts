import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, UntypedFormGroup, Validators } from '@angular/forms';
import { AuthService } from '@app/core/services/auth.service';
import { NotifyService } from '@app/core/services/notify.service';
import { NgxSpinnerService } from 'ngx-spinner';
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
    private _authService: AuthService,
    private _notifyService: NotifyService,
    private _spinner: NgxSpinnerService
  ) {
  }

  ngOnInit(): void {
    // Create the form
    this.forgotPasswordForm = this._formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  // sendResetLink(): void {
  //   if (this.forgotPasswordForm.invalid) {
  //     return;
  //   }

  //   this.forgotPasswordForm.disable();
  //   this.showAlert = false;

  //   this._authService.forgotPassword(this.forgotPasswordForm.get('email')?.value)
  //     .pipe(finalize(() => {
  //       this.forgotPasswordForm.enable();
  //       this.forgotPasswordForm.reset();
  //       this.showAlert = true;
  //     }))
  //     .subscribe(
  //       (response) => {
  //         this.alert = { type: 'success', message: 'Reset link sent to your email.' };
  //       },
  //       (error) => {
  //         this.alert = { type: 'error', message: 'Email not found!' };
  //       }
  //     );
  // }

  sendResetLink(): void {
    // Validate form
    if (this.forgotPasswordForm.invalid) {
      this._notifyService.showWarning('Please enter a valid email address');
      return;
    }

    // Show spinner
    this._spinner.show();

    // Disable form to prevent multiple submissions
    this.forgotPasswordForm.disable();

    // Get email from form
    const email = this.forgotPasswordForm.get('email')?.value;

    // Call forgot password service
    this._authService.forgotPassword(email)
      .pipe(
        finalize(() => {
          this._spinner.hide();
          this.forgotPasswordForm.enable();
        })
      )
      .subscribe({
        next: (response) => {
          if (response.statusCode === 200) {
            this._notifyService.showSuccess(response.message);
          } else {
            this._notifyService.showError(response.message);
          }
        },
        error: (error) => {
          console.error('Forgot Password Error:', error);
          this._notifyService.showError(error.error?.message || 'An unexpected error occurred');
        }
      });
  }

}

