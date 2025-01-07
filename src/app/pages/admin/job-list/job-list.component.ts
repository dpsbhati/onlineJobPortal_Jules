import { Component } from '@angular/core';
import { AdminService } from '../../../core/services/admin.service';
import { FormsModule, } from '@angular/forms';
import { CommonModule, NgFor } from '@angular/common';
import { Router } from '@angular/router';
import { HelperService } from '../../../core/helpers/helper.service';
import { NotifyService } from '../../../core/services/notify.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { Options, LabelType } from "@angular-slider/ngx-slider";

declare var $: any;

@Component({
  selector: 'app-job-list',
  standalone: true,
  imports: [FormsModule, NgFor, CommonModule, NgxSliderModule],
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
  salaryRange = { min: 0, max: 1000000 }; // Default salary range
  salarySliderOptions: any = {
    floor: 0,
    ceil: 1000000,
    step: 1000,
    translate: (value: number, label: LabelType): string => {
      switch (label) {
        case LabelType.Low:
          return "<b>Min salary:</b> $" + `₹${value.toLocaleString('en-IN')}`;
        case LabelType.High:
          return "<b>Max salary:</b> $" + `₹${value.toLocaleString('en-IN')}`;
        default:
          return "$" + value;
      }
    }
  };

  filters = {
    all: "",
    title: "",
    job_type: "",
    deadline: "",
    start_salary: this.salaryRange.min,
    end_salary: this.salaryRange.max,
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
    this.initializeDeadlinePicker();
  }

  onSalaryRangeChange(): void {
    this.filters.start_salary = this.salaryRange.min;
    this.filters.end_salary = this.salaryRange.max;
   this.onPagination(true)
  }

  
  initializeDeadlinePicker(): void {
    $('input[name="deadlineDatePicker"]').daterangepicker(
      {
        singleDatePicker: true,
        autoUpdateInput: false,
        locale: {
          format: 'YYYY-MM-DD',
          cancelLabel: 'Clear',
          applyLabel: 'Apply',
          placeholder: 'Select Deadline',
        },
      },
      (selectedDate: any) => {
        this.filters.deadline = selectedDate.format('YYYY-MM-DD');
        this.onSearch();
      }
    );

    $('input[name="deadlineDatePicker"]').on(
      'cancel.daterangepicker',
      () => {
        this.filters.deadline = '';
        $('input[name="deadlineDatePicker"]').val('');
        this.onSearch();
      }
    );
  }

  openDatePicker(name: string): void {
    $(`input[name="${name}"]`).trigger('click');
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

  // deleteJob(jobId: string) {
  //   if (confirm('Are you sure you want to delete this job?')) {
  //     this.adminService.deleteJob(jobId).subscribe(
  //       (response: any) => {
  //         this.jobs = this.jobs.filter(job => job.id !== jobId);
  //         this.notify.showSuccess(response.message);
  //         window.location.reload();
         
  //       },
  //     );
  //   }
    
  // }

  deleteJob(jobId: string) {
    if (confirm('Are you sure you want to delete this job?')) {
      this.adminService.deleteJob(jobId).subscribe(
        (response: any) => {
          this.notify.showSuccess(response.message);
  
          // Refresh job data after deletion
          this.onPagination();
  
          // If the current page becomes empty after deletion, navigate to the previous page
          if (this.jobPostingList.length === 1 && this.pageConfig.curPage > 1) {
            this.pageConfig.curPage -= 1;
            this.onPagination();
          }
        },
        (error: any) => {
          this.notify.showError(error?.message || "Failed to delete job.");
        }
      );
    }
  }
  

  onPagination(isFilter = false): void {
    this.spinner.show();
    if(isFilter){
      this.pageConfig.whereClause = this.helperService.getAllFilters(this.filters);
    }    
    this.adminService.jobPostingPagination(this.pageConfig).subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          this.spinner.hide()
          this.jobPostingList = res.data;
          this.total = res.count;
          console.log('this', this.jobPostingList);
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

  onFilterChange(): void {
    this.pageConfig.curPage = 1; // Reset to the first page
    this.onPagination(); // Trigger the API call
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
    this.filters.title = "",
    this.filters.job_type = "",
    this.filters.deadline = "",
    this.filters.start_salary = this.salaryRange.min,
    this.filters.end_salary = this.salaryRange.max
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
  navigate(){
    this.router.navigate(['auth/login']);
  }

}