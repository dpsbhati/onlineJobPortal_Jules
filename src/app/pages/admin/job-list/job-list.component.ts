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
import moment from 'moment';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../core/enums/roles.enum';

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
  userRole: string = '';
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
    salary_min: this.salaryRange.min,
    salary_max: this.salaryRange.max,
  }

  total: number = 0;
  jobPostingList: any[] = [];

  constructor(
    private adminService: AdminService,
    private router: Router,
    private helperService: HelperService,
    private notify: NotifyService,
    private spinner: NgxSpinnerService,
    private authService: AuthService
  ) {
    this.userRole = this.authService.getUserRole();
    console.log('Current user role:', this.userRole); // Debug log
  }

  isAdmin(): boolean {
    return this.userRole.toLowerCase() === UserRole.ADMIN.toLowerCase();
  }

  isApplicant(): boolean {
    return this.userRole.toLowerCase() === UserRole.APPLICANT.toLowerCase();
  }

  ngOnInit(): void {
    // this.fetchJobs();
    this.onPagination();
    this.initializeDeadlinePicker();
  }

  onSalaryRangeChange(): void {
    this.filters.salary_min = this.salaryRange.min;
    this.filters.salary_max = this.salaryRange.max;
    this.onPagination()
  }

  initializeDeadlinePicker(): void {
    const datePickerElement = $('input[name="deadlineDatePicker"]');

    datePickerElement.daterangepicker(
      {
        singleDatePicker: true,
        autoUpdateInput: true, // Automatically update the input field
        startDate: moment().format('YYYY-MM-DD'), // Set today's date as default
        locale: {
          format: 'YYYY-MM-DD',
          cancelLabel: 'Clear',
          applyLabel: 'Apply',
        },
      },
      (selectedDate: any) => {
        const selectedDateFormatted = selectedDate.format('YYYY-MM-DD');
        if (this.filters.deadline !== selectedDateFormatted) {
          this.filters.deadline = selectedDateFormatted;
          this.onSearch(); // Trigger search only if the date changes
        }
      }
    );

    // Handle the 'Clear' button functionality
    datePickerElement.on('cancel.daterangepicker', () => {
      this.filters.deadline = '';
      datePickerElement.val(''); // Clear the input field
      this.onSearch(); // Trigger the search API call on clear
    });

    // Handle the 'Apply' button functionality explicitly
    datePickerElement.on('apply.daterangepicker', () => {
      const selectedDateFormatted = datePickerElement.data('daterangepicker').startDate.format('YYYY-MM-DD');
      this.filters.deadline = selectedDateFormatted;
      this.onSearch();
    });
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

  onPagination(): void {
    this.spinner.show();
    this.pageConfig.whereClause = this.helperService.getAllFilters(this.filters);

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

  navigateToCreateJob() {
    this.router.navigate(['/create-job-posting'])
  }

  navigateToUserProfile(): void {

    this.router.navigate(['/user-profile']);
  }

  navigateToApplicantList(): void {
    this.router.navigate(['/applied-jobs']);
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
      // Reset the salary range
      this.salaryRange.min = this.salarySliderOptions.floor; // Reset to slider minimum
    this.salaryRange.max = this.salarySliderOptions.ceil;  // Reset to slider maximum

    this.filters.salary_min = this.salaryRange.min;
    this.filters.salary_max = this.salaryRange.max;

    // Reset whereClause
    this.pageConfig.whereClause = []; // Clear all filters in whereClause

    // Trigger the UI update for the slider
    this.onSalaryRangeChange();
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
  navigate() {
    this.router.navigate(['auth/login']);
  }

  // onSearchWithMinLength(): void {
  //   if (this.filters.all.trim().length >= 2) {
  //     this.onSearch(); // Trigger the API call only if 2 or more characters are entered
  //   } else {
  //     this.notify.showWarning('Please enter at least 2 characters to search.');
  //   }
  // }

  viewJob(id: number) {
    this.router.navigate(['/view-job', id]);
  }
}