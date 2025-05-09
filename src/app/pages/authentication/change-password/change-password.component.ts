import { NgFor, NgIf } from '@angular/common';
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
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AdminService } from 'src/app/core/services/admin/admin.service';
import { ImageCompressionService } from 'src/app/core/services/image/image-compression.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { UserService } from 'src/app/core/services/user/user.service';
import { UserRole } from '../../../core/enums/roles.enum';

@Component({
  selector: 'app-change-password',
  imports: [
     ReactiveFormsModule,
        FormsModule,
        NgIf,
        NgFor,
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
  userProfileForm:any;
  apiError: string | null = null;
  userRole: string = '';
  passwordVisible = false;
  passwordVisible1=false;
  passwordVisible2=false;

   constructor(
      private userService: UserService,
      private route: ActivatedRoute,
      private adminService: AdminService,
      private imageCompressionService: ImageCompressionService,
      private router: Router,
      private loader: LoaderService,
      private toaster: ToastrService,

    ) {
      this.userRole = localStorage.getItem('role') || '';
      // console.log('Current user role:', this.userRole);
    }

    ngOnInit(): void {
      this.initializeForm();
      const userStr = localStorage.getItem('user');

      // if (userStr) {
      //   const user = JSON.parse(userStr);
      //   this.userRole = user.role || '';
      //   this.userEmail = user.email || '';
      //   if (user.id) {
      //     this.isEditMode = true;
      //     this.loadUserData(user.id);
      //   }
      // }
    }

    goBack(): void {
      this.router.navigate(['job-list']);
    }

    initializeForm(): void {
      this.userProfileForm = new FormGroup({
        Email: new FormControl('', [
          Validators.required,
          Validators.pattern('^[a-zA-Z0-9 ]+$'),
        ]),
        CurrentPassword: new FormControl('', [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
        ]),
        NewPassword: new FormControl('', [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
        ]),
        ConfirmPassword: new FormControl('', [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
        ])
      });

      // Apply the custom password match validator after form initialization
      this.userProfileForm.setValidators(this.passwordMatchValidator);
    }

    // Password match validator function
    passwordMatchValidator(g: FormGroup) {
      return g.get('NewPassword')?.value === g.get('ConfirmPassword')?.value
        ? null : { 'mismatch': true };
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
    // Access form controls
    get f() {
      return this.userProfileForm.controls;
    }


}
