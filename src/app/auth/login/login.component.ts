import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";

import { NgxSpinnerService } from 'ngx-spinner';
import { finalize } from 'rxjs/operators';
import { AuthService } from "../../core/services/auth.service";
import { NotifyService } from "../../core/services/notify.service";
import { UserRole } from '../../core/enums/roles.enum';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  showPassword: boolean = false;
  loginForm!: FormGroup;

  constructor(
    private _formBuilder: FormBuilder,
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _authService: AuthService,
    private spinner: NgxSpinnerService,
    private notify: NotifyService
  ) { }
  ngOnInit(): void {
    this.initializeLoginForm();
   
    this.loadRememberedCredentials();
  }
  initializeLoginForm(): void {
    this.loginForm = this._formBuilder.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
  
  signIn(): void {
  
    // Validate form before proceeding
    if (this.loginForm.invalid) {
      this.notify.showWarning('Please fill in all required fields correctly.');
      return;
    }

    this.spinner.show();

    this._authService.login(this.loginForm.value)
      .pipe(
        finalize(() => this.spinner.hide())
      )
      .subscribe({
        next: (response) => {
          if (response.statusCode === 200) {
            this.spinner.hide()
            this._authService.accessToken = response.data.token;
            localStorage.setItem("user", JSON.stringify(response.data.User));

            if (this.loginForm.value.rememberMe) {
              this.saveCredentials(this.loginForm.value.email, this.loginForm.value.password);
            } else {
              this.clearSavedCredentials();
            }

            // Navigate based on role
            const user = response.data.User;
            if (user.role === 'ADMIN') {
              this._router.navigateByUrl('/job-list');
            } else {
              this._router.navigateByUrl('/job-list');
            }
            
          } else {
            this.spinner.hide()
            this.notify.showError(response.message);
          }
        },
        error: (error) => {
          this.spinner.hide()
          console.log(error);
          this.notify.showError('Login failed.');
        }
      });
  }

  // Remember Me functionality
  loadRememberedCredentials(): void {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    const rememberedPassword = localStorage.getItem('rememberedPassword');

    if (rememberedEmail && rememberedPassword) {
      this.loginForm.patchValue({
        email: rememberedEmail,
        password: rememberedPassword,
        rememberMe: true
      });
    }
  }

  saveCredentials(email: string, password: string): void {
    localStorage.setItem('rememberedEmail', email);
    localStorage.setItem('rememberedPassword', password);
  }

  clearSavedCredentials(): void {
    localStorage.removeItem('rememberedEmail');
    localStorage.removeItem('rememberedPassword');
  }

  navigateToForgotPassword(): void {
    this._router.navigate(['auth/forgot-password']);
  }

  navigateToNewuserRegistartion(): void {
    this._router.navigate(['/auth/new-user-registration']);
  }
}
