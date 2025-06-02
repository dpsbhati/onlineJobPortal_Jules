import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { AdminService } from '../../../core/services/admin/admin.service';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { HelperService } from '../../../core/helpers/helper.service';
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
import { MatNativeDateModule } from '@angular/material/core';
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
    NgIf,
    MatNativeDateModule,
    ToastrModule,
  ],
  templateUrl: './job-list.component.html',
  styleUrls: ['./job-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
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
  minDate: Date = new Date();
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
    vessel_type: '',
    employer: '',
    rank_name: '',
    job_opening: '',
  };

  total: number = 0;
  jobPostingList: any[] = [];
  isLoading: boolean = false;
  displayedColumns: string[] = [];
  showDeadlineModal = false; // control modal visibility
  selectedJobToActivate: any = null; // store the job user tries to activate
  newDeadline: Date | null = null; // new deadline chosen by user
showDeleteWarningModal = false;
jobToDeleteId: string | null = null;
jobToDeleteApplicationCount = 0;
deleteJobMessage = '';
  constructor(
    private adminService: AdminService,
    private router: Router,
    private helperService: HelperService,
    private authService: AuthService,
    private loader: LoaderService,
    private toastr: ToastrService,
    private dialog: MatDialog
  ) {
    this.userRole = this.authService.getUserRole();
    this.displayedColumns = this.isAdmin()
      ? [
          'position',
          'rank',
          'title',

          'employer',

          // 'date_published',
          'deadline',
          'status',
          'number_of_applicant',
          'actions',
        ]
      : [
          'position',
          'rank',
          'title',
          'employer',
          // 'date_published',
          'number_of_applicant',
          'deadline',
          'actions',
        ];
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.allJobList();
    this.allrankslist(); // 🔧 Add this line
    this.onPagination();
  }

  isAdmin(): boolean {
    return this.userRole.toLowerCase() === UserRole.ADMIN.toLowerCase();
  }

  // onPagination(): void {
  //   this.loader.show();
  //   this.pageConfig.whereClause = this.helperService.getAllFilters(
  //     this.filters
  //   );
  //   this.adminService.jobPostingPagination(this.pageConfig).subscribe({
  //     next: (res: any) => {
  //       if (res.statusCode === 200) {
  //         this.jobPostingList = res.data.map((job: any) => ({
  //           ...job,
  //           rank: job.ranks?.rank_name || '-', 
  //         }));

  //         this.total = res.count || 0;
  //         this.loader.hide();
  //       } else {
  //         this.jobPostingList = [];
  //         this.total = 0;
  //         this.loader.hide();
  //       }
  //       this.isLoading = false;
  //     },
  //     error: (err: any) => {
  //       this.isLoading = false;
  //       this.loader.hide();
  //       this.toastr.error(err?.error?.message);
  //       this.jobPostingList = [];
  //       this.total = 0;
  //     },
  //   });
  // }

//   onPagination(): void {
//   this.loader.show();


//   const dynamicFilters = this.helperService.getAllFilters(this.filters);


//   const fixedFilter = {
//     key: 'job_opening',
//     value: 'Active',
//     operator: '=',
//   };


//   this.pageConfig.whereClause = [...dynamicFilters, fixedFilter];

