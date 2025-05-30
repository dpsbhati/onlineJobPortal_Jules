import { Component } from '@angular/core'
import { FormGroup, Validators, FormControl, ReactiveFormsModule, AbstractControl, ValidationErrors, ValidatorFn, FormsModule } from '@angular/forms'
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
import { ToastrService } from 'ngx-toastr'

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
    FormsModule, TablerIconsModule
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
 uniqueRanks: { id: string; rank_name: string }[] = [];
  constructor(
    private adminService: AdminService,
    private route: ActivatedRoute,
    private router: Router,
    private imageCompressionService: ImageCompressionService,
    private loader: LoaderService,
    private toaster: ToastrService
  )

  {
    this.jobForm = new FormGroup(
      {
        id: new FormControl(''),
        vessel_type: new FormControl('', Validators.required),
        rank: new FormControl('', Validators.required),
        skills_required: new FormControl(
          [],
          // [
          //   Validators.maxLength(50),
          //   this.SkillArrayValidator(1, 10),
          //   this.skillsValidator(2, 50)
          // ]
        ),
        // title: new FormControl('', [
        //   Validators.required,
        //   Validators.minLength(2),
        //   this.minLengthWithoutSpaces(2),
        //   Validators.pattern('^[a-zA-Z0-9\\s,().-]+$'),
        //   Validators.maxLength(50)
        // ]),
        number_of_vacancy: new FormControl('', [
  Validators.required,
  Validators.pattern(/^[0-9]+$/), // digits only
  Validators.maxLength(4)         // optional: max 4 digits
]),
        featured_image: new FormControl(null, Validators.required),
        // date_published: new FormControl(this.todaysDate, Validators.required),
        deadline: new FormControl('', [Validators.required]),
        short_description: new FormControl('', [
          Validators.required,
          Validators.min(2),
          this.minLengthWithoutSpaces(2),
          Validators.maxLength(250)
        ]),
        // full_description: new FormControl('', [
        //   Validators.required,
        //   Validators.min(2),
        //   this.minLengthWithoutSpaces(2),
        //   Validators.maxLength(1000)
        // ]),
        // assignment_duration: new FormControl('', [
        //   Validators.required,
        // ]),
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
     Validators.maxLength(30),
  Validators.pattern('^[a-zA-Z0-9\\s,\\-]+$')
        ]),
        end_salary: new FormControl(null, [
        ]),
        application_instruction: new FormControl('', [
          Validators.required,
          Validators.min(2),
          this.minLengthWithoutSpaces(2),
          Validators.maxLength(1500)
        ]),
        country_code: new FormControl('PH', Validators.required),
        address: new FormControl('Philippines, Navilands Marine Inc', [
          Validators.required,
          Validators.min(2),
          this.minLengthWithoutSpaces(2),
          Validators.maxLength(100)
        ]),
        social_media_type: new FormControl([], Validators.required),
        posted_at: new FormControl('', Validators.required),
        posted_date: new FormControl('', Validators.required),
        jobpost_status: new FormControl('Draft'),
        job_type_post: new FormControl('', Validators.required)
      },
    )
  }

  ngOnInit(): void {
    this.allrankslist();
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
      this.onJobTypePostChange(value);
    })
    // const today = new Date().toISOString().split('T')[0]
    // this.jobForm.get('date_published')?.setValue(today)
    // this.jobForm
    //   .get('deadline')
    //   ?.setValidators([
    //     Validators.required,
    //   ])

    this.jobForm.get('deadline')?.setValidators([
  Validators.required,
  this.deadlineValidator()
]);

// this.jobForm.get('posted_date')?.setValidators([
//   Validators.required,
//   this.postedDateValidator()
// ]);


  }
  addSkill(): void {
    const skill = this.newSkill.trim()
    if (!skill) {

      return
    }
    if (skill.length < 2) {

      return
    }
    if (skill.length > 50) {

      return
    }
    if (skill && !this.skillsArray.includes(skill)) {
      this.skillsArray.push(skill)
      this.newSkill = '' // Clear the input field
      this.updateSkillsInForm()
    }
  }

  // Method to handle dynamic changes to validation based on job type
  // onJobTypePostChange(value: string): void {
  //   const postedAtControl = this.jobForm.get('posted_at');
  //   const postedDateControl = this.jobForm.get('posted_date');
  //   const currentDate = new Date();

  //   const formattedTime = currentDate.toLocaleTimeString([], {
  //     hour: '2-digit',
  //     minute: '2-digit',
  //     hour12: false,
  //   }); 
  //   const formattedDate = formatDate(currentDate, 'yyyy-MM-dd', 'en-US') // Format: dd/MM/yyyy (e.g., 09/05/2025)

  //   if (value === 'Schedulelater') {
      
  //     postedAtControl?.setValidators([Validators.required]);
  //     postedDateControl?.setValidators([Validators.required]);
  //   } else {

  //     postedAtControl?.setValue(formattedTime);
  //     postedDateControl?.setValue(formattedDate);


  //     postedAtControl?.clearValidators();
  //     postedDateControl?.clearValidators();
  //   }

 
  //   postedAtControl?.updateValueAndValidity();
  //   postedDateControl?.updateValueAndValidity();
  // }

  onJobTypePostChange(value: string): void {
  const postedAtControl = this.jobForm.get('posted_at');
  const postedDateControl = this.jobForm.get('posted_date');
  const currentDate = new Date();

  const formattedTime = currentDate.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const formattedDate = formatDate(currentDate, 'yyyy-MM-dd', 'en-US');

  if (value === 'Schedulelater') {
    postedAtControl?.setValidators([Validators.required]);
    postedDateControl?.setValidators([Validators.required, this.postedDateValidator()]);
  } else {
    postedAtControl?.setValue(formattedTime);
    postedDateControl?.setValue(formattedDate);

    postedAtControl?.clearValidators();
    postedDateControl?.clearValidators();
  }

  postedAtControl?.updateValueAndValidity();
  postedDateControl?.updateValueAndValidity();
}


  onSubmit(): void {
    console.log(this.jobForm.valid,'valid');
    console.log(this.jobForm)
    if (this.jobForm.valid) {
      this.sanitizeFormValues();
      const formValues = this.jobForm.value;
      formValues.posted_date = formatDate(formValues?.posted_date, 'yyyy-MM-dd', 'en-US')
      // if (formValues.start_salary) {
      //   formValues.start_salary = parseInt(formValues?.start_salary.replace(/,/g, ''), 10);
      // }

      if (!formValues.id) {
        delete formValues.id;
      }

      formValues.skills_required = JSON.stringify(formValues.skills_required);
      this.loader.show();

      this.adminService.createOrUpdateJobPosting(formValues).subscribe({
        next: (response: any) => {
          this.loader.hide();
          if (response.statusCode === 200) {
            this.toaster.success(response.message);
            this.router.navigate(['/job-list']);
          } else {
            console.error(response.message);
          }
        },
        error: (error: any) => {
          this.loader.hide();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });

    } else {
      // Mark all fields as touched to show validation errors
      this.jobForm.markAllAsTouched();
      this.loader.hide();
    }
  }

  removeSkill(index: number): void {
    this.skillsArray.splice(index, 1)
    this.updateSkillsInForm()
  }

  updateSkillsInForm(): void {
    this.jobForm.get('skills_required')?.setValue(this.skillsArray)
    this.jobForm.get('skills_required')?.markAsTouched()
  }


  validateMinimumTime(): ValidatorFn {
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
  SkillArrayValidator(min: number, max: number) {
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
  minLengthWithoutSpaces(minLength: number): ValidatorFn {
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
  postedAtValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const selectedDate = new Date(control.value)
      const now = new Date()

      if (control.value && selectedDate < now) {
        return { pastDateTime: true }
      }
      return null
    }
  }

  // formatSalary(controlName: string): void {
  //   const control = this.jobForm.get(controlName)
  //   if (control) {
  //     let value = control.value
  //     if (value) {
  //       value = value.replace(/[^0-9]/g, '')
  //       const formattedValue = new Intl.NumberFormat('en-US').format(
  //         Number(value)
  //       )
  //       control.setValue(formattedValue, { emitEvent: false })
  //     }
  //   }
  // }
formatSalary(controlName: string): void {
  const control = this.jobForm.get(controlName);
  if (control) {
    let value = control.value;
    if (value) {
      // Allow letters, digits, spaces, commas, dashes only
      value = value.replace(/[^a-zA-Z0-9\s,-]/g, '');
      control.setValue(value, { emitEvent: false });
    }
  }
}



  sanitizeFormValues(): void {
    Object.keys(this.jobForm.controls).forEach(key => {
      const control = this.jobForm.get(key)
      if (control && typeof control.value === 'string') {
        control.setValue(control.value.trim())
      }
    })
  }
  // deadlineValidator(date_published: Date): ValidatorFn {
  //   return (control: AbstractControl): ValidationErrors | null => {
  //     const selectedDeadline = new Date(control.value)
  //     const today = new Date()

  //     if (selectedDeadline < today || selectedDeadline < date_published) {
  //       return { deadlineInvalid: true }
  //     }
  //     return null
  //   }
  // }
//   deadlineValidator(): ValidatorFn {
//   return (control: AbstractControl): ValidationErrors | null => {
//     const selectedDeadline = new Date(control.value);
//     const today = new Date();

//     if (selectedDeadline < today) {
//       return { deadlineInvalid: true };
//     }
//     return null;
//   }
// }
deadlineValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null; // agar value empty ho toh koi error nahi
    
    const selectedDeadline = new Date(control.value);
    const today = new Date();
    // Time reset karna to compare only dates (ignoring time)
    today.setHours(0,0,0,0);
    selectedDeadline.setHours(0,0,0,0);

    if (selectedDeadline < today) {
      return { deadlineInvalid: true };
    }
    return null;
  }
}
postedDateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;

    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0,0,0,0);
    selectedDate.setHours(0,0,0,0);

    if (selectedDate < today) {
      return { postedDateInvalid: true };
    }
    return null;
  }
}

  salaryComparisonValidator(control: AbstractControl): ValidationErrors | null {
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

  getJobPosting(jobId: string): void {
    this.loader.show();
    this.adminService.getJobById(jobId).subscribe((response: any) => {
      if (response.statusCode === 200 && response.data) {
        const data = response.data
        this.loader.hide();

        // const formattedDatePublished = formatDate(
        //   data.date_published,
        //   'yyyy-MM-dd',
        //   'en-US'
        // )
        const formattedDeadline = formatDate(
          data.deadline,
          'yyyy-MM-dd',
          'en-US'
        )

        const formattedpostedAtDate = formatDate(
          data.posted_date,
          'yyyy-MM-dd',
          'en-US'
        )

        let socialMediaTypes: string[] = [];
        if (data.social_media_type) {
          if (typeof data.social_media_type === 'string') {
            try {
              socialMediaTypes = JSON.parse(data.social_media_type);
            } catch (e) {
              socialMediaTypes = [];
            }
          } else if (Array.isArray(data.social_media_type)) {
            socialMediaTypes = data.social_media_type;
          }
        }
        let skillsArray: string[] = [];
        if (data.skills_required) {
          if (typeof data.skills_required === 'string') {
            try {
              skillsArray = JSON.parse(data.skills_required);
            } catch (e) {
              skillsArray = [];
            }
          } else if (Array.isArray(data.skills_required)) {
            skillsArray = data.skills_required;
          }
        }
        this.skillsArray = skillsArray;

        // const formattedStartSalary = data.start_salary
        //   ? new Intl.NumberFormat('en-US').format(Number(data.start_salary))
        //   : ''
        // const formattedEndSalary = data.end_salary
        //   ? new Intl.NumberFormat('en-US').format(Number(data.end_salary))
        //   : ''

        this.jobForm.patchValue({
          id: data.id || '',
          // job_type: data.job_type || '',
          vessel_type: data.vessel_type || '',
          rank: data.rank || '',
          skills_required: this.skillsArray,
          // title: data.title || '',
          number_of_vacancy: data.number_of_vacancy || '',
          featured_image: data.featured_image || null,
          // date_published: formattedDatePublished || '',
          deadline: formattedDeadline || '',
          short_description: data.short_description || '',
          // full_description: data.full_description || '',
          // assignment_duration: data.assignment_duration || '',
          employer: data.employer || '',
          required_experience: data.required_experience || '',
          // start_salary: formattedStartSalary || 0,
          start_salary: data.start_salary || 0,
          // end_salary: formattedEndSalary || 0,
          application_instruction: data.application_instruction,
          country_code: data.country_code || '',
          address: data.address || '',
          social_media_type: socialMediaTypes,
          posted_at: data.posted_at,
          posted_date: formattedpostedAtDate,
          jobpost_status: data.jobpost_status || 'Draft',
          job_type_post: data.job_type_post

        })
        if (data.featured_image) {
          this.imagePreview = data.featured_image;
        } else {
          this.loader.hide();
        }

      }
    })
  }


  // onFileSelected(event: Event, controlName: string): void {
  //   const file = (event.target as HTMLInputElement).files?.[0];

  //   if (file) {
  //     if (!file.type.startsWith('image/')) {
  //       this.toaster.warning('Please select an image file.');
     
  //       (event.target as HTMLInputElement).value = ''; // Reset input file
  //       return;
  //     }

  //     // Create preview
  //     const reader = new FileReader();
  //     reader.onload = () => {
  //       this.imagePreview = reader.result; 
  //     };
  //     reader.readAsDataURL(file);

  //     // Your existing compression and upload logic
  //     if (this.allowedImageFormats.includes(file.type)) {
  //       this.imageCompressionService
  //         .compressImage(file)
  //         .then((compressedImageUrl: string) => {
  //           fetch(compressedImageUrl)
  //             .then(res => res.blob())
  //             .then(compressedFileBlob => {
  //               const compressedFile = new File(
  //                 [compressedFileBlob],
  //                 file.name,
  //                 { type: file.type }
  //               );

  //               // Upload image
  //               const folderName = 'job-postings';
  //               const user = JSON.parse(localStorage.getItem('user') || '{}');
  //               const userId = user.id;
  //               this.adminService
  //                 .uploadFile({ folderName, file: compressedFile, userId })
  //                 .subscribe(
  //                   (response: any) => {
  //                     if (response.statusCode === 200) {
  //                       this.jobForm.patchValue({
  //                         [controlName]: response.data.path
  //                       });
  //                     } else {
  //                       console.error(response.message);
  //                     }
  //                   },
  //                   (error: any) => {
  //                     console.error('Error uploading file:', error);
  //                   }
  //                 );
  //             });
  //         });
  //     }
  //   }
  // }

onFileSelected(event: Event, controlName: string): void {
  const file = (event.target as HTMLInputElement).files?.[0];
  const control = this.jobForm.get(controlName);

  if (file) {
    const allowedExtensions = ['jpg', 'jpeg', 'png']; // Removed 'gif'
    const maxSizeMB = 5;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';

    if (!allowedExtensions.includes(fileExtension)) {
      this.toaster.error('Invalid file extension. Only .jpg, .jpeg, and .png are allowed.');
      (event.target as HTMLInputElement).value = ''; // Reset file input
      control?.setErrors({ invalidFileExtension: true });
      this.imagePreview = null;
      return;
    }

    if (file.size > maxSizeBytes) {
      this.toaster.error(`File size exceeds the maximum allowed size of ${maxSizeMB} MB.`);
      (event.target as HTMLInputElement).value = ''; // Reset file input
      control?.setErrors({ fileSizeExceeded: true });
      this.imagePreview = null;
      return;
    }

    control?.setErrors(null); // Clear error if valid

    // Create image preview
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result;
    };
    reader.readAsDataURL(file);

    // Continue with compression & upload logic as before...
    this.imageCompressionService
      .compressImage(file)
      .then((compressedImageUrl: string) => {
        fetch(compressedImageUrl)
          .then(res => res.blob())
          .then(compressedFileBlob => {
            const compressedFile = new File([compressedFileBlob], file.name, { type: file.type });
            const folderName = 'job-postings';
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const userId = user.id;
            this.adminService.uploadFile({ folderName, file: compressedFile, userId }).subscribe(
              (response: any) => {
                if (response.statusCode === 200) {
                  this.jobForm.patchValue({ [controlName]: response.data.path });
                } else {
                  this.toaster.error('Error uploading image.');
                  console.error(response.message);
                }
              },
              (error: any) => {
                this.toaster.error('Error uploading image.');
                console.error('Error uploading file:', error);
              }
            );
          });
      });
  }
}

  clearImage() {
    this.jobForm.patchValue({
      featured_image: null
    })
    this.imagePreview = null
  }

  // allrankslist() {
  //   this.adminService.getallranks().subscribe((res: any) => {
  //     if (res.statusCode === 200) {
  //       const allRanks = res.data.map((r: any) => r.rank_name).filter(Boolean);
  //       this.uniqueRanks = [...new Set(allRanks)] as string[];
  //     }
  //   });
  // }
  allrankslist() {
  this.adminService.getallranks().subscribe((res: any) => {
    if (res.statusCode === 200) {
      // Directly assign array of objects (id + rank_name)
      this.uniqueRanks = res.data;
    }
  });
}


  navigate() {
    this.router.navigate(['/job-list'])
  }

  getFileName(path: string | null): string {
    if (!path) return ''
    // Extract filename from path
    const parts = path.split(/[\/\\]/)
    return parts[parts.length - 1]
  }

  onDateTimeChange(event: any): void {
    const selectedDate = event.value
    if (selectedDate) {
      this.jobForm.patchValue({
        posted_at: selectedDate
      })
    }
  }

  removeImage(): void {
    this.imagePreview = ''; // Clear the image preview
    this.jobForm.get('featured_image')?.setValue(null); // Reset the form control value
    const fileInput: HTMLInputElement = document.querySelector('input[type="file"]')!;
    fileInput.value = ''; // Reset the file input value
  }
  preventFormSubmit(event: any): void {
    event.preventDefault();  // Prevent form-wide submit behavior
    event.stopPropagation(); // Stop the event from bubbling up
  }
  onInputFocus(): void {
    // Manually mark the input field as touched to trigger validation error
    this.jobForm.get('skills_required')?.markAsTouched();
  }

  onToDateChange(from: any, to: any) {
    const fromDate = new Date(from.value);
    const toDate = new Date(to.value);
    if (toDate < fromDate) {
      to.setErrors({ deadlineInvalid: true })
    }
  }
}
