import { Component } from '@angular/core';
import { AdminService } from '../../../core/services/admin.service';
import { FormsModule, } from '@angular/forms';
import { CommonModule, NgFor } from '@angular/common';
import { Router } from '@angular/router';
import { HelperService } from '../../../core/helpers/helper.service';
import { NotifyService } from '../../../core/services/notify.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-job-list',
  standalone: true,
  imports: [FormsModule, NgFor, CommonModule],
  templateUrl: './job-list.component.html',
  styleUrl: './job-list.component.css'
})
export class JobListComponent {
  jobs: any[] = []; // To store job data
  errorMessage: string = '';
  pageConfig: any = {
    curPage: 1,
    perPage: 10,
    sortBy: "created_on",
    direction: "desc",
    whereClause: [],
  }

  filters = {
    all: "",
  }
  total: number = 0;
  jobPostingList: any[] = [];

  constructor(private adminService: AdminService, private router: Router,
    private helperService: HelperService, private notify: NotifyService,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit(): void {
    // this.fetchJobs();
    this.onPagination();
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

    this.router.navigate(['/create-job-posting', jobId]);
  }

  edituser(userID: string) {

    this.router.navigate(['/user-profile', userID]);
  }

  deleteJob(jobId: string) {
    if (confirm('Are you sure you want to delete this job?')) {
      this.adminService.deleteJob(jobId).subscribe(
        (response: any) => {
          console.log('Job deleted:', response);
          this.jobs = this.jobs.filter(job => job.id !== jobId);
        },
      );
    }
  }

  onPagination(): void {
    this.spinner.show();
    this.pageConfig.whereClause = this.helperService.getAllFilters(this.filters);
    this.adminService.jobPostingPagination(this.pageConfig).subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          this.spinner.hide()
          this.jobPostingList = res.data;
          console.log('this', this.jobPostingList);

          this.total = res.count;
        }
        else {
          this.spinner.hide()
          this.jobPostingList = [];
          this.total = 0;
        }
      },
      error: (err: any) => {
        this.spinner.hide();
        this.notify.showError(err?.error?.message || "Something went wrong!!");
        this.jobPostingList = [];
        this.total = 0;
      }
    })
  }

navigateToCreateJob(){
   this.router.navigate(['/create-job-posting'])
}

navigateToUserProfile(): void {
 
  this.router.navigate(['/user-profile']);
}


   // Handle search action
   onSearch(): void {
    this.pageConfig.curPage = 1; // Reset to the first page
    this.onPagination(); // Trigger the pagination API
  }

   // Clear the search field and trigger API
   clearSearch(): void {
    this.filters.all = '';
    this.onSearch();
  }

   // Trigger API if input becomes empty
   onInputChange(value: string): void {
    if (!value.trim()) {
      this.clearSearch();
    }
  }

  onPageChange(page: number): void {
    if (page > 0 && page <= this.totalPages) {
      this.pageConfig.curPage = page;
      this.onPagination();
    }
  }

  get totalPages(): number {
    return Math.ceil(this.total / this.pageConfig.perPage);
  }

  get paginationArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

}