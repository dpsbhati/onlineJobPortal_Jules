import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthService } from "@app/core/services/auth.service";
import { NotifyService } from "@app/core/services/notify.service";
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
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
    this.loginForm = this._formBuilder.group({
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(6)]]
    });
  }


  signIn(): void {
    // Validate form before proceeding
    if (this.loginForm.invalid) {
      this.notify.showWarning('Please fill in all required fields correctly.');
      return;
    }

    // Show loading spinner
    this.spinner.show();

    // Disable form to prevent multiple submissions
    this.loginForm.disable();

    // Attempt login
    this._authService.login(this.loginForm.value).subscribe({
      next: (result) => {
        if (result.statusCode === 200) {
          // this.notify.showSuccess('Login successful!');

          // Redirect to dashboard
          setTimeout(() => {
            this._router.navigateByUrl('/dashboard');
          }, 1000);
        } else {
          // Handle other status codes
          this.notify.showError(result.message);
          this.loginForm.enable();
        }
      },
      // error: (error) => {
      //   // Re-enable form
      //   this.loginForm.enable();

      //   // Handle different error scenarios
      //   if (error.status === 401) {
      //     this.notify.showError('Invalid email or password. Please try again.');
      //   } else if (error.status === 0) {
      //     this.notify.showError('Network error. Please check your internet connection.');
      //   } else {
      //     this.notify.showError('An unexpected error occurred. Please try again later.');
      //   }
      // },
     
    });
  }


  navigateToForgotPassword(): void {
    this._router.navigate(['auth/forgot-password']);
  }

  // navigateToResetPassword(): void {
  //   this._router.navigate(['reset-password']);
  // }
  navigateToNewuserRegistartion(): void {
    this._router.navigate(['auth/new-user-registration']);
  }
}
