// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-applied-applications',
//   imports: [],
//   templateUrl: './applied-applications.component.html',
//   styleUrl: './applied-applications.component.scss'
// })
// export class AppliedApplicationsComponent {

// }
// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-social-media-integration',
//   imports: [],
//   templateUrl: './social-media-integration.component.html',
//   styleUrl: './social-media-integration.component.scss'
// })
// export class SocialMediaIntegrationComponent {

// }

// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-applicant',
//   imports: [],
//   templateUrl: './applicant.component.html',
//   styleUrl: './applicant.component.scss'
// })
// export class ApplicantComponent {

// }
import { Component, OnInit, ViewChild } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatCardModule } from '@angular/material/card'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatIconModule } from '@angular/material/icon'
import { MatButtonModule } from '@angular/material/button'
import { MatTableModule } from '@angular/material/table'
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator'
import { MatTableDataSource } from '@angular/material/table'
import { MatMenuModule } from '@angular/material/menu'
import { MatSelectModule } from '@angular/material/select'
import { ActivatedRoute, Router } from '@angular/router'
import { AuthService } from 'src/app/core/services/authentication/auth.service'

import { AdminService } from 'src/app/core/services/admin/admin.service'
import { HelperService } from 'src/app/core/helpers/helper.service'
import { NotifyService } from 'src/app/core/services/notify.service'
import { LoaderService } from 'src/app/core/services/loader.service'
import { UserService } from 'src/app/core/services/user/user.service'
import { FormsModule } from '@angular/forms'

@Component({
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    FormsModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    MatMenuModule,
    MatSelectModule
  ],
  selector: 'app-applied-applications',
  templateUrl: './applied-applications.component.html',
  styleUrl: './applied-applications.component.scss'
})
export class AppliedApplicationsComponent implements OnInit {
  pageConfig: any = {
    curPage: 1,
    perPage: 10,
    sortBy: 'created_at',
    direction: 'desc',
    whereClause: [],
  };
  allData: any;
  total: any;
  appliedData: any

  filters = {
    all: '',
    name: '',
    email: '',
    status: '',
  };

  displayedColumns: string[] = [
    'name',
    'email',
    'applied_at',
    'work_experiences',
    'status',
    'action'
  ]

  @ViewChild(MatPaginator) paginator!: MatPaginator
  userRole: string

    constructor(
      private authService: AuthService,
      private route: ActivatedRoute,
      private userService: UserService,
      private router: Router,
      private helperService: HelperService,
      private notify: NotifyService,
      private loader: LoaderService,
    ) {
    this.userRole = this.authService.getUserRole();
   }

  ngOnInit() {
    this.getAllData();
    // this.dataSource.paginator = this.paginator
    this.onPagination();
  }

  applyFilter(filterValue: string) {
    // this.dataSource.filter = filterValue.trim().toLowerCase()
  }

  openDialog(action: string, element: any) {
    console.log(action, element)
    // Dialog open logic yahan add kar sakte ho
  }

  onPagination(): void {
    // this.isLoading = true;
    this.loader.show();
    this.pageConfig.whereClause = this.helperService.getAllFilters(
      this.filters
    );
    this.userService.getAppliedJobs(this.pageConfig).subscribe({
      next: (res: any) => {
        if (res.statusCode === 200) {
          this.appliedData = res.data;
          this.total = res.count || 0;
          this.loader.hide();
        } else {
          this.appliedData = [];
          this.total = 0;
          this.loader.hide();
          // this.toastr.warning(res.message);
        }
        // this.isLoading = false;
      },
      error: (err: any) => {
        console.error('API Error:', err);
        this.loader.hide();
        // this.toastr.error(err?.error?.message);
        this.appliedData = [];
        this.total = 0;
      },
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

  clearFilter(event: Event, filterType: 'name' | 'email' | 'status'): void {
    event.stopPropagation();
    this.filters[filterType] = '';
    this.onSearch();
  }
  clearSearch(): void {
    this.filters = {
      all: '',
      name: '',
      email: '',
      status: '',
    };
    this.pageConfig.curPage = 1; // reset pagination too
    this.pageConfig.whereClause = [];
    this.onPagination(); // fetch the cleared list
  }

  viewappliedstatus(jobId: string): void {
    this.router.navigate(['/Applied-Status', jobId]);
  }

  getAllData() {
    this.userService.getAllAppliedJobs().subscribe((response: any) => {
      if (response.statusCode === 200) {
        this.allData = response.data;
      }
      else {
        this.allData = [];
      }
    });
  }
}
