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
    MatButtonModule,MatSidenavModule,
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
    perPage: 10,
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
  // Reset page to 1 on new search
  this.pageConfig.curPage = 1;

  // Update whereClause with keyword filter
  if (this.keyword && this.keyword.trim() !== '') {
    this.pageConfig.whereClause = [
      { key: 'all', operator: '=', value: this.keyword.trim() }
    ];
  } else {
    // Clear filter if keyword empty
    this.pageConfig.whereClause = [];
  }

  // Call pagination API with updated filter
  this.onPagination();
}
onKeywordChange(value: string): void {
  if (!value || value.trim() === '') {
    this.pageConfig.curPage = 1;
    this.pageConfig.whereClause = [];
    this.onPagination();
  }
}





  goToLogin() {
  this.router.navigate(['/authentication/login']);
}
goToJobDetail(jobId: string) {
  this.router.navigate(['/view-job', jobId]);
}

}
