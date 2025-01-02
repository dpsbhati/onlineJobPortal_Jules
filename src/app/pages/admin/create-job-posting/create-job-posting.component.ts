import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, ReactiveFormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-create-job-posting',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './create-job-posting.component.html',
  styleUrl: './create-job-posting.component.css'
})
export class CreateJobPostingComponent {
  jobForm: FormGroup;
  isEditMode = false;

  constructor(
    private adminService: AdminService,
    private route: ActivatedRoute
  ) {
    this.jobForm = new FormGroup({
      id: new FormControl(0),
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
      this.jobForm.patchValue({ [controlName]: file });
    }
  }

  onSubmit(): void {
    if (this.jobForm.valid) {
      const formData = new FormData();
      Object.entries(this.jobForm.value).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          // Check if value is a File (or Blob) and append it correctly
          if (value instanceof File) {
            formData.append(key, value);
          } else {
            // Convert other types to string
            formData.append(key, value.toString());
          }
        }
      });
    
      this.adminService.createOrUpdateJobPosting(formData).subscribe(
        () => alert('Job posting saved successfully!'),
        (error) => console.error(error)
      );
    } else {
      alert('Please fill in all required fields.');
    }
    
  }}