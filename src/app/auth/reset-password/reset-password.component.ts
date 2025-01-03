import { CommonModule, NgIf } from '@angular/common';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { NgForm, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { FuseValidators } from '../../core/helpers/validators';
import { ActivatedRoute, Router } from '@angular/router';
import { NotifyService } from '../../core/services/notify.service';
import { NgxSpinnerService } from 'ngx-spinner';
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
  token: string | null = null;

  /**
   * Constructor
   */
  constructor(
    private _authService: AuthService,
    private _formBuilder: UntypedFormBuilder,
    private _route: ActivatedRoute,
    private _notify: NotifyService,
    private spinner: NgxSpinnerService,
    private router: Router
  ) { }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    this.token = this._route.snapshot.queryParamMap.get('token');

    if (!this.token) {
      this.alert = { type: 'error', message: 'Reset token is missing. Please use the link from your email.' };
      this.showAlert = true;
      return;
    }
    // Create the form
    this.resetPasswordForm = this._formBuilder.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      passwordConfirm: ['', Validators.required],

    },
      {
        validators: FuseValidators.mustMatch('newPassword', 'passwordConfirm'),
      },
    );
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Reset password
   */
  // resetPassword(): void {
  //   if (this.resetPasswordForm.invalid) {
  //     this.resetPasswordForm.markAllAsTouched();
  //     return;
  //   }

  //   this.isSubmitting = true;
  //   this.resetPasswordForm.disable();
  //   this.showAlert = false;

  //   const password = this.resetPasswordForm.get('newPassword')?.value;
  //   this._authService.resetPassword(password)
  //     .pipe(
  //       finalize(() => {
  //         this.isSubmitting = false;
  //         this.resetPasswordForm.enable();
  //         this.resetPasswordNgForm.resetForm();
  //         this.showAlert = true;
  //       })
  //     ).subscribe({
  //       next: () => {
  //         this.alert = { type: 'success', message: 'Your password has been reset.' };
  //       },
  //       error: (error) => {
  //         this.alert = { type: 'error', message: error?.message || 'An error occurred. Please try again.' };
  //       }
  //     });
  // }
  resetPassword(): void {
    if (this.resetPasswordForm.invalid) {
      this.resetPasswordForm.markAllAsTouched();
      return;
    }

    if (!this.token) {
      this.alert = { type: 'error', message: 'Reset token is missing. Please use the link from your email.' };
      this.showAlert = true;
      return;
    }

    this.isSubmitting = true;
    this.spinner.show();
    this.resetPasswordForm.disable();
    this.showAlert = false;

    const payload = {
      newPassword: this.resetPasswordForm.get('newPassword')?.value,
      token: this.token, // Token from the route
    };

    this._authService.resetPassword(payload)
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
          this.spinner.hide();
          this.resetPasswordForm.enable();
          this.resetPasswordNgForm.resetForm();
          this.showAlert = true;
        })
      ).subscribe({
        next: (res: any) => {
          if (res.statusCode == 200) {
            this._notify.showSuccess(res.data.message)
            this.router.navigate(["/auth/login"]);
          } else {
            this._notify.showWarning(res.message);
          }

        },
        error: (error) => {
          this._notify.showError(error?.error?.message || "Something went wrong!!");
        },
      });
  }

}
