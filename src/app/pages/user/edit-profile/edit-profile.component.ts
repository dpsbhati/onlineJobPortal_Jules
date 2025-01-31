import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { UserService } from '../../../core/services/user/user.service';
import { AdminService } from '../../../core/services/admin/admin.service';
import { ImageCompressionService } from '../../../core/services/image/image-compression.service';
import { NotifyService } from '../../../core/services/notify.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { UserRole } from '../../../core/enums/roles.enum';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
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
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss']
})
export class EditProfileComponent implements OnInit {

  skillsArray: string[] = [];
  newSkill: string = '';
  userRole: string = '';
  userProfileForm!: FormGroup;
  isEditMode = false;
  loading = false;
  apiError: string | null = null;
  fieldErrors: string[] = [];
  successMessage: string = '';
  errorMessage: string = '';
  userId: string | null = null;
  userEmail: string = '';

  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private adminService: AdminService,
    private imageCompressionService: ImageCompressionService,
    private router: Router,
    private notify: NotifyService,
    private spinner: NgxSpinnerService
  ) {
    this.userRole = localStorage.getItem('role') || '';
    // console.log('Current user role:', this.userRole);
  }

  ngOnInit(): void {
    this.initializeForm();
    const userStr = localStorage.getItem('user');

    if (userStr) {
      const user = JSON.parse(userStr);
      this.userRole = user.role || '';
      this.userEmail = user.email || '';
      if (user.id) {
        this.isEditMode = true;
        this.loadUserData(user.id);
      }
    }
  }

  isAdmin(): boolean {
    return this.userRole.toLowerCase() === UserRole.ADMIN.toLowerCase();
  }

  isApplicant(): boolean {
    return this.userRole.toLowerCase() === UserRole.APPLICANT.toLowerCase();
  }

  initializeForm(): void {
    this.userProfileForm = new FormGroup({
      first_name: new FormControl('', [
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9 ]+$'),
      ]),
      last_name: new FormControl('', [
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9 ]+$')
      ]),
      email: new FormControl({ value: this.userEmail || '', disabled: true }),
      dob: new FormControl('', this.isApplicant() ? [Validators.required] : null),
      gender: new FormControl('', this.isApplicant() ? [Validators.required] : null),
      mobile: new FormControl('', this.isApplicant() ? [
        Validators.required,
        Validators.pattern('^[0-9]{10}$'),
        this.mobileNumberValidator
      ] : null),
      key_skills: new FormControl([], this.isApplicant() ? [
        Validators.required,
        Validators.min(2),
        Validators.maxLength(50),
        this.SkillArrayValidator(1, 10),
        this.skillsValidator(2, 50),
      ] : null),
      work_experiences: new FormControl('', this.isApplicant() ? [
        Validators.required,
        this.twoDigitWorkExperienceValidator.bind(this)
      ] : null),
      current_company: new FormControl('', this.isApplicant() ? [
        Validators.required,
        Validators.pattern('^[a-zA-Z ]*$'),
        Validators.maxLength(100)
      ] : null),
      expected_salary: new FormControl('', this.isApplicant() ? [
        Validators.required,
        Validators.min(1),
        this.expectedSalaryValidator()
      ] : null),
    });

    Object.keys(this.userProfileForm.controls).forEach(key => {
      const control = this.userProfileForm.get(key);
      if (control) {
        control.valueChanges.subscribe(() => {
          if (control.touched) {
            this.showValidationMessage(key);
          }
        });
      }
    });

    this.addTrimValidators();
  }

  skillsValidator(minLength: number, maxLength: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const skills = control.value;
      if (!Array.isArray(skills)) {
        return { invalidType: true };
      }
      for (const skill of skills) {
        if (skill.length < minLength) {
          return { minLengthSkill: { requiredLength: minLength, actualLength: skill.length } };
        }
        if (skill.length > maxLength) {
          return { maxLengthSkill: { requiredLength: maxLength, actualLength: skill.length } };
        }
      }
      return null;
    };
  }

  SkillArrayValidator(min: number, max: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const skills = control.value;
      if (!Array.isArray(skills)) {
        return { invalidType: true };
      }
      if (skills.length < min) {
        return { minSkills: { required: min, actual: skills.length } };
      }
      if (skills.length > max) {
        return { maxSkills: { required: max, actual: skills.length } };
      }
      return null;
    };
  }

  mobileNumberValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;
    const mobileStr = value.toString().trim();
    if (!/^[0-9]{10}$/.test(mobileStr)) {
      return { invalidMobile: true };
    }
    return null;
  }

  onMobileInput() {
    const mobileControl = this.userProfileForm.get('mobile');
    if (mobileControl && mobileControl.value) {
      const digitsOnly = mobileControl.value.toString().replace(/\D/g, '').slice(0, 10);
      if (mobileControl.value !== digitsOnly) {
        mobileControl.setValue(digitsOnly, { emitEvent: true });
      }
      if (digitsOnly.length !== 10) {
        mobileControl.setErrors({ invalidMobile: true });
      }
    }
  }

  showValidationMessage(fieldName: string) {
    const control = this.userProfileForm.get(fieldName);
    if (control?.invalid && control.touched) {
      const errors = control.errors;
      if (errors) {
        if (errors['required']) {
          this.notify.showWarning(`${this.formatFieldName(fieldName)} is required`);
          this.scrollToTop();
        } else if (fieldName === 'current_company' && errors['pattern']) {
          this.notify.showWarning('Current Company must contain only alphabets');
          this.scrollToTop();
        } else if (fieldName === 'expected_salary' && errors['maxDigits']) {
          this.notify.showWarning('Expected Salary should not exceed 7 digits');
          this.scrollToTop();
        }
      }
    }
  }

  private formatFieldName(fieldName: string): string {
    return fieldName.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }

  get isUpdateButtonDisabled(): boolean {
    if (this.isAdmin()) {
      const firstNameValue = this.userProfileForm?.get('first_name')?.value;
      const lastNameValue = this.userProfileForm?.get('last_name')?.value;
      return !firstNameValue?.trim() || !lastNameValue?.trim();
    } else if (this.isApplicant()) {
      const requiredFields = [
        'first_name', 'last_name', 'dob', 'gender', 'mobile',
        'key_skills', 'work_experiences', 'current_company', 'expected_salary'
      ];

      const expectedSalaryValue = this.userProfileForm?.get('expected_salary')?.value;
      if (expectedSalaryValue) {
        const numStr = expectedSalaryValue.toString().replace(/,/g, '');
        if (numStr.length > 7) return true;
      }

      return requiredFields.some(field => {
        const control = this.userProfileForm?.get(field);
        if (!control) return true;
        const value = control.value;
        if (field === 'key_skills') {
          return !Array.isArray(value) || value.length === 0;
        }
        if (typeof value === 'string') {
          return !value || value.trim() === '';
        }
        return !value;
      }) || !this.userProfileForm.valid;
    }
    return true;
  }

  addTrimValidators(): void {
    Object.keys(this.userProfileForm.controls).forEach((controlName) => {
      const control = this.userProfileForm.get(controlName);
      if (control) {
        control.valueChanges.subscribe((value) => {
          if (typeof value === 'string') {
            const trimmedValue = value.trim();
            if (value !== trimmedValue) {
              control.setValue(trimmedValue, { emitEvent: false });
            }
          }
        });
      }
    });
  }

  twoDigitWorkExperienceValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;
    const isValid = /^(\d{1,2})(\s*[a-zA-Z]*)?$/.test(value);
    if (!isValid) {
      return { invalidWorkExperience: 'Each work experience must be a valid number (1 or 2 digits) followed by optional text.' };
    }
    return null;
  }

  formatSalary(controlName: string): void {
    const control = this.userProfileForm.get(controlName);
    if (control && control.value) {
      const unformattedValue = control.value.toString().replace(/[^0-9]/g, '');
      if (!isNaN(unformattedValue)) {
        const formattedValue = parseInt(unformattedValue).toLocaleString('en-IN')
        control.setValue(formattedValue, { emitEvent: false });
      }
    }
  }

  onSubmit(): void {
    if (this.userProfileForm.invalid) {
      Object.keys(this.userProfileForm.controls).forEach(key => {
        const control = this.userProfileForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
          this.showValidationMessage(key);
        }
      });
      this.scrollToTop();
      return;
    }

    const formValues = this.userProfileForm.value;
    const formattedSkills = formValues.key_skills.map((skill: string) => `/${skill}`);
    
    const payload = {
      ...formValues,
      key_skills: JSON.stringify(formattedSkills),
      mobile: formValues.mobile ? +formValues.mobile : null,
      role: this.userRole
    };

    this.userService.SaveUserProfile(payload).subscribe({
      next: (response: any) => {
        if (response.statusCode === 200) {
          this.notify.showSuccess(response.message);
          this.router.navigate(['/starter']);
        } else {
          this.notify.showError(response.message || 'Failed to update profile');
          this.scrollToTop();
        }
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        this.notify.showError(error.error?.message || 'An error occurred while updating the profile');
        this.scrollToTop();
      }
    });
  }

  loadUserData(userId: string): void {
    this.spinner.show();
    this.userService.getUserById(userId).subscribe({
      next: (response: any) => {
        this.spinner.hide();
        if (response.statusCode === 200 && response.data) {
          const data = response.data;
          
          let keySkills = [];
          if (data.key_skills) {
            try {
              keySkills = JSON.parse(data.key_skills).map((skill: string) => skill.replace('/', ''));
            } catch (e) {
              console.warn('Error parsing key_skills:', e);
              keySkills = Array.isArray(data.key_skills) ? data.key_skills : [];
            }
          }
          
          const dob = data.dob ? new Date(data.dob).toISOString().split('T')[0] : null;
          const expectedSalary = data.expected_salary ? 
            data.expected_salary.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '';
          
          this.userProfileForm.patchValue({
            first_name: data.first_name || '',
            last_name: data.last_name || '',
            email: this.userEmail,
            dob: dob,
            gender: data.gender || '',
            mobile: data.mobile || null,
            key_skills: keySkills,
            work_experiences: data.work_experiences || '',
            current_company: data.current_company || '',
            expected_salary: expectedSalary
          });

          this.userId = data.id || userId;
          this.skillsArray = keySkills;
          this.userProfileForm.markAsPristine();
          
          if (this.isApplicant()) {
            const applicantControls = ['dob', 'gender', 'mobile', 'key_skills', 'work_experiences'];
            applicantControls.forEach(controlName => {
              const control = this.userProfileForm.get(controlName);
              if (control) {
                control.setValidators([Validators.required]);
                control.updateValueAndValidity();
              }
            });
          }
        } else {
          this.notify.showError(response.message || 'Failed to retrieve user profile data');
        }
      },
      error: (error: any) => {
        this.spinner.hide();
        console.error('Error fetching user profile data:', error);
        this.notify.showError(error.error?.message || 'An error occurred while fetching user profile data');
      }
    });
  }

  addSkill(): void {
    const skill = this.newSkill.trim();
    if (!skill) {
      this.notify.showWarning('Skill cannot be empty.');
      return;
    }
    if (skill.length < 2) {
      this.notify.showWarning('Skill must be at least 2 characters long.');
      return;
    }
    if (skill.length > 50) {
      this.notify.showWarning('Skill cannot exceed 50 characters.');
      return;
    }
    if (skill && !this.skillsArray.includes(skill)) {
      this.skillsArray.push(skill);
      this.newSkill = '';
      this.updateSkillsInForm();
    }
  }

  removeSkill(index: number): void {
    this.skillsArray.splice(index, 1);
    this.updateSkillsInForm();
  }

  updateSkillsInForm(): void {
    this.userProfileForm.get('key_skills')?.setValue(this.skillsArray);
    this.userProfileForm.get('key_skills')?.markAsTouched();
  }

  expectedSalaryValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;
      const numStr = value.toString().replace(/,/g, '');
      if (numStr.length > 7) {
        return { maxDigits: true };
      }
      return null;
    };
  }

  navigate() {
    this.router.navigate(['/starter/job-list']);
  }

  goBack(): void {
    this.router.navigate(['/starter/job-list']);
  }

  private scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
