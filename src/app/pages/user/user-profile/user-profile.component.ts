import { CommonModule, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../../core/services/user/user.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], // Add ReactiveFormsModule here
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  userProfileForm!: FormGroup;
  isSubmitting = false;
  isEditMode = false;

  constructor(private formBuilder: FormBuilder,
    private userService: UserService,
    private route: ActivatedRoute
  ) {
    // Initialize the form with controls and validation in the constructor
    this.userProfileForm = new FormGroup({
      id: new FormControl(null), // Optional
      user_id: new FormControl('', Validators.required), // Required
      first_name: new FormControl('', Validators.required), // Required
      last_name: new FormControl('', Validators.required), // Required
      dob: new FormControl('', Validators.required), // Required
      gender: new FormControl('', Validators.required), // Required
      email: new FormControl('', [Validators.required, Validators.email]), // Required + Email validation
      mobile: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{10,15}$')]), // Required + Pattern validation
      file_path: new FormControl(null) // Optional
    });
  }

  ngOnInit(): void {
    const userID = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!userID;

    if (this.isEditMode) {
      this.userProfileForm.patchValue({ id: userID }); // Populate id for edit mode
    }
  }



  onSubmit(): void {
    if (this.userProfileForm.invalid) {
      alert('Please fill in all required fields.');
      return;
    }

    const payload = { ...this.userProfileForm.getRawValue() };

    if (!this.isEditMode) {
      delete payload.id; // Remove id for create mode
    }

    this.isSubmitting = true;

    this.userService.SaveUserProfile(payload).subscribe(
      () => {
        this.isSubmitting = false;
        alert(this.isEditMode ? 'User profile updated successfully!' : 'User profile created successfully!');
      },
      (error) => {
        this.isSubmitting = false;
        console.error('Error saving profile:', error);
        alert('An error occurred while saving the profile.');
      }
    );
  }
  // Helper function to get form controls
  get f() {
    return this.userProfileForm.controls;
  }
}
