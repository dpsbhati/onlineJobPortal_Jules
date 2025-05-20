import { Component, OnInit } from '@angular/core'
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms'
import { Router, ActivatedRoute } from '@angular/router'
import { NgFor, NgIf } from '@angular/common'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatSelectModule } from '@angular/material/select'
import { MatDatepickerModule } from '@angular/material/datepicker'
import { MatNativeDateModule } from '@angular/material/core'
import { MatButtonModule } from '@angular/material/button'
import { MatChipsModule } from '@angular/material/chips'
import { MatIconModule } from '@angular/material/icon'
import { MatCardModule } from '@angular/material/card'
import { UserService } from '../../../core/services/user/user.service'
import { AdminService } from '../../../core/services/admin/admin.service'
import { ImageCompressionService } from '../../../core/services/image/image-compression.service'
import { NotifyService } from '../../../core/services/notify.service'

import { UserRole } from '../../../core/enums/roles.enum'
import { LoaderService } from 'src/app/core/services/loader.service'
import { ToastrService } from 'ngx-toastr'
import { MaterialModule } from 'src/app/material.module'

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
    MatCardModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss']
})
export class EditProfileComponent implements OnInit {
  // Example arrays - aap apne actual data se replace kar dena
  countriesLanguages = ['English', 'Spanish', 'French', 'German', 'Chinese'];
  proficiencyOptions = ['None', 'Basic', 'Proficient', 'Fluent'];
  currencyList = ['USD', 'EUR', 'PKR', 'GBP', 'INR'];
  departmentsList = ['Admin', 'Business Development', 'Crew Management', 'HSEQ', 'HR'];
  vacancySources = ['Company Website', 'HR', 'Job Portal (LinkedIn)', 'Placement Agency', 'Friend'];
  private readonly allowedImageFormats = [
    'image/jpeg',
    'image/png',
    'image/webp'
  ]
  imagePreview: string | ArrayBuffer | null = null
  skillsArray: string[] = []
  newSkill: string = ''
  userRole: string = ''
  userProfileForm!: FormGroup
  isEditMode = false
  loading = false
  apiError: string | null = null
  fieldErrors: string[] = []
  successMessage: string = ''
  errorMessage: string = ''
  userId: string | null = null
  userEmail: string = ''
  form: FormGroup;
  secondForm: FormGroup;
  thirdForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private route: ActivatedRoute,
    private adminService: AdminService,
    private imageCompressionService: ImageCompressionService,
    private router: Router,
    private loader: LoaderService,
    private toaster: ToastrService,
    private _formBuilder: FormBuilder
  ) {
    this.userRole = localStorage.getItem('role') || ''
  }

  ngOnInit(): void {
    this.initializeForm()
    const userStr = localStorage.getItem('user')

    if (userStr) {
      const user = JSON.parse(userStr)
      this.userRole = user.role || ''
      this.userEmail = user.email || ''
      if (user.id) {
        this.isEditMode = true
        this.loadUserData(user.id)
      }
    }
    this.firstForm();
    this.second();
    this.Third();
    this.addContact()
  }

  firstForm() {
    this.form = this.fb.group({
      first_name: new FormControl('', [
        Validators.required,
        Validators.pattern('^[a-zA-Z ]*$')
      ]),
      last_name: new FormControl('', [
        Validators.required,
        // Validators.pattern('^[a-zA-Z0-9 ]+$')
        Validators.pattern('^[a-zA-Z ]*$')
      ]),
      email: new FormControl({ value: this.userEmail || '', disabled: true }),
      dob: new FormControl('', [Validators.required]),
      mobile: new FormControl(
        '',
        this.isApplicant()
          ? [
            Validators.required,
            Validators.pattern('^[0-9]{10}$'),
            this.mobileNumberValidator
          ]
          : null
      ),
      nationalities: new FormControl([], [Validators.required]),
      country: new FormControl(null, [Validators.required]),
      location: new FormControl(null, [Validators.required]),
      dial_code: new FormControl(null, [Validators.required]),
      profile_image_path: new FormControl(null, [Validators.required]),
      additional_contact_info: this.fb.array([]),
    })
  }

  second() {
    this.secondForm = this.fb.group({
      work_experience_info: this.fb.array([]),
      education_info: this.fb.array([]),
      course_info: this.fb.array([]),
      certification_info: this.fb.array([]),
      cv_path: new FormControl(null),
    })
  }

  Third() {
    this.thirdForm = this.fb.group({
      country: [''],
      location: [''],
    })
  }

  isAdmin(): boolean {
    return this.userRole.toLowerCase() === UserRole.ADMIN.toLowerCase()
  }

  isApplicant(): boolean {
    return this.userRole.toLowerCase() === UserRole.APPLICANT.toLowerCase()
  }

  initializeForm(): void {
    this.userProfileForm = new FormGroup({
      first_name: new FormControl('', [
        Validators.required,
        Validators.pattern('^[a-zA-Z ]*$')
      ]),
      last_name: new FormControl('', [
        Validators.required,
        // Validators.pattern('^[a-zA-Z0-9 ]+$')
        Validators.pattern('^[a-zA-Z ]*$')
      ]),
      email: new FormControl({ value: this.userEmail || '', disabled: true }),
      dob: new FormControl('', [Validators.required, this.dobValidator]),
      gender: new FormControl(
        '',
        this.isApplicant() ? [Validators.required] : null
      ),
      mobile: new FormControl(
        '',
        this.isApplicant()
          ? [
            Validators.required,
            Validators.pattern('^[0-9]{10}$'),
            this.mobileNumberValidator
          ]
          : null
      ),
      key_skills: new FormControl(
        [],
        this.isApplicant()
          ? [
            Validators.required,
            Validators.min(2),
            Validators.maxLength(50),
            this.SkillArrayValidator(1, 10),
            this.skillsValidator(2, 50)
          ]
          : null
      ),
      work_experiences: new FormControl(
        '',
        this.isApplicant()
          ? [
            Validators.required,
            this.twoDigitWorkExperienceValidator.bind(this)
          ]
          : null
      ),
      current_company: new FormControl(
        '',
        this.isApplicant()
          ? [
            Validators.required,
            Validators.pattern('^[a-zA-Z0-9 ]+$'),
            Validators.maxLength(100)
          ]
          : null
      ),
      expected_salary: new FormControl(
        '',
        this.isApplicant()
          ? [
            Validators.required,
            Validators.pattern('^[0-9]*$'),
            Validators.min(1),
            this.expectedSalaryValidator()
          ]
          : null
      )
    })

    Object.keys(this.userProfileForm.controls).forEach(key => {
      const control = this.userProfileForm.get(key)
      if (control) {
        control.valueChanges.subscribe(() => {
          if (control.touched) {
            this.showValidationMessage(key)
          }
        })
      }
    })

    // this.addTrimValidators();
  }

  skillsValidator(minLength: number, maxLength: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const skills = control.value
      if (!Array.isArray(skills)) {
        return { invalidType: true }
      }
      for (const skill of skills) {
        if (skill.length < minLength) {
          return {
            minLengthSkill: {
              requiredLength: minLength,
              actualLength: skill.length
            }
          }
        }
        if (skill.length > maxLength) {
          return {
            maxLengthSkill: {
              requiredLength: maxLength,
              actualLength: skill.length
            }
          }
        }
      }
      return null
    }
  }

  SkillArrayValidator(min: number, max: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const skills = control.value
      if (!Array.isArray(skills)) {
        return { invalidType: true }
      }
      if (skills.length < min) {
        return { minSkills: { required: min, actual: skills.length } }
      }
      if (skills.length > max) {
        return { maxSkills: { required: max, actual: skills.length } }
      }
      return null
    }
  }

  mobileNumberValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value
    if (!value) return null
    const mobileStr = value.toString().trim()
    if (!/^[0-9]{10}$/.test(mobileStr)) {
      return { invalidMobile: true }
    }
    return null
  }

  onMobileInput() {
    const mobileControl = this.userProfileForm.get('mobile')
    if (mobileControl && mobileControl.value) {
      const digitsOnly = mobileControl.value
        .toString()
        .replace(/\D/g, '')
        .slice(0, 10)
      if (mobileControl.value !== digitsOnly) {
        mobileControl.setValue(digitsOnly, { emitEvent: true })
      }
      if (digitsOnly.length !== 10) {
        mobileControl.setErrors({ invalidMobile: true })
      }
    }
  }

  showValidationMessage(fieldName: string) {
    const control = this.userProfileForm.get(fieldName)
    if (control?.invalid && control.touched) {
      const errors = control.errors
      if (errors) {
        if (errors['required']) {
          this.toaster.warning(`${this.formatFieldName(fieldName)} is required`)
          this.scrollToTop()
        } else if (errors['invalidDOB']) {
          // Check for invalid DOB error
          this.toaster.warning(
            'Invalid Date of Birth format. Please enter in YYYY-MM-DD.'
          )
          this.scrollToTop()
        } else if (fieldName === 'current_company' && errors['pattern']) {
          this.toaster.warning('Current Company must contain only alphabets')
          this.scrollToTop()
        } else if (errors['maxDigits']) {
          this.toaster.warning('Salary should not exceed 8 digits')
        } else if (errors['pattern']) {
          this.toaster.warning('Please enter a valid numeric salary value')
        }
      }
    }
  }
  dobValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value
    if (!value) {
      return null // No value means we don't show any error yet (waiting for the user to type something)
    }

    // Check if the date is in the correct format (YYYY-MM-DD)
    const regex = /^\d{4}-\d{2}-\d{2}$/
    if (!regex.test(value)) {
      return {
        invalidDOB: 'Invalid Date of Birth format. Please enter in YYYY-MM-DD.'
      }
    }
    return null // Return null when the date format is valid
  }

  private formatFieldName(fieldName: string): string {
    return fieldName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  get isUpdateButtonDisabled(): boolean {
    if (this.isAdmin()) {
      const firstNameValue = this.userProfileForm?.get('first_name')?.value
      const lastNameValue = this.userProfileForm?.get('last_name')?.value
      return !firstNameValue?.trim() || !lastNameValue?.trim()
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
      ]

      const expectedSalaryValue =
        this.userProfileForm?.get('expected_salary')?.value
      if (expectedSalaryValue) {
        const numStr = expectedSalaryValue.toString().replace(/,/g, '')
        if (numStr.length > 7) return true
      }

      return (
        requiredFields.some(field => {
          const control = this.userProfileForm?.get(field)
          if (!control) return true
          const value = control.value
          if (field === 'key_skills') {
            return !Array.isArray(value) || value.length === 0
          }
          if (typeof value === 'string') {
            return !value || value.trim() === ''
          }
          return !value
        }) || !this.userProfileForm.valid
      )
    }
    return true
  }

  addTrimValidators(): void {
    Object.keys(this.userProfileForm.controls).forEach(controlName => {
      const control = this.userProfileForm.get(controlName)
      if (control) {
        control.valueChanges.subscribe(value => {
          if (typeof value === 'string') {
            const trimmedValue = value.trim()
            if (value !== trimmedValue) {
              control.setValue(trimmedValue, { emitEvent: false })
            }
          }
        })
      }
    })
  }

  twoDigitWorkExperienceValidator(
    control: AbstractControl
  ): ValidationErrors | null {
    const value = control.value
    if (!value) return null
    const isValid = /^(\d{1,2})(\s*[a-zA-Z]*)?$/.test(value)
    if (!isValid) {
      return {
        invalidWorkExperience:
          'Each work experience must be a valid number (1 or 2 digits) followed by optional text.'
      }
    }
    return null
  }

  formatSalary(controlName: string): void {
    const control = this.userProfileForm.get(controlName)
    if (control && control.value) {
      const unformattedValue = control.value.toString().replace(/[^0-9]/g, '')
      if (!isNaN(unformattedValue)) {
        const formattedValue =
          parseInt(unformattedValue).toLocaleString('en-IN')
        control.setValue(formattedValue, { emitEvent: false })
      }
    }
  }

  onSubmit(): void {
    console.log(this.form);
    if (this.userProfileForm.invalid) {
      Object.keys(this.userProfileForm.controls).forEach(key => {
        const control = this.userProfileForm.get(key)
        if (control?.invalid) {
          control.markAsTouched()
          this.showValidationMessage(key)
        }
      })
      this.scrollToTop()
      return
    }
    this.loader.show()

    const formValues = this.userProfileForm.value
    // Format the Date of Birth (dob) if it's set
    if (formValues.dob) {
      formValues.dob = this.formatDate(formValues.dob)
    }
    const formattedSkills = formValues.key_skills.map(
      (skill: string) => `/${skill}`
    )

    const payload = {
      ...formValues,
      key_skills: JSON.stringify(formattedSkills),
      mobile: formValues.mobile ? +formValues.mobile : null,
      role: this.userRole
    }

    this.userService.SaveUserProfile(payload).subscribe({
      next: (response: any) => {
        this.loader.hide()
        if (response.statusCode === 200) {
          this.toaster.success(response.message)
          this.router.navigate(['/dashboard'])
        } else {
          this.toaster.error(response.message || 'Failed to update profile')
          this.scrollToTop()
        }
      },
      error: error => {
        this.loader.hide()
        this.toaster.error(
          error.error?.message || 'An error occurred while updating the profile'
        )
        this.scrollToTop()
      }
    })
  }

  // Helper function to format the Date of Birth to YYYY-MM-DD format
  formatDate(date: Date): string {
    // Set the time to midnight to avoid timezone issues
    const localDate = new Date(date)
    localDate.setHours(0, 0, 0, 0) // Set the time to midnight

    const year = localDate.getFullYear()
    const month = ('0' + (localDate.getMonth() + 1)).slice(-2) // Add leading zero if month < 10
    const day = ('0' + localDate.getDate()).slice(-2) // Add leading zero if day < 10

    return `${year}-${month}-${day}` // Returns in 'YYYY-MM-DD' format
  }

  restrictToNumbers(event: KeyboardEvent): void {
    const inputChar = String.fromCharCode(event.charCode)
    const inputElement = event.target as HTMLInputElement
    const currentValue = inputElement.value

    const digitsOnly = currentValue.replace(/\D/g, '') // Remove non-digit characters

    // Prevent the input if it's not a number
    if (/[^0-9]/g.test(inputChar)) {
      event.preventDefault()
    }

    // Prevent entering more than 8 digits
    // if (digitsOnly.length >= 8 && event.key !== 'Backspace' && event.key !== 'Delete') {
    //   event.preventDefault(); // Prevent further input if length exceeds 8 digits
    // }

    // Check if the input length exceeds 8 digits
    const expectedSalaryControl = this.userProfileForm.get('expected_salary')

    if (digitsOnly.length > 8) {
      // Set error if more than 8 digits are entered
      expectedSalaryControl?.setErrors({ maxDigits: true })
      event.preventDefault() // Prevent further input
    } else {
      // Clear maxDigits error if the input length is within limit
      expectedSalaryControl?.setErrors(null)
    }
  }

  onBlur(event: FocusEvent): void {
    const inputElement = event.target as HTMLInputElement
    const value = inputElement.value

    // Ensure that the value doesn't exceed 8 digits on blur
    const digitsOnly = value.replace(/\D/g, '') // Remove non-digit characters

    const expectedSalaryControl = this.userProfileForm.get('expected_salary')

    if (!value) {
      // If the input is empty, set the "required" error
      expectedSalaryControl?.setErrors({ required: true })
    } else if (digitsOnly.length > 8) {
      // If the input exceeds 8 digits, set the "maxDigits" error
      expectedSalaryControl?.setErrors({ maxDigits: true })
    } else {
      // Clear errors if the input is valid
      expectedSalaryControl?.setErrors(null)
    }
  }

  loadUserData(userId: string): void {
    this.loader.show()

    this.userService.getUserById(userId).subscribe({
      next: (response: any) => {
        this.loader.hide()

        if (response.statusCode === 200 && response.data) {
          const data = response.data

          let keySkills = []
          if (data.key_skills) {
            try {
              keySkills = JSON.parse(data.key_skills).map((skill: string) =>
                skill.replace('/', '')
              )
            } catch (e) {
              keySkills = Array.isArray(data.key_skills) ? data.key_skills : []
            }
          }

          const dob = data.dob
            ? new Date(data.dob).toISOString().split('T')[0]
            : null
          const expectedSalary = data.expected_salary
            ? data.expected_salary
              .toString()
              .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
            : ''

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
          })

          this.userId = data.id || userId
          this.skillsArray = keySkills
          this.userProfileForm.markAsPristine()

          if (this.isApplicant()) {
            const applicantControls = [
              'dob',
              'gender',
              'mobile',
              'key_skills',
              'work_experiences',
              'expected_salary'
            ]
            applicantControls.forEach(controlName => {
              const control = this.userProfileForm.get(controlName)
              if (control) {
                control.setValidators([Validators.required])
                control.updateValueAndValidity()
              }
            })
          }
        } else {
          this.toaster.error(
            response.message || 'Failed to retrieve user profile data'
          )
        }
      },
      error: (error: any) => {
        this.loader.hide()
        this.toaster.error(
          error.error?.message ||
          'An error occurred while fetching user profile data'
        )
      }
    })
  }

  addSkill(): void {
    const skill = this.newSkill.trim()
    if (!skill) {
      //  this.toaster.warning('Skill cannot be empty.');
      return
    }
    if (skill.length < 2) {
      // this.toaster.warning('Skill must be at least 2 characters long.');
      return
    }
    if (skill.length > 50) {
      //  this.toaster.warning('Skill cannot exceed 50 characters.');
      return
    }
    if (skill && !this.skillsArray.includes(skill)) {
      this.skillsArray.push(skill)
      this.newSkill = ''
      this.updateSkillsInForm()
    }
  }

  removeSkill(index: number): void {
    this.skillsArray.splice(index, 1)
    this.updateSkillsInForm()
  }

  updateSkillsInForm(): void {
    this.userProfileForm.get('key_skills')?.setValue(this.skillsArray)
    this.userProfileForm.get('key_skills')?.markAsTouched()
  }

  onSkillEnter(event: any): void {
    event.preventDefault() // prevent form submit or validation triggering
    this.addSkill()
  }

  preventFormSubmit(event: any): void {
    event.preventDefault() // Prevent form-wide submit behavior
    event.stopPropagation() // Stop the event from bubbling up
  }
  onInputFocus(): void {
    // Manually mark the input field as touched to trigger validation error
    this.userProfileForm.get('key_skills')?.markAsTouched()
  }

  // expectedSalaryValidator(): ValidatorFn {
  //   return (control: AbstractControl): ValidationErrors | null => {
  //     const value = control.value;
  //     if (!value) return null;
  //     const numStr = value.toString().replace(/,/g, '');
  //     if (numStr.length > 7) {
  //       return { maxDigits: true };
  //     }
  //     return null;
  //   };
  // }
  expectedSalaryValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value
      if (!value) return null // Allow empty value as valid
      const numStr = value.toString().replace(/,/g, '') // Remove commas before checking length
      if (numStr.length > 8) {
        return { maxDigits: 'Salary should not exceed 8 digits' } // Validation error for too many digits
      }
      return null // No error if the length is valid
    }
  }

  navigate() {
    this.router.navigate(['job-list'])
  }

  goBack(): void {
    this.router.navigate(['job-list'])
  }

  private scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  // onInputChange(event: Event): void {
  //   const inputElement = event.target as HTMLInputElement;

  //   // Regular expression to match only letters and spaces
  //   const regex = /^[a-zA-Z\s]*$/;

  //   // If the value contains any invalid characters, we remove them
  //   if (!regex.test(value)) {
  //     value = value.replace(/[^a-zA-Z\s]/g, ''); // Remove non-alphabetic characters
  //     inputElement.value = value; // Set the modified value back to the input
  //   }
  // }

  restrictNumeric(event: KeyboardEvent): void {
    const regex = /^[a-zA-Z\s]*$/ // Regex for allowing only alphabets and spaces
    const inputChar = String.fromCharCode(event.charCode)
    if (!regex.test(inputChar)) {
      event.preventDefault() // Prevent the input if it doesn't match the regex
    }
  }


  countryDialCodes = ['+91', '+1', '+44', '+971']
  countries = ['India', 'USA', 'UK', 'UAE']
  nationalities = ['Indian', 'American', 'British', 'Iraqi']
  contactTypes = [
    'Email',
    'LinkedIn',
    'Messenger',
    'Telephone Number',
    'Viber',
    'Whatsapp'
  ]

  additionalContacts() {
    return (this.form.get('additional_contact_info') as FormArray).controls;
  }

  addContact() {
    (this.form.get('additional_contact_info') as FormArray).push(
      this.fb.group({
        contact_type: new FormControl(['']),
        value: new FormControl([''])
      })
    )
  }

  getworkExp() {
    return (this.secondForm.get('work_experience_info') as FormArray).controls;
  }

  addWorkExp() {
    (this.secondForm.get('work_experience_info') as FormArray).push(
      this.fb.group({
        work_experience_from: new FormControl(['']),
        work_experience_to: new FormControl(['']),
        work_experience_title: new FormControl(['']),
        work_experience_employer: new FormControl([''])
      })
    )
  }

  getEducation() {
    return (this.secondForm.get('education_info') as FormArray).controls;
  }

  addEducation() {
    (this.secondForm.get('education_info') as FormArray).push(
      this.fb.group({
        education_from: new FormControl(['']),
        education_to: new FormControl(['']),
        education_title: new FormControl(['']),
        education_institute: new FormControl([''])
      })
    )
  }

  getCourse() {
    return (this.secondForm.get('course_info') as FormArray).controls;
  }

  addCourse() {
    (this.secondForm.get('course_info') as FormArray).push(
      this.fb.group({
        course_from: new FormControl(['']),
        course_to: new FormControl(['']),
        course_title: new FormControl(['']),
        course_provider: new FormControl([''])
      })
    )
  }

  getCetificate() {
    return (this.secondForm.get('certification_info') as FormArray).controls;
  }

  addCertificate() {
    (this.secondForm.get('certification_info') as FormArray).push(
      this.fb.group({
        certification_from: new FormControl(['']),
        certification_to: new FormControl(['']),
        certification_title: new FormControl(['']),
        certification_issuer: new FormControl([''])
      })
    )
  }

  removeContact(index: number) {
    (this.form.get('additional_contact_info') as FormArray).removeAt(index)
  }

  getFileName(path: string | null): string {
    if (!path) return ''
    // Extract filename from path
    const parts = path.split(/[\/\\]/)
    return parts[parts.length - 1]
  }

  onFileSelected(event: Event, controlName: string): void {
    const file = (event.target as HTMLInputElement).files?.[0];

    if (file) {
      if (!file.type.startsWith('image/')) {
        this.toaster.warning('Please select an image file.');
        // Optionally, clear the selected file
        (event.target as HTMLInputElement).value = ''; // Reset input file
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result; // Set the preview for the selected image
      };
      reader.readAsDataURL(file);

      // Your existing compression and upload logic
      if (this.allowedImageFormats.includes(file.type)) {
        this.imageCompressionService
          .compressImage(file)
          .then((compressedImageUrl: string) => {
            fetch(compressedImageUrl)
              .then(res => res.blob())
              .then(compressedFileBlob => {
                const compressedFile = new File(
                  [compressedFileBlob],
                  file.name,
                  { type: file.type }
                );

                // Upload image
                const folderName = 'user-details';
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                const userId = user.id;
                this.adminService
                  .uploadFile({ folderName, file: compressedFile, userId })
                  .subscribe(
                    (response: any) => {
                      if (response.statusCode === 200) {
                        this.form.patchValue({
                          [controlName]: response.data.path
                        });
                      } else {
                        console.error(response.message);
                      }
                    },
                    (error: any) => {
                      console.error('Error uploading file:', error);
                    }
                  );
              });
          });
      }
    }
  }

  workExperiences = [{}] // allow dynamic add/remove later
  educations = [{}]
  courses = [{}]
  certifications = [{}]
}
