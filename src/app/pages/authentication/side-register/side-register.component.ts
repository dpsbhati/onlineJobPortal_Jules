import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { AppAuthBrandingComponent } from '../../../layouts/full/vertical/sidebar/auth-branding.component';
import { AuthService } from 'src/app/core/services/authentication/auth.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { NgIf } from '@angular/common';
const PASSWORD_PATTERN = '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$';
const EMAIL_PATTERN = '^[a-z0-9._%+-]+@(?:[a-z0-9-]+\\.)[a-z]{2,}$';

@Component({
  selector: 'app-side-register',
  imports: [RouterModule, MaterialModule, FormsModule, ReactiveFormsModule, AppAuthBrandingComponent, NgIf, ToastrModule],
  templateUrl: './side-register.component.html',
})
export class AppSideRegisterComponent {
  showPassword: boolean = false;
  loading: boolean = false;
  errorMessage: string | null = null;
  registrationForm: FormGroup = new FormGroup({
    firstName: new FormControl('', [
      Validators.required,
      Validators.minLength(2),
      Validators.pattern('^[a-zA-Z]+$'),
      Validators.maxLength(50),
    ]),
    lastName: new FormControl('', [
      Validators.required,
      Validators.minLength(2),
      Validators.pattern('^[a-zA-Z]+$'),
      Validators.maxLength(50),
    ]),
    email: new FormControl('', [Validators.required, Validators.email, Validators.pattern(EMAIL_PATTERN)]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(6),
      Validators.pattern(PASSWORD_PATTERN)
    ]),
    role: new FormControl('applicant', Validators.required), // Default role
    career_type: new FormControl(null, Validators.required),
    isJobAlerts: new FormControl(false),
    isNewsLetters: new FormControl(false),
    isPrivacyPolicy:new FormControl(false)
  });

  constructor(
    private authService: AuthService,
    private router: Router,
    private loader: LoaderService,
    private toastr: ToastrService,
  ) { }

  togglePasswordVisibility(event: Event): void {
    event.preventDefault();
    this.showPassword = !this.showPassword;
  }

  trimFormValues() {
    const trimmedValues = { ...this.registrationForm.value };
    trimmedValues.firstName = trimmedValues.firstName.trim();
    trimmedValues.lastName = trimmedValues.lastName.trim();
    this.registrationForm.setValue(trimmedValues);
  }

  onSubmit(): void {
    this.loader.show();
    if (this.registrationForm.invalid) {
      this.loader.hide();
      return;
    }
    this.trimFormValues();
    this.loading = true;
    this.errorMessage = null;
    this.authService.registerUser(this.registrationForm.value).subscribe({
      next: (res: any) => {
        if (res.statusCode == 200 || res.statusCode == 201) {
          this.loader.hide();
          this.router.navigate(['/authentication/login']);
          this.toastr.success(res.message);
          this.loading = false;
        }
        else {
          this.errorMessage = res.message;
          this.toastr.warning(res.message)
          this.loader.hide();
          this.loading = false;
        }
      },
      error: (error: any) => {
        this.toastr.error = error.error?.message || 'Registration failed. Please try again.';
        this.loader.hide();
      }
    });
  }

  back(): void {
    this.router.navigate(['auth/login']);
  }
}
