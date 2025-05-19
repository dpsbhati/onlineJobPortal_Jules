import { CommonModule, NgIf } from '@angular/common'
import { Component } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatSelectModule } from '@angular/material/select'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatSidenavModule } from '@angular/material/sidenav';
import { Router } from '@angular/router'
import { AdminService } from 'src/app/core/services/admin/admin.service'
import { LoaderService } from 'src/app/core/services/loader.service'
import { NotifyService } from 'src/app/core/services/notify.service'
import { MatSortModule } from '@angular/material/sort'
import { TablerIconsModule } from 'angular-tabler-icons'
import { MaterialModule } from 'src/app/material.module'
import { MatPaginatorModule } from '@angular/material/paginator'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { ToastrModule } from 'ngx-toastr'
import countries from '../../core/helpers/country.json'
import { MatSelectChange } from '@angular/material/select';
import { BrandingComponent } from "../../layouts/full/vertical/sidebar/branding.component";

@Component({
  selector: 'app-home',
  // imports: [TablerIconsModule, MaterialModule, BrandingComponent],
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

   countryList = countries
   isLoading: boolean = false;
    total: number = 0;
   jobPostingList:any;
   pageConfig: any = {
    curPage: 1,
    perPage: 9,
    sortBy: "created_at",
    direction: "desc",
    whereClause: [],
  }
  // ranks = ['Captain', 'Chief Engineer', 'Oiler']
  employers = ['Maersk', 'Anglo-Eastern', 'Bernhard Schulte']
  locations = ['India', 'Philippines', 'Greece']

  selectedRank = ''
  selectedEmployer = ''
  selectedLocation = ''
  keyword = ''
   constructor(private router: Router,
      private adminService: AdminService,
      private loader: LoaderService,
         private notify: NotifyService,



    ){}

  ngOnInit(): void {
      const savedPerPage = localStorage.getItem('jobPagePerPage');
  this.pageConfig.perPage = savedPerPage ? parseInt(savedPerPage, 10) : 9;
    // this.isLoading = true;
    // this.allJobList();
    this.allrankslist(); // 🔧 Add this line
    this.onPagination();
  }

 allrankslist() {
    this.adminService.getallranks().subscribe((response: any) => {
      if (response.statusCode === 200) {
        const allRanks = response.data.map((rank: any) => rank.rank_name);
        this.uniqueRanks = [...new Set(allRanks)] as string[];
      }
    });
  }
  onRankChange(rankValue: string): void {
  this.pageConfig.curPage = 1;  // reset page on filter change

  // Remove existing rank filters from whereClause (if any)
  this.pageConfig.whereClause = this.pageConfig.whereClause.filter(
    (filter: any) => filter.key !== 'rank'
  );

  if (rankValue && rankValue.trim() !== '') {
    // Add new rank filter
    this.pageConfig.whereClause.push({
      key: 'rank',
      operator: '=',
      value: rankValue.trim(),
    });
  }

  this.onPagination();
}
onLocationChange(event: MatSelectChange): void {
  const locationCode = event.value; // yeh selected value hai
  this.pageConfig.curPage = 1;

  // Remove any previous location filters
  this.pageConfig.whereClause = this.pageConfig.whereClause.filter(
    (filter: any) => filter.key !== 'location'
  );

  if (locationCode && typeof locationCode === 'string' && locationCode.trim() !== '') {
    this.pageConfig.whereClause.push({
      key: 'location',
      operator: '=',
      value: locationCode.trim(),
    });
  }

  this.onPagination();
}


   onPagination(): void {
    this.loader.show();

    // Create the base applicant filter

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
  onSearch(): void {
  this.pageConfig.curPage = 1;
  const trimmedKeyword = this.keyword.trim();

  if (trimmedKeyword !== '') {
    this.pageConfig.whereClause = [
      { key: 'all', operator: '=', value: trimmedKeyword }
    ];
  } else {
    this.pageConfig.whereClause = [];
  }

  this.onPagination();
}


//   goToLogin() {
//   this.router.navigate(['/authentication/login']);
// }
goToLogin() {
  const accessToken = localStorage.getItem('accessToken');
  const userStr = localStorage.getItem('user');

  if (!accessToken || !userStr) {
    // Not logged in, send to login page
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
      // Default fallback if role unknown
      this.router.navigate(['/authentication/login']);
    }
  } catch (error) {
    // Parsing error or other issue, fallback to login page
    console.error('Error parsing user from localStorage:', error);
    this.router.navigate(['/authentication/login']);
  }
}

goToJobDetail(jobId: string) {
  this.router.navigate(['/authentication/Job-Details', jobId]);
}

  // onPageChange(event: any): void {
  //   this.pageConfig.curPage = event.pageIndex + 1;
  //   this.pageConfig.perPage = event.pageSize;
  //   this.onPagination();
  // }
  onPageChange(event: any): void {
  this.pageConfig.curPage = event.pageIndex + 1;
  this.pageConfig.perPage = event.pageSize;

  // Save perPage to localStorage
  localStorage.setItem('jobPagePerPage', this.pageConfig.perPage.toString());

  this.onPagination();
}

  clearFilters(): void {
  this.selectedRank = '';
  this.selectedLocation = '';
  this.keyword = '';

  // Clear all filters from whereClause
  this.pageConfig.whereClause = [];
  this.pageConfig.curPage = 1;

  this.onPagination(); // Re-fetch data without filters
}


}
