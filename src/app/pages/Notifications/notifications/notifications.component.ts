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
import { AdminService } from 'src/app/core/services/admin/admin.service'
import { Router } from '@angular/router'
import { HelperService } from 'src/app/core/helpers/helper.service'
import { NotifyService } from 'src/app/core/services/notify.service'
import { AuthService } from 'src/app/core/services/authentication/auth.service'
import { LoaderService } from 'src/app/core/services/loader.service'
import { ToastrService } from 'ngx-toastr'
import { UserRole } from 'src/app/core/enums/roles.enum'
import { TablerIconsModule } from 'angular-tabler-icons'
import { FormsModule } from '@angular/forms'
interface notificationsList {
  id: number
  color: string
  title: string
  time: string
  subtitle: string
}
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
    MatPaginatorModule,TablerIconsModule,FormsModule
  ],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  displayedColumns: string[] = []
  notificationlist:any;
  total: number = 0;
  searchText: string = '';
  // displayedColumns: string[] = ['#', 'name', 'email', 'mobile'];
  pageConfig: any = {
    curPage: 1,
    perPage: 10,
    sortBy: 'created_at',
    direction: 'desc',
    whereClause: []
  }

  userRole: string
  constructor (
    private adminService: AdminService,
    private router: Router,
    private helperService: HelperService,
    private notify: NotifyService,
    private authService: AuthService,
    private loader: LoaderService,
    private toastr: ToastrService
  ) {
    this.userRole = this.authService.getUserRole()
    this.displayedColumns = this.isAdmin()
      ? ['#', 'name', 'email', 'mobile']
      : ['#', 'name', 'email', 'mobile']
  }

  @ViewChild(MatPaginator) paginator!: MatPaginator

  ngOnInit () {
    // this.dataSource.paginator = this.paginator
    this.onPagination();
  }

  // applyFilter (filterValue: string) {
  //   this.dataSource.filter = filterValue.trim().toLowerCase()
  // }

  isAdmin (): boolean {
    return this.userRole.toLowerCase() === UserRole.ADMIN.toLowerCase()
  }

  openDialog (action: string, element: any) {
    console.log(action, element)
    // Dialog open logic yahan add kar sakte ho
  }

  onPagination(): void {
    // this.isLoading = true;
    this.loader.show();
    // this.pageConfig.whereClause = this.helperService.getAllFilters(
    //   this.filters
    // );
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
          // this.toastr.warning(res.message);
        }
        // this.isLoading = false;
      },
      error: (err: any) => {
        console.error('API Error:', err);
        // this.isLoading = false;
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

  trackByNotification(index: number, item: any): string {
    return item.id; // Assuming 'id' is unique for each notification
  }
  onSearch(): void {
    const trimmedText = this.searchText.trim();
    this.pageConfig.curPage = 1;

    if (trimmedText) {
      this.pageConfig.whereClause = [
        {
          key: 'all',
          value: trimmedText,
          operator: '='
        }
      ];
    } else {
      this.pageConfig.whereClause = []; // 🔄 Clear filters if empty
    }

    this.onPagination();
  }

}
