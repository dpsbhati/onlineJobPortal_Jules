// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-user',
//   imports: [],
//   templateUrl: './user.component.html',
//   styleUrl: './user.component.scss'
// })
// export class UserComponent {

// }

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
import { AdminService } from 'src/app/core/services/admin/admin.service';
import { Router } from '@angular/router';
import { HelperService } from 'src/app/core/helpers/helper.service';
import { NotifyService } from 'src/app/core/services/notify.service';
import { AuthService } from 'src/app/core/services/authentication/auth.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { ToastrService } from 'ngx-toastr';
import { UserRole } from 'src/app/core/enums/roles.enum';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule
  ],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss'
})
export class UserComponent implements OnInit {
  displayedColumns: string[] = [];
  dataSource = new MatTableDataSource<any>([
    {
      id: 1,
      Name: 'Amit Sharma',
      Email: 'amit.sharma@example.com',
      Mobile: '9876543210',
    },
    {
      id: 2,
      Name: 'Neha Verma',
      Email: 'neha.verma@example.com',
      Mobile: '9123456780',
    }
  ]);
  pageConfig: any = {
    curPage: 1,
    perPage: 10,
    sortBy: "created_at",
    direction: "desc",
    whereClause: []
  }
  userRole: string;
  constructor(
    private adminService: AdminService,
    private router: Router,
    private helperService: HelperService,
    private notify: NotifyService,
    private authService: AuthService,
    private loader : LoaderService,
    private toastr : ToastrService
  ) {
    this.userRole = this.authService.getUserRole();
    this.displayedColumns = this.isAdmin() ?
    ['#', 'name', 'email', 'mobile'] :
    ['#', 'name', 'email', 'mobile'];
  }

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
   isAdmin(): boolean {
      return this.userRole.toLowerCase() === UserRole.ADMIN.toLowerCase();
    }

  openDialog(action: string, element: any) {
    console.log(action, element);
    // Dialog open logic yahan add kar sakte ho
  }
  // onPagination(): void {
  //   // this.isLoading = true;
  //   this.loader.show();
  //   this.pageConfig.whereClause = this.helperService.getAllFilters(this.filters);
  //   this.adminService.jobPostingPagination(this.pageConfig).subscribe({
  //     next: (res: any) => {
  //       // console.log('API Response:', res);
  //       if (res.statusCode === 200) {
  //         this.jobPostingList = res.data;
  //         this.total = res.count || 0;
  //         this.loader.hide();
  //         console.log('Loaded jobs:', this.jobPostingList);
  //       } else {
  //         this.jobPostingList = [];
  //         this.total = 0;
  //         this.loader.hide();
  //         this.toastr.warning(res.message);
  //       }
  //       this.isLoading = false;
  //     },
  //     error: (err: any) => {
  //       console.error('API Error:', err);
  //       this.isLoading = false;
  //       this.loader.hide();
  //       this.toastr.error(err?.error?.message);
  //       this.jobPostingList = [];
  //       this.total = 0;
  //     }
  //   });
  // }

  // onPageChange(event: any): void {
  //   this.pageConfig.curPage = event.pageIndex + 1;
  //   this.pageConfig.perPage = event.pageSize;
  //   this.onPagination();
  // }

}