//   this.adminService.jobPostingPagination(this.pageConfig).subscribe({
//     next: (res: any) => {
//       if (res.statusCode === 200) {
//         this.jobPostingList = res.data.map((job: any) => ({
//           ...job,
//           rank: job.ranks?.rank_name || '-',
//         }));
//         this.total = res.count || 0;
//         this.loader.hide();
//       } else {
//         this.jobPostingList = [];
//         this.total = 0;
//         this.loader.hide();
//       }
//       this.isLoading = false;
//     },
//     error: (err: any) => {
//       this.isLoading = false;
//       this.loader.hide();
//       this.toastr.error(err?.error?.message);
//       this.jobPostingList = [];
//       this.total = 0;
//     },
//   });
// }
onPagination(): void {
  this.loader.show();

  const dynamicFilters = this.helperService.getAllFilters(this.filters);

  // ✅ Add 2 separate job_opening filters
  const activeFilter = {
    key: 'job_opening',
    value: 'Active',
    operator: '='
  };

  const holdFilter = {
    key: 'job_opening',
    value: 'Hold',
    operator: '='
  };

  // Combine all filters
  this.pageConfig.whereClause = [...dynamicFilters, activeFilter, holdFilter];

  this.adminService.jobPostingPagination(this.pageConfig).subscribe({
    next: (res: any) => {
      if (res.statusCode === 200) {
        this.jobPostingList = res.data.map((job: any) => ({
          ...job,
          rank: job.ranks?.rank_name || '-',
        }));
        this.total = res.count || 0;
      } else {
        this.jobPostingList = [];
        this.total = 0;
      }
      this.loader.hide();
      this.isLoading = false;
    },
    error: (err: any) => {
      this.loader.hide();
      this.isLoading = false;
      this.toastr.error(err?.error?.message);
      this.jobPostingList = [];
      this.total = 0;
    },
  });
}



  onPageChange(event: any): void {
    this.pageConfig.curPage = event.pageIndex + 1;
    this.pageConfig.perPage = event.pageSize;
    this.onPagination();
  }

  // onStatusToggleChange(element: any, checked: boolean) {

  //   element.job_opening = checked ? 'Active' : 'DeActivated';
  //   element.isActive = checked;

  //   this.adminService.toggleJobStatus(element.id, checked).subscribe({
  //     next: (res) => {

  // this.toastr.success(res.message);

  //     },
  //     error: (err) => {

  //       element.isActive = !checked;
  //       element.job_opening = !checked ? 'Active' : 'DeActivated';
  //       this.toastr.error('Failed to update status');
  //     },
  //   });
  // }
  // onStatusToggleChange(element: any, checked: boolean) {
  //   console.log(checked);
  //   if (checked) {
    
  //     const today = new Date();
  //     console.log(today, 'Today');
  //     const jobDeadline = new Date(element.deadline);
  //     console.log(jobDeadline, 'jobDeadline', jobDeadline < today);
  //     if (jobDeadline < today) {
   
  //       this.selectedJobToActivate = element;
  //       this.newDeadline = null; // reset date
  //       this.showDeadlineModal = true;
     
  //       element.isActive = false;
  //       return;
  //     }
  //   }
   
  //   element.job_opening = checked ? 'Active' : 'DeActivated';
  //   element.isActive = checked;

  //   this.adminService.toggleJobStatus(element.id, checked).subscribe({
  //     next: (res) => {
  //       this.toastr.success(res.message);
      
  //     },
  //     error: (err) => {
     
  //       element.isActive = !checked;
  //       element.job_opening = !checked ? 'Active' : 'DeActivated';
  //       this.toastr.error('Failed to update status');
  //     },
  //   });
  // }
