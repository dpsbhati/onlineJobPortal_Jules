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
    if (this.forgotPasswordForm.invalid) {
      return;
    }
  
    this.forgotPasswordForm.disable();
    this.showAlert = false;
  
    this._authService.forgotPassword(this.forgotPasswordForm.get('email')?.value)
      .pipe(finalize(() => {
        this.forgotPasswordForm.enable();
        this.forgotPasswordForm.reset();
        this.showAlert = true;
      }))
      .subscribe(
        (response) => {
          this.alert = { type: 'success', message: 'Reset link sent to your email.' };
        },
        (error) => {
          this.alert = { type: 'error', message: 'Email not found!' };
        }
      );
  }
  
}

