import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, ReactiveFormsModule, NgSelectOption, FormsModule, AbstractControl } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ImageCompressionService } from '../../../core/services/image-compression.service';
import countries from '../../../core/helpers/country.json';
import { NotifyService } from '../../../core/services/notify.service';
import { CommonModule, formatDate, NgFor, NgIf } from '@angular/common';
import { NgLabelTemplateDirective, NgOptionTemplateDirective, NgSelectComponent } from '@ng-select/ng-select';
import {  ValidationErrors, ValidatorFn} from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
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
  isDatePublishedReadonly = true;
  todaysDate = new Date();
  
  private readonly allowedImageFormats = ['image/jpeg', 'image/png', 'image/webp'];
  constructor(
    private adminService: AdminService,
    private route: ActivatedRoute,
    private router : Router,
    private imageCompressionService :ImageCompressionService,
    private notify :NotifyService,
    private spinner : NgxSpinnerService,
  ) {
    this.jobForm = new FormGroup({
      id: new FormControl(''),
      job_type: new FormControl('', Validators.required),
      rank: new FormControl('', Validators.required),
      skills_required: new FormControl([], Validators.required),
      title: new FormControl('', [Validators.required , Validators.minLength(2),  Validators.pattern('^[a-zA-Z0-9\\s,().-]+$'), Validators.maxLength(50)],),
      featured_image: new FormControl(null,Validators.required),
      date_published: new FormControl(this.todaysDate),
      deadline: new FormControl('', [Validators.required,]),
      short_description: new FormControl(''),
      full_description: new FormControl(''),
      assignment_duration: new FormControl(''),
      employer: new FormControl(''),
      required_experience: new FormControl('', ),
      start_salary: new FormControl('', [Validators.required, Validators.min(3),  Validators.maxLength(7),]),
      end_salary: new FormControl('', [Validators.required, Validators.min(3),  Validators.maxLength(8),]),
      country_code: new FormControl('', Validators.required),
      address: new FormControl('', Validators.required),
      social_media_type: new FormControl('', Validators.required),
      posted_at: new FormControl(''),
      jobpost_status: new FormControl('draft'),
      
      // work_type: new FormControl(''),
      // file_path: new FormControl(null),
    }, 
     { validators: this.salaryComparisonValidator }
    );
    
  }
  

  ngOnInit(): void {
    const jobId = this.route.snapshot.paramMap.get('id') as string;
    if (jobId) {
      this.isEditMode = true;
      this.getJobPosting(jobId);
    }
      const today = new Date().toISOString().split('T')[0];
      this.jobForm.get('date_published')?.setValue(today);
      this.jobForm.get('deadline')?.setValidators([Validators.required, this.deadlineValidator(this.todaysDate)]);
   this.listenToSocialMediaType();
  }
  listenToSocialMediaType(): void {
    this.jobForm.get('social_media_type')?.valueChanges.subscribe((value) => {
      const postedAtControl = this.jobForm.get('posted_at');
      if (value === 'facebook' || value === 'linkedin') {
        postedAtControl?.setValidators([Validators.required,  this.postedAtValidator()]);
      } else {
        postedAtControl?.clearValidators();
        postedAtControl?.setValue(''); // Clear the value
      }
      postedAtControl?.updateValueAndValidity();
    });
  }
  postedAtValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const selectedDate = new Date(control.value);
      const now = new Date();
  
      if (control.value && selectedDate < now) {
        return { pastDateTime: true };
      }
      return null;
    };
  }
  
  formatSalary(controlName: string): void {
    const control = this.jobForm.get(controlName);
    if (control) {
      let value = control.value;
      if (value) {
        value = value.replace(/[^0-9]/g, '');
        const formattedValue = new Intl.NumberFormat('en-US').format(Number(value));
        control.setValue(formattedValue, { emitEvent: false });
      }
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
  deadlineValidator(date_published: Date): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const selectedDeadline = new Date(control.value);
      const today = new Date();
      
      if (selectedDeadline < today || selectedDeadline < date_published) {
        return { deadlineInvalid: true };
      }
      return null;
    }
  }
  salaryComparisonValidator(control: AbstractControl): ValidationErrors | null {
    const startSalaryControl = control.get('start_salary');
    const endSalaryControl = control.get('end_salary');
  
    if (startSalaryControl && endSalaryControl) {
      const startSalary = parseInt(startSalaryControl.value.replace(/,/g, '') || '0', 10);
      const endSalary = parseInt(endSalaryControl.value.replace(/,/g, '') || '0', 10);
  
      if (startSalary > endSalary) {
        return { salaryMismatch: true };
      }
    }
    return null;
  }
  
  
  
  getJobPosting(jobId: string): void {
    this.spinner.show();
    this.adminService.getJobById(jobId).subscribe((response: any) => {
      if (response.statusCode === 200 && response.data) {
        this.spinner.hide()
        const data = response.data;
           console.log(data);
           const formattedDatePublished = formatDate(data.date_published, 'yyyy-MM-dd', 'en-US');
           const formattedDeadline = formatDate(data.deadline, 'yyyy-MM-dd', 'en-US');
           const formattedPostedAt = data.posted_at
           ? new Date(data.posted_at).toISOString().slice(0, 16) 
           : '';

           const formattedStartSalary = data.start_salary
           ? new Intl.NumberFormat('en-US').format(Number(data.start_salary))
           : '';
         const formattedEndSalary = data.end_salary
           ? new Intl.NumberFormat('en-US').format(Number(data.end_salary))
           : '';
    
        this.jobForm.patchValue({
          id: data.id || '',
          job_type: data.job_type || '',
          rank: data.rank || '',
          skills_required: JSON.parse(data.skills_required || '[]'),
          title: data.title || '',
          featured_image: data.featured_image || null,
          date_published: formattedDatePublished || '',
          deadline: formattedDeadline || '',
          short_description: data.short_description || '',
          full_description: data.full_description || '',
          assignment_duration: data.assignment_duration || '',
          employer: data.employer || '',
          required_experience: data.required_experience || '',
          start_salary: formattedStartSalary || 0,
          end_salary: formattedEndSalary || 0,
          country_code: data.country_code || '',
          address: data.address || '',
          social_media_type: data.social_media_type || 'facebook',
          posted_at: formattedPostedAt,
          jobpost_status: data.jobpost_status || 'draft',
          // work_type: data.work_type || '',
          // file_path: data.file || null,
        });
      
        
        
      } else {
        this.spinner.hide();
        console.error('Failed to retrieve job posting data', response.message);
      }
    });
  }
  
 
  onFileSelected(event: Event, controlName: string): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    this.spinner.show()
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
                  this.spinner.hide();
                  this.notify.showSuccess(response.message);
                  this.jobForm.patchValue({
                    [controlName]: response.data.path
                  });
               
                }
                else {
                  this.spinner.hide();
                  this.notify.showWarning(response.message);
                }
                },
                (error) => {
                  console.error('Error uploading file:', error);
                  this.spinner.hide();
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
      else {
        this.spinner.hide();
        this.notify.showWarning("Invalid image format")
      }
    }
  }
  
  onSubmit(): void {
    // debugger
    this.spinner.show();
    if (this.jobForm.valid) {
      this.sanitizeFormValues();
      const formValues = this.jobForm.value;
      if (formValues.start_salary) {
        formValues.start_salary = parseInt(formValues.start_salary.replace(/,/g, ''), 10);
      }
      if (formValues.end_salary) {
        formValues.end_salary = parseInt(formValues.end_salary.replace(/,/g, ''), 10);
      }
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
            this.spinner.hide();
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
            this.spinner.hide();
          }
        });
      }
    } 
    else {
      this.spinner.hide();
      this.notify.showWarning("Failed to update the form")
    }
  }
  navigate(){
    this.router.navigate(['/job-list']);
  }
  
}