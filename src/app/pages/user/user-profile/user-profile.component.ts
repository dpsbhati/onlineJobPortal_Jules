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
  userRole : string = '';
  userProfileForm!: FormGroup;
  isEditMode = false;
  loading = false;
  apiError: string | null = null;
  fieldErrors: string[] = [];
  successMessage: string = '';
  errorMessage: string = '';
  userId: string | null = null;
  userEmail: string = '';

  private readonly allowedImageFormats = ['image/jpeg', 'image/png', 'image/webp'];

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
      first_name: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z0-9 ]+$'), this.noWhitespaceValidator]),
      last_name: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z0-9 ]+$'), this.noWhitespaceValidator]),
  
      dob: new FormControl('', Validators.required),
      gender: new FormControl('', Validators.required),
      mobile: new FormControl(null, [
        Validators.required,
        Validators.pattern('^[0-9]{10}$'), this.noWhitespaceValidator
      ]),
      key_skills: new FormControl(''),
      work_experiences: new FormControl('', [this.twoDigitWorkExperienceValidator.bind(this)]),
      current_company: new FormControl('', [Validators.pattern('^[a-zA-Z ]*$')]),
      expected_salary: new FormControl('', [Validators.min(1), Validators.maxLength(8)]),
    });
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

  noWhitespaceValidator(control: AbstractControl): ValidationErrors | null {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { whitespace: true };
  }

  salaryLimitValidator(maxLimit: number) {
    return (control: AbstractControl): ValidationErrors | null => {
      const rawValue = control.value;

      if (!rawValue) return null; // If the field is empty, no validation error

      // Remove commas from the input for validation
      const numericValue = parseInt(rawValue.toString().replace(/,/g, ''), 10);

      // Validate if the value is a number and within the limit
      if (isNaN(numericValue) || numericValue > maxLimit) {
        return { salaryLimitExceeded: `Value exceeds the allowed limit of ${maxLimit.toLocaleString()}` };
      }

      return null; // Validation passed
    };
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

  onSubmit(): void {
    if (this.userProfileForm.invalid) {
      // Show validation messages for all invalid fields
      Object.keys(this.userProfileForm.controls).forEach(key => {
        const control = this.userProfileForm.get(key);
        if (control?.invalid) {
          if (key === 'mobile' && control.errors?.['pattern']) {
            this.notify.showWarning('Mobile number must be exactly 10 digits');
          }
        }
      });
      this.notify.showWarning('Please fill all required fields correctly.');
      return;
    }

    // Trim all values in the form
    Object.keys(this.userProfileForm.controls).forEach((controlName) => {
      const control = this.userProfileForm.get(controlName);
      if (control && typeof control.value === 'string') {
        control.setValue(control.value.trim());
      }
    });

    const payload = {
      ...this.userProfileForm.value,
      mobile: +this.userProfileForm.value.mobile,
    };

    // Update user profile
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
        // Show API error messages and scroll to top
        if (error.error?.message) {
          this.notify.showError(error.error.message);
        } else {
          this.notify.showError('An error occurred while updating the profile');
        }
        this.scrollToTop();
      }
    });
  }

  onMobileInput() {
    const mobileControl = this.userProfileForm.get('mobile');
    if (mobileControl && mobileControl.value) {
      const mobileValue = mobileControl.value.toString();
      if (mobileValue.length > 10) {
        this.notify.showWarning('Mobile number cannot exceed 10 digits');
        // Truncate to 10 digits
        mobileControl.setValue(mobileValue.slice(0, 10), { emitEvent: false });
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
      first_name: 'First Name is required.',
      last_name: 'Last Name is required.',
      dob: 'Date of Birth is required.',
      gender: 'Gender is required.',
      mobile: 'Mobile Number is required and must be a valid 10-digit number.',
      key_skills: 'Key Skills are required.',
      work_experiences: 'Work Experiences are required.',
      current_company: 'Current Company is required.',
      current_salary: 'Current Salary must be a valid number.',
      expected_salary: 'Expected Salary must be a valid number.',
    };

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
