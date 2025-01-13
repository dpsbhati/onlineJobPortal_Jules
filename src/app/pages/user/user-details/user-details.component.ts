import { NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { ActivatedRoute } from '@angular/router';
import { NotifyService } from '../../../core/services/notify.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
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
      ]),
      additional_info: new FormControl('',  [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(500),
      ]),
      description: new FormControl('',  [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(1000),
      ]),
      comments: new FormControl('',   [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(500),
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

  // onFileChange(event: Event, controlName: string): void {

  //   const fileInput = event.target as HTMLInputElement;
  //   const file = fileInput?.files?.[0];
  //   this.spinner.show();
  //   if (file) {
  //     const validFormats = [
  //       'application/pdf',                 // PDF
  //       'application/msword',              // DOC
  //       // 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
  //       // 'application/vnd.oasis.opendocument.text', // ODT
  //       // 'text/rtf',                        // RTF
  //       // 'text/plain'                       // TXT
  //     ];
  
  //     if (!validFormats.includes(file.type)) {
  //       this.fileError = 'Invalid file format. Only PDF, DOC, DOCX, ODT, RTF, and TXT files are allowed.';
  //       this.fileUploaded= null;
  //       this.spinner.hide();
  //       return;
  //     }
  
  //     if (file.size > 5 * 1024 * 1024) { 
  //       this.fileError = 'File size should not exceed  5 MB.';
  //       this.fileUploaded = null;
  //       return;
  //     }
  
  //     this.fileError = null;
  //     this.fileUploaded = file;
  
  //     const folderName = 'user-details';
  //     this.user = JSON.parse(localStorage.getItem('user') || '{}');
  //     const userId =this. user.id;
  //     console.log(folderName, file, userId);
  //     this.adminService.uploadFile({ folderName, file, userId }).subscribe(
  //       (response :any) => {
        
  //         if (response.statusCode === 200) {
  //           this.notify.showSuccess(response.message);
  //           this.spinner.hide();
  //           this.userDetailsForm.patchValue({
  //             [controlName]: response.data.path
  //           });
  //         } else {
  //           this.notify.showWarning(response.message);
  //           this.spinner.hide();
  //           this.fileError = 'File upload failed. Please try again.';
  //         }
  //       },
        
  //     );
  //   }
  //   else{
  //     this.spinner.hide();
  //   }
  // }



onFileChange(event: Event, controlName: string): void {
  // debugger
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
          const existingCertifications = this.userDetailsForm.get(controlName)?.value || [];
          this.userDetailsForm.patchValue({
            [controlName]: [...existingCertifications, ...certifications],
          });
          this.notify.showSuccess('All valid files uploaded successfully!');
        } else {
          this.notify.showWarning('No valid files were uploaded.');
        }
      })
      .catch(error => {
        this.notify.showError('Error uploading certification files. Please try again.');
        console.error(error);
      });
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
        } else {
          this.notify.showWarning(response.message);
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

  Submit(): void {
    this.spinner.show();
    this.submitted = true;

    if (this.userDetailsForm.valid  && this.fileUploaded) {
      this.sanitizeFormValues();
      const formData = this.userDetailsForm.value; 
      // const apiPayload = {
      //   ...formData,
      //   courses_and_certification: this.certificationFiles.map(file => ({
      //     organization_name: file.name,
      //     certification_description: 'Description placeholder', 
      //     start_date: '2020-01-01',
      //     end_date: '2020-12-31', 
      //     certification_file: file.name,
      //   })),
      //   job_id: this.jobId,
      //   user_id: this.user?.id,
      // };
  
      const apiPayload = {
        ...formData,
        job_id: this.jobId, 
        user_id: this.user?.id, 
      };

      this.adminService.applyJobs(apiPayload ).subscribe(
        (response: any) => {
          if (response.statusCode === 200) {
            this.spinner.hide();
               this.notify.showSuccess(response.message);
               this.router.navigate(['/job-list'])
          } else {
                this.spinner.hide();
                this.notify.showWarning(response.message);
                this.router.navigate(['/job-list'])
          }
        },
      );
    } else {
     this.spinner.hide();
    }
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
    } else if (controlName === 'courses_and_certification' && index !== undefined) {
      this.certificationFiles.splice(index, 1);

      const updatedCertifications = this.userDetailsForm.get(controlName)?.value || [];
      updatedCertifications.splice(index, 1);
      this.userDetailsForm.patchValue({
        [controlName]: updatedCertifications,
      });
  
      this.notify.showSuccess('Certification removed successfully.');
    }
  }
  // deleteFile(controlName: string, userId: string, index?: number): void {
  //   if (controlName === 'cv_path') {
  //     // API call to delete CV file
  //     this.adminService.deleteFile({ path: this.userDetailsForm.get(controlName)?.value, userId }).subscribe(
  //       (response: any) => {
  //         if (response.statusCode === 200) {
  //           this.uploadedFileName = null;
  //           this.fileUploaded = null;
  //           this.userDetailsForm.patchValue({
  //             [controlName]: null,
  //           });
  //           this.notify.showSuccess('CV removed successfully.');
  //         } else {
  //           this.notify.showWarning('Failed to remove CV. Please try again.');
  //         }
  //       },
  //       error => {
  //         this.notify.showError('Error while deleting CV file.');
  //         console.error(error);
  //       }
  //     );
  //   } else if (controlName === 'courses_and_certification' && index !== undefined) {
  //     // API call to delete certification file
  //     const certification = this.certificationFiles[index];
  //     this.adminService.deleteFile({ path: certification.certification_file, userId }).subscribe(
  //       (response: any) => {
  //         if (response.statusCode === 200) {
  //           this.certificationFiles.splice(index, 1);
  //           const updatedCertifications = this.userDetailsForm.get(controlName)?.value || [];
  //           updatedCertifications.splice(index, 1);
  //           this.userDetailsForm.patchValue({
  //             [controlName]: updatedCertifications,
  //           });
  //           this.notify.showSuccess('Certification removed successfully.');
  //         } else {
  //           this.notify.showWarning('Failed to remove certification. Please try again.');
  //         }
  //       },
  //       error => {
  //         this.notify.showError('Error while deleting certification file.');
  //         console.error(error);
  //       }
  //     );
  //   }
  // }
  
  
}
