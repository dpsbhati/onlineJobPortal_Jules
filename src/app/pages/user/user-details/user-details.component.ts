import { NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { ActivatedRoute } from '@angular/router';
import { NotifyService } from '../../../core/services/notify.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
import { AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';

@Component({
  selector: 'app-user-details',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgFor ],
  templateUrl: './user-details.component.html',
  styleUrl: './user-details.component.css'
})
export class UserDetailsComponent {
  certificationFiles: File[] = [];
  uploadedFileName: string | null = null; 
  userDetailsForm: FormGroup;
  submitted = false;
  fileError: string | null = null;
  fileUploaded: File | null = null;
  jobId: any;
  user:any
  constructor( private adminService : AdminService, 
    private route : ActivatedRoute,
     private notify : NotifyService,
      private spinner : NgxSpinnerService,
    private router : Router) {
    this.userDetailsForm = new FormGroup({
      job_id : new FormControl (this.jobId),
      user_id : new FormControl(this.user),
      work_experiences: new FormControl('',  [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(200),
        this.minLengthWithContent(5),
      ]),
      additional_info: new FormControl('',  [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(500),
        this.minLengthWithContent(5),
      ]),
      description: new FormControl('',  [
        Validators.required,
        Validators.minLength(15),
        Validators.maxLength(1000),
        this.minLengthWithContent(5),
      ]),
      comments: new FormControl('',   [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(500),
        this.minLengthWithContent(5),
      ]),
      cv_path: new FormControl('', Validators.required),
      courses_and_certification: new FormControl([], Validators.required),
    });
  }
  ngOnInit(): void {
    this.jobId = this.route.snapshot.paramMap.get('id') as string;
    this.user = JSON.parse(localStorage.getItem('user') || '{}');
    
    this.userDetailsForm.patchValue({
      job_id: this.jobId,
      user_id: this.user?.id
    });
  
  }   

  onFileChange(event: Event, controlName: string): void {
    // debugger
    this.spinner.show();
    const fileInput = event.target as HTMLInputElement;
    const files = fileInput?.files;

    if (!files) {
      return;
    }

    const validFormats = ['application/pdf', 'application/msword']; 
    const maxFileSize = 5 * 1024 * 1024; 

    if (controlName === 'courses_and_certification') {
  
      Array.from(files).forEach(file => {
        if (!validFormats.includes(file.type)) {
          this.fileError = `Invalid file format. Only PDF and DOC files are allowed.`;
          return;
        }

        if (file.size > maxFileSize) {
          this.fileError = `File size should not exceed 5 MB for ${file.name}.`;
          return;
        }
       
        this.fileError = null; 
        this.certificationFiles.push(file); 
      });

 
      const folderName = 'certifications';
      const userId = JSON.parse(localStorage.getItem('user') || '{}').id;

      const uploadPromises = this.certificationFiles.map(file =>
        this.adminService.uploadFile({ folderName, file, userId }).toPromise()
      );

      Promise.all(uploadPromises)
        .then(responses => {
          const certifications: { organization_name: any; certification_description: string; start_date: string; end_date: string; certification_file: any; }[] = [];
          responses.forEach((response: any) => {
            if (response.statusCode === 200) {
              certifications.push({
                organization_name: response.data.originalName.split('.')[0], 
                certification_description: `Uploaded file: ${response.data.originalName}`, 
                start_date: '2023-01-01', 
                end_date: '2023-12-31', 
                certification_file: response.data.path, 
              });
              this.spinner.hide();
               this.notify.showSuccess(response.message);
              
            } else {
              this.spinner.hide();
              this.notify.showWarning(response.message);
            }
          });

          if (certifications.length > 0) {
            // const existingCertifications = this.userDetailsForm.get(controlName)?.value || [];
            this.userDetailsForm.patchValue({
              [controlName]: [ ...certifications],
            });
         
          }
        })
  } else if (controlName === 'cv_path') {
    
    const file = files[0];

    if (!validFormats.includes(file.type)) {
      this.fileError = 'Invalid file format. Only PDF and DOC files are allowed.';
      this.uploadedFileName =null;
      return;
    }

    if (file.size > maxFileSize) {
      this.fileError = 'File size should not exceed 5 MB.';
      return;
    }

    this.fileError = null;
    this.fileUploaded = file;
    this.uploadedFileName=file.name

    // Make API call for CV upload
    const folderName = 'user-details';
    const userId = JSON.parse(localStorage.getItem('user') || '{}').id;

    this.adminService.uploadFile({ folderName, file, userId }).subscribe(
      (response: any) => {
        if (response.statusCode === 200) {
          this.notify.showSuccess(response.message);
          this.userDetailsForm.patchValue({
            [controlName]: response.data.path
          });
          this.spinner.hide();
        } else {
          this.notify.showWarning(response.message);
          this.spinner.hide();
        }
      },
      error => {
        this.notify.showError('Error uploading CV file. Please try again.');
        console.error(error);
      }
    );
  }

  // Reset file input to allow selecting the same file again
  fileInput.value = '';
}

  sanitizeFormValues(): void {
  
    Object.keys(this.userDetailsForm.controls).forEach(key => {
      const control = this.userDetailsForm.get(key);
      if (control && typeof control.value === 'string') {
        control.setValue(control.value.trim());
      }
    });
  }
  minLengthWithContent(minLength: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value || control.value.trim().length < minLength) {
        return { minLengthWithContent: true };
      }
      return null;
    };
  }

  Submit(): void {
    this.spinner.show();
    this.submitted = true;

    if (this.userDetailsForm.valid  && this.fileUploaded) {
      this.sanitizeFormValues();
      const formData = this.userDetailsForm.value; 
      // const apiPayload = {
      //   ...formData,
      //   courses_and_certification: this.certificationFiles.map(file => ({

      const apiPayload = {
        ...formData,
        job_id: this.jobId, 
        user_id: this.user?.id, 
      };

      this.adminService.applyJobs(apiPayload).subscribe({
        next: (response: any) => {
          this.spinner.hide();
          if (response.statusCode === 200) {
            this.notify.showSuccess(response.message);
            this.router.navigate(['/job-list']);
          } else {
            this.notify.showWarning(response.message);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        },
        error: (error: any) => {
          this.spinner.hide();
          this.notify.showError(error.error?.message || 'Failed to apply for job');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    } else {
     this.spinner.hide();
    }
    this.spinner.hide();
  }
  naviagte(){
    this.router.navigate(['/job-list']);
  }
  deleteFile(controlName: string, index?: number): void {
    if (controlName === 'cv_path') {
      this.uploadedFileName = null;
      this.fileUploaded = null;
      this.userDetailsForm.patchValue({
        [controlName]: null,
      });
      this.notify.showSuccess('CV removed successfully.');
  }   else if (controlName === 'courses_and_certification' && index !== undefined) {
      this.certificationFiles.splice(index, 1);
      this.userDetailsForm.patchValue({
        [controlName]: [...this.certificationFiles],
      });

      // const updatedCertifications = this.userDetailsForm.get(controlName)?.value || [];
      // updatedCertifications.splice(index, 1);
      // this.userDetailsForm.patchValue({
      //   [controlName]: updatedCertifications,
      // });

      this.notify.showSuccess('Certification removed successfully.');
    
  }
}
  
} 
