import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, ReactiveFormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ImageCompressionService } from '../../../core/services/image-compression.service';
import countries from '../../../core/helpers/country.json';
import { NotifyService } from '../../../core/services/notify.service';
import { formatDate, NgFor, NgIf } from '@angular/common';
@Component({
  selector: 'app-create-job-posting',
  standalone: true,
  imports: [ReactiveFormsModule, NgFor, NgIf],
  templateUrl: './create-job-posting.component.html',
  styleUrl: './create-job-posting.component.css'
})
export class CreateJobPostingComponent {
  jobForm: FormGroup;
  isEditMode = false;
  countryList = countries;
  
  private readonly allowedImageFormats = ['image/jpeg', 'image/png', 'image/webp'];
  constructor(
    private adminService: AdminService,
    private route: ActivatedRoute,
    private router : Router,
    private imageCompressionService :ImageCompressionService,
    private notify :NotifyService
  ) {
    this.jobForm = new FormGroup({
      id: new FormControl(''),
      job_type: new FormControl('', Validators.required),
      qualifications: new FormControl('', Validators.required),
      skills_required: new FormControl('', Validators.required),
      title: new FormControl('', Validators.required),
      featured_image: new FormControl(null),
      date_published: new FormControl('', Validators.required),
      deadline: new FormControl('', Validators.required),
      short_description: new FormControl('', Validators.required),
      full_description: new FormControl('', Validators.required),
      assignment_duration: new FormControl('', Validators.required),
      employer: new FormControl('', Validators.required),
      required_experience: new FormControl('', Validators.required),
      start_salary: new FormControl('', [Validators.required, Validators.min(0)]),
      end_salary: new FormControl('', [Validators.required, Validators.min(0)]),
      country_code: new FormControl('', Validators.required),
      address: new FormControl('', Validators.required),
      work_type: new FormControl('', Validators.required),
      // file_path: new FormControl(null),
    });
  }

  ngOnInit(): void {
    const jobId = this.route.snapshot.paramMap.get('id') as string;
    if (jobId) {
      this.isEditMode = true;
      this.loadJobPosting(jobId);
    }
  }

  loadJobPosting(jobId: string): void {
    this.adminService.getJobById(jobId).subscribe((response: any) => {
      if (response.statusCode === 200 && response.data) {
        const data = response.data;
           console.log(data);
        // Explicitly set the value for each control
        this.jobForm.patchValue({
          id: data.id || '',
          job_type: data.job_type || '',
          qualifications: data.qualifications || '',
          skills_required: data.skills_required || '',
          title: data.title || '',
          featured_image: data.featured_image || null,
          date_published: data.date_published || '',
          deadline: data.deadline || '',
          short_description: data.short_description || '',
          full_description: data.full_description || '',
          assignment_duration: data.assignment_duration || '',
          employer: data.employer || '',
          required_experience: data.required_experience || '',
          start_salary: data.start_salary || 0,
          end_salary: data.end_salary || 0,
          country_code: data.country_code || '',
          address: data.address || '',
          work_type: data.work_type || '',
          // file_path: data.file || null,
        });
      
        
        
      } else {
        console.error('Failed to retrieve job posting data', response.message);
      }
    });
  }
  
 
  onFileSelected(event: Event, controlName: string): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      if (this.allowedImageFormats.includes(file.type)) {
        this.imageCompressionService.compressImage(file).then((compressedImageUrl: string) => {
          fetch(compressedImageUrl)
            .then((res) => res.blob())
            .then((compressedFileBlob) => {
              const compressedFile = new File([compressedFileBlob], file.name, { type: file.type });
        
              // this.jobForm.patchValue({ [controlName]: compressedFile });
              const folderName = 'job-postings';
              const user = JSON.parse(localStorage.getItem('user') || '{}');
              const userId = user.id;
              this.adminService.uploadFile({ folderName, file: compressedFile, userId }).subscribe(
                (response) => {
                if(response.statusCode ===200){
                  // console.log(response);
                  this.jobForm.patchValue({
                    [controlName]: response.data.path
                  });
               
                }
                },
                (error) => {
                  console.error('Error uploading file:', error);
                }
              );
            });
        })
      // } else {
    
      //   // this.jobForm.patchValue({ [controlName]: file });
      //   const folderName = 'job-postings';
      //   const user = JSON.parse(localStorage.getItem('user') || '{}');
      //   const userId = user.id;
      //   this.adminService.uploadFile({ folderName, file, userId }).subscribe(
      //     (response) => {
      //       if(response.statusCode ===200){
      //         console.log(response);
      //         this.jobForm.patchValue({
      //           [controlName]: response.data.path
      //         });
            
      //     }
      //   })
      }
    }
  }
  onSubmit(): void {
    if (this.jobForm.valid) {
      const formValues = this.jobForm.value;
      if (!formValues.id) {
        delete formValues.id;
      }
      if (this.isEditMode) {
        this.adminService.createOrUpdateJobPosting(formValues).subscribe(response => {
          if (response.statusCode === 200) {
            this.notify.showSuccess('Job updated successfully');
            this.router.navigate(['/job-list']);
          }
        });
      } else {
        this.adminService.createOrUpdateJobPosting(formValues).subscribe(response => {
          if (response.statusCode === 200) {
            this.notify.showSuccess('Job created successfully');
            this.router.navigate(['/job-list']);
          }
        });
      }
    } else {
      alert('Please fill in all required fields.');
    }
  }
  
  // onSubmit(): void {
  //   console.log(this.countryList);
  //   if (this.jobForm.valid) {
  //     const formValues = this.jobForm.value;
  //     if (!formValues.id) {
  //       delete formValues.id;
  //     }
  
  //     this.adminService.createOrUpdateJobPosting(formValues).subscribe(
  //       (response) => {
  //         if(response.statusCode === 200){
  //            this.notify.showSuccess("JOb created Successfully")
  //            this.router.navigate(['auth/job-list']);
  //           //  this.router.navigate(['auth/create-job-posting'])
  //         }
  //       }
  //     );
  //   } else {
  //     alert('Please fill in all required fields.');
  //   }
  // }
  
}