onStatusToggleChange(element: any, checked: boolean): void {
  console.log(checked);

  if (checked) {
    const today = new Date();
    const jobDeadline = new Date(element.deadline);

    if (jobDeadline < today) {
      // 🛑 Show modal if deadline already passed
      this.selectedJobToActivate = element;
      this.newDeadline = null;
      this.showDeadlineModal = true;

      // ❌ Revert UI immediately
      element.isActive = false;
      return;
    }
  }

  // ✅ Temporarily apply changes in UI
  element.job_opening = checked ? 'Active' : 'DeActivated';
  element.isActive = checked;

  // 🔁 Call API to toggle status
  this.adminService.toggleJobStatus(element.id, checked).subscribe({
    next: (res: any) => {
      if (res?.statusCode === 200) {
        this.toastr.success(res.message || 'Job status updated successfully');
      } else {
       
        this.toastr.error(res.message || 'Failed to update job status');
        
        // 🔁 Revert UI
        element.isActive = !checked;
        element.job_opening = !checked ? 'Active' : 'DeActivated';
      }
    },
    error: (err: any) => {
  
      this.toastr.error(err?.error?.message || 'Server error while updating status');

      // 🔁 Revert UI
      element.isActive = !checked;
      element.job_opening = !checked ? 'Active' : 'DeActivated';
    },
  });
}

  onSearch(): void {
    // Trim leading and trailing spaces from search text
    if (this.filters.all) {
      this.filters.all = this.filters.all.trim();
    }

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

  viewapplicationDetails(jobId: string): void {
    this.router.navigate(['/applications', jobId]);
  }

  viewAppliedApplication(jobId: any): void {
    this.router.navigate(['/applications', jobId]);
  }

  editJob(id: string) {
    this.router.navigate(['/create-job-posting', id]);
  }

  // deleteJob(jobId: string) {
  //   const dialogRef = this.dialog.open(DeleteComponent);
  //   dialogRef.afterClosed().subscribe((result) => {
  //     if (result) {
  //       this.loader.show();
  //       this.adminService.deleteJob(jobId).subscribe({
  //         next: (response: any) => {
  //           this.toastr.success(response.message);
  //           this.loader.hide();
       
  //           this.onPagination();
       
  //           if (
  //             this.jobPostingList.length === 1 &&
  //             this.pageConfig.curPage > 1
  //           ) {
  //             this.pageConfig.curPage -= 1;
  //             this.onPagination();
  //           }
  //         },
  //         error: (error: any) => {
  //           this.loader.hide();
  //           this.toastr.error(error?.message || 'Failed to delete job.');
  //         },
  //       });
  //     }
  //   });
  // }
deleteJob(jobId: string) {
  const job = this.jobPostingList.find(j => j.id === jobId);
  if (!job) return;

  this.jobToDeleteId = jobId;
  this.jobToDeleteApplicationCount = job.application_number;

  if (job.application_number > 0) {
    this.deleteJobMessage = `This job has ${job.application_number} application${job.application_number > 1 ? 's' : ''} attached. Are you sure you want to delete it? Deleting will move this job to the Archived section instead of permanent deletion.`;
  } else {
    this.deleteJobMessage = `Are you sure you want to delete it? Deleting will move this job to the Archived section instead of permanent deletion.`;
  }
  this.showDeleteWarningModal = true;
}

confirmDeleteJob(jobId: string) {
  const dialogRef = this.dialog.open(DeleteComponent);
  dialogRef.afterClosed().subscribe((result) => {
    if (result) {
      this.loader.show();
      this.adminService.deleteJob(jobId).subscribe({
        next: (response: any) => {
          this.toastr.success(response.message);
          this.loader.hide();
          this.onPagination();

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


closeDeleteWarningModal() {
  this.showDeleteWarningModal = false;
  this.jobToDeleteId = null;
  this.jobToDeleteApplicationCount = 0;
  this.deleteJobMessage = '';
}

confirmArchiveJob() {
  if (!this.jobToDeleteId) return;

  this.loader.show();

  const payload = {
    job_id: this.jobToDeleteId,
    job_opening: 'Archived',
  };

  this.adminService.changeJobStatusToArchived(payload).subscribe({
    next: (res: any) => {
      this.toastr.success('Job moved to archive successfully');
      this.loader.hide();
      this.closeDeleteWarningModal();
      this.onPagination();

      // Optional: Adjust page if last item deleted
      if (
        this.jobPostingList.length === 1 &&
        this.pageConfig.curPage > 1
      ) {
        this.pageConfig.curPage -= 1;
        this.onPagination();
      }
    },
    error: (err) => {
      this.toastr.error(err?.error?.message || 'Failed to archive job');
      this.loader.hide();
    },
  });
}

  navigateToCreateJob() {
    this.router.navigate(['/create-job-posting']);
  }

  formatSalary(value: number): string {
    return '$' + value?.toLocaleString('en-IN');
  }

  allrankslist() {
    this.adminService.getallranks().subscribe((response: any) => {
      if (response.statusCode === 200) {
        const allRanks = response.data.map((rank: any) => rank.rank_name);
        this.uniqueRanks = [...new Set(allRanks)] as string[];
      }
    });
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
    filterType: 'vessel_type' | 'rank_name' | 'job_opening'
  ): void {
    event.stopPropagation();
    this.filters[filterType] = '';
    this.onSearch();
  }

  clearSearch(): void {
    this.filters = {
      all: '',
      title: '',
      vessel_type: '',
      employer: '',
      rank_name: '',
      job_opening: '',
    };
    this.pageConfig.curPage = 1; // reset pagination too
    this.pageConfig.whereClause = [];
    this.onPagination(); // fetch the cleared list
  }
  closeDeadlineModal() {
    this.showDeadlineModal = false;
    this.selectedJobToActivate = null;
    this.newDeadline = null;
    this.onPagination();
  }

  // confirmDeadlineChange() {
  //   if (!this.newDeadline || !this.selectedJobToActivate) return;

  //   this.adminService.updateJobDeadline(this.selectedJobToActivate.id, this.newDeadline).subscribe({
  //     next: () => {
  //       this.adminService.toggleJobStatus(this.selectedJobToActivate.id, true).subscribe({
  //         next: () => {
  //           this.toastr.success('Deadline updated and job activated');
  //           this.selectedJobToActivate.isActive = true;
  //           this.selectedJobToActivate.job_opening = 'Active';
  //           this.closeDeadlineModal();
  //         },
  //         error: () => this.toastr.error('Failed to activate job'),
  //       });
  //     },
  //     error: () => this.toastr.error('Failed to update deadline'),
  //   });
  // }
  // confirmDeadlineChange() {
  //   if (!this.newDeadline || !this.selectedJobToActivate) return;

  //   // Show loader if any
  //   this.loader.show();

  //   this.adminService.updateJobDeadline(this.selectedJobToActivate.id, this.newDeadline).subscribe({
  //     next: () => {
  //       this.adminService.toggleJobStatus(this.selectedJobToActivate.id, true).subscribe({
  //         next: () => {
  //           this.toastr.success('Deadline updated and job activated');
  //           this.selectedJobToActivate.isActive = true;
  //           this.selectedJobToActivate.job_opening = 'Active';
  //           this.closeDeadlineModal();
  //           this.loader.hide();
  //           this.onPagination();  // refresh list if needed
  //         },
  //         error: () => {
  //           this.toastr.error('Failed to activate job');
  //           this.loader.hide();
  //         },
  //       });
  //     },
  //     error: () => {
  //       this.toastr.error('Failed to update deadline');
  //       this.loader.hide();
  //     },
  //   });
  // }
  confirmDeadlineChange() {
    if (!this.newDeadline || !this.selectedJobToActivate) return;

    this.loader.show();

    // Convert newDeadline (local Date) to ISO string WITHOUT timezone shift
    // So, send only date part with time set to some fixed time, e.g., noon local to avoid timezone issues

    const adjustedDeadline = this.fixDateForApi(this.newDeadline);

    this.adminService
      .updateJobDeadline(this.selectedJobToActivate.id, adjustedDeadline)
      .subscribe({
        next: () => {
          this.adminService
            .toggleJobStatus(this.selectedJobToActivate.id, true)
            .subscribe({
              next: () => {
                this.toastr.success('Deadline updated and job activated');
                this.selectedJobToActivate.isActive = true;
                this.selectedJobToActivate.job_opening = 'Active';
                this.closeDeadlineModal();
                this.loader.hide();
                this.onPagination();
              },
              error: () => {
                this.toastr.error('Failed to activate job');
                this.loader.hide();
              },
            });
        },
        error: () => {
          this.toastr.error('Failed to update deadline');
          this.loader.hide();
        },
      });
  }

  // Helper method to adjust date before sending to API
  fixDateForApi(date: Date): string {
    // Set fixed time (e.g., noon) to avoid timezone shift to previous day
    const fixedDate = new Date(date);
    fixedDate.setHours(12, 0, 0, 0); // 12:00:00 local time
    return fixedDate.toISOString(); // send ISO string with fixed time
  }
}
