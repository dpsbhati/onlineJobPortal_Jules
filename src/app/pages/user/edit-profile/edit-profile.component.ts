  import { Component, OnInit } from '@angular/core';
  import {
    AbstractControl,
    FormArray,
    FormBuilder,
    FormControl,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    ValidationErrors,
    Validators,
  } from '@angular/forms';
  import { Router } from '@angular/router';
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
  import { UserRole } from '../../../core/enums/roles.enum';
  import { LoaderService } from 'src/app/core/services/loader.service';
  import { ToastrService } from 'ngx-toastr';
  import { MaterialModule } from 'src/app/material.module';
  import { MatStepperModule } from '@angular/material/stepper';
  import countries from '../../../core/helpers/country.json';
  import currency from '../../../core/helpers/currency.json';
  import languages from '../../../core/helpers/languages.json';

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
      ReactiveFormsModule,
      MatStepperModule,
    ],
    templateUrl: './edit-profile.component.html',
    styleUrls: ['./edit-profile.component.scss'],
  })
  export class EditProfileComponent implements OnInit {
    proficiencyOptions = ['None', 'Basic', 'Proficient', 'Fluent'];
    departmentsList = [
      'Admin',
      'Business Development',
      'Crew Management',
      'HSEQ',
      'HR',
    ];
    vacancySources = [
      'Company Website',
      'HR',
      'Job Portal (LinkedIn)',
      'Placement Agency',
      'Friend',
    ];
    private readonly allowedImageFormats = [
      'image/jpeg',
      'image/png',
      'image/webp',
    ];
    imagePreview: string | ArrayBuffer | null = null;
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
    form: FormGroup;
    secondForm: FormGroup;
    thirdForm: FormGroup;
    fourthForm: FormGroup;
    fiveFrom: FormGroup;
    // sixFrom: FormGroup;
    sixthForm: FormGroup;
    seventhForm:FormGroup;
    fileError: string | null = null;
    fileUploaded: File | null = null;
    uploadedFileName: string | null = null;
    countryList = countries;
    currencyList = currency;
    languageList = languages;
    uniqueRanks: any[] = [];
  showTextarea: boolean = true; // Initialize to true if you want the textarea visible by default for 'Yes'

    constructor(
      private fb: FormBuilder,
      private userService: UserService,
      private adminService: AdminService,
      private imageCompressionService: ImageCompressionService,
      private router: Router,
      private loader: LoaderService,
      private toaster: ToastrService
    ) {
      this.userRole = localStorage.getItem('role') || '';
    }

    ngOnInit(): void {
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
      this.firstForm();
      this.second();
      this.Third();
      // this.fourth();
      // this.fiveFrom();
      this.sixth();
        this.seventh();
      this.allrankslist();
    }

    firstForm() {
      this.form = this.fb.group({
        first_name: new FormControl(null, [
          Validators.required,
          Validators.pattern('^[a-zA-Z ]*$'),
        ]),
        last_name: new FormControl(null, [
          Validators.required,
          Validators.pattern('^[a-zA-Z ]*$'),
        ]),
        middle_name: new FormControl(null, [
    Validators.required,
    Validators.pattern('^[a-zA-Z ]*$')
  ]),
        email: new FormControl({ value: this.userEmail || '', disabled: true }),
        dob: new FormControl(
          null,
          this.isApplicant() ? [Validators.required] : null
        ),
        mobile: new FormControl(
          '',
          this.isApplicant()
            ? [
                Validators.required,
                Validators.pattern('^[0-9]{10}$'),
                this.mobileNumberValidator,
              ]
            : null
        ),
        nationalities: new FormControl(
          [],
          this.isApplicant() ? [Validators.required] : null
        ),
        country: new FormControl(
          null,
          this.isApplicant() ? [Validators.required] : null
        ),
        rank_id: new FormControl(
          null,
          this.isApplicant() ? [Validators.required] : null
        ),



          marital_status: new FormControl(null),
  home_address: new FormControl(null),
  residence_no: new FormControl(null),
  birth_place: new FormControl(null),
  father_full_name: new FormControl(null),
  father_birth_date: new FormControl(null),
  mother_full_name: new FormControl(null),
  mother_birth_date: new FormControl(null),
  height: new FormControl(null),
  weight: new FormControl(null),
  sss_no: new FormControl(null),
  philhealth_no: new FormControl(null),
  pagibig_no: new FormControl(null),
        location: new FormControl(
          null,
          this.isApplicant() ? [Validators.required] : null
        ),
        dial_code: new FormControl(
          null,
          this.isApplicant() ? [Validators.required] : null
        ),
        profile_image_path: new FormControl(
          null,
          this.isApplicant() ? [Validators.required] : null
        ),
        additional_contact_info: this.fb.array([]),
        emergency_contact_info: this.fb.array([])

      });
    }


    second() {
    this.secondForm = this.fb.group({
      travel_documents_info: this.fb.array([]), // For Travel Documents
    });
  }

   addTravelDocument() {
    const travelDocumentsArray = this.secondForm.get('travel_documents_info') as FormArray;
    travelDocumentsArray.push(
      this.fb.group({
        travel_type: new FormControl(null, [Validators.required]),
        document_number: new FormControl(null, [Validators.required]),
        issue_place: new FormControl(null, [Validators.required]),
        issue_date: new FormControl(null, [Validators.required]),
      })
    );
  }

  // Get the travel documents form controls
  getTravelDocuments() {
    return (this.secondForm.get('travel_documents_info') as FormArray).controls;
  }

  // Method to remove a travel document
  removeTravelDocument(index: number) {
    const travelDocumentsArray = this.secondForm.get('travel_documents_info') as FormArray;
    travelDocumentsArray.removeAt(index);
  }



    Third() {
      this.thirdForm = this.fb.group({
         language_spoken_info: this.fb.array([]),
        language_written_info: this.fb.array([]),
          highest_education_level: new FormControl(null, [Validators.required]),
          education_info: this.fb.array([]),
         cv_path: new FormControl(null),
      cv_name: new FormControl(null, [Validators.required]),
        // other_experience_info: this.fb.array([]),
        // project_info: this.fb.array([]),

      });
    }

    sixth() {
      this.sixthForm = this.fb.group({
        // language_spoken_info: this.fb.array([]),
        // language_written_info: this.fb.array([]),
        notice_period_info: this.fb.group({
          notice_period_months: [0, Validators.min(0)],
          commence_work_date: [null],
        }),
        current_salary_info: this.fb.group({
          currency: [''],
          amount: [0, Validators.min(0)],
        }),
        expected_salary_info: this.fb.group({
          currency: [''],
          amount: [0, Validators.min(0)],
        }),
        preferences_info: this.fb.group({
          department: [[]],
          location: [[]],
        }),
        additional_info: this.fb.group({
          additional_info: [''],
        }),
        vacancy_source_info: this.fb.group({
          vacancy_source: [''],
        }),
      });
    }
      seventh() {
    this.seventhForm = this.fb.group({
      disease_suffered: new FormControl(false),
      accident_suffered: new FormControl(false),
      psychiatric_treatment: new FormControl(false),
      addiction: new FormControl(false),
      deported_or_convicted: new FormControl(false),
      // other_experience_info: this.fb.array([]),
      // project_info: this.fb.array([]), // For Projects
    });
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

    onSubmit(): void {
      // if(this.form.invalid){
      //    this.form.markAllAsTouched();
      // return;
      // }
      this.loader.show();
      const payload = {
        ...this.form.value,
        ...this.secondForm.value,
        ...this.thirdForm.value,
        ...this.sixthForm.value,
         ...this.seventhForm.value,
      };
      this.userService.SaveUserProfile(payload).subscribe({
        next: (response: any) => {
          this.loader.hide();
          if (response.statusCode === 200) {
            this.toaster.success(response.message);
            this.router.navigate(['/dashboard']);
          } else {
            this.toaster.error(response.message || 'Failed to update profile');
            this.scrollToTop();
          }
        },
        error: (error) => {
          this.loader.hide();
          this.toaster.error(
            error.error?.message || 'An error occurred while updating the profile'
          );
          this.scrollToTop();
        },
      });
    }

    isAdmin(): boolean {
      return this.userRole.toLowerCase() === UserRole.ADMIN.toLowerCase();
    }

    isApplicant(): boolean {
      return this.userRole.toLowerCase() === UserRole.APPLICANT.toLowerCase();
    }

    loadUserData(userId: string): void {
      this.loader.show();
      this.userService.getUserById(userId).subscribe({
        next: (response: any) => {
          this.loader.hide();
          if (response.statusCode === 200 && response.data) {
            const data = response.data;
            this.form.patchValue(response.data);
            this.secondForm.patchValue(response.data);
            this.thirdForm.patchValue(response.data);
            this.sixthForm.patchValue(response.data);
            this.userId = data.id || userId;
            if (data.profile_image_path) {
              this.imagePreview = data.profile_image_path;
            }
            if (data.cv_name) {
              this.uploadedFileName = data.cv_name;
            }
            const contactsFormArray = this.form.get(
              'additional_contact_info'
            ) as FormArray;
            if (data.additional_contact_info?.length > 0) {
              data.additional_contact_info.forEach((contact: any) => {
                contactsFormArray.push(
                  this.fb.group({
                    contact_type: [contact.contact_type || null],
                    value: [contact.value || null],
                  })
                );
              });
            } else if (
              data.additional_contact_info?.length == 0 ||
              data.additional_contact_info == null
            ) {
              this.addContact();
            }

            const educationArray = this.thirdForm.get(
              'education_info'
            ) as FormArray;
            while (educationArray?.length !== 0) {
              educationArray.removeAt(0);
            }
            if (data.education_info && data.education_info?.length > 0) {
              data.education_info.forEach((item: any) => {
                educationArray.push(
                  this.fb.group({
                    education_from: [
                      item.education_from || null,
                      Validators.required,
                    ],
                    education_to: [
                      item.education_to || null,
                      Validators.required,
                    ],
                    education_title: [
                      item.education_title || null,
                      Validators.required,
                    ],
                    education_institute: [
                      item.education_institute || null,
                      Validators.required,
                    ],
                  })
                );
              });
            } else if (
              !data.education_info ||
              data.education_info?.length === 0
            ) {
              this.addEducation();
            }
            // const courseArray = this.secondForm.get('course_info') as FormArray;
            // while (courseArray?.length !== 0) {
            //   courseArray.removeAt(0);
            // }
            // if (data.course_info && data.course_info?.length > 0) {
            //   data.course_info.forEach((item: any) => {
            //     courseArray.push(
            //       this.fb.group({
            //         course_from: [item.course_from || null, Validators.required],
            //         course_to: [item.course_to || null, Validators.required],
            //         course_title: [
            //           item.course_title || null,
            //           Validators.required,
            //         ],
            //         course_provider: [
            //           item.course_provider || null,
            //           Validators.required,
            //         ],
            //       })
            //     );
            //   });
            // } else if (!data.course_info || data.course_info?.length === 0) {
            //   this.addCourse();
            // }
            // const certificateArray = this.secondForm.get(
            //   'certification_info'
            // ) as FormArray;
            // while (certificateArray?.length !== 0) {
            //   certificateArray.removeAt(0);
            // }
            // if (data.certification_info && data.certification_info?.length > 0) {
            //   data.certification_info.forEach((item: any) => {
            //     certificateArray.push(
            //       this.fb.group({
            //         certification_from: [
            //           item.certification_from || null,
            //           Validators.required,
            //         ],
            //         certification_to: [
            //           item.certification_to || null,
            //           Validators.required,
            //         ],
            //         certification_title: [
            //           item.certification_title || null,
            //           Validators.required,
            //         ],
            //         certification_issuer: [
            //           item.certification_issuer || null,
            //           Validators.required,
            //         ],
            //       })
            //     );
            //   });
            // } else if (
            //   !data.certification_info ||
            //   data.certification_info?.length === 0
            // ) {
            //   this.addCertificate();
            // }
            // const otherExpArray = this.thirdForm.get(
            //   'other_experience_info'
            // ) as FormArray;
            // while (otherExpArray?.length !== 0) {
            //   otherExpArray.removeAt(0);
            // }
            // if (
            //   data.other_experience_info &&
            //   data.other_experience_info?.length > 0
            // ) {
            //   data.other_experience_info.forEach((item: any) => {
            //     otherExpArray.push(
            //       this.fb.group({
            //         other_experience_from: [
            //           item.other_experience_from || null,
            //         ],
            //         other_experience_to: [item.other_experience_to || null],
            //         other_experience_description: [
            //           item.other_experience_description || null,
            //         ],
            //       })
            //     );
            //   });
            // } else if (
            //   !data.other_experience_info ||
            //   data.other_experience_info?.length === 0
            // ) {
            //   this.addOtherExp();
            // }
            // const projectsArray = this.thirdForm.get('project_info') as FormArray;
            // while (projectsArray?.length !== 0) {
            //   projectsArray.removeAt(0);
            // }
            // if (data.project_info && data.project_info?.length > 0) {
            //   data.project_info.forEach((item: any) => {
            //     projectsArray.push(
            //       this.fb.group({
            //         project_from: [
            //           item.project_from || null,
            //           Validators.required,
            //         ],
            //         project_to: [item.project_to || null],
            //         project_name: [
            //           item.project_name || null,
            //           Validators.required,
            //         ],
            //         project_role: [
            //           item.project_role || null,
            //           Validators.required,
            //         ],
            //       })
            //     );
            //   });
            // } else if (!data.project_info || data.project_info?.length === 0) {
            //   this.addProjects();
            // }
            const langSpokenArray = this.thirdForm.get(
              'language_spoken_info'
            ) as FormArray;
            while (langSpokenArray?.length !== 0) {
              langSpokenArray.removeAt(0);
            }
            if (
              data.language_spoken_info &&
              data.language_spoken_info?.length > 0
            ) {
              data.language_spoken_info.forEach((item: any) => {
                langSpokenArray.push(
                  this.fb.group({
                    language: [item.language || null, Validators.required],
                    proficiency: [item.proficiency || null, Validators.required],
                  })
                );
              });
            } else if (
              !data.language_spoken_info ||
              data.language_spoken_info?.length === 0
            ) {
              this.addLangSpoken();
            }
            const langWrittenArray = this.thirdForm.get(
              'language_written_info'
            ) as FormArray;
            while (langWrittenArray?.length !== 0) {
              langWrittenArray.removeAt(0);
            }
            if (
              data.language_written_info &&
              data.language_written_info?.length > 0
            ) {
              data.language_written_info.forEach((item: any) => {
                langWrittenArray.push(
                  this.fb.group({
                    language: [item.language || null, Validators.required],
                    proficiency: [item.proficiency || null, Validators.required],
                  })
                );
              });
            } else if (
              !data.language_written_info ||
              data.language_written_info?.length === 0
            ) {
              this.addLangWritten();
            }
          }
        },
        error: (error: any) => {
          this.loader.hide();
          this.toaster.error(
            error.error?.message ||
              'An error occurred while fetching user profile data'
          );
        },
      });
    }

    navigate() {
      this.router.navigate(['job-list']);
    }

    goBack(): void {
      this.router.navigate(['Applied-Applications']);
    }

    restrictNumeric(event: KeyboardEvent): void {
      const regex = /^[a-zA-Z\s]*$/; // Regex for allowing only alphabets and spaces
      const inputChar = String.fromCharCode(event.charCode);
      if (!regex.test(inputChar)) {
        event.preventDefault(); // Prevent the input if it doesn't match the regex
      }
    }

    additionalContacts() {
      return (this.form.get('additional_contact_info') as FormArray).controls;
    }

    addContact() {
      (this.form.get('additional_contact_info') as FormArray).push(
        this.fb.group({
          contact_type: new FormControl(null, [Validators.required]),
          value: new FormControl(null, [Validators.required]),
        })
      );
    }
   emergencyContacts() {
  return (this.form.get('emergency_contact_info') as FormArray).controls;
}

   addEmergencyContact() {
      (this.form.get('additional_contact_info') as FormArray).push(
        this.fb.group({
          name: new FormControl(null, [Validators.required]),
          address: new FormControl(null, [Validators.required]),
           contact_no: new FormControl(null, [Validators.required]),
           relationship: new FormControl(null, [Validators.required]),
        })
      );
    }
// removeEmergencyContact(index: number) {
//   this.emergencyContacts().removeAt(index);
// }

    // getworkExp() {
    //   return (this.secondForm.get('work_experience_info') as FormArray).controls;
    // }

    // addWorkExp() {
    //   (this.secondForm.get('work_experience_info') as FormArray).push(
    //     this.fb.group({
    //       work_experience_from: new FormControl(null, [Validators.required]),
    //       work_experience_to: new FormControl(null, [Validators.required]),
    //       work_experience_title: new FormControl(null, [Validators.required]),
    //       work_experience_employer: new FormControl(null, [Validators.required]),
    //     })
    //   );
    // }

    getEducation() {
      return (this.thirdForm.get('education_info') as FormArray).controls;
    }

    addEducation() {
      (this.thirdForm.get('education_info') as FormArray).push(
        this.fb.group({
          education_from: new FormControl(null, [Validators.required]),
          education_to: new FormControl(null, [Validators.required]),
          education_title: new FormControl(null, [Validators.required]),
          education_institute: new FormControl(null, [Validators.required]),
        })
      );
    }

    // getOtherExp() {
    //   return (this.thirdForm.get('other_experience_info') as FormArray).controls;
    // }

    // addOtherExp() {
    //   (this.thirdForm.get('other_experience_info') as FormArray).push(
    //     this.fb.group({
    //       other_experience_from: new FormControl(null),
    //       other_experience_to: new FormControl(null),
    //       other_experience_description: new FormControl(null, [
    //       ]),
    //     })
    //   );
    // }

    // getProjects() {
    //   return (this.thirdForm.get('project_info') as FormArray).controls;
    // }

    addProjects() {
      (this.thirdForm.get('project_info') as FormArray).push(
        this.fb.group({
          project_from: new FormControl(null, [Validators.required]),
          project_to: new FormControl(null),
          project_name: new FormControl(null, [Validators.required]),
          project_role: new FormControl(null, [Validators.required]),
        })
      );
    }

    // getCourse() {
    //   return (this.secondForm.get('course_info') as FormArray).controls;
    // }

    // addCourse() {
    //   (this.secondForm.get('course_info') as FormArray).push(
    //     this.fb.group({
    //       course_from: new FormControl(null, [Validators.required]),
    //       course_to: new FormControl(null, [Validators.required]),
    //       course_title: new FormControl(null, [Validators.required]),
    //       course_provider: new FormControl(null, [Validators.required]),
    //     })
    //   );
    // }

    getCetificate() {
      return (this.secondForm.get('certification_info') as FormArray).controls;
    }

    addCertificate() {
      (this.secondForm.get('certification_info') as FormArray).push(
        this.fb.group({
          certification_from: new FormControl(null, [Validators.required]),
          certification_to: new FormControl(null, [Validators.required]),
          certification_title: new FormControl(null, [Validators.required]),
          certification_issuer: new FormControl(null, [Validators.required]),
        })
      );
    }

    addLangSpoken() {
      (this.thirdForm.get('language_spoken_info') as FormArray).push(
        this.fb.group({
          language: new FormControl(null, [Validators.required]),
          proficiency: new FormControl(null, [Validators.required]),
        })
      );
    }

    getlanguageSpoken() {
      return (this.thirdForm.get('language_spoken_info') as FormArray).controls;
    }

    getlanguageWritten() {
      return (this.thirdForm.get('language_written_info') as FormArray).controls;
    }

    addLangWritten() {
      (this.thirdForm.get('language_written_info') as FormArray).push(
        this.fb.group({
          language: new FormControl(null, [Validators.required]),
          proficiency: new FormControl(null, [Validators.required]),
        })
      );
    }

    removeLangSpoken(index: number) {
      (this.thirdForm.get('language_spoken_info') as FormArray).removeAt(index);
    }

    removeLangWritten(index: number) {
      (this.thirdForm.get('language_written_info') as FormArray).removeAt(index);
    }

    removeContact(index: number) {
      (this.form.get('additional_contact_info') as FormArray).removeAt(index);
    }

    // removeWorkExp(index: number) {
    //   (this.secondForm.get('work_experience_info') as FormArray).removeAt(index);
    // }

    removeEducation(index: number) {
      (this.thirdForm.get('education_info') as FormArray).removeAt(index);
    }

    // removeCourse(index: number) {
    //   (this.secondForm.get('course_info') as FormArray).removeAt(index);
    // }

    removeCertificate(index: number) {
      (this.secondForm.get('certification_info') as FormArray).removeAt(index);
    }

    // removeOtherExp(index: number) {
    //   (this.thirdForm.get('other_experience_info') as FormArray).removeAt(index);
    // }

    // removeProjects(index: number) {
    //   (this.thirdForm.get('project_info') as FormArray).removeAt(index);
    // }

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
                .then((res) => res.blob())
                .then((compressedFileBlob) => {
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
                            [controlName]: response.data.path,
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
      this.uploadedFileName = file.name;
      const folderName = 'user-details';
      const userId = JSON.parse(localStorage.getItem('user') || '{}').id;
      this.adminService.uploadFile({ folderName, file, userId }).subscribe(
        (response: any) => {
          if (response.statusCode === 200) {
            this.secondForm.patchValue({
              [controlName]: response.data.path,
              cv_name: response.data.originalName,
            });
            this.loader.hide();
          } else {
            this.loader.hide();
          }
        },
        (error) => {
          console.error(error);
        }
      );
      fileInput.value = '';
    }

    filteredCountryList(): string[] {
      if (!this.countryList) return [];
      // Extract all nationalities arrays, flatten, and remove duplicates
      const allNationalities = this.countryList
        .filter((c) => c.nationalities && c.nationalities.length > 0)
        .map((c) => c.nationalities) // Already arrays
        .flat();
      // Remove duplicates by converting to Set and back to array
      return Array.from(new Set(allNationalities));
    }

  allrankslist() {
    this.adminService.getallranks().subscribe((response: any) => {
      if (response.statusCode === 200) {
        // Poora object rakhna hai taaki id aur rank_name dono milein
        this.uniqueRanks = response.data.filter((rank: any) => rank.is_deleted === 0);
      }
    });
  }


    adultValidator(control: any) {
      const val = control.value;
      if (!val) {
        control.setErrors(null);
      }
      const dob = new Date(val);
      if (isNaN(dob.getTime())) {
        control.setErrors({ invalidDOB: true });
      }
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
      if (age < 18) {
        control.setErrors({ tooYoung: true });
      } else {
        control.setErrors(null);
      }
    }

    onToDateChange(from: any, to: any) {
      const fromDate = new Date(from.value);
      const toDate = new Date(to.value);
      if (toDate < fromDate) {
        to.setErrors({ invalidDateRange: true });
      }
    }

    private scrollToTop(): void {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
