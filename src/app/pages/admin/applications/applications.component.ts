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
// import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoaderService } from 'src/app/core/services/loader.service';
import { ToastrService, ToastrModule } from 'ngx-toastr';
import { HelperService } from 'src/app/core/helpers/helper.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
export interface Application {
  position: number;
  name: string;
  email: string;
  mobile: string;
  dateOfApplication: string;
  jobPost: string;
  job_id :string ;
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
    MatProgressSpinnerModule
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
    'mobile',
    'dateOfApplication',
    'jobPost',
    'applications',
    'status',
    'action',
  ];
  dataSource = new MatTableDataSource<Application>([]);
  totalApplications: number = 0;
  pageSize: number = 5;
  pageIndex: number = 0;
  jobPosts: { id: string; title: string }[] = [];
  selectedJobPostId: string | null = null;
  selectedFilters: any = {
    all: null,
    jobPostId: null,
    status: null,
    rank: null,
  };
  total: number = 0;
  data :any
  sortBy: string = 'created_on';
  direction: string = 'desc';
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  isLoading: boolean = false;
  applicantId: string | null = null;
  application_id : string | null =null;
  constructor(
    private adminService: AdminService,
    private notify: NotifyService,
    private router: Router,
    private route: ActivatedRoute,
    private loader: LoaderService,
    private toaster: ToastrService,
    private helper : HelperService
  ) {}

  ngOnInit(): void {
    this.applicantId = this.route.snapshot.paramMap.get('id');
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.fetchJobPosts();
    this.fetchApplications();
  }

  fetchJobPosts() {
    // debugger
    const payload = {
      curPage: 1, 
      perPage: 10, 
    };
  
    this.adminService.applicationPagination(payload).subscribe((response: any) => {
      if (response.statusCode === 200) {
        this.jobPosts = response.data
          .map((application: any) => ({
            id: application.job.id,  
            title: application.job.title,  
          }))
          .filter((job: any) => job.title); 
      }
    });
  }
  
  
  fetchApplications() {
    // debugger
    this.loader.show();
    const whereClause = this.helper.getAllFilters(this.selectedFilters); 
    //  console.log(whereClause);
    const payload = {
      curPage: this.pageIndex + 1,
      perPage: this.pageSize,
      sortBy: this.sortBy,
      direction: this.direction,
      whereClause,
    };
    // console.log(whereClause);
    this.adminService.applicationPagination(payload).subscribe((response: any) => {
      this.loader.hide();
      if (response.statusCode === 200) {
        this.totalApplications = response.count || 0;
        // this.totalApplications = response.total || response.data.length;
        this.dataSource.data = response.data.map((app: any, index: number) => ({
          position: index + 1 + this.pageIndex * this.pageSize,
          name: `${app.user.userProfile?.first_name} ${app.user.userProfile?.last_name}`,
          email: app.user.email,
          mobile: app.user.userProfile?.mobile,
          dateOfApplication: new Date(app.applied_at).toLocaleDateString('en-US', { 
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
          }),
          application_id: app.id,
          jobPost: app.job.title,
          applications: app.count,
          status: app.status,
          all: app.all,
          user_id: app.user_id,
          job_id : app.job_id

        }));
      } else {
        this.toaster.warning(response.message);
        this.dataSource.data = [];
        this.totalApplications = 0;
      }
    }, (error: any) => {
      this.loader.hide();
      this.toaster.error(error?.error?.message || 'Failed to fetch data.');
      this.dataSource.data = [];
      this.totalApplications = 0;
    });
  }
  



  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  filterByJobPost() {
    this.pageIndex = 0;
    this.fetchApplications();
  }
  onFilterChange(filterType: string, value: any) {
    this.selectedFilters[filterType] = value;
    this.pageIndex = 0;
    this.fetchApplications();
  }
  onPageChange(event: any) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
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
    // debugger
    this.router.navigate(['/applicant-details', application_id]);
  }

  
  deleteApplicant(application_id: any): void {
    // debugger
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
          id: application_id  
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
            this.toaster.error(err?.error?.message || 'An error occurred while deleting the applicant.');
          }
        });
      }
    });
  }
  
  // deleteApplicant(applicantId: any): void {
  //   // debugger
  //   Swal.fire({
  //     title: 'Are you sure?',
  //     text: `You are about to delete the applicant.`,
  //     icon: 'warning',
  //     showCancelButton: true,
  //     confirmButtonColor: '#3085d6',
  //     cancelButtonColor: '#d33',
  //     confirmButtonText: 'Yes, delete it!',
  //     cancelButtonText: 'Cancel',
  //   }).then((result) => {
  //     if (result.isConfirmed) {
  //       this.loader.show();
  //       this.adminService
  //         .deleteApplicant(applicantId)
  //         .subscribe((response: any) => {
  //           if ((response.statusCode = 200)) {
  //             this.toaster.success(response.message);
  //             this.fetchApplications();
  //             this.loader.hide();
  //           } else {
  //             this.toaster.warning(response.message);
  //             this.loader.hide();
  //           }
  //           (err: any) => {
  //             this.loader.hide();
  //             this.toaster.error(err?.error?.message);
  //           };
  //         });
  //     }
  //   });
  // }
  //   fetchApplications() {
