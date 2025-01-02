import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { NotifyService } from '../../core/services/notify.service';
import { CommonModule, NgIf } from '@angular/common';
@Component({
  selector: 'app-new-user-registration',
  standalone: true,
  imports: [ReactiveFormsModule,
    NgIf,
    CommonModule,
    FormsModule,
  ],
  templateUrl: './new-user-registration.component.html',
  styleUrl: './new-user-registration.component.css',
})
export class NewUserRegistrationComponent {
  registrationForm: FormGroup;
  loading: boolean = false;
  errorMessage: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private notify: NotifyService
  ) {
    this.registrationForm = new FormGroup({
      firstName: new FormControl('', [
        Validators.required,
        Validators.minLength(2),
      ]),
      lastName: new FormControl('', [
        Validators.required,
        Validators.minLength(2),
      ]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
      ]),
      role: new FormControl('applicant', Validators.required), // Default role as 'applicant'
    });
  }

  onSubmit(): void {
    if (this.registrationForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = null;

    this.authService.registerUser(this.registrationForm.value).subscribe({
      next: (res: any) => {
        console.log(res);
        if (res.statusCode == 200 || res.statusCode == 201) {
          this.router.navigate(['auth/login']);
          this.notify.showSuccess(res.message);
          this.loading = false;
        }
      },
      error:(err:any)=>{
        this.loading = false;
        this.notify.showError(err);
      }
    });
  }
}
