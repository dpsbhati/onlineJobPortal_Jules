import { CommonModule } from "@angular/common";
import { Component, inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { AuthService } from "@app/core/services/auth.service";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  private _formBuilder = inject(FormBuilder);
  private _router = inject(Router);
  private _activatedRoute = inject(ActivatedRoute);
  private _authService = inject(AuthService);

  ngOnInit(): void {
    this.loginForm = this._formBuilder.group({
      email: ['john.doe@example.com', [Validators.required, Validators.email]],
      password: ['securePassword123', [Validators.required, Validators.minLength(6)]]
    });
  }


  signIn(): void {
    console.log('signIn method called');
    if (this.loginForm.invalid) {
      console.log('Form is invalid');
      return;
    }

    this.loginForm.disable();
    console.log('Form is valid, attempting login');

    this._authService.login(this.loginForm.value).subscribe(
      (response) => {
        console.log('Login successful', response);
        const redirectURL =
          this._activatedRoute.snapshot.queryParamMap.get('redirectURL') ||
          '/signed-in-redirect';
        this._router.navigateByUrl(redirectURL);
      },
      (error) => {
        console.error('Login failed', error);
        this.loginForm.enable();

        // Display user-friendly error message
        if (error.status === 401) {
          alert('Invalid credentials. Please try again.');
        } else if (error.status === 0) {
          alert('Network error. Please check your internet connection.');
        } else {
          alert('An unexpected error occurred. Please try again later.');
        }
      }
    );
  }


  navigateToForgotPassword(): void {
    this._router.navigate(['auth/forgot-password']);
  }

  navigateToResetPassword(): void {
    this._router.navigate(['reset-password']);
  }
}
