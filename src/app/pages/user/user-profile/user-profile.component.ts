import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../../../core/services/user/user.service';
import { AdminService } from '../../../core/services/admin.service';
import { ImageCompressionService } from '../../../core/services/image-compression.service';
import { NotifyService } from '../../../core/services/notify.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { NgFor, NgIf } from '@angular/common';
import { UserRole } from '../../../core/enums/roles.enum';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgFor],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
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

  private readonly allowedImageFormats = ['image/jpeg', 'image/png', 'image/webp']

  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private adminService: AdminService,
    private imageCompressionService: ImageCompressionService,
    private router: Router,
    private notify: NotifyService,
    private spinner: NgxSpinnerService
  ) { }

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
      
      dob: new FormControl('', this.isApplicant() ? [Validators.required] : null),
      gender: new FormControl('', this.isApplicant() ? [Validators.required] : null),
      mobile: new FormControl('', this.isApplicant() ? [
        Validators.required,
        Validators.pattern('^[0-9]{10}$'),this.mobileNumberValidator
      ] : null),
      key_skills: new FormControl('', this.isApplicant() ? [Validators.required] : null),
      work_experiences: new FormControl('', this.isApplicant() ? [
        Validators.required,
        this.twoDigitWorkExperienceValidator.bind(this)
      ] : null),
      current_company: new FormControl('', [
        Validators.required,
        Validators.pattern('^[a-zA-Z ]*$'),
        Validators.maxLength(100)
      ]),
      expected_salary: new FormControl('', [
        Validators.required,
        Validators.min(1), 
        Validators.maxLength(9)
      ])
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
        'work_experiences'
      ];

      const hasEmptyRequiredFields = requiredFields.some(field => {
        const control = this.userProfileForm?.get(field);
        if (!control) return true;

        const value = control.value;
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

    const mobileControl = this.userProfileForm.get('mobile');
    if (mobileControl && this.isApplicant()) {
      const mobileValue = mobileControl.value?.toString() || '';
      if (mobileValue.length !== 10) {
        mobileControl.setErrors({ invalidMobile: true });
        mobileControl.markAsTouched();
        this.scrollToTop();
        return;
      }
    }
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

    const payload = {
      ...this.userProfileForm.value,
      mobile: this.userProfileForm.value.mobile ? +this.userProfileForm.value.mobile : null
    };

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

  onFileSelected(event: Event, controlName: string): void {
    const file = (event.target as HTMLInputElement).files?.[0];

    if (file) {
      if (this.allowedImageFormats.includes(file.type)) {
        this.imageCompressionService.compressImage(file).then((compressedImageUrl: string) => {
          fetch(compressedImageUrl)
            .then((res) => res.blob())
            .then((compressedFileBlob) => {
              const compressedFile = new File([compressedFileBlob], file.name, { type: file.type });

              const folderName = 'user-profile';
              const user = JSON.parse(localStorage.getItem('user') || '{}');
              const userId = user.id;
              this.userService.uploadFile({ folderName, file: compressedFile, userId }).subscribe(
                (response) => {
                  if (response.statusCode === 200) {
                    this.userProfileForm.patchValue({
                      [controlName]: response.data.path,
                    });

                    // Wrap in setTimeout to ensure change detection triggers
                    setTimeout(() => {
                      this.successMessage = response.message || 'File uploaded successfully!';
                      this.errorMessage = ''; // Clear error message
                    });
                  }
                },
                (error) => {
                  console.error('Error uploading file:', error);

                  setTimeout(() => {
                    this.errorMessage = 'Failed to upload the file. Please try again.';
                    this.successMessage = ''; // Clear success message
                  });
                }
              );
            });
        });
      } else {
        const folderName = 'user-profile';
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = user.id;
        this.adminService.uploadFile({ folderName, file, userId }).subscribe(
          (response) => {
            if (response.statusCode === 200) {
              this.userProfileForm.patchValue({
                [controlName]: response.data.path,
              });

              setTimeout(() => {
                this.successMessage = response.message || 'File uploaded successfully!';
                this.errorMessage = ''; // Clear error message
              });
            }
          },
          (error) => {
            console.error('Error uploading file:', error);

            setTimeout(() => {
              this.errorMessage = 'Failed to upload the file. Please try again.';
              this.successMessage = ''; // Clear success message
            });
          }
        );
      }
    }
  }


  private handleApiError(error: any) {
    if (error.message) {
      // If it's a single error message
      this.apiError = error.message;
    } else if (error.errors && Array.isArray(error.errors)) {
      // If it's an array of error messages
      this.fieldErrors = error.errors;
    } else if (typeof error === 'string') {
      // If it's just a string
      this.apiError = error;
    } else {
      // Default error message
      this.apiError = 'An error occurred. Please try again.';
    }

    // Handle specific field errors
    if (error.mobile) {
      this.userProfileForm.get('mobile')?.setErrors({ 'apiError': error.mobile });
    }
  }

  getValidationMessage(fieldName: string): string {
    const errorMessages: { [key: string]: string } = {
      first_name: 'First Name is required and can only contain letters, numbers and spaces.',
      last_name: 'Last Name is required and can only contain letters, numbers and spaces.',
      dob: 'Date of Birth is required.',
      gender: 'Gender is required.',
      mobile: 'Mobile Number must be exactly 10 digits.',
      key_skills: 'Key Skills are required and cannot be empty.',
      work_experiences: 'Work Experience must be a valid number (1 or 2 digits) followed by optional text.',
      current_company: 'Current Company is required and cannot exceed 100 characters.',
      expected_salary: 'Expected Salary must be a valid number.',
    };

    const control = this.userProfileForm.get(fieldName);
    if (control?.errors) {
      if (control.errors['required']) {
        return `${fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} is required.`;
      }
      if (control.errors['pattern'] || control.errors['invalidMobile']) {
        if (fieldName === 'mobile') {
          return 'Please enter a valid 10-digit mobile number.';
        }
        if (fieldName === 'current_company') {
          return 'Company name can only contain letters and spaces.';
        }
      }
      if (control.errors['maxlength']) {
        if (fieldName === 'current_company') {
          return 'Company name cannot exceed 100 characters.';
        }
      }
      if (control.errors['invalidWorkExperience']) {
        return 'Work experience must be a valid number (1 or 2 digits) followed by optional text.';
      }
    }

    return errorMessages[fieldName] || 'Invalid input.';
  }

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
    this.router.navigate(['/user-profile', userId]);
  }

  loadUserData(userId: string): void {
    this.spinner.show();
    this.userService.getUserById(userId).subscribe(
      (response: any) => {
        this.spinner.hide();
        if (response.statusCode === 200 && response.data) {
          const data = response.data;
          // Convert the `dob` field to YYYY-MM-DD format
          const dob = data.dob ? new Date(data.dob).toISOString().split('T')[0] : null;
          this.userProfileForm.patchValue({
            first_name: data.first_name || '',
            last_name: data.last_name || '',
            email: data.email || '',
            dob: dob,
            gender: data.gender || '',
            mobile: data.mobile || null,
            key_skills: data.key_skills || '',
            work_experiences: data.work_experiences || '',
            current_company: data.current_company || '',
            current_salary: data.current_salary || '',
            expected_salary: data.expected_salary || '',
          });
        } else {
          console.error('Failed to retrieve user profile data', response.message);
          this.notify.showError('Failed to retrieve user profile data');
        }
      },
      (error: any) => {
        // Hide the spinner in case of error
        this.spinner.hide();
        console.error('Error fetching user profile data:', error.message);
        this.notify.showError('An error occurred while fetching user profile data');
      }
    );
  }

  navigate() {
    this.router.navigate(['/job-list']);
  }

  private scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
