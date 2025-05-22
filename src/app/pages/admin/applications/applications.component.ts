import { Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ViewChild } from '@angular/core';
import { MaterialModule } from 'src/app/material.module';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { AdminService } from 'src/app/core/services/admin/admin.service';
import { MatOption } from '@angular/material/core';
import { NotifyService } from 'src/app/core/services/notify.service';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { LoaderService } from 'src/app/core/services/loader.service';
import { ToastrService, ToastrModule } from 'ngx-toastr';
import { HelperService } from 'src/app/core/helpers/helper.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  MatDialog,
  MatDialogRef,
  MatDialogActions,
  MatDialogTitle,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { FileuploadComponent } from '../fileupload/fileupload.component';
import { DeleteComponent } from '../delete/delete.component';
export interface Application {
  position: number;
  name: string;
  email: string;
  mobile: string;
  dateOfApplication: string;
  jobPost: string;
  job_id: string;
  applications: number;
  status: string;
}

@Component({
  selector: 'app-applications',
  imports: [
    MatPaginatorModule,
    MaterialModule,
    NgClass,
    MatOption,
    NgFor,
    FormsModule,
    NgIf,
    ToastrModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatDialogModule,
  ],
  providers: [ToastrService],
  templateUrl: './applications.component.html',
  styleUrl: './applications.component.scss',
})
export class ApplicationsComponent {
  displayedColumns: string[] = [
    'position',
    'name',
    'email',
    'appliedDate',
    'jobPost',
    'status',
    'action',
  ];
  uniqueRanks: string[] = [];
  dataSource = new MatTableDataSource<Application>([]);
  totalApplications: number = 0;
  pageSize: number = 10;
  pageIndex: number = 0;
  jobPosts: { id: string; title: string }[] = [];
  selectedJobPostId: string | null = null;
  selectedFilters: any = {
    all: null,
    jobPostId: null,
    status: null,
    rank: null,
  };
  pageConfig: any = {
    curPage: 1,
    perPage: 10,
    sortBy: 'created_at',
    direction: 'desc',
    whereClause: [],
    job_id: '', // <-- Add job_id here
  };
  total: number = 0;
  data: any;
  viewapplicationlist: any;
  sortBy: string = 'created_at'
  direction: string = 'desc'
  @ViewChild(MatPaginator) paginator!: MatPaginator
  @ViewChild(MatSort) sort!: MatSort
  isLoading: boolean = false
  applicantId: string | null = null
  application_id: string | null = null
  constructor(
    private dialog: MatDialog,
    private adminService: AdminService,
    private notify: NotifyService,
    private router: Router,
    private route: ActivatedRoute,
    private loader: LoaderService,
    private toaster: ToastrService,
    private helper: HelperService
  ) { }

  ngOnInit(): void {
    this.fetchJobPosts()
    this.allrankslist()
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.route.paramMap.subscribe(params => {
      const jobId = params.get('id');
      this.applicantId = jobId;

      if (jobId) {
        // Job-based view
        this.selectedJobPostId = jobId;
        this.pageConfig.job_id = jobId;
        this.pageConfig.curPage = this.pageIndex + 1;
        this.pageConfig.perPage = this.pageSize;
        this.onjobviewapplicationPagination();
      } else {
        // Normal application listing
        this.fetchApplications();
      }
    });
  }
  openHeaderDialog() {
    const dialogRef = this.dialog.open(FileuploadComponent);
    dialogRef.afterClosed().subscribe((result) => {
      console.log('Dialog result: result');
    });
  }
  deleteDialog() {
    const dialogRef = this.dialog.open(DeleteComponent)
    dialogRef.afterClosed().subscribe(result => {
    })
  }
  fetchJobPosts() {

    this.adminService
      .getJobPostings()
      .subscribe((response: any) => {
        if (response.statusCode === 200) {
          this.jobPosts = response.data;
        }
        else {
          this.jobPosts = [];
        }
      });
  }


