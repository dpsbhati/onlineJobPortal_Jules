import { Component } from '@angular/core';
import { CoreService } from 'src/app/services/core.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AppAuthBrandingComponent } from 'src/app/layouts/full/vertical/sidebar/auth-branding.component';
import { AuthService } from 'src/app/core/services/authentication/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserRole } from 'src/app/core/enums/roles.enum';

@Component({
  selector: 'app-side-login',
  standalone: true,
  imports: [RouterModule, MaterialModule, FormsModule, ReactiveFormsModule, AppAuthBrandingComponent, CommonModule],
  templateUrl: './side-login.component.html',
})
export class AppSideLoginComponent {
  options = this.settings.getOptions();
  showPassword: boolean = false;
  isLoading: boolean = false;
  form: FormGroup;

  constructor(
    private settings: CoreService,
    private _router: Router,
    private _authService: AuthService,
    private _snackBar: MatSnackBar
  ) {
    this.initializeForm();
  }

  initializeForm(): void {
    this.form = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required]),
    });
  }

  get f() {
    return this.form.controls;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  private showMessage(message: string, isError: boolean = false): void {
    this._snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: isError ? ['error-snackbar'] : ['success-snackbar']
    });
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.showMessage('Please fill in all required fields correctly.', true);
      return;
    }

    this.isLoading = true;

    try {
      const { email, password } = this.form.value;
      const response = await this._authService.login({ email, password }).toPromise();
      
      if (response.statusCode === 200) {
        const userData = response.data.User;
        
        // Set token
        this._authService.accessToken = response.data.token;
        
        // Wait for user data to be set
        await this._authService.setCurrentUser(userData);

        this.showMessage('Login successful!');

        // Navigate based on role
        if (userData.role === UserRole.ADMIN) {
          await this._router.navigate(['/starter'], { replaceUrl: true });
        } else {
          await this._router.navigate(['/starter'], { replaceUrl: true });
        }
      } else {
        this.showMessage(response.message, true);
      }
    } catch (error) {
      console.error('Login error:', error);
      this.showMessage('Login failed. Please check your credentials and try again.', true);
    } finally {
      this.isLoading = false;
    }
  }

  navigateToForgotPassword(): void {
    this._router.navigate(['auth/forgot-password']);
  }

  navigateToNewuserRegistartion(): void {
    this._router.navigate(['/auth/new-user-registration']);
  }
}
