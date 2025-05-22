import { Component, OnInit } from '@angular/core';
import { CoreService } from 'src/app/services/core.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AppAuthBrandingComponent } from 'src/app/layouts/full/vertical/sidebar/auth-branding.component';
import { AuthService } from 'src/app/core/services/authentication/auth.service';
import { NotifyService } from 'src/app/core/services/notify.service';
import { finalize } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ToastrModule, ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-side-forgot-password',
  standalone: true,
  imports: [
    RouterModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    AppAuthBrandingComponent,
    CommonModule,
    MatProgressSpinnerModule,
    ToastrModule
  ],
  templateUrl: './side-forgot-password.component.html',
  styles: [`
    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    }
    .loading-text {
      color: white;
      margin-top: 16px;
    }
    .highlight-message {
      background-color: #E3F2FD;
      color: #1565C0;
      padding: 12px 16px;
      border-radius: 4px;
      border-left: 4px solid #1565C0;
      margin: 16px 0;
      display: inline-block;
      width: 100%;
    }
    ::ng-deep .success-snackbar {
      background: #E8F5E9 !important;
      color: #2E7D32 !important;
      border-radius: 8px !important;
    }
    ::ng-deep .error-snackbar {
      background: #FFEBEE !important;
      color: #C62828 !important;
      border-radius: 8px !important;
    }
    ::ng-deep .mat-mdc-snack-bar-action {
      color: inherit !important;
    }
  `]
})
export class SideForgotPasswordComponent implements OnInit {
  options = this.settings.getOptions();
  isLoading: boolean = false;
  form: FormGroup;

  constructor(
    private settings: CoreService,
    private _formBuilder: FormBuilder,
    private _router: Router,
    private _authService: AuthService,
    private _notifyService: NotifyService,
    private toastr : ToastrService,
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.form = this._formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get f() {
    return this.form.controls;
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      if (this.form.get('email')?.hasError('required')) {
        this.toastr.warning('Please enter your email address');
      } else if (this.form.get('email')?.hasError('email')) {
        this.toastr.warning('Please enter a valid email address');
      }
      return;
    }

    this.form.disable();
    this.isLoading = true;

    // Get email from form
    const email = this.form.get('email')?.value;

    // Call forgot password service
    this._authService.forgotPassword(email)
      .pipe(
        finalize(() => {
          this.form.enable();
          this.isLoading = false;
        })
      ).subscribe({
        next: (response) => {
          if (response.statusCode === 200) {
            this.toastr.success(response.message);
            this._router.navigate(['/authentication/login']);
          } else {
            this.toastr.warning(response.message);
          }
        },
        error: (error) => {
          this.toastr.error(error.error?.message || 'Enter a valid email');
        }
      });
  }

  navigateToLogin(): void {
    this._router.navigate(['/authentication/login']);
  }
  navigate () {
    this._router.navigate(['/authentication/login'])
  }
}
