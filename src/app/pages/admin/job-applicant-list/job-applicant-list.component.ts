import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { NotifyService } from '../../../core/services/notify.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { UserService } from '../../../core/services/user/user.service';

@Component({
  selector: 'app-job-applicant-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './job-applicant-list.component.html',
  styleUrls: ['./job-applicant-list.component.css']
})
export class JobApplicantListComponent implements OnInit {
  jobId: string = '';
  applicants: any[] = [];
  loading: boolean = false;
  searchTerm: string = '';
  selectedStatus: string = '';
  selectedDateRange: string = '';
  Math = Math; // Add Math object for template use
  
  // Pagination config
  pageConfig: any = {
    curPage: 1,
    perPage: 10,
    sortBy: "created_on",
    direction: "desc",
    whereClause: []
  };

  // For template use
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  
  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private router: Router,
    private notifyService: NotifyService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit() {
    // Get jobId from route params
    this.jobId = this.route.snapshot.paramMap.get('jobId') || '';
    if (!this.jobId) {
      this.notifyService.showError('Job ID not found');
      return;
    }
    
    this.loadApplicants();
  }

  loadApplicants() {
    this.spinner.show();

    // Initialize where clause array
    this.pageConfig.whereClause = [
      {
        key: 'job_id',
        value: this.jobId,
        operator: '='
      }
    ];

    // Add search filter if search term exists
    if (this.searchTerm && this.searchTerm.trim() !== '') {
      this.pageConfig.whereClause.push({
        key: 'all',
        value: this.searchTerm.trim(),
        operator: '='
      });
    }

    // Make API call with exact payload format
    this.userService.getAppliedJobs(this.pageConfig).subscribe({
      next: (response: any) => {
        if (response.statusCode === 200) {
          console.log('API Response:', response); // Add this to debug the response
         this.applicants = response.data; 
          this.totalItems = this.applicants.length;
        } else {
          this.applicants = [];
          this.totalItems = 0;
          // this.notifyService.showError(response.message);
        }
        this.spinner.hide();
      },
      error: (error) => {
this.applicants = [];
this.totalItems = 0;
        console.error('API Error:', error); // Add this to debug errors
        this.notifyService.showError('Failed to load applicants');
        this.spinner.hide();
      }
    });
  }

  onSearch(): void {
    this.loadApplicants();
  }

  clear(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.selectedDateRange = '';
    this.pageConfig.curPage = 1;
    this.pageConfig.perPage = 10;
    this.loadApplicants();
  }

  onStatusChange(): void {
    this.currentPage = 1;
    this.loadApplicants();
  }

  onDateRangeChange(): void {
    this.currentPage = 1;
    this.loadApplicants();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadApplicants();
  }

  onPerPageChange(perPage: number): void {
    this.itemsPerPage = perPage;
    this.currentPage = 1;
    this.loadApplicants();
  }

  // onSort(field: string) {
  //   if (this.pageConfig.sortBy === field) {
  //     // Toggle direction if clicking same field
  //     this.pageConfig.direction = this.pageConfig.direction === 'asc' ? 'desc' : 'asc';
  //   } else {
  //     // Set new sort field and default to desc
  //     this.pageConfig.sortBy = field;
  //     this.pageConfig.direction = 'desc';
  //   }
  //   this.loadApplicants();
  // }

  viewApplicantProfile(applicantId: string): void {
    this.router.navigate(['/user-details', applicantId]);
  }

  goBack(): void {
    this.router.navigate(['/job-list']);
  }

  getTotalPages(): number {
    return Math.ceil(this.totalItems / this.pageConfig.perPage);
  }
}
