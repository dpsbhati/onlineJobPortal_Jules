import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../../core/services/user/user.service';
import { AdminService } from '../../../core/services/admin.service';
import { ImageCompressionService } from '../../../core/services/image-compression.service';
import { NotifyService } from '../../../core/services/notify.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { NgFor, NgIf } from '@angular/common';
import { UserRole } from '../../../core/enums/roles.enum';
import { NgOptionTemplateDirective, NgSelectComponent } from '@ng-select/ng-select';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgFor,FormsModule,
        NgSelectComponent,
            NgOptionTemplateDirective,
        
  ],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
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
    // Get role from localStorage
    this.userRole = localStorage.getItem('role') || '';
    console.log('Current user role:', this.userRole);
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
        Validators.pattern('^[0-9]{10}$'),this.mobileNumberValidator
      ] : null),
      key_skills: new FormControl([], this.isApplicant() ? [Validators.required, Validators.min(2),  Validators.maxLength(50),this.SkillArrayValidator(1,10),  this.skillsValidator(2, 50),] : null),
      work_experiences: new FormControl('', this.isApplicant() ? [
        Validators.required,
        this.twoDigitWorkExperienceValidator.bind(this)
      ] : null),
      current_company: new FormControl('', this.isApplicant() ? [
        Validators.required,
        Validators.pattern('^[a-zA-Z ]*$'),
        Validators.maxLength(100)
      ] : null),
      expected_salary: new FormControl('', this.isApplicant () ? [
        Validators.required,
        Validators.min(1),
        this.expectedSalaryValidator()
      ] : null),
    });

    // Subscribe to form value changes to show validation messages
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
      };}
    SkillArrayValidator(min: number, max: number) {
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
  
    // Convert to string and remove any spaces
    const mobileStr = value.toString().trim();
  
    // Check if it's exactly 10 digits
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
        } else if (fieldName === 'current_company') {
          if (errors['pattern']) {
            this.notify.showWarning('Current Company must contain only alphabets');
            this.scrollToTop();
          }
        } else if (fieldName === 'expected_salary') {
          if (errors['maxDigits']) {
            this.notify.showWarning('Expected Salary should not exceed 8 digits');
            this.scrollToTop();
          }
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

      const isFirstNameEmpty = !firstNameValue || firstNameValue.trim() === '';
      const isLastNameEmpty = !lastNameValue || lastNameValue.trim() === '';

      return isFirstNameEmpty || isLastNameEmpty;
    } else if (this.isApplicant()) {
      const requiredFields = [
        'first_name',
        'last_name',
        'dob',
        'gender',
        'mobile',
        'key_skills',
        'work_experiences',
        'current_company',
        'expected_salary'
      ];

      // Check expected salary length
      const expectedSalaryValue = this.userProfileForm?.get('expected_salary')?.value;
      if (expectedSalaryValue) {
        const numStr = expectedSalaryValue.toString().replace(/,/g, '');
        if (numStr.length > 8) {
          return true; // Disable button if more than 8 digits
        }
      }

      const hasEmptyRequiredFields = requiredFields.some(field => {
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
      });

      return hasEmptyRequiredFields || !this.userProfileForm.valid;
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

    // Allow values like "22 years" or "5 years"
    const isValid = /^(\d{1,2})(\s*[a-zA-Z]*)?$/.test(value);
    if (!isValid) {
      return { invalidWorkExperience: 'Each work experience must be a valid number (1 or 2 digits) followed by optional text.' };
    }

    return null;
  }

  formatSalary(controlName: string): void {
    const control = this.userProfileForm.get(controlName);
    if (control && control.value) {
      // Remove commas for processing
      const unformattedValue = control.value.toString().replace(/[^0-9]/g, '');

      // Check if it's a valid number before formatting
      if (!isNaN(unformattedValue)) {
        const formattedValue = parseInt(unformattedValue).toLocaleString('en-IN')
        control.setValue(formattedValue, { emitEvent: false });
      }
    }
  }

  onSubmit(): void {
    const formValues = this.userProfileForm.value;
    
    // Format skills array with forward slashes
    const formattedSkills = formValues.key_skills.map((skill: string) => `/${skill}`);
    
    const payload = {
      ...formValues,
      key_skills: JSON.stringify(formattedSkills),
      mobile: formValues.mobile ? +formValues.mobile : null,
      role: this.userRole // Add role from localStorage
    };

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

    this.userService.SaveUserProfile(payload).subscribe({
      next: (response: any) => {
        if (response.statusCode === 200) {
          this.notify.showSuccess(response.message);
          this.router.navigate(['/job-list']);
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


  // getValidationMessage(fieldName: string): string {
  //   const errorMessages: { [key: string]: string } = {
  //     first_name: 'First Name is required and can only contain letters, numbers and spaces.',
  //     last_name: 'Last Name is required and can only contain letters, numbers and spaces.',
  //     dob: 'Date of Birth is required.',
  //     gender: 'Gender is required.',
  //     mobile: 'Mobile Number must be exactly 10 digits.',
  //     key_skills: 'Key Skills are required and cannot be empty.',
  //     work_experiences: 'Work Experience must be a valid number (1 or 2 digits) followed by optional text.',
  //     current_company: 'Current Company is required and cannot exceed 100 characters.',
  //     expected_salary: 'Expected Salary must be a valid number.',
  //   };

  //   const control = this.userProfileForm.get(fieldName);
  //   if (control?.errors) {
  //     if (control.errors['required']) {
  //       return `${fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} is required.`;
  //     }
  //     if (control.errors['pattern'] || control.errors['invalidMobile']) {
  //       if (fieldName === 'mobile') {
  //         return 'Please enter a valid 10-digit mobile number.';
  //       }
  //       if (fieldName === 'current_company') {
  //         return 'Company name can only contain letters and spaces.';
  //       }
  //     }
  //     if (control.errors['maxlength']) {
  //       if (fieldName === 'current_company') {
  //         return 'Company name cannot exceed 100 characters.';
  //       }
  //     }
  //     if (control.errors['invalidWorkExperience']) {
  //       return 'Work experience must be a valid number (1 or 2 digits) followed by optional text.';
  //     }
  //   }

  //   return errorMessages[fieldName] || 'Invalid input.';
  // }

  getInvalidFields(): any {
    const invalidFields: any = {};
    Object.keys(this.userProfileForm.controls).forEach((key) => {
      const control = this.userProfileForm.get(key);
      if (control && control.invalid) {
        invalidFields[key] = control.errors;
      }
    });
    return invalidFields;
  }

  navigateToEditMode(userId: string): void {
    this.router.navigate(['/edit-profile', userId]);
  }

  loadUserData(userId: string): void {
    this.spinner.show();
    this.userService.getUserById(userId).subscribe({
      next: (response: any) => {
        this.spinner.hide();
        if (response.statusCode === 200 && response.data) {
          const data = response.data;
          
          // Parse key_skills from JSON string if it exists
          let keySkills = [];
          if (data.key_skills) {
            try {
              // Remove forward slashes from skills when displaying
              keySkills = JSON.parse(data.key_skills).map((skill: string) => skill.replace('/', ''));
            } catch (e) {
              console.warn('Error parsing key_skills:', e);
              keySkills = Array.isArray(data.key_skills) ? data.key_skills : [];
            }
          }
          
          // Convert the `dob` field to YYYY-MM-DD format
          const dob = data.dob ? new Date(data.dob).toISOString().split('T')[0] : null;

          // Format salary values if they exist
          const currentSalary = data.current_salary ? data.current_salary.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '';
          const expectedSalary = data.expected_salary ? data.expected_salary.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '';
          
          // Update the form with all available data
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
            current_salary: currentSalary,
            expected_salary: expectedSalary
          });

          // Update component properties
          this.userId = data.id || userId;
          this.skillsArray = keySkills;

          // Mark form as pristine after loading data
          this.userProfileForm.markAsPristine();
          
          // Add validators based on role
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
          console.error('Failed to retrieve user profile data', response.message);
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

  navigate() {
    this.router.navigate(['/job-list']);
  }

  private scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      this.newSkill = ''; // Clear the input field
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
      
      // Convert to string and remove any commas
      const numStr = value.toString().replace(/,/g, '');
      
      // Check if it's more than 8 digits
      if (numStr.length > 8) {
        return { maxDigits: true };
      }
      
      return null;
    };
  }

  goBack(): void {
    this.router.navigate(['/job-list']);
  }
}
