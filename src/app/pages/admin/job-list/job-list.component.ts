import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { AdminService } from '../../../core/services/admin/admin.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HelperService } from '../../../core/helpers/helper.service';
import { NotifyService } from '../../../core/services/notify.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { NgxSpinnerModule } from 'ngx-spinner';
import { AuthService } from '../../../core/services/authentication/auth.service';
import { UserRole } from '../../../core/enums/roles.enum';
import { MaterialModule } from '../../../material.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-job-list',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    TablerIconsModule,
    FormsModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    NgxSpinnerModule
  ],
  templateUrl: './job-list.component.html',
  styleUrls: ['./job-list.component.scss'],
  styles: [`
    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    }
    .loading-text {
      color: white;
      margin-top: 16px;
    }
    .no-records-message {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .text-danger {
      color: #dc3545;
    }
    .ms-2 {
      margin-left: 0.5rem;
    }
  `],
  encapsulation: ViewEncapsulation.None
})
export class JobListComponent implements OnInit {
  jobList: any[] = [];
  uniqueRanks: string[] = [];
  id: number = 0;
  userRole: string = '';
  errorMessage: string = '';
  dataSource: any;
  pageSize = 10;
  pageIndex = 0;
  totalApplications = 0;

  pageConfig: any = {
    curPage: 1,
    perPage: 10,
    sortBy: "created_at",
    direction: "desc",
    whereClause: []
  }

  filters = {
    all: "",
    title: "",
    job_type: "",
    employer: "",
    rank: "",
    status: ""
  }

  total: number = 0;
  jobPostingList: any[] = [];
  isLoading: boolean = false;
  displayedColumns: string[] = [];

  constructor(
    private adminService: AdminService,
    private router: Router,
    private helperService: HelperService,
    private notify: NotifyService,
    private authService: AuthService
  ) {
    this.userRole = this.authService.getUserRole();
    this.displayedColumns = this.isAdmin() ? 
      ['position', 'title', 'job_type', 'employer', 'salary', 'date_published', 'deadline', 'status', 'actions'] :
      ['position', 'title', 'job_type', 'employer', 'salary', 'date_published', 'deadline', 'actions'];
  }

  isAdmin(): boolean {
    return this.userRole.toLowerCase() === UserRole.ADMIN.toLowerCase();
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.allJobList();
    this.onPagination();
  }

  onPagination(): void {
    this.isLoading = true;
    this.pageConfig.whereClause = this.helperService.getAllFilters(this.filters);
    this.adminService.jobPostingPagination(this.pageConfig).subscribe({
      next: (res: any) => {
        console.log('API Response:', res);
        if (res.statusCode === 200) {
          this.jobPostingList = res.data;
          this.total = res.count || 0;
          console.log('Loaded jobs:', this.jobPostingList);
        } else {
          this.jobPostingList = [];
          this.total = 0;
          this.notify.showError(res.message);
        }
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('API Error:', err);
        this.isLoading = false;
        this.notify.showError(err?.error?.message);
        this.jobPostingList = [];
        this.total = 0;
      }
    });
  }

  onPageChange(event: any): void {
    this.pageConfig.curPage = event.pageIndex + 1;
    this.pageConfig.perPage = event.pageSize;
    this.onPagination();
  }

  onSearch(): void {
    this.pageConfig.curPage = 1;
    this.onPagination();
  }

  onInputChange(event: any): void {
    if (!this.filters.all) {
      this.clearSearch();
    }
  }

  clearSearch(): void {
    this.filters = {
      all: "",
      title: "",
      job_type: "",
      employer: "",
      rank: "",
      status: ""
    };
    this.pageConfig.whereClause = [];
    this.onSearch();
  }

  viewJob(id: string) {
    this.router.navigate(['/view-job', id]);
  }

  editJob(id: string) {
    this.router.navigate(['/create-job-posting', id]);
  }

  deleteJob(jobId: string) {
    if (confirm('Are you sure you want to delete this job?')) {
      this.adminService.deleteJob(jobId).subscribe({
        next: (response: any) => {
          this.notify.showSuccess(response.message);
          // Refresh job data after deletion
          this.onPagination();
          // If the current page becomes empty after deletion, navigate to the previous page
          if (this.jobPostingList.length === 1 && this.pageConfig.curPage > 1) {
            this.pageConfig.curPage -= 1;
            this.onPagination();
          }
        },
        error: (error: any) => {
          this.notify.showError(error?.message || "Failed to delete job.");
        }
      });
    }
  }

  navigateToCreateJob() {
    this.router.navigate(['/create-job-posting']);
  }

  formatSalary(value: number): string {
    return '₹' + value.toLocaleString('en-IN');
  }

  allJobList() {
    this.adminService.getJobPostings().subscribe((response: any) => {
      if (response.statusCode === 200) {
        this.jobList = response.data.map((job: any) => ({
          id: job.id,
          rank: job.rank,
        }));
        // Extract unique ranks
        this.uniqueRanks = [...new Set(this.jobList.map(job => job.rank))].filter(rank => rank);
      }
    });
  }

  clearFilter(event: Event, filterType: 'job_type' | 'rank' | 'status'): void {
    event.stopPropagation();
    this.filters[filterType] = '';
    this.onSearch();
  }
}
