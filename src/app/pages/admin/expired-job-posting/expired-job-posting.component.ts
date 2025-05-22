import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { AdminService } from '../../../core/services/admin/admin.service';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { HelperService } from '../../../core/helpers/helper.service';
import { NotifyService } from '../../../core/services/notify.service';
import { AuthService } from '../../../core/services/authentication/auth.service';
import { UserRole } from '../../../core/enums/roles.enum';
import { MaterialModule } from '../../../material.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoaderService } from 'src/app/core/services/loader.service';
import { ToastrService, ToastrModule } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { DeleteComponent } from '../delete/delete.component';
@Component({
  selector: 'app-expired-job-posting',
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

    NgIf,
    ToastrModule,
  ],
  templateUrl: './expired-job-posting.component.html',
  styleUrls: ['./expired-job-posting.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ExpiredJobPostingComponent implements OnInit {
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
    sortBy: 'created_at',
    direction: 'desc',
    whereClause: [],
  };

  filters = {
    all: '',
    title: '',
    job_type: '',
    employer: '',
    rank: '',
    jobpost_status: '',
  };

  total: number = 0;
  jobPostingList: any[] = [];
  isLoading: boolean = false;
  displayedColumns: string[] = [];

  constructor(
    private adminService: AdminService,
    private router: Router,
    private helperService: HelperService,
    private notify: NotifyService,
    private authService: AuthService,
    private loader: LoaderService,
    private toastr: ToastrService,
    private dialog: MatDialog
  ) {
    this.userRole = this.authService.getUserRole();
    this.displayedColumns = this.isAdmin()
      ? [
          'position',
          'title',
          'job_type',
          'employer',
          'salary',
          'date_published',
          'deadline',
          'status',
          'number_of_applicant',
          'actions',
        ]
      : [
          'position',
          'title',
          'job_type',
          'employer',
          'salary',
          'date_published',
          'number_of_applicant',
          'deadline',
          'actions',
        ];
  }

  isAdmin(): boolean {
    return this.userRole.toLowerCase() === UserRole.ADMIN.toLowerCase();
  }

  allrankslist() {
    this.adminService.getallranks().subscribe((response: any) => {
      if (response.statusCode === 200) {
        const allRanks = response.data.map((rank: any) => rank.rank_name);
        this.uniqueRanks = [...new Set(allRanks)] as string[];
      }
    });
  }
  onPagination(): void {
    this.loader.show();

    // 1. Get dynamic filters from form
    const dynamicFilters = this.helperService.getAllFilters(this.filters);

    // 2. Add static filter for expired jobs
    const expiredFilter = {
      key: 'job_opening',
      value: 'Close',
      operator: '=',
    };

    // 3. Combine filters
    this.pageConfig.whereClause = [...dynamicFilters, expiredFilter];

    this.adminService.jobPostingPagination(this.pageConfig).subscribe({
      next: (res: any) => {
        if (res.statusCode === 200) {
          this.jobPostingList = res.data;
          this.total = res.count || 0;
          this.loader.hide();
        } else {
          this.jobPostingList = [];
          this.total = 0;
          this.loader.hide();
        }
        this.isLoading = false;
      },
      error: (err: any) => {
        this.isLoading = false;
        this.loader.hide();
        this.toastr.error(err?.error?.message);
        this.jobPostingList = [];
        this.total = 0;
      },
    });
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.allJobList();
    this.allrankslist(); // 🔧 Add this line
    this.onPagination();
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
  viewJobPostDetails(jobId: string): void {
    this.router.navigate(['/job-post-details', jobId]);
  }

  editJob(id: string) {
    this.router.navigate(['/create-job-posting', id]);
  }

  deleteJob(jobId: string) {
    const dialogRef = this.dialog.open(DeleteComponent);
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loader.show();
        this.adminService.deleteJob(jobId).subscribe({
          next: (response: any) => {
            this.toastr.success(response.message);
            this.loader.hide();
            // Refresh job data after deletion
            this.onPagination();
            // If the current page becomes empty after deletion, navigate to the previous page
            if (
              this.jobPostingList.length === 1 &&
              this.pageConfig.curPage > 1
            ) {
              this.pageConfig.curPage -= 1;
              this.onPagination();
            }
          },
          error: (error: any) => {
            this.loader.hide();
            this.toastr.error(error?.message || 'Failed to delete job.');
          },
        });
      }
    });
  }

  navigateToCreateJob() {
    this.router.navigate(['/create-job-posting']);
  }

  formatSalary(value: number): string {
    return '$' + value.toLocaleString('en-IN');
  }

  allJobList() {
    this.adminService.getJobPostings().subscribe((response: any) => {
      if (response.statusCode === 200) {
        this.jobList = response.data.map((job: any) => ({
          id: job.id,
          rank: job.rank,
        }));
      }
    });
  }

  clearFilter(
    event: Event,
    filterType: 'job_type' | 'rank' | 'jobpost_status'
  ): void {
    event.stopPropagation();
    this.filters[filterType] = '';
    this.onSearch();
  }
  clearSearch(): void {
    this.filters = {
      all: '',
      title: '',
      job_type: '',
      employer: '',
      rank: '',

      jobpost_status: '',
    };
    this.pageConfig.curPage = 1; // reset pagination too
    this.pageConfig.whereClause = [];
    this.onPagination(); // fetch the cleared list
  }
}
