import { Component } from '@angular/core';
import { AdminService } from '../../../core/services/admin.service';
import { FormsModule, } from '@angular/forms';
import { CommonModule, NgFor } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-job-list',
  standalone: true,
  imports: [FormsModule, NgFor, CommonModule],
  templateUrl: './job-list.component.html',
  styleUrl: './job-list.component.css'
})
export class JobListComponent {
  jobs: any[] = []; // To store job data
  errorMessage: string = ''; // To store error messages

  constructor(private adminService: AdminService, private router :Router) {}

  ngOnInit(): void {
    this.fetchJobs();
  }

  fetchJobs(): void {
    this.adminService.getJobPostings().subscribe({
      next: (response: any) => {
        console.log(response)
        if (response.statusCode === 200) {
          this.jobs = response.data; // Assign the job data to the jobs array
        } else {
          this.errorMessage = response.message || 'Failed to retrieve jobs';
        }
      },

    });
  }

  getFeaturedImage(imagePath: string): string {
    return imagePath ? `http://example.com/${imagePath}` : 'assets/default-image.jpg';
  }
  editJob(jobId: string) {
    
    this.router.navigate(['admin/create-job-posting', jobId]);
  }

  deleteJob(jobId: string) {
    if (confirm('Are you sure you want to delete this job?')) {
      console.log('Delete job with ID:', jobId);
   
      this.adminService.deleteJob(jobId).subscribe(
        (response) => {
          console.log('Job deleted:', response);
          // this.jobs = this.jobs.filter(job => job.id !== jobId);
        },
        (error) => {
          this.errorMessage = 'Failed to delete the job.';
          console.error(error);
        }
      );
    }
}
}