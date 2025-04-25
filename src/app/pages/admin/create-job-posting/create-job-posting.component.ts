import { Component } from '@angular/core'
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
  FormsModule
} from '@angular/forms'
import { AdminService } from 'src/app/core/services/admin/admin.service'
import { ActivatedRoute, Router } from '@angular/router'
import { ImageCompressionService } from 'src/app/core/services/image/image-compression.service'
import { CommonModule, formatDate } from '@angular/common'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatSelectModule } from '@angular/material/select'
import { MatDatepickerModule } from '@angular/material/datepicker'
import { MatNativeDateModule } from '@angular/material/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatChipsModule } from '@angular/material/chips'
import countries from '../../../core/helpers/country.json'
import { MatCardModule } from '@angular/material/card'
import { TablerIconsModule } from 'angular-tabler-icons'
import { LoaderService } from 'src/app/core/services/loader.service'

@Component({
  selector: 'app-create-job-posting',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatCardModule,
    FormsModule,TablerIconsModule
  ],
  templateUrl: './create-job-posting.component.html',
  styleUrls: ['./create-job-posting.component.scss']
})
export class CreateJobPostingComponent {
  jobForm: FormGroup
  isEditMode = false
  countryList = countries
  newSkill: string = ''
  skillsArray: string[] = []
  socialMediaOptions = [
    { label: 'Facebook', value: 'facebook' },
    { label: 'LinkedIn', value: 'linkedin' }
  ]

  isDatePublishedReadonly = true
  todaysDate = new Date()

  private readonly allowedImageFormats = [
    'image/jpeg',
    'image/png',
    'image/webp'
  ]
  imagePreview: string | ArrayBuffer | null = null
  constructor (
    private fb: FormBuilder,
    private adminService: AdminService,
    private route: ActivatedRoute,
    private router: Router,
    private imageCompressionService: ImageCompressionService,
     private loader: LoaderService,
  ) // private notify :NotifyService,

  {
    this.jobForm = new FormGroup(
      {
        id: new FormControl(''),
        job_type: new FormControl('', Validators.required),
        rank: new FormControl('', Validators.required),
        // skills_required: new FormControl([], Validators.required),
        skills_required: new FormControl(
          [],
          [
            Validators.required,
            Validators.maxLength(50),
            this.SkillArrayValidator(1, 10),
            this.skillsValidator(2, 50)
          ]
        ),
        title: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          this.minLengthWithoutSpaces(2),
          Validators.pattern('^[a-zA-Z0-9\\s,().-]+$'),
          Validators.maxLength(50)
        ]),
        featured_image: new FormControl(null, Validators.required),
        date_published: new FormControl(this.todaysDate, Validators.required),
        deadline: new FormControl('', [Validators.required]),
        short_description: new FormControl('', [
          Validators.required,
          Validators.min(2),
          this.minLengthWithoutSpaces(2),
          Validators.maxLength(250)
        ]),
        full_description: new FormControl('', [
          Validators.required,
          Validators.min(2),
          this.minLengthWithoutSpaces(2),
          Validators.maxLength(1000)
        ]),
        assignment_duration: new FormControl('', [
          Validators.required,
          Validators.min(2),
          this.minLengthWithoutSpaces(2),
          Validators.maxLength(50)
        ]),
        employer: new FormControl('', [
          Validators.required,
          Validators.min(2),
          Validators.maxLength(100)
        ]),
        required_experience: new FormControl('', [
          Validators.required,
          Validators.maxLength(50)
        ]),
        start_salary: new FormControl('', [
          Validators.required,
          Validators.min(3),
          Validators.maxLength(7)
        ]),
        end_salary: new FormControl('', [
          Validators.required,
          Validators.min(3),
          Validators.maxLength(8)
        ]),
        application_instruction: new FormControl('', [
          Validators.required,
          Validators.min(2),
          this.minLengthWithoutSpaces(2),
          Validators.maxLength(1500)
        ]),
        country_code: new FormControl('', Validators.required),
        address: new FormControl('', [
          Validators.required,
          Validators.min(2),
          this.minLengthWithoutSpaces(2),
          Validators.maxLength(100)
        ]),
        social_media_type: new FormControl([], Validators.required),
        posted_at: new FormControl('', Validators.required),
        jobpost_status: new FormControl('draft'),
        job_type_post: new FormControl('', Validators.required)
        // work_type: new FormControl(''),
        // file_path: new FormControl(null),
      },
      { validators: this.salaryComparisonValidator }
    )
  }

  ngOnInit (): void {
    const jobId = this.route.snapshot.paramMap.get('id') as string
    if (jobId) {
      this.isEditMode = true
      this.getJobPosting(jobId)
    }
    if (this.isEditMode) {
      this.jobForm.get('social_media_type')?.disable()
      this.jobForm.get('job_type_post')?.disable()
      this.jobForm.get('job_type_post')?.disable()
    } else {
      this.jobForm.get('social_media_type')?.enable()
      this.jobForm.get('job_type_post')?.enable()
    }
    this.jobForm.get('job_type_post')?.valueChanges.subscribe(value => {
      const postedAtControl = this.jobForm.get('posted_at')
      if (value === 'schedulelater') {
        postedAtControl?.setValidators([
          Validators.required,
          this.validateMinimumTime()
        ])
      } else {
        postedAtControl?.clearValidators()
        postedAtControl?.setValue('')
      }
      postedAtControl?.updateValueAndValidity()
    })
    const today = new Date().toISOString().split('T')[0]
    this.jobForm.get('date_published')?.setValue(today)
    this.jobForm
      .get('deadline')
      ?.setValidators([
        Validators.required,
        this.deadlineValidator(this.todaysDate)
      ])
    //  this.listenToJobPostingStatus();
  }
  addSkill (): void {
    const skill = this.newSkill.trim()
    if (!skill) {
      // this.notify.showWarning('Skill cannot be empty.');
      return
    }
    if (skill.length < 2) {
      // this.notify.showWarning('Skill must be at least 2 characters long.');
      return
    }
    if (skill.length > 50) {
      // this.notify.showWarning('Skill cannot exceed 50 characters.');
      return
    }
    if (skill && !this.skillsArray.includes(skill)) {
      this.skillsArray.push(skill)
      this.newSkill = '' // Clear the input field
      this.updateSkillsInForm()
    }
  }

  removeSkill (index: number): void {
    this.skillsArray.splice(index, 1)
    this.updateSkillsInForm()
  }

  updateSkillsInForm (): void {
    this.jobForm.get('skills_required')?.setValue(this.skillsArray)
    this.jobForm.get('skills_required')?.markAsTouched()
  }

  // listenToJobPostingStatus(): void {
  //   this.jobForm.get('job_type_post')?.valueChanges.subscribe((value) => {
  //     const postedAtControl = this.jobForm.get('posted_at');
  //     if (value === 'schedulelater') {
  //       postedAtControl?.setValidators([Validators.required,  this.postedAtValidator()]);
  //     } else {
  //       postedAtControl?.clearValidators();
  //       postedAtControl?.setValue(''); // Clear the value
  //     }
  //     postedAtControl?.updateValueAndValidity();
  //   });
  // }
  validateMinimumTime (): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null
      }

      const selectedDate = new Date(control.value)
      const currentDate = new Date()
      const oneHourFromNow = new Date(currentDate.getTime() + 60 * 60 * 1000) // Add 1 hour

      return selectedDate < oneHourFromNow ? { minimumTime: true } : null
    }
  }
  skillsValidator (minLength: number, maxLength: number): ValidatorFn {
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
  SkillArrayValidator (min: number, max: number) {
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
  minLengthWithoutSpaces (minLength: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null
      }

      const trimmedValue = control.value.trim()
      if (trimmedValue.length < minLength) {
        return {
          minLengthWithoutSpaces: {
            requiredLength: minLength,
            actualLength: trimmedValue.length
          }
        }
      }

      return null
    }
  }
  postedAtValidator (): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const selectedDate = new Date(control.value)
      const now = new Date()

      if (control.value && selectedDate < now) {
        return { pastDateTime: true }
      }
      return null
    }
  }

  formatSalary (controlName: string): void {
    const control = this.jobForm.get(controlName)
    if (control) {
      let value = control.value
      if (value) {
        value = value.replace(/[^0-9]/g, '')
        const formattedValue = new Intl.NumberFormat('en-US').format(
          Number(value)
        )
        control.setValue(formattedValue, { emitEvent: false })
      }
    }
  }

  sanitizeFormValues (): void {
    Object.keys(this.jobForm.controls).forEach(key => {
      const control = this.jobForm.get(key)
      if (control && typeof control.value === 'string') {
        control.setValue(control.value.trim())
      }
    })
  }
  deadlineValidator (date_published: Date): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const selectedDeadline = new Date(control.value)
      const today = new Date()

      if (selectedDeadline < today || selectedDeadline < date_published) {
        return { deadlineInvalid: true }
      }
      return null
    }
  }
  salaryComparisonValidator (control: AbstractControl): ValidationErrors | null {
    const startSalaryControl = control.get('start_salary')
    const endSalaryControl = control.get('end_salary')

    if (startSalaryControl && endSalaryControl) {
      const startSalary = parseInt(
        (startSalaryControl.value || '0').replace(/,/g, ''),
        10
      )
      const endSalary = parseInt(
        (endSalaryControl.value || '0').replace(/,/g, ''),
        10
      )

      if (startSalary > endSalary) {
        endSalaryControl.setErrors({ salaryMismatch: true })
        return { salaryMismatch: true }
      } else {
        if (endSalaryControl.hasError('salaryMismatch')) {
          const endSalaryErrors = { ...endSalaryControl.errors }
          delete endSalaryErrors['salaryMismatch']
          endSalaryControl.setErrors(
            Object.keys(endSalaryErrors).length ? endSalaryErrors : null
          )
        }
      }
    }
    return null
  }

  getJobPosting (jobId: string): void {
    this.loader.show();
    this.adminService.getJobById(jobId).subscribe((response: any) => {
      if (response.statusCode === 200 && response.data) {
        const data = response.data
        this.loader.hide();
        //  console.log(data);
        // const formattedImageUrl = data.featured_image.replace(/\\/g, '/');
        // this.jobForm.patchValue({featured_image: formattedImageUrl,});
        const formattedDatePublished = formatDate(
          data.date_published,
          'yyyy-MM-dd',
          'en-US'
        )
        const formattedDeadline = formatDate(
          data.deadline,
          'yyyy-MM-dd',
          'en-US'
        )
        const socialMediaTypes = data.social_media_type
          ? JSON.parse(data.social_media_type)
          : []
        //  const formattedPostedAt = data.posted_at
        //  ? new Date(data.posted_at).toISOString().slice(0, 16)
        //  : '';
        //  const formattedPostedAt = data.posted_at
        //  ? new Date(data.posted_at).toLocaleString('en-GB', {
        //      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        //      year: 'numeric',
        //      month: '2-digit',
        //      day: '2-digit',
        //      hour: '2-digit',
        //      minute: '2-digit',
        //    }).replace(',', '') // Optional: Remove comma for formatting
        //  : '';
        const skills = data.skills_required
          ? JSON.parse(data.skills_required)
          : []
        this.skillsArray = Array.isArray(skills) ? skills : []

        const formattedStartSalary = data.start_salary
          ? new Intl.NumberFormat('en-US').format(Number(data.start_salary))
          : ''
        const formattedEndSalary = data.end_salary
          ? new Intl.NumberFormat('en-US').format(Number(data.end_salary))
          : ''

        this.jobForm.patchValue({
          id: data.id || '',
          job_type: data.job_type || '',
          rank: data.rank || '',
          skills_required: this.skillsArray,
          title: data.title || '',
          featured_image: data.featured_image || null,
          date_published: formattedDatePublished || '',
          deadline: formattedDeadline || '',
          short_description: data.short_description || '',
          full_description: data.full_description || '',
          assignment_duration: data.assignment_duration || '',
          employer: data.employer || '',
          required_experience: data.required_experience || '',
          start_salary: formattedStartSalary || 0,
          end_salary: formattedEndSalary || 0,
          application_instruction: data.application_instruction,
          country_code: data.country_code || '',
          address: data.address || '',
          social_media_type: socialMediaTypes,
          posted_at: data.posted_at,
          jobpost_status: data.jobpost_status || 'draft',
          job_type_post: data.job_type_post
          // work_type: data.work_type || '',
          // file_path: data.file || null,
        })
        if (data.featured_image) {
          this.imagePreview = data.featured_image;
        }else {
          this.loader.hide();
      }
        // console.error('Failed to retrieve job posting data', response.message)
      }
    })
  }

  onFileSelected (event: Event, controlName: string): void {
    const file = (event.target as HTMLInputElement).files?.[0]

    if (file) {
      // Create preview
      const reader = new FileReader()
      reader.onload = () => {
        this.imagePreview = reader.result
      }
      reader.readAsDataURL(file)

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
                )

                // this.jobForm.patchValue({ [controlName]: compressedFile });
                const folderName = 'job-postings'
                const user = JSON.parse(localStorage.getItem('user') || '{}')
                const userId = user.id
                this.adminService
                  .uploadFile({ folderName, file: compressedFile, userId })
                  .subscribe(
                    (response: any) => {
                      if (response.statusCode === 200) {
                        // this.notify.showSuccess(response.message);
                        this.jobForm.patchValue({
                          [controlName]: response.data.path
                        })
                      } else {
                        // this.notify.showWarning(response.message);
                      }
                    },
                    (error: any) => {
                      console.error('Error uploading file:', error)
                    }
                  )
              })
          })
      } else {
        // this.notify.showWarning("Invalid image format")
      }
    }
  }

  clearImage () {
    this.jobForm.patchValue({
      featured_image: null
    })
    this.imagePreview = null
  }
  // onSubmit (): void {
  //   // debugger

  //   if (this.jobForm.valid) {
  //     this.sanitizeFormValues()
  //     const formValues = this.jobForm.value
  //     // if (formValues.posted_at) {
  //     //   const localDate = new Date(formValues.posted_at);
  //     //   formValues.posted_at = localDate.toISOString(); // Convert to UTC ISO format
  //     // }
  //     //     if (formValues.posted_at) {
  //     //   const localDate = new Date(formValues.posted_at);
  //     //   formValues.posted_at = localDate.toISOString(); // Convert to ISO format
  //     // }
  //     //  const jobTypeControl = this.jobForm.get('job_type');
  //     //  if (jobTypeControl) {
  //     //    formValues.job_type.setValue(jobTypeControl.value.toUpperCase(), { emitEvent: false });
  //     //   }

  //     if (formValues.start_salary) {
  //       formValues.start_salary = parseInt(
  //         formValues.start_salary.replace(/,/g, ''),
  //         10
  //       )
  //     }
  //     if (formValues.end_salary) {
  //       formValues.end_salary = parseInt(
  //         formValues.end_salary.replace(/,/g, ''),
  //         10
  //       )
  //     }
  //     if (!formValues.id) {
  //       delete formValues.id
  //     }

  //     formValues.skills_required = JSON.stringify(formValues.skills_required)
  //     // if (this.isEditMode) {

  //     //   this.adminService.createOrUpdateJobPosting(formValues).subscribe(response => {
  //     //     if (response.statusCode === 200) {
  //     //       this.notify.showSuccess(response.message);
  //     //       this.router.navigate(['/job-list']);
  //     //     }
  //     //     else{
  //     //       this.notify.showError(response.message);
  //     //       this.spinner.hide();
  //     //     }
  //     //   });
  //     // } else {

  //     //   this.adminService.createOrUpdateJobPosting(formValues).subscribe(response => {
  //     //     if (response.statusCode === 200) {
  //     //       this.notify.showSuccess(response.message);
  //     //       this.router.navigate(['/job-list']);
  //     //     }
  //     //     else{
  //     //       this.notify.showWarning(response.message);
  //     //       this.spinner.hide();
  //     //     }
  //     //   });
  //     this.loader.show();

  //     this.adminService.createOrUpdateJobPosting(formValues).subscribe({
  //       next: (response: any) => {
  //         if (response.statusCode === 200) {
  //           this.loader.hide();
  //           // this.notify.showSuccess(response.message);
  //           this.router.navigate(['/job-list'])
  //         } else {
  //           // this.notify.showError(response.message);
  //         }
  //       },
  //       error: (error: any) => {
  //         // this.notify.showError(error.error?.message);
  //         window.scrollTo({ top: 0, behavior: 'smooth' })
  //       }
  //     })
  //     // } else {
  //     //   this.spinner.show();
  //     //   this.adminService.createOrUpdateJobPosting(formValues).subscribe({
  //     //     next: (response) => {
  //     //       this.spinner.hide();
  //     //       if (response.statusCode === 200) {
  //     //         this.notify.showSuccess(response.message);
  //     //         this.router.navigate(['/job-list']);
  //     //       } else {
  //     //         this.notify.showError(response.message );
  //     //       }
  //     //     },
  //     //     error: (error) => {
  //     //       this.spinner.hide();
  //     //       this.notify.showError(error.error?.message );
  //     //       window.scrollTo({ top: 0, behavior: 'smooth' });
  //     //     }
  //     //   });
  //   } else {
  //     this.loader.hide();
  //     // this.notify.showWarning("Failed to update the form")
  //   }
  // }
  onSubmit (): void {
    if (this.jobForm.valid) {
      this.sanitizeFormValues();
      const formValues = this.jobForm.value;

      if (formValues.start_salary) {
        formValues.start_salary = parseInt(formValues.start_salary.replace(/,/g, ''), 10);
      }
      if (formValues.end_salary) {
        formValues.end_salary = parseInt(formValues.end_salary.replace(/,/g, ''), 10);
      }
      if (!formValues.id) {
        delete formValues.id;
      }

      formValues.skills_required = JSON.stringify(formValues.skills_required);
      this.loader.show();

      this.adminService.createOrUpdateJobPosting(formValues).subscribe({
        next: (response: any) => {
          this.loader.hide();
          if (response.statusCode === 200) {
            this.router.navigate(['/job-list']);
          } else {
            console.error(response.message);
          }
        },
        error: (error: any) => {
          this.loader.hide();
          console.error(error.error?.message);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });

    } else {
      // Mark all fields as touched to show validation errors
      this.jobForm.markAllAsTouched();
      this.loader.hide();
      console.warn("Form is invalid", this.jobForm.errors);
    }
  }

  navigate () {
    this.router.navigate(['/job-list'])
  }

  getFileName (path: string | null): string {
    if (!path) return ''
    // Extract filename from path
    const parts = path.split(/[\/\\]/)
    return parts[parts.length - 1]
  }

  onDateTimeChange (event: any): void {
    const selectedDate = event.value
    if (selectedDate) {
      this.jobForm.patchValue({
        posted_at: selectedDate
      })
    }
  }
}
