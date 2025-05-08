import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { UserRole } from 'src/app/core/enums/roles.enum';
import { AdminService } from 'src/app/core/services/admin/admin.service';
import { Router } from '@angular/router';
import { HelperService } from 'src/app/core/helpers/helper.service';
import { NotifyService } from 'src/app/core/services/notify.service';
import { AuthService } from 'src/app/core/services/authentication/auth.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  MatNativeDateModule,
  provideNativeDateAdapter,
} from '@angular/material/core'; // And this
import { MatSliderModule } from '@angular/material/slider';

@Component({
  selector: 'app-all-applicants',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    MatMenuModule,
    MatSelectModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSliderModule,

    MatMenuModule,
    MatSelectModule,
    FormsModule,
  ],
  templateUrl: './all-applicants.component.html',
  styleUrl: './all-applicants.component.scss',
})
export class AllApplicantsComponent implements OnInit {
  displayedColumns: string[] = [
    'name',
    'employer',
    'jobType',
    'publishedDate',
    'deadline',
    'startSalary',
    'endSalary',
    'jobPost',
    'city',
    'action',
  ];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  jobs: any[] = []; // To store job data
  userRole: string = '';
  filters = {
    job_type: '',
    dateRange: {
      start: null,
      end: null,
    },
  };
  errorMessage: string = '';
  searchQuery: string = '';
  pageConfig: any = {
    curPage: 1,
    perPage: 10,
    sortBy: 'created_at',
    direction: 'desc',
    whereClause: [],
  };
  salaryRange = { min: 0, max: 1000000 }; // Default salary range
  salarySliderOptions: any = {
    floor: 0,
    ceil: 1000000,
    step: 1000,
  };

  total: number = 0;
  jobPostingList: any[] = [];

  constructor(
    private adminService: AdminService,
    private router: Router,
    private helperService: HelperService,
    private notify: NotifyService,
    private loader: LoaderService,
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
    // this.onPagination();
    this.onDateRangeChange();
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.pageConfig.curPage = 1; // Reset to the first page when a new search is made
      this.pageConfig.whereClause = [
        {
          key: 'all',
          operator: '=',
          value: this.searchQuery.trim().toLowerCase(),
        },
      ]; // Apply the search query as a filter
    } else {
      this.clearSearch(); // Reset search when query is cleared
    }
    this.onPagination(); // Trigger pagination
  }

  clearSearch(): void {
    this.searchQuery = ''; // Clear search query
    this.pageConfig.whereClause = []; // Reset whereClause to null or empty
    this.pageConfig.curPage = 1; // Reset to the first page
    this.onPagination(); // Trigger pagination again to show all data
  }
  onJobTypeChange(selectedJobType: string): void {
    this.filters.job_type = selectedJobType;
    this.pageConfig.curPage = 1;
    if (this.filters.job_type) {
      this.pageConfig.whereClause = [
        { key: 'job_type', operator: '=', value: this.filters.job_type },
      ];
    } else {
      this.pageConfig.whereClause = [];
    }
    this.onPagination();
  }

  clearFilters(): void {
    this.filters.job_type = ''; // Clear the dropdown
    this.filters.dateRange = {
      start: null,
      end: null,
    };
    this.searchQuery = '';
    this.pageConfig.curPage = 1;
    this.pageConfig.whereClause = []; // Clear filter conditions
    this.onPagination(); // Refresh data
  }

  fetchJobs(): void {
    this.adminService.getJobPostings().subscribe({
      next: (response: any) => {
        console.log(response);
        if (response.statusCode === 200) {
          this.jobs = response.data; // Assign the job data to the jobs array
        } else {
          this.errorMessage = response.message || 'Failed to retrieve jobs';
        }
      },
    });
  }

  getFeaturedImage(imagePath: string): string {
    return imagePath
      ? `http://example.com/${imagePath}`
      : 'assets/default-image.jpg';
  }

  editJob(jobId: string) {
    this.router.navigate(['/create-job-posting', jobId]);
  }

  edituser(userID: string) {
    this.router.navigate(['/edit-profile', userID]);
  }

  deleteJob(jobId: string) {
    if (confirm('Are you sure you want to delete this job?')) {
      this.adminService.deleteJob(jobId).subscribe(
        (response: any) => {
          this.notify.showSuccess(response.message);
          this.onPagination();
          if (this.jobPostingList.length === 1 && this.pageConfig.curPage > 1) {
            this.pageConfig.curPage -= 1;
            this.onPagination();
          }
        },
        (error: any) => {
          this.notify.showError(error?.message || 'Failed to delete job.');
        }
      );
    }
  }

  onPagination(): void {
    this.loader.show();
    this.adminService.jobPostingPagination(this.pageConfig).subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          this.loader.hide();
          this.jobPostingList = res.data;
          this.total = res.count;
          console.log('this', this.jobPostingList);
        } else {
          this.loader.hide();
          this.jobPostingList = [];
          this.total = 0;
        }
      },
      error: (err: any) => {
        this.loader.hide();
        this.notify.showError(err?.error?.message || 'Something went wrong!!');
        this.jobPostingList = [];
        this.total = 0;
      },
    });
  }

  onFilterChange(): void {
    this.pageConfig.curPage = 1; // Reset to the first page
    this.onPagination(); // Trigger the API call
  }

  navigateToCreateJob() {
    this.router.navigate(['/create-job-posting']);
  }

  navigateToUserProfile(): void {
    console.log('Navigating with role:', this.userRole);
    if (this.isAdmin()) {
      console.log('Navigating as admin');
    } else if (this.isApplicant()) {
      console.log('Navigating as applicant');
    }
    this.router.navigate(['/edit-profile']);
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']).then(() => {});
  }

  navigateToApplicantList(): void {
    this.router.navigate(['/applied-jobs']);
  }

  onInputChange(value: string): void {
    if (!value.trim()) {
    }
  }
  onPageChange(event: any): void {
    this.pageConfig.curPage = event.pageIndex + 1;
    this.pageConfig.perPage = event.pageSize;
    this.onPagination();
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

  viewJob(id: any) {
    this.router.navigate(['/view-job', id]);
  }

  viewJobApplications(jobId: string) {
    this.router.navigate(['/job-applicants-list', jobId]);
  }

  applyNow(jobId: string) {
    this.router.navigate(['/Apply-Job', jobId]);
  }

  formatDateToLocalISO(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  onDateRangeChange(): void {
    const { start, end } = this.filters.dateRange;
    const whereClause: any[] = [];

    if (this.filters.job_type) {
      whereClause.push({
        key: 'job_type',
        operator: '=',
        value: this.filters.job_type,
      });
    }

    if (start) {
      const startDate = this.formatDateToLocalISO(start);
      whereClause.push({
        key: 'startDate',
        operator: '=',
        value: startDate,
      });
    }

    if (end) {
      const endDate = this.formatDateToLocalISO(end);
      whereClause.push({
        key: 'endDate',
        operator: '=',
        value: endDate,
      });
    }

    this.pageConfig.curPage = 1;
    this.pageConfig.whereClause = whereClause;
    this.onPagination();
  }
}
