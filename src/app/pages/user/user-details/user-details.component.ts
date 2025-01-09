import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
@Component({
  selector: 'app-user-details',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, ],
  templateUrl: './user-details.component.html',
  styleUrl: './user-details.component.css'
})
export class UserDetailsComponent {
  userDetailsForm: FormGroup;
  submitted = false;
  fileError: string | null = null;
  fileUploaded: File | null = null;

  constructor( private adminService : AdminService) {
    this.userDetailsForm = new FormGroup({
      work_experiences: new FormControl('', Validators.required),
      additional_info: new FormControl(''),
      description: new FormControl('', Validators.required),
      comments: new FormControl(''),
      cv_path: new FormControl('', Validators.required),
      certification_path: new FormControl('', Validators.required),
    });
  }

  onFileChange(event: Event, controlName: string): void {
    const fileInput = event.target as HTMLInputElement;
    const file = fileInput?.files?.[0];
  
    if (file) {
      const validFormats = [
        'application/pdf',                 // PDF
        'application/msword',              // DOC
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
        'application/vnd.oasis.opendocument.text', // ODT
        'text/rtf',                        // RTF
        'text/plain'                       // TXT
      ];
  
      if (!validFormats.includes(file.type)) {
        this.fileError = 'Invalid file format. Only PDF, DOC, DOCX, ODT, RTF, and TXT files are allowed.';
        this.fileUploaded= null;
        return;
      }
  
      if (file.size > 5 * 1024 * 1024) { 
        this.fileError = 'File size should not exceed  5 MB.';
        this.fileUploaded = null;
        return;
      }
  
      this.fileError = null;
      this.fileUploaded = file;
  
      // Upload file to the server using adminService
      const folderName = 'user-details';
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user.id;
      console.log(folderName, file, userId);
      this.adminService.uploadFile({ folderName, file, userId }).subscribe(
        (response :any) => {
        
          if (response.statusCode === 200) {
            this.userDetailsForm.patchValue({
              [controlName]: response.data.path
            });
          } else {
            this.fileError = 'File upload failed. Please try again.';
          }
        },
        
      );
      (error :any) => {
        console.error('Error uploading file:', error);
        this.fileError = 'An error occurred during file upload.';
      }
    }
  }
  sanitizeFormValues(): void {
  
    Object.keys(this.userDetailsForm.controls).forEach(key => {
      const control = this.userDetailsForm.get(key);
      if (control && typeof control.value === 'string') {
        control.setValue(control.value.trim());
      }
    });
  }

  Submit(): void {
    debugger
    this.submitted = true;

    if (this.userDetailsForm.valid) {
      const formValues = this.userDetailsForm.value;
      this.sanitizeFormValues();
      // const apiPayload = {
      //   job_id: 'b3f5f1e7-5030-4b9f-baa2-510d195c7607', // Static or dynamic job_id
      //   user_id: JSON.parse(localStorage.getItem('user') || '{}').id,
      //   description: formData.description,
      //   comments: formData.comments,
      //   cv_path: formData.cv_path,
      //   certification_path: formData.certification_path,
      //   additional_info: formData.additionalInfo,
      //   work_experiences: formData.experience,
      // };

      this.adminService.applyJobs(formValues ).subscribe(
        (response: any) => {
          if (response.statusCode === 200) {
            console.log('Data submitted successfully:', response);
          } else {
            console.error('Failed to submit data:', response);
          }
        },
        (error: any) => {
          console.error('Error during submission:', error);
        }
      );
    } else {
      console.log('Form is invalid.');
    }
  }
}
