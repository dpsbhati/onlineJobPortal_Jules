import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule, MatSelectChange } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSortModule } from '@angular/material/sort';
import { TablerIconsModule } from 'angular-tabler-icons';
import { ToastrModule } from 'ngx-toastr';
import { MaterialModule } from 'src/app/material.module';
import { BrandingComponent } from '../../layouts/full/vertical/sidebar/branding.component';
import { AdminService } from 'src/app/core/services/admin/admin.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { NotifyService } from 'src/app/core/services/notify.service';
import countries from '../../core/helpers/country.json';

@Component({
  selector: 'app-home',
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule, MatSidenavModule,
    CommonModule,
    MaterialModule,
    TablerIconsModule,
    FormsModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    ToastrModule,
    BrandingComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})

export class HomeComponent {
  uniqueRanks: string[] = [];
  jobPostingList: any;
  countryList = countries;
  selectedRank = ''
  selectedEmployer = ''
  selectedLocation = ''
  keyword = ''
  isLoading: boolean = false;
  total: number = 0;
  employers = ['Maersk', 'Anglo-Eastern', 'Bernhard Schulte']
  locations = ['India', 'Philippines', 'Greece']
  pageConfig: any = {
    curPage: 1,
    perPage: 9,
    sortBy: "created_at",
    direction: "desc",
    whereClause: [
      {
        key: "isActive",
        value: true,
        operator: "="
      }
    ],
  }

  constructor(
    private router: Router,
    private adminService: AdminService,
    private loader: LoaderService,
    private notify: NotifyService,
  ) { }

  ngOnInit(): void {
    const savedPerPage = localStorage.getItem('jobPagePerPage');
    this.pageConfig.perPage = savedPerPage ? parseInt(savedPerPage, 10) : 9;
    this.allrankslist();
    this.onPagination();
  }

  onPagination(): void {
    this.loader.show();
    this.adminService.jobPostingPagination(this.pageConfig).subscribe({
      next: (res: any) => {
        if (res.statusCode == 200) {
          this.loader.hide()
          this.jobPostingList = res.data;
          this.total = res.count;
        }
        else {
          this.loader.hide()
          this.jobPostingList = [];
          this.total = 0;
        }
      },
      error: (err: any) => {
        this.loader.hide();
        this.notify.showError(err?.error?.message || "Something went wrong!!");
        this.jobPostingList = [];
        this.total = 0;
      }
    })
  }

  allrankslist() {
    this.adminService.getallranks().subscribe((response: any) => {
      if (response.statusCode === 200) {
        const allRanks = response.data.map((rank: any) => rank.rank_name);
        this.uniqueRanks = [...new Set(allRanks)] as string[];
      }
    });
  }

  private ensureIsActiveFilter() {
    const exists = this.pageConfig.whereClause.some(
      (filter: any) => filter.key === 'isActive'
    );
    if (!exists) {
      this.pageConfig.whereClause.push({
        key: 'isActive',
        operator: '=',
        value: true,
      });
    }
  }

  // onRankChange(rankValue: string): void {
  //   this.pageConfig.curPage = 1;
  //   this.pageConfig.whereClause = this.pageConfig.whereClause.filter(
  //     (filter: any) => filter.key !== 'rank'
  //   );
  //   if (rankValue && rankValue.trim() !== '') {
  //     this.pageConfig.whereClause.push({
  //       key: 'rank_name',
  //       operator: '=',
  //       value: rankValue.trim(),
  //     });
  //   }
  //   this.onPagination();
  // }
onRankChange(rankValue: string): void {
  this.pageConfig.curPage = 1;

  // Remove previous rank_name filter, not 'rank'
  this.pageConfig.whereClause = this.pageConfig.whereClause.filter(
    (filter: any) => filter.key !== 'rank_name'
  );

  if (rankValue && rankValue.trim() !== '') {
    this.pageConfig.whereClause.push({
      key: 'rank_name',
      operator: '=',
      value: rankValue.trim(),
    });
  }

  this.onPagination();
}

  onLocationChange(event: MatSelectChange): void {
    const locationCode = event.value;
    this.pageConfig.curPage = 1;
    this.pageConfig.whereClause = this.pageConfig.whereClause.filter(
      (filter: any) => filter.key !== 'location'
    );
    if (locationCode && typeof locationCode === 'string' && locationCode.trim() !== '') {
      this.pageConfig.whereClause.push({
        key: 'country_code',
        operator: '=',
        value: locationCode.trim(),
      });
    }
    this.onPagination();
  }

  onSearch(): void {
    this.pageConfig.curPage = 1;
    const trimmedKeyword = this.keyword.trim();
    const trimmedRank = this.selectedRank.trim();
    const trimmedLocation = this.selectedLocation.trim();
    this.pageConfig.whereClause = [];

    // Add each filter only if it has a value
   if (trimmedRank) {
  this.pageConfig.whereClause.push({
    key: 'rank_name',
    operator: '=',
    value: trimmedRank,
  });
}
    if (trimmedLocation) {
      this.pageConfig.whereClause.push({
        key: 'country_code',
        operator: '=',
        value: trimmedLocation,
      });
    }
    if (trimmedKeyword) {
      this.pageConfig.whereClause.push({
        key: 'all',
        operator: '=',
        value: trimmedKeyword,
      });
    }
    this.ensureIsActiveFilter();
    this.onPagination();
  }

  goToLogin() {
    const accessToken = localStorage.getItem('accessToken');
    const userStr = localStorage.getItem('user');
    if (!accessToken || !userStr) {
      this.router.navigate(['/authentication/login']);
      return;
    }
    try {
      const user = JSON.parse(userStr);
      const role = user.role?.toLowerCase();
      if (role === 'admin') {
        this.router.navigate(['/applications']);
      } else if (role === 'applicant') {
        this.router.navigate(['/Applied-Applications']);
      } else {
        this.router.navigate(['/authentication/login']);
      }
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      this.router.navigate(['/authentication/login']);
    }
  }

  goToJobDetail(jobId: string) {
    this.router.navigate(['/authentication/Job-Details', jobId]);
  }

  onPageChange(event: any): void {
    this.pageConfig.curPage = event.pageIndex + 1;
    this.pageConfig.perPage = event.pageSize;
    localStorage.setItem('jobPagePerPage', this.pageConfig.perPage.toString());
    this.onPagination();
  }

  clearFilters(): void {
  this.selectedRank = '';
  this.selectedLocation = '';
  this.keyword = '';
  this.pageConfig.whereClause = [];    // Clear all filters

  this.ensureIsActiveFilter();          // Add isActive filter back

  this.pageConfig.curPage = 1;
  this.onPagination();
}

}
