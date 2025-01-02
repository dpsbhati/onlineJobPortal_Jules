import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, ReactiveFormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { ActivatedRoute } from '@angular/router';
import { ImageCompressionService } from '../../../core/services/image-compression.service';
import countries from '../../../core/helpers/country.json';
import { NotifyService } from '../../../core/services/notify.service';
import { NgFor } from '@angular/common';
@Component({
  selector: 'app-create-job-posting',
  standalone: true,
  imports: [ReactiveFormsModule, NgFor],
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
      file_path: new FormControl(null),
    });
  }

  ngOnInit(): void {
   
    const jobId = this.route.snapshot.paramMap.get('id');
    if (jobId) {
      this.isEditMode = true;
      // this.loadJobPosting(jobId);
    }
  }

  // loadJobPosting(jobId: string): void {
  //   this.adminService.getJobById(jobId).subscribe((data: any) => {
  //     this.jobForm.patchValue(data);
  //   });
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
      } else {
    
        // this.jobForm.patchValue({ [controlName]: file });
        const folderName = 'job-postings';
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = user.id;
        this.adminService.uploadFile({ folderName, file, userId }).subscribe(
          (response) => {
            if(response.statusCode ===200){
              console.log(response);
              this.jobForm.patchValue({
                [controlName]: response.data.path
              });
            
          }
        })
      }
    }
  }
  onSubmit(): void {
    console.log(this.countryList);
    if (this.jobForm.valid) {
      const formValues = this.jobForm.value;
      if (!formValues.id) {
        delete formValues.id;
      }
  
      this.adminService.createOrUpdateJobPosting(formValues).subscribe(
        (response) => {
          if(response.statusCode === 200){
             this.notify.showSuccess("JOb created Successfully")
          }
        }
      );
    } else {
      alert('Please fill in all required fields.');
    }
  }
  
}