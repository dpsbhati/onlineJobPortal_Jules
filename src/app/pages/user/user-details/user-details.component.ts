import { NgIf } from '@angular/common';
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
  imports: [ReactiveFormsModule, NgIf, ],
  templateUrl: './user-details.component.html',
  styleUrl: './user-details.component.css'
})
export class UserDetailsComponent {
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
      work_experiences: new FormControl('', Validators.required),
      additional_info: new FormControl(''),
      description: new FormControl('', Validators.required),
      comments: new FormControl(''),
      cv_path: new FormControl('', Validators.required),
      certification_path: new FormControl('', Validators.required),
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

    const fileInput = event.target as HTMLInputElement;
    const file = fileInput?.files?.[0];
    this.spinner.show();
    if (file) {
      const validFormats = [
        'application/pdf',                 // PDF
        'application/msword',              // DOC
        // 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
        // 'application/vnd.oasis.opendocument.text', // ODT
        // 'text/rtf',                        // RTF
        // 'text/plain'                       // TXT
      ];
  
      if (!validFormats.includes(file.type)) {
        this.fileError = 'Invalid file format. Only PDF, DOC, DOCX, ODT, RTF, and TXT files are allowed.';
        this.fileUploaded= null;
        this.spinner.hide();
        return;
      }
  
      if (file.size > 5 * 1024 * 1024) { 
        this.fileError = 'File size should not exceed  5 MB.';
        this.fileUploaded = null;
        return;
      }
  
      this.fileError = null;
      this.fileUploaded = file;
  
      const folderName = 'user-details';
      this.user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId =this. user.id;
      console.log(folderName, file, userId);
      this.adminService.uploadFile({ folderName, file, userId }).subscribe(
        (response :any) => {
        
          if (response.statusCode === 200) {
            this.notify.showSuccess(response.message);
            this.spinner.hide();
            this.userDetailsForm.patchValue({
              [controlName]: response.data.path
            });
          } else {
            this.notify.showWarning(response.message);
            this.spinner.hide();
            this.fileError = 'File upload failed. Please try again.';
          }
        },
        
      );
    }
    else{
      this.spinner.hide();
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
    this.spinner.show();
    this.submitted = true;

    if (this.userDetailsForm.valid) {
      this.sanitizeFormValues();
      const formData = this.userDetailsForm.value; 
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
}
