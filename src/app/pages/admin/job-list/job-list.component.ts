import { Component, ViewEncapsulation } from '@angular/core';
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

@Component({
  selector: 'app-job-list',
  standalone: true,
  imports: [
    MaterialModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    CommonModule,
    TablerIconsModule,
    NgxSpinnerModule
  ],
  templateUrl: './job-list.component.html',
  styleUrls: ['./job-list.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class JobListComponent {
  isLoading: boolean = false;
  userRole: string = '';
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
    title: "",
    job_type: "",
    deadline: "",
  }

  total: number = 0;
  jobPostingList: any[] = [];
  displayedColumns: string[] = ['position', 'title', 'job_type', 'salary', 'deadline', 'actions'];

  constructor(
    private adminService: AdminService,
    private router: Router,
    private helperService: HelperService,
    private notify: NotifyService,
    private spinner: NgxSpinnerService,
    private authService: AuthService
  ) {
    this.userRole = this.authService.getUserRole();
  }

  isAdmin(): boolean {
    return this.userRole.toLowerCase() === UserRole.ADMIN.toLowerCase();
  }

  ngOnInit(): void {
    this.onPagination();
  }

  onPagination(): void {
    this.isLoading = true;
    this.pageConfig.whereClause = this.helperService.getAllFilters(this.filters);

    this.adminService.jobPostingPagination(this.pageConfig).subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          this.isLoading = false;
          this.jobPostingList = res.data;
          this.total = res.count;
        }
        else {
          this.isLoading = false;   
          this.jobPostingList = [];
          this.total = 0;
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        this.notify.showError(err?.error?.message || "Something went wrong!!");
        this.jobPostingList = [];
        this.total = 0;
      }
    })
  }

  onFilterChange(): void {
    this.pageConfig.curPage = 1;
    this.onPagination();
  }

  onSearch(): void {
    this.pageConfig.curPage = 1;
    this.onPagination();
  }

  clearSearch(): void {
    this.filters.all = '';
    this.filters.title = "";
    this.filters.job_type = "";
    this.filters.deadline = "";
    this.pageConfig.whereClause = [];
    this.onSearch();
  }

  onInputChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    if (!value.trim()) {
      this.clearSearch();
    }
  }

  onPageChange(page: number): void {
    if (page > 0) {
      this.pageConfig.curPage = page;
      this.onPagination();
    }
  }

  viewJob(id: number) {
    this.router.navigate(['/starter/view-job', id]);
  }

  editJob(jobId: string) {
    this.router.navigate(['/starter/createjob', jobId]);
  }

  deleteJob(jobId: string) {
    if (confirm('Are you sure you want to delete this job?')) {
      this.adminService.deleteJob(jobId).subscribe(
        (response: any) => {
          this.notify.showSuccess(response.message);
          this.onPagination();
        },
        (error: any) => {
          this.notify.showError(error?.message || "Failed to delete job.");
        }
      );
    }
  }

  viewJobApplications(jobId: string) {
    this.router.navigate(['/starter/job-applicants-list', jobId]);
  }

  navigateToCreateJob() {
    this.router.navigate(['/starter/createjob'])
  }
}
