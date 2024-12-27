import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '@app/core/services/auth.service';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { NotifyService } from '@app/core/services/notify.service';
@Component({
  selector: 'app-new-user-registration',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './new-user-registration.component.html',
  styleUrl: './new-user-registration.component.css'
})
export class NewUserRegistrationComponent {
  registrationForm: FormGroup;
  loading: boolean = false;
  errorMessage: string | null = null;

  constructor(private authService: AuthService, private router: Router) {
    this.registrationForm = new FormGroup({
      firstName: new FormControl('', [Validators.required, Validators.minLength(2)]),
      lastName: new FormControl('', [Validators.required, Validators.minLength(2)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      role: new FormControl('applicant', Validators.required) // Default role as 'applicant'
    });
  }

  onSubmit(): void {
    
    if (this.registrationForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = null;

    this.authService.registerUser(this.registrationForm.value).subscribe((res: any)=>{
      console.log(res);
      if(res.statusCode == 200 || res.statusCode == 201) {
        this.router.navigate(['auth/login']);
        this.loading = false;
       
      }
    });
  }
}