//     // this.isLoading = true;
//     // debugger
//     this.loader.show();
//     const whereClause = [];

//     if (this.selectedFilters.jobPostId) {
//       whereClause.push({
//         key: 'job_id',
//         value: this.selectedFilters.jobPostId,
//         operator: '=',
//       });
//     }
//     if (this.selectedFilters.all) {
//       whereClause.push({
//         key: 'all',
//         value: this.selectedFilters.all,
//         operator: '=',
//       });
//     }

//     if (this.selectedFilters.status) {
//       whereClause.push({
//         key: 'status',
//         value: this.selectedFilters.status,
//         operator: '=',
//       });
//     }

//     if (this.selectedFilters.rank) {
//       whereClause.push({
//         key: 'rank',
//         value: this.selectedFilters.rank,
//         operator: '=',
//       });
//     }

//     const payload = {
//       curPage: this.pageIndex + 1,
//       perPage: this.pageSize,
//       sortBy: this.sortBy,
//       direction: this.direction,
//       whereClause,
//     };
// //  debugger
//     this.adminService
//       .applicationPagination(payload)
//       .subscribe((response: any) => {
//         if (response.statusCode === 200) {
//           if (response.data && response.data.length > 0) {
//             // console.log('Res --->',response.data)
//             this.totalApplications = response.total || response.data.length;
//             this.dataSource.data = response.data.map(
//               (app: any, index: number) => (
//                 // console.log(app),
//                 {
//                 position: index + 1 + this.pageIndex * this.pageSize,
//                 name: `${app.user.userProfile?.first_name} ${app.user.userProfile?.last_name}`,
//                 email: app.user.email,
//                 mobile: app.user.userProfile?.mobile,
//                 // dateOfApplication: new Date(app.applied_at).toDateString(),
//                 dateOfApplication: new Date(app.applied_at).toLocaleDateString('en-US', { 
//                   weekday: 'long', 
//                   year: 'numeric', 
//                   month: 'long', 
//                   day: 'numeric' 
//                 }),
//                 application_id : app.id,
//                 jobPost: app.job.title,
//                 applications: app.count,
//                 status: app.status,
//                 all: app.all,
//                 user_id: app.user_id,
//               }),
//               // console.log(this.application_id)
//             );
//             // this.toaster.success(response.message);
//             this.loader.hide();

//             // this.isLoading = false;
//           } else {
//             // this.isLoading = false;
//             this.loader.hide();
//             this.toaster.warning(response.message);
//             this.dataSource.data = [];
//             this.totalApplications = 0;
//           }
//         } else {
//           // this.isLoading = false;
//           this.loader.hide();
//           this.toaster.error(response.message || 'Failed to fetch data.');
//           this.dataSource.data = [];
//           this.totalApplications = 0;
//         }
//       });
//   }
}
