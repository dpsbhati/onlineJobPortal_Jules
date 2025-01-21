import { Component } from '@angular/core';
import { AuthService } from 'src/app/core/services/authentication/auth.service';
import { NotifyService } from 'src/app/core/services/notify.service';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { NgIf } from '@angular/common';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MaterialModule } from 'src/app/material.module';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
  selector: 'app-email-activation',
  imports: [NgIf, MatProgressSpinner, MaterialModule, FormsModule],
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
    private spinner: NgxSpinnerService,
    private _snackBar: MatSnackBar,
    private notify: NotifyService
  ) {}

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      this.token = params['token']; 
      if (this.token) {
        this.verifyEmail(this.token);
      } else {
        this.errorMessage = 'Invalid token.';
      }
    });
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
    this.spinner.show();
    this.loading = true;
    
    this.authService.verifyEmail({ token }).subscribe({
      next: (response: any) => {
        if (response.statusCode === 200) {
          this.successMessage = 'Email verified successfully!';
          this.notify.showSuccess(this.successMessage);
          setTimeout(() => {
            this.router.navigate(['authentication/login']);
          }, 2000);
        } else {
          this.errorMessage = 'Email verification failed. Please try again.';
          this.notify.showWarning(this.errorMessage);
        }
        this.spinner.hide();
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Email verification failed. Please try again.';
        this.showMessage(this.errorMessage ?? 'Email verification failed.');
        this.spinner.hide();
        this.loading = false;
      }
    });
  }

  resendVerificationEmail(): void {
    if (!this.email) {
      this.notify.showWarning('Please enter your email address');
      return;
    }

    this.spinner.show();
    this.loading = true;

    this.authService.resendVerificationEmail(this.email).subscribe({
      next: (response: any) => {
        if (response.statusCode === 200 || response.statusCode === 201) {
          this.notify.showSuccess('A new verification email has been sent. Please check your inbox.');
          this.email = ''; // Clear the email input
        } else {
          this.notify.showWarning(response.message || 'Failed to resend verification email');
        }
        this.spinner.hide();
        this.loading = false;
      },
      error: (error:any) => {
        this.errorMessage =(error.error?.message || 'Failed to resend verification email');
        this.spinner.hide();
        this.loading = false;
      }
    });
  }
}
