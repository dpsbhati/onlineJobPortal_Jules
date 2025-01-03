import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NotifyService } from '../../core/services/notify.service';
import { CommonModule, NgIf } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';
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
        Validators.minLength(2), Validators.pattern('^[a-zA-Z]+$'), Validators.maxLength(50),
      ]),
      lastName: new FormControl('', [
        Validators.required,
        Validators.minLength(2), Validators.pattern('^[a-zA-Z]+$'), Validators.maxLength(50),
      ]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
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


  onSubmit(): void {
    this.spinner.show();
    if (this.registrationForm.invalid) {
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
          this.notify.showSuccess(res.message
          );
          this.loading = false;
        }
        else if(res.statusCode == 409 ){
          this.notify.showWarning(res.message
          );
          this.spinner.hide();
         
        }
      },
       
    });
  }
  back(){
    this.router.navigate(['auth/login']);
  }
}
