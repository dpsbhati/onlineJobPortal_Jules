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
import countries from '../../../core/helpers/country.json'
import currency from '../../../core/helpers/currency.json'
import languages from '../../../core/helpers/languages.json'
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
  fourthForm: FormGroup;
  fileError: string | null = null;
  fileUploaded: File | null = null;
  uploadedFileName: string | null = null;
  countryList = countries
  currencyList = currency
  languageList = languages

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
    this.fourth();
  }

  firstForm() {
    this.form = this.fb.group({
      first_name: new FormControl(null, [
        Validators.required,
        Validators.pattern('^[a-zA-Z ]*$')
      ]),
      last_name: new FormControl(null, [
        Validators.required,
        // Validators.pattern('^[a-zA-Z0-9 ]+$')
        Validators.pattern('^[a-zA-Z ]*$')
      ]),
      email: new FormControl({ value: this.userEmail || '', disabled: true }),
      dob: new FormControl(null, this.isApplicant() ? [Validators.required] : null),
      mobile: new FormControl(
        '',
        this.isApplicant() ?
          [
            Validators.required,
            Validators.pattern('^[0-9]{10}$'),
            this.mobileNumberValidator
          ]
          : null
      ),
      nationalities: new FormControl([], this.isApplicant() ? [Validators.required] : null),
      country: new FormControl(null, this.isApplicant() ? [Validators.required] : null),
      location: new FormControl(null, this.isApplicant() ? [Validators.required] : null),
      dial_code: new FormControl(null, this.isApplicant() ? [Validators.required] : null),
      profile_image_path: new FormControl(null, this.isApplicant() ? [Validators.required] : null),
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
      cv_name: new FormControl(null),
      highest_education_level: new FormControl(null)
    })
  }

  Third() {
    this.thirdForm = this.fb.group({
      other_experience_info: this.fb.array([]),
      project_info: this.fb.array([]),
    })
  }

  fourth() {
    this.fourthForm = this.fb.group({
      language_spoken_info: this.fb.array([]),
      language_written_info: this.fb.array([]),
      notice_period_info: this.fb.group({
        notice_period_months: [0, Validators.min(0)],
        commence_work_date: [null]
      }),
      current_salary_info: this.fb.group({
        currency: [''],
        amount: [0, Validators.min(0)]
      }),
      expected_salary_info: this.fb.group({
        currency: [''],
        amount: [0, Validators.min(0)]
      }),
      preferences_info: this.fb.group({
        department: [[]],
        location: [[]]
      }),
      additional_info: this.fb.group({
        additional_info: ['']
      }),
      vacancy_source_info: this.fb.group({
        vacancy_source: ['']
      })
    });
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
        if (skill?.length < minLength) {
          return {
            minLengthSkill: {
              requiredLength: minLength,
              actualLength: skill?.length
            }
          }
        }
        if (skill?.length > maxLength) {
          return {
            maxLengthSkill: {
              requiredLength: maxLength,
              actualLength: skill?.length
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
      if (skills?.length < min) {
        return { minSkills: { required: min, actual: skills?.length } }
      }
      if (skills?.length > max) {
        return { maxSkills: { required: max, actual: skills?.length } }
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
      if (digitsOnly?.length !== 10) {
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
        if (numStr?.length > 7) return true
      }

      return (
        requiredFields.some(field => {
          const control = this.userProfileForm?.get(field)
          if (!control) return true
          const value = control.value
          if (field === 'key_skills') {
            return !Array.isArray(value) || value?.length === 0
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
    // if (this.userProfileForm.invalid) {
    //   Object.keys(this.userProfileForm.controls).forEach(key => {
    //     const control = this.userProfileForm.get(key)
    //     if (control?.invalid) {
    //       control.markAsTouched()
    //       this.showValidationMessage(key)
    //     }
    //   })
    //   this.scrollToTop()
    //   return
    // }
    this.loader.show()

    // const formValues = this.userProfileForm.value
    // // Format the Date of Birth (dob) if it's set
    // if (formValues.dob) {
    //   formValues.dob = this.formatDate(formValues.dob)
    // }
    // const formattedSkills = formValues.key_skills.map(
    //   (skill: string) => `/${skill}`
    // )

    const payload = {
      ...this.form.value,
      ...this.secondForm.value,
      ...this.thirdForm.value,
      ...this.fourthForm.value
    }
    console.log(payload);
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
    // if (digitsOnly?.length >= 8 && event.key !== 'Backspace' && event.key !== 'Delete') {
    //   event.preventDefault(); // Prevent further input if length exceeds 8 digits
    // }

    // Check if the input length exceeds 8 digits
    const expectedSalaryControl = this.userProfileForm.get('expected_salary')

    if (digitsOnly?.length > 8) {
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
    } else if (digitsOnly?.length > 8) {
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
          const data = response.data;

          // const dob = data.dob
          //   ? new Date(data.dob).toISOString().split('T')[0]
          //   : null
          // const expectedSalary = data.expected_salary
          //   ? data.expected_salary
          //     .toString()
          //     .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
          //   : ''

          this.form.patchValue(response.data);
          this.secondForm.patchValue(response.data);
          this.thirdForm.patchValue(response.data);
          this.fourthForm.patchValue(response.data);
          this.userId = data.id || userId
          if (data.profile_image_path) {
            this.imagePreview = data.profile_image_path;
          }
          if (data.cv_name) {
            this.uploadedFileName = data.cv_name;
          }
          const contactsFormArray = this.form.get('additional_contact_info') as FormArray;
          if (data.additional_contact_info?.length > 0) {
            data.additional_contact_info.forEach((contact: any) => {
              contactsFormArray.push(
                this.fb.group({
                  contact_type: [contact.contact_type || null],
                  value: [contact.value || null]
                })
              );
            });
          }
          else if (data.additional_contact_info?.length == 0 || data.additional_contact_info == null) {
            this.addContact();
          }
          const workExpArray = this.secondForm.get('work_experience_info') as FormArray;
          while (workExpArray?.length !== 0) {
            workExpArray.removeAt(0);
          }
          if (data.work_experience_info && data.work_experience_info?.length > 0) {
            data.work_experience_info.forEach((item: any) => {
              workExpArray.push(
                this.fb.group({
                  work_experience_from: [item.work_experience_from || null, Validators.required],
                  work_experience_to: [item.work_experience_to || null, Validators.required],
                  work_experience_title: [item.work_experience_title || null, Validators.required],
                  work_experience_employer: [item.work_experience_employer || null, Validators.required]
                })
              );
            });
          } else if (!data.work_experience_info || data.work_experience_info?.length === 0) {
            this.addWorkExp();
          }
          const educationArray = this.secondForm.get('education_info') as FormArray;
          while (educationArray?.length !== 0) {
            educationArray.removeAt(0);
          }
          if (data.education_info && data.education_info?.length > 0) {
            data.education_info.forEach((item: any) => {
              educationArray.push(
                this.fb.group({
                  education_from: [item.education_from || null, Validators.required],
                  education_to: [item.education_to || null, Validators.required],
                  education_title: [item.education_title || null, Validators.required],
                  education_institute: [item.education_institute || null, Validators.required]
                })
              );
            });
          } else if (!data.education_info || data.education_info?.length === 0) {
            this.addEducation();
          }
          const courseArray = this.secondForm.get('course_info') as FormArray;
          while (courseArray?.length !== 0) {
            courseArray.removeAt(0);
          }
          if (data.course_info && data.course_info?.length > 0) {
            data.course_info.forEach((item: any) => {
              courseArray.push(
                this.fb.group({
                  course_from: [item.course_from || null, Validators.required],
                  course_to: [item.course_to || null, Validators.required],
                  course_title: [item.course_title || null, Validators.required],
                  course_provider: [item.course_provider || null, Validators.required]
                })
              );
            });
          } else if (!data.course_info || data.course_info?.length === 0) {
            this.addCourse();
          }
          const certificateArray = this.secondForm.get('certification_info') as FormArray;
          while (certificateArray?.length !== 0) {
            certificateArray.removeAt(0);
          }
          if (data.certification_info && data.certification_info?.length > 0) {
            data.certification_info.forEach((item: any) => {
              certificateArray.push(
                this.fb.group({
                  certification_from: [item.course_from || null, Validators.required],
                  certification_to: [item.course_to || null, Validators.required],
                  certification_title: [item.course_title || null, Validators.required],
                  certification_issuer: [item.course_provider || null, Validators.required]
                })
              );
            });
          } else if (!data.certification_info || data.certification_info?.length === 0) {
            this.addCertificate();
          }
          const otherExpArray = this.thirdForm.get('other_experience_info') as FormArray;
          while (otherExpArray?.length !== 0) {
            otherExpArray.removeAt(0);
          }
          if (data.other_experience_info && data.other_experience_info?.length > 0) {
            data.other_experience_info.forEach((item: any) => {
              otherExpArray.push(
                this.fb.group({
                  other_experience_from: [item.other_experience_from || null, Validators.required],
                  other_experience_to: [item.other_experience_to || null, Validators.required],
                  other_experience_description: [item.other_experience_description || null, Validators.required]
                })
              );
            });
          } else if (!data.other_experience_info || data.other_experience_info?.length === 0) {
            this.addOtherExp();
          }
          const projectsArray = this.thirdForm.get('project_info') as FormArray;
          while (projectsArray?.length !== 0) {
            projectsArray.removeAt(0);
          }
          if (data.project_info && data.project_info?.length > 0) {
            data.project_info.forEach((item: any) => {
              projectsArray.push(
                this.fb.group({
                  project_from: [item.project_from || null, Validators.required],
                  project_to: [item.project_to || null, Validators.required],
                  project_name: [item.project_name || null, Validators.required],
                  project_role: [item.project_role || null, Validators.required]
                })
              );
            });
          } else if (!data.project_info || data.project_info?.length === 0) {
            this.addProjects();
          }
          const langSpokenArray = this.fourthForm.get('language_spoken_info') as FormArray;
          while (langSpokenArray?.length !== 0) {
            langSpokenArray.removeAt(0);
          }
          if (data.language_spoken_info && data.language_spoken_info?.length > 0) {
            data.language_spoken_info.forEach((item: any) => {
              langSpokenArray.push(
                this.fb.group({
                  language: [item.language || null, Validators.required],
                  proficiency: [item.proficiency || null, Validators.required]
                })
              );
            });
          } else if (!data.language_spoken_info || data.language_spoken_info?.length === 0) {
            this.addLangSpoken();
          }
          const langWrittenArray = this.fourthForm.get('language_written_info') as FormArray;
          while (langWrittenArray?.length !== 0) {
            langWrittenArray.removeAt(0);
          }
          if (data.language_written_info && data.language_written_info?.length > 0) {
            data.language_written_info.forEach((item: any) => {
              langWrittenArray.push(
                this.fb.group({
                  language: [item.language || null, Validators.required],
                  proficiency: [item.proficiency || null, Validators.required]
                })
              );
            });
          } else if (!data.language_written_info || data.language_written_info?.length === 0) {
            this.addLangWritten();
          }

          //   if (this.isApplicant()) {
          //     const applicantControls = [
          //       'dob',
          //       'gender',
          //       'mobile',
          //       'key_skills',
          //       'work_experiences',
          //       'expected_salary'
          //     ]
          //     applicantControls.forEach(controlName => {
          //       const control = this.userProfileForm.get(controlName)
          //       if (control) {
          //         control.setValidators([Validators.required])
          //         control.updateValueAndValidity()
          //       }
          //     })
          //   }
          // } else {
          //   this.toaster.error(
          //     response.message || 'Failed to retrieve user profile data'
          //   )
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
    if (skill?.length < 2) {
      // this.toaster.warning('Skill must be at least 2 characters long.');
      return
    }
    if (skill?.length > 50) {
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
  //     if (numStr?.length > 7) {
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
      if (numStr?.length > 8) {
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

  additionalContacts() {
    return (this.form.get('additional_contact_info') as FormArray).controls;
  }

  addContact() {
    (this.form.get('additional_contact_info') as FormArray).push(
      this.fb.group({
        contact_type: new FormControl(null, [Validators.required]),
        value: new FormControl(null, [Validators.required])
      })
    )
  }

  getworkExp() {
    return (this.secondForm.get('work_experience_info') as FormArray).controls;
  }

  addWorkExp() {
    (this.secondForm.get('work_experience_info') as FormArray).push(
      this.fb.group({
        work_experience_from: new FormControl(null, [Validators.required]),
        work_experience_to: new FormControl(null, [Validators.required]),
        work_experience_title: new FormControl(null, [Validators.required]),
        work_experience_employer: new FormControl(null, [Validators.required])
      })
    )
  }

  getEducation() {
    return (this.secondForm.get('education_info') as FormArray).controls;
  }

  addEducation() {
    (this.secondForm.get('education_info') as FormArray).push(
      this.fb.group({
        education_from: new FormControl(null, [Validators.required]),
        education_to: new FormControl(null, [Validators.required]),
        education_title: new FormControl(null, [Validators.required]),
        education_institute: new FormControl(null, [Validators.required])
      })
    )
  }

  getOtherExp() {
    return (this.thirdForm.get('other_experience_info') as FormArray).controls;
  }

  addOtherExp() {
    (this.thirdForm.get('other_experience_info') as FormArray).push(
      this.fb.group({
        other_experience_from: new FormControl(null, [Validators.required]),
        other_experience_to: new FormControl(null, [Validators.required]),
        other_experience_description: new FormControl(null, [Validators.required])
      })
    )
  }

  getProjects() {
    return (this.thirdForm.get('project_info') as FormArray).controls;
  }

  addProjects() {
    (this.thirdForm.get('project_info') as FormArray).push(
      this.fb.group({
        project_from: new FormControl(null, [Validators.required]),
        project_to: new FormControl(null, [Validators.required]),
        project_name: new FormControl(null, [Validators.required]),
        project_role: new FormControl(null, [Validators.required])
      })
    )
  }

  getCourse() {
    return (this.secondForm.get('course_info') as FormArray).controls;
  }

  addCourse() {
    (this.secondForm.get('course_info') as FormArray).push(
      this.fb.group({
        course_from: new FormControl(null, [Validators.required]),
        course_to: new FormControl(null, [Validators.required]),
        course_title: new FormControl(null, [Validators.required]),
        course_provider: new FormControl(null, [Validators.required])
      })
    )
  }

  getCetificate() {
    return (this.secondForm.get('certification_info') as FormArray).controls;
  }

  addCertificate() {
    (this.secondForm.get('certification_info') as FormArray).push(
      this.fb.group({
        certification_from: new FormControl(null, [Validators.required]),
        certification_to: new FormControl(null, [Validators.required]),
        certification_title: new FormControl(null, [Validators.required]),
        certification_issuer: new FormControl(null, [Validators.required])
      })
    )
  }

  addLangSpoken() {
    (this.fourthForm.get('language_spoken_info') as FormArray).push(
      this.fb.group({
        language: new FormControl(null, [Validators.required]),
        proficiency: new FormControl(null, [Validators.required])
      })
    )
  }

  addLangWritten() {
    (this.fourthForm.get('language_written_info') as FormArray).push(
      this.fb.group({
        language: new FormControl(null, [Validators.required]),
        proficiency: new FormControl(null, [Validators.required])
      })
    )
  }

  removeLangSpoken(index: number) {
    (this.fourthForm.get('language_spoken_info') as FormArray).removeAt(index)
  }

  removeLangWritten(index: number) {
    (this.fourthForm.get('language_written_info') as FormArray).removeAt(index)
  }

  removeContact(index: number) {
    (this.form.get('additional_contact_info') as FormArray).removeAt(index)
  }

  removeWorkExp(index: number) {
    (this.secondForm.get('work_experience_info') as FormArray).removeAt(index)
  }

  removeEducation(index: number) {
    (this.form.get('education_info') as FormArray).removeAt(index)
  }

  removeCourse(index: number) {
    (this.secondForm.get('course_info') as FormArray).removeAt(index)
  }

  removeCertificate(index: number) {
    (this.secondForm.get('certification_info') as FormArray).removeAt(index)
  }

  removeOtherExp(index: number) {
    (this.thirdForm.get('other_experience_info') as FormArray).removeAt(index)
  }

  removeProjects(index: number) {
    (this.thirdForm.get('project_info') as FormArray).removeAt(index)
  }

  getFileName(path: string | null): string {
    if (!path) return ''
    // Extract filename from path
    const parts = path.split(/[\/\\]/)
    return parts[parts?.length - 1]
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

  onFileChange(event: Event, controlName: string): void {
    const fileInput = event.target as HTMLInputElement;
    const files = fileInput?.files;

    if (!files) {
      return;
    }

    const validFormats = ['application/pdf', 'application/msword'];
    const maxFileSize = 5 * 1024 * 1024;

    const file = files[0];

    if (!validFormats.includes(file.type)) {
      this.fileError = 'Invalid file format. Only PDF files are allowed.';
      this.uploadedFileName = null;
      return;
    }

    if (file.size > maxFileSize) {
      this.fileError = 'File size should not exceed 5 MB.';
      return;
    }
    this.loader.show();

    this.fileError = null;
    this.fileUploaded = file;
    this.uploadedFileName = file.name

    // Make API call for CV upload
    const folderName = 'user-details';
    const userId = JSON.parse(localStorage.getItem('user') || '{}').id;

    this.adminService.uploadFile({ folderName, file, userId }).subscribe(
      (response: any) => {
        if (response.statusCode === 200) {
          // this.toastr.success(response.message);
          this.secondForm.patchValue({
            [controlName]: response.data.path,
            cv_name: response.data.originalName
          });
          this.loader.hide();
        } else {
          // this.toastr.warning(response.message);
          this.loader.hide();
        }
      },
      error => {
        // this.toastr.error('Error uploading CV file. Please try again.');
        console.error(error);
      }
    );

    // Reset file input to allow selecting the same file again
    fileInput.value = '';
  }

  getlanguageSpoken() {
    return (this.fourthForm.get('language_spoken_info') as FormArray).controls;
  }

  getlanguageWritten() {
    return (this.fourthForm.get('language_written_info') as FormArray).controls;
  }

  filteredCountryList() {
    return this.countryList?.filter(country => country.nationalities && country.nationalities?.length > 0) || [];
  }

}
