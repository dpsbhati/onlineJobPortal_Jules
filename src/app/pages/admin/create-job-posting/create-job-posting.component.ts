import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, ReactiveFormsModule, NgSelectOption, FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ImageCompressionService } from '../../../core/services/image-compression.service';
import countries from '../../../core/helpers/country.json';
import { NotifyService } from '../../../core/services/notify.service';
import { CommonModule, formatDate, NgFor, NgIf } from '@angular/common';
import { NgLabelTemplateDirective, NgOptionTemplateDirective, NgSelectComponent } from '@ng-select/ng-select';
@Component({
  selector: 'app-create-job-posting',
  standalone: true,
  imports: [ReactiveFormsModule, NgFor, NgIf,  FormsModule,
    NgLabelTemplateDirective,
    NgOptionTemplateDirective,
    NgSelectComponent,
  ],
  templateUrl: './create-job-posting.component.html',
  styleUrl: './create-job-posting.component.css'
})
export class CreateJobPostingComponent {
  jobForm: FormGroup;
  isEditMode = false;
  countryList = countries;
  skillsList = [
    { id: 1, name: 'JavaScript' },
    { id: 2, name: 'Angular' },
    { id: 3, name: 'React' },
    { id: 4, name: 'Node.js' },
    { id: 5, name: 'Python' }
  ];
  
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
      skills_required: new FormControl([], Validators.required),
      title: new FormControl('', [Validators.required , Validators.minLength(2),  Validators.pattern('^[a-zA-Z0-9\\s,().-]+$'), Validators.maxLength(50)],),
      featured_image: new FormControl(null),
      date_published: new FormControl('', Validators.required),
      deadline: new FormControl('', Validators.required),
      short_description: new FormControl(''),
      full_description: new FormControl(''),
      assignment_duration: new FormControl(''),
      employer: new FormControl(''),
      required_experience: new FormControl('', ),
      start_salary: new FormControl('', [Validators.required, Validators.min(3), Validators.pattern(/^\d+$/)]),
      end_salary: new FormControl('', [Validators.required, Validators.min(3), Validators.pattern(/^\d+$/)]),
      country_code: new FormControl('', Validators.required),
      address: new FormControl(''),
      work_type: new FormControl(''),
      // file_path: new FormControl(null),
    });
  }
  

  ngOnInit(): void {
    const jobId = this.route.snapshot.paramMap.get('id') as string;
    if (jobId) {
      this.isEditMode = true;
      this.getJobPosting(jobId);
    }
  }
  sanitizeFormValues(): void {
    Object.keys(this.jobForm.controls).forEach(key => {
      const control = this.jobForm.get(key);
      if (control && typeof control.value === 'string') {
        control.setValue(control.value.trim());
      }
    });
  }
  
  getJobPosting(jobId: string): void {
    this.adminService.getJobById(jobId).subscribe((response: any) => {
      if (response.statusCode === 200 && response.data) {
        const data = response.data;
           console.log(data);
           const formattedDatePublished = formatDate(data.date_published, 'yyyy-MM-dd', 'en-US');
           const formattedDeadline = formatDate(data.deadline, 'yyyy-MM-dd', 'en-US');
        // Explicitly set the value for each control
        this.jobForm.patchValue({
          id: data.id || '',
          job_type: data.job_type || '',
          qualifications: data.qualifications || '',
          skills_required: JSON.parse(data.skills_required || '[]'),
          // skills_required: Array.isArray(data.skills_required) ? data.skills_required : data.skills_required ? [data.skills_required] : [],
          title: data.title || '',
          featured_image: data.featured_image || null,
          date_published: formattedDatePublished || '',
          deadline: formattedDeadline || '',
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
                  this.notify.showSuccess(response.message);
                  this.jobForm.patchValue({
                    [controlName]: response.data.path
                  });
               
                }
                else {
                  this.notify.showWarning(response.message);
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
      else {this.notify.showWarning("Invalid image format")}
    }
  }
  
  onSubmit(): void {
    if (this.jobForm.valid) {
      this.sanitizeFormValues();
      const formValues = this.jobForm.value;
      if (!formValues.id) {
        delete formValues.id;
      }
      formValues.skills_required = JSON.stringify(formValues.skills_required);
      if (this.isEditMode) {
        this.adminService.createOrUpdateJobPosting(formValues).subscribe(response => {
          if (response.statusCode === 200) {
            this.notify.showSuccess(response.message);
            this.router.navigate(['/job-list']);
          }
          else{
            this.notify.showWarning(response.message);
          }
        });
      } else {
        this.adminService.createOrUpdateJobPosting(formValues).subscribe(response => {
          if (response.statusCode === 200) {
            this.notify.showSuccess(response.message);
            this.router.navigate(['/job-list']);
          }
          else{
            this.notify.showWarning(response.message);
          }
        });
      }
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