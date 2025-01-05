import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../../core/services/user/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { ImageCompressionService } from '../../../core/services/image-compression.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  userProfileForm!: FormGroup;
  isEditMode = false;
  successMessage: string = '';
  errorMessage: string = '';
  userId: string | null = null;

  private readonly allowedImageFormats = ['image/jpeg', 'image/png', 'image/webp'];
  constructor(private userService: UserService, private route: ActivatedRoute,
    private adminService: AdminService,
    private imageCompressionService: ImageCompressionService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    // this.checkEditMode();
    // this.route.params.subscribe((params) => {
    //   this.isEditMode = false;
    //   this.userId = params['id'];
    //   this.getUserDetailsById(this.userId);
    // });
  }

  initializeForm(): void {
    this.userProfileForm = new FormGroup({
      first_name: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z0-9 ]+$')]),
      last_name: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z0-9 ]+$')]),
      dob: new FormControl('', Validators.required),
      gender: new FormControl('', Validators.required),
      mobile: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{10,15}$')]),
      key_skills: new FormControl(''),
      work_experiences: new FormControl(''),
      current_company: new FormControl('', [Validators.pattern('^[a-zA-Z0-9 ]*$')]),
      current_salary: new FormControl('', [Validators.pattern('^[0-9]+$')]),
      expected_salary: new FormControl('', [Validators.pattern('^[0-9]+$')]),
    });
  }

  // populateUserId(): void {
  //   const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
  //   if (loggedInUser?.id) {
  //     this.userProfileForm.patchValue({ user_id: loggedInUser.id });
  //   } else {
  //     console.error('User ID not found in localStorage or is invalid.');
  //   }
  // }

  // checkEditMode(): void {
  //   this.route.paramMap.subscribe((params) => {
  //     this.userId = params.get('id');
  //     if (this.userId) {
  //       this.isEditMode = true;
  //       this.getUserDetailsById(this.userId);
  //     } else {
  //       this.isEditMode = false;
  //     }
  //   });
  // }

  // getUserDetailsById(id: any): void {
  //   this.userService.getUserById(id).subscribe(
  //     (response) => {
  //       if (response && response.data) {
  //         this.userProfileForm.patchValue(response.data);
  //         this.successMessage = 'Edit mode activated. Data loaded successfully.';
  //       } else {
  //         this.errorMessage = 'Failed to load user data.';
  //       }
  //     },
  //     (error) => {
  //       console.error('Error loading user data:', error);
  //       this.errorMessage = error.error?.message || 'Failed to load user data.';
  //     }
  //   );
  // }
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
      console.log('Invalid fields:', this.getInvalidFields());
      alert('Please fill in all required fields correctly.');
      return;
    }

    const payload = { ...this.userProfileForm.value };

    if (this.isEditMode) {
      this.userService.SaveUserProfile(payload).subscribe(
        (response) => {
          alert('User profile updated successfully!');
        },
        (error) => console.error('Error updating profile:', error)
      );
    } else {
      this.userService.SaveUserProfile(payload).subscribe(
        (response) => {
          alert('User profile created successfully!');
          if (response && response.data && response.data.id) {
            this.navigateToEditMode(response.data.id);
          }
        },
        (error) => console.error('Error creating profile:', error)
      );
    }
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
}
