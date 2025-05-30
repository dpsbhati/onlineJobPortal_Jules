import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { AdminService } from 'src/app/core/services/admin/admin.service';
import { AuthService } from 'src/app/core/services/authentication/auth.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { ToastrService } from 'ngx-toastr';
import { UserRole } from 'src/app/core/enums/roles.enum';
import { TablerIconsModule } from 'angular-tabler-icons';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { Router } from '@angular/router';
@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatInputModule,
    MatPaginatorModule,
    TablerIconsModule,
    FormsModule,
    MaterialModule,
    TablerIconsModule,
    FormsModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
})
export class NotificationsComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns: string[] = [];
  notificationlist: any;
  total: number = 0;
  searchText: string = '';
  userRole: string;
  pageConfig: any = {
    curPage: 1,
    perPage: 10,
    sortBy: 'created_at',
    direction: 'desc',
    whereClause: [],
  };
  currentUserId: any;

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private loader: LoaderService,
    private toastr: ToastrService,
    private _router : Router
  ) {
    this.userRole = this.authService.getUserRole();
    this.displayedColumns = this.isAdmin()
      ? ['#', 'name', 'email', 'mobile']
      : ['#', 'name', 'email', 'mobile'];
  }

  ngOnInit() {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        this.currentUserId = user.id;
      } catch (error) {
        this.currentUserId = null;
      }
    }

    this.onPagination();
  }

   navigateToNotification(type: string | undefined, application_id?: string, job_id?: string) {
  if (!type) return;

  switch (type) {
    case 'job_application':
    case 'application_cancelled':
      // Yeh teenon ke liye application_id jayegi
      if (application_id) {
        this._router.navigate(['/applicant-details', application_id]);
      } 
      break;

    case 'application_status_update':
      if(application_id){
        this._router.navigate(['Applied-Status',application_id])
      }
      break;

    case 'job_expired':
    case 'job_posting':
      // Yeh dono ke liye job_id jayegi
      if (job_id) {
        // Note: aapke route me spelling dikkat na ho, 'job-expired' vs 'job_expired'
        if(type === 'job_expired'){
          this._router.navigate(['/job-post-details', job_id]);
        } else {
          this._router.navigate(['/authentication/Job-Details', job_id]);
        }
      }
      break;

    default:
      console.warn('No route mapped for notification type:', type);
  }
}

  // onPagination(): void {
  //   this.loader.show();
  //   this.adminService.notificationPagination(this.pageConfig).subscribe({
  //     next: (res: any) => {
  //       if (res.statusCode === 200) {
  //         this.notificationlist = res.data;
  //         this.total = res.count || 0;
  //         this.loader.hide();
  //       } else {
  //         this.notificationlist = [];
  //         this.total = 0;
  //         this.loader.hide();
  //       }
  //     },
  //     error: (err: any) => {
  //       this.loader.hide();
  //       this.toastr.error(err?.error?.message);
  //       this.notificationlist = [];
  //       this.total = 0;
  //     },
  //   });
  // }
  onPagination(): void {
    this.loader.show();

    this.pageConfig.whereClause = [
      {
        key: 'user_id',
        value: this.currentUserId,
        operator: '=',
      },
    ];

    this.adminService.notificationPagination(this.pageConfig).subscribe({
      next: (res: any) => {
        if (res.statusCode === 200) {
          this.notificationlist = res.data;
          this.total = res.count || 0;
          this.loader.hide();
        } else {
          this.notificationlist = [];
          this.total = 0;
          this.loader.hide();
        }
      },
      error: (err: any) => {
        this.loader.hide();
        this.toastr.error(err?.error?.message);
        this.notificationlist = [];
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
    const trimmedText = this.searchText.trim();
    this.pageConfig.curPage = 1;
    if (trimmedText) {
      this.pageConfig.whereClause = [
        {
          key: 'all',
          value: trimmedText,
          operator: '=',
        },
      ];
    } else {
      this.pageConfig.whereClause = []; //Clear filters if empty
    }
    this.onPagination();
  }

  isAdmin(): boolean {
    return this.userRole.toLowerCase() === UserRole.ADMIN.toLowerCase();
  }

  trackByNotification(index: number, item: any): string {
    return item.id; // Assuming 'id' is unique for each notification
  }
}
