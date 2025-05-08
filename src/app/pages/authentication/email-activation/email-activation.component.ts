import { Component } from '@angular/core';
import { AuthService } from 'src/app/core/services/authentication/auth.service';
import { NotifyService } from 'src/app/core/services/notify.service';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';

import { NgIf } from '@angular/common';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MaterialModule } from 'src/app/material.module';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToastrModule, ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-email-activation',
  imports: [NgIf, MatProgressSpinner, MaterialModule, FormsModule, ToastrModule],
  templateUrl: './email-activation.component.html',
  styleUrl: './email-activation.component.scss'
})
export class EmailActivationComponent {
  token: string | null = null;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  email: string = '';
  loading: boolean = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private router: Router,

    private _snackBar: MatSnackBar,
    private notify: NotifyService,
    private toastr : ToastrService,
  ) {}

  ngOnInit(): void {
    this.token = this.activatedRoute.snapshot.queryParams['token'];
      if (this.token) {
        this.verifyEmail(this.token);
      } else {
        this.errorMessage = 'Invalid token.';
      }
  }
  private showMessage(message: string, isError: boolean = false): void {
    this._snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: isError ? ['error-snackbar'] : ['success-snackbar']
    });
  }

  verifyEmail(token: string): void {

    this.loading = true;

    this.authService.verifyEmail({ token }).subscribe({
      next: (response: any) => {
        if (response.statusCode === 200) {
          this.successMessage = response.message;
          this.toastr.success(response.message);
          setTimeout(() => {
            this.router.navigate(['authentication/login']);
          }, 2000);
        } else {
          this.errorMessage = response.message;
          this.toastr.warning(response.message);
        }

        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Email verification failed. Please try again.';
        this.toastr.error(this.errorMessage ?? 'Email verification failed.');

        this.loading = false;
      }
    });
  }

  resendVerificationEmail(): void {
    if (!this.email) {
      this.toastr.warning('Please enter your email address');
      return;
    }

    this.loading = true;

    this.authService.resendVerificationEmail(this.email).subscribe({
      next: (response: any) => {
        if (response.statusCode === 200 || response.statusCode === 201) {
          this.toastr.success(response.message);
          this.email = ''; // Clear the email input
        } else {
          this.toastr.warning(response.message || 'Failed to resend verification email');
        }

        this.loading = false;
      },
      error: (error:any) => {
        this.toastr.error =(error.error?.message || 'Failed to resend verification email');

        this.loading = false;
      }
    });
  }
}
