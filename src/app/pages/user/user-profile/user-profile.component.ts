import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../../core/services/user/user.service';
import { ActivatedRoute } from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  userProfileForm!: FormGroup;
  isEditMode = false;

  constructor(private userService: UserService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.initializeForm();
    this.populateUserId();
    this.checkEditMode();
  }

  initializeForm(): void {
    this.userProfileForm = new FormGroup({
      id: new FormControl(null),
      user_id: new FormControl(''),
      first_name: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z0-9 ]+$')]),
      last_name: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z0-9 ]+$')]),
      dob: new FormControl('', Validators.required),
      gender: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      mobile: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{10,15}$')]),
      key_skills: new FormControl(''),
      work_experiences: new FormControl(''),
      current_company: new FormControl('', [Validators.pattern('^[a-zA-Z0-9 ]*$')]),
      current_salary: new FormControl('', [Validators.pattern('^[0-9]+$')]),
      expected_salary: new FormControl('', [Validators.pattern('^[0-9]+$')]),
      preferred_location: new FormControl('', [Validators.pattern('^[a-zA-Z0-9 ]+$')]),
      preferred_job_role: new FormControl(''),
      preferred_shift: new FormControl(''),
      languages_known: new FormControl(''),
      file: new FormControl(null),
    });
  }

  populateUserId(): void {
    const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (loggedInUser?.id) {
      this.userProfileForm.patchValue({ user_id: loggedInUser.id });
    } else {
      console.error('User ID not found in localStorage or is invalid.');
    }
  }

  checkEditMode(): void {
    const userID = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!userID;
    if (this.isEditMode && userID) {
      this.userService.getUserById(userID).subscribe((data) => this.userProfileForm.patchValue(data));
    }
  }

  onFileSelected(event: Event, controlName: string): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.userProfileForm.patchValue({ [controlName]: file });
    }
  }

  onSubmit(): void {
    if (this.userProfileForm.invalid) {
      console.log('Invalid fields:', this.getInvalidFields());
      alert('Please fill in all required fields correctly.');
      return;
    }

    // Directly use the form values
    const payload = { ...this.userProfileForm.value };

    // Handle create or edit mode
    if (this.isEditMode) {
      this.userService.getUserById(payload).subscribe(
        () => alert('User profile updated successfully!'),
        (error) => console.error('Error updating profile:', error)
      );
    } else {
      this.userService.SaveUserProfile(payload).subscribe(
        () => alert('User profile created successfully!'),
        (error) => console.error('Error creating profile:', error)
      );
    }
  }

  // Helper to log invalid fields
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

}
