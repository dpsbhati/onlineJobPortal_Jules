import { Component, OnInit, ViewChild } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatCardModule } from '@angular/material/card'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatIconModule } from '@angular/material/icon'
import { MatButtonModule } from '@angular/material/button'
import { MatTableModule } from '@angular/material/table'
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator'
import { MatMenuModule } from '@angular/material/menu'
import { MatSelectModule } from '@angular/material/select'
import { Router } from '@angular/router'
import { AuthService } from 'src/app/core/services/authentication/auth.service'
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
  statusOptions: string[] = ['Pending', 'Shortlisted', 'Rejected', 'Hired'];
  filters = {
    all: '',
    name: '',
    email: '',
    status: '',
  };
  displayedColumns: string[] = [
    'job_title',
    'employment_type',
    'applied_at',
    'status',
    'action'
  ]
  @ViewChild(MatPaginator) paginator!: MatPaginator
  userRole: string
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private helperService: HelperService,
    private loader: LoaderService,
  ) {
    this.userRole = this.authService.getUserRole();
  }

  ngOnInit() {
    this.getAllData();
    this.onPagination();
  }

  openDialog(action: string, element: any) {
    console.log(action, element)
  }

  onPagination(): void {
    this.loader.show();
    this.pageConfig.whereClause = this.helperService.getAllFilters(
      this.filters
    );
    this.pageConfig.whereClause = this.pageConfig.whereClause.map((filter: any) => {
      if (filter.key === 'all') {
        return {
          ...filter,
          key: 'all_job_post'
        };
      }
      return filter;
    });
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
        }
      },
      error: (err: any) => {
        console.error('API Error:', err);
        this.loader.hide();
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
