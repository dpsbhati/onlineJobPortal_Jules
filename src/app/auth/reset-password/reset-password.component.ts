import { CommonModule, NgIf } from '@angular/common';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule, NgForm, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FuseValidators } from '@app/core/helpers/validators';
import { AuthService } from '@app/core/services/auth.service';

import { finalize } from 'rxjs';
export type FuseAlertType = 'success' | 'error' | 'info' | 'warning';
@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  encapsulation: ViewEncapsulation.None,
  // animations: fuseAnimations,
  standalone: true,
  imports: [
    NgIf,
    // FuseAlertComponent,
    CommonModule,
    ReactiveFormsModule,
    // RouterLink
  ],
})
export class ResetPasswordComponent implements OnInit {
  isSubmitting = false;
  @ViewChild('resetPasswordNgForm') resetPasswordNgForm!: NgForm;

  alert: { type: FuseAlertType; message: string } = {
    type: 'success',
    message: '',
  };

  resetPasswordForm!: UntypedFormGroup;
  showAlert: boolean = false;

  /**
   * Constructor
   */
  constructor(
    private _authService: AuthService,
    private _formBuilder: UntypedFormBuilder,
  ) { }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    // Create the form
    this.resetPasswordForm = this._formBuilder.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      passwordConfirm: ['', Validators.required],
    },
      {
        validators: FuseValidators.mustMatch('password', 'passwordConfirm'),
      },
    );
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Reset password
   */
  resetPassword(): void {
    if (this.resetPasswordForm.invalid) {
      this.resetPasswordForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.resetPasswordForm.disable();
    this.showAlert = false;

    const password = this.resetPasswordForm.get('password')?.value;

    this._authService.resetPassword(password)
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
          this.resetPasswordForm.enable();
          this.resetPasswordNgForm.resetForm();
          this.showAlert = true;
        })
      )
      .subscribe(
        () => {
          this.alert = { type: 'success', message: 'Your password has been reset.' };
        },
        (error) => {
          this.alert = { type: 'error', message: error?.message || 'An error occurred. Please try again.' };
        }
      );
  }

}