  fetchApplications() {
    this.loader.show();

    if (this.applicantId) {
      this.selectedFilters.job_id = this.applicantId;
    }

    // Step 1: Get filters from helper
    let whereClause = this.helper.getAllFilters(this.selectedFilters);

    // ✅ Step 2: Replace "rank" filter with "all" (like) filter
    if (this.selectedFilters.rank) {
      // Remove original rank filter if it exists
      whereClause = whereClause.filter(clause => clause.key !== 'rank');

      // Push custom 'all' filter for rank
      whereClause.push({
        key: 'all',
        value: this.selectedFilters.rank,
        operator: 'like',
      });
    }

    const payload = {
      curPage: this.pageIndex + 1,
      perPage: this.pageSize,
      sortBy: this.sortBy,
      direction: this.direction,
      whereClause,
    };

    this.adminService.applicationPagination(payload).subscribe(
      (response: any) => {
        this.loader.hide();
        if (response.statusCode === 200) {
          this.totalApplications = response.count || 0;

           this.dataSource.data = response.data.map((app: any, index: number) => {
          const rawImagePath = app.user?.userProfile?.profile_image_path || '';
          const profileImageUrl = rawImagePath ? rawImagePath.replace(/\\/g, '/') : null;

          return {
            position: index + 1 + this.pageIndex * this.pageSize,
            name: `${app.user?.userProfile?.first_name} ${app.user?.userProfile?.last_name}`,
            email: app.user?.email,
           
            dateOfApplication: new Date(app.applied_at).toLocaleDateString('en-US', {
        year: 'numeric',
      month: 'long',
       day: 'numeric',
}),

            application_id: app?.id,
            experience: app?.work_experiences,
            jobPost: app.job?.title,
            applications: app?.count,
            status: app?.status,
            all: app?.all,
            user_id: app?.user_id,
            job_id: app?.job_id,
            profileImageUrl,  // <-- Added profile image URL here
          };
        });
          ;
        } else {
          // this.toaster.warning(response.message);
          this.dataSource.data = [];
          this.totalApplications = 0;
        }
      },
      (error: any) => {
        this.loader.hide();
        this.toaster.error(error?.error?.message || 'Failed to fetch data.');
        this.dataSource.data = [];
        this.totalApplications = 0;
      }
    );
  }


  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value
    this.dataSource.filter = filterValue.trim().toLowerCase()

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  allrankslist() {
    this.adminService.getallranks().subscribe((response: any) => {
      if (response.statusCode === 200) {
        const allRanks = response.data
          .map((rank: any) => rank.rank_name)
          .filter(Boolean);
        this.uniqueRanks = [...new Set(allRanks)] as string[];
      }
    });
  }

  filterByJobPost() {
    this.pageIndex = 0
    this.fetchApplications()
  }

  onFilterChange(filterType: string, value: any): void {
    this.selectedFilters[filterType] = value;
    this.pageConfig.curPage = 1;
    this.fetchApplications();
  }

  onSearch() {
    throw new Error('Method not implemented.');
  }

  onPageChange(event: any) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.fetchApplications();
  }
  clearFilter(event: Event, filterType: 'rank'): void {
    event.stopPropagation();
    this.selectedFilters[filterType] = null;
    this.pageIndex = 0;
    this.fetchApplications();
  }

  clearFilters() {
    this.selectedFilters = {
      all: null,
      job_id: null,
      status: null,
      rank: null,
    };
    this.pageIndex = 0;
    if (this.paginator) {
      this.paginator.firstPage();
    }
    this.fetchApplications();
  }

  viewApplicantDetails(application_id: any): void {
    this.router.navigate(['/applicant-details', application_id]);
  }

viewJobDetails(jobId:any): void {
  if (jobId) {
    this.router.navigate(['/job-post-details', jobId]);
  } else {
    this.toaster.warning('Job ID not found.');
  }
}


  deleteApplicant(application_id: any): void {
    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete the applicant.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.loader.show();
        const payload = {
          id: application_id,
        };

        this.adminService.deleteApplicant(payload).subscribe({
          next: (response: any) => {
            if (response.statusCode === 200) {
              this.toaster.success(response.message);
              this.fetchApplications();
            } else {
              this.toaster.warning(response.message);
            }
            this.loader.hide();
          },
          error: (err: any) => {
            this.loader.hide();
            this.toaster.error(
              err?.error?.message ||
              'An error occurred while deleting the applicant.'
            )
          }
        })
      }
    });
  }


  onjobviewapplicationPagination(): void {
    this.loader.show();

    const whereClause = this.helper.getAllFilters(this.selectedFilters);

    this.pageConfig.curPage = this.pageIndex + 1;
    this.pageConfig.perPage = this.pageSize;
    this.pageConfig.sortBy = this.sortBy;
    this.pageConfig.direction = this.direction;
    this.pageConfig.whereClause = whereClause;

    this.adminService.jobviewapplicationPagination(this.pageConfig).subscribe({
      next: (res: any) => {
        this.loader.hide();

        if (res.statusCode === 200 && res.data?.applications) {
          this.totalApplications = res.data.count || 0;

          this.dataSource.data = res.data.applications.map(
            (app: any, index: number) => ({
              position: index + 1 + this.pageIndex * this.pageSize,
              name: `${app.user?.userProfile?.first_name || ''} ${app.user?.userProfile?.last_name || ''}`,
              email: app.user?.email || '',
              dateOfApplication: new Date(app.applied_at).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }),
              application_id: app?.id,
              experience: app?.work_experiences || '',
              jobPost: app.job?.title || '',
              applications: app?.count || 0,
              status: app?.status || '',
              all: app?.all,
              user_id: app?.user?.id || '',
              job_id: app?.job_id || ''
            })
          );
        } else {
          // this.toaster.warning(res.message || 'No applications found');
          this.dataSource.data = [];
          this.totalApplications = 0;
        }
      },
      error: (err: any) => {
        this.loader.hide();
        this.dataSource.data = [];
        this.totalApplications = 0;
        this.toaster.error(err?.error?.message || 'Something went wrong');
      }
    });
  }

}
