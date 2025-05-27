import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { LoaderService } from 'src/app/core/services/loader.service';
import { AuthService } from 'src/app/core/services/authentication/auth.service';

@Component({
  selector: 'app-change-password',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    NgIf,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatCardModule
  ],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss'
})

export class ChangePasswordComponent {
  userProfileForm: any;
  apiError: string | null = null;
  userRole: string = '';
  passwordVisible = false;
  passwordVisible1 = false;
  passwordVisible2 = false;
  errorMessage: string | null = null;

  constructor(
    private router: Router,
    private loader: LoaderService,
    private toaster: ToastrService,
    private authService: AuthService,
  ) {
    this.userRole = localStorage.getItem('role') || '';
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.userProfileForm = new FormGroup({
      oldPassword: new FormControl('', [
        Validators.required,
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      ]),
      newPassword: new FormControl('', [
        Validators.required,
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      ]),
      confirmPassword: new FormControl('', [
        Validators.required,
        Validators.minLength(8)
      ])
    });
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }
  togglePasswordVisibility1() {
    this.passwordVisible1 = !this.passwordVisible1;
  }
  togglePasswordVisibility2() {
    this.passwordVisible2 = !this.passwordVisible2;
  }

  onSubmit(): void {
    this.loader.show();
    this.errorMessage = null;
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const email = user?.email || '';
    if (!email) {
      this.toaster.error('User email not found. Please login again.');
      this.loader.hide();
      return;
    }
    const formValue = this.userProfileForm.value;
    const payload = {
      email: email,
      oldPassword: formValue.oldPassword,
      newPassword: formValue.newPassword,
      confirmPassword: formValue.confirmPassword
    };

    this.authService.changepassword(payload).subscribe({
      next: (res: any) => {
        if (res.statusCode == 200 || res.statusCode == 201) {
          this.loader.hide();
          this.router.navigate(['/authentication/login']);
          this.toaster.success(res.message);
        } else {
          this.errorMessage = res.message;
          this.toaster.warning(res.message);
          this.loader.hide();
        }
      },
      error: (error: any) => {
        this.toaster.error(error.error?.message || 'Change password failed. Please try again.');
        this.loader.hide();
      }
    });
  }

  passwordMatchValidator() {
    if (this.userProfileForm.get('newPassword')?.value !== this.userProfileForm.get('confirmPassword')?.value) {
      this.userProfileForm.get('confirmPassword')?.setErrors({ mismatch: true });
    } else {
      this.userProfileForm.get('confirmPassword')?.setErrors(null);
    }
  }

  onInputChange() {
    this.passwordMatchValidator();
  }

  goBack(): void {
    this.router.navigate(['job-list']);
  }

  get f() {
    return this.userProfileForm.controls;
  }

}
