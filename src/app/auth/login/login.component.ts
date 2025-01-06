import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";

import { NgxSpinnerService } from 'ngx-spinner';
import { finalize } from 'rxjs/operators';
import { AuthService } from "../../core/services/auth.service";
import { NotifyService } from "../../core/services/notify.service";

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
    this._authService.login(this.loginForm.value)
      .pipe(
        finalize(() => {
          this.spinner.hide(); // Hide the spinner
          this.loginForm.enable();
        })
      )
      .subscribe({
        next: (response) => {
          // console.log(response);
          if (response.statusCode === 200) {
            this._authService.accessToken = response.data.token;
            localStorage.setItem("user", JSON.stringify(response.data.User));
            this.notify.showSuccess('Login successful!');
            this._router.navigateByUrl('/job-list');
            // this._router.navigate(['/create-job-posting'])
            // this._router.navigateByUrl('/create-job-posting'); // Redirect to dashboard
          } else {
            this.notify.showError(response.message);
          }
        },
        error: (error) => {
          console.log(error);
          this.notify.showError('Login failed.');
        }
      });
  }

  navigateToForgotPassword(): void {
    this._router.navigate(['auth/forgot-password']);
  }

  navigateToNewuserRegistartion(): void {
    this._router.navigate(['/auth/new-user-registration']);
  }
}
