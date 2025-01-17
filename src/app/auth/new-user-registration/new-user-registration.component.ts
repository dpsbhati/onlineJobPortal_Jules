import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotifyService } from '../../core/services/notify.service';
import { CommonModule, NgIf } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';

// Custom email validation pattern
const EMAIL_PATTERN = '^[a-z0-9._%+-]+@(?:[a-z0-9-]+\\.)[a-z]{2,}$';

// Strong password pattern
const PASSWORD_PATTERN = '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$';

@Component({
  selector: 'app-new-user-registration',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf,
    CommonModule,
    FormsModule,
  ],
  templateUrl: './new-user-registration.component.html',
  styleUrl: './new-user-registration.component.css',
})
export class NewUserRegistrationComponent {
  showPassword:boolean = false
  registrationForm: FormGroup;
  loading: boolean = false;
  errorMessage: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private notify: NotifyService,
    private spinner : NgxSpinnerService
  ) {
    this.registrationForm = new FormGroup({
      firstName: new FormControl('', [
        Validators.required,
        Validators.minLength(3), Validators.pattern('^[a-zA-Z]+$'), Validators.maxLength(20),
      ]),
      lastName: new FormControl('', [
        Validators.required,
        Validators.minLength(3), Validators.pattern('^[a-zA-Z]+$'), Validators.maxLength(20),
      ]),
      email: new FormControl('', [
        Validators.required, 
        Validators.pattern(EMAIL_PATTERN)
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(PASSWORD_PATTERN)
      ]),
      role: new FormControl('applicant', Validators.required), // Default role as 'applicant'
    });
  }
  trimFormValues() {
    const trimmedValues = { ...this.registrationForm.value };
    trimmedValues.firstName = trimmedValues.firstName.trim();
    trimmedValues.lastName = trimmedValues.lastName.trim();
    this.registrationForm.setValue(trimmedValues);
  }
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    this.spinner.show();
    if (this.registrationForm.invalid) {
      this.spinner.hide();
      return;
    }
    this.trimFormValues();
    this.loading = true;
    this.errorMessage = null;

    this.authService.registerUser(this.registrationForm.value).subscribe({
      next: (res: any) => {
        console.log(res);
        if (res.statusCode == 200 || res.statusCode == 201) {
          this.spinner.hide();
          this.router.navigate(['auth/login']);
          this.notify.showSuccess(res.message + ' Please check your email to verify your account.');
          this.loading = false;
        }
        else {
          this.errorMessage = res.message;
          this.notify.showWarning(res.message);
          this.spinner.hide();
          this.loading = false;
        }
      },
      error: (error: any) => {
        this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
        this.notify.showError(this.errorMessage);
        this.spinner.hide();
      }
    });
  }

  
  back(){
    this.router.navigate(['auth/login']);
  }
}
