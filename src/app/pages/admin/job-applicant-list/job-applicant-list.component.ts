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
      this.router.navigate(['/admin/jobs']);
      return;
    }
    
    this.loadApplicants();
  }

  loadApplicants() {
    this.spinner.show();
    
    // Reset whereClause array
    this.pageConfig.whereClause = [
      {
        key: "job.id", // Update the key to match the nested property path
        value: this.jobId,
        operator: "="
      }
    ];

    // Add search filter if present
    if (this.searchTerm) {
      this.pageConfig.whereClause.push({
        key: "all",
        value: this.searchTerm,
        operator: "="
      });
    }

    if (this.selectedStatus) {
      this.pageConfig.whereClause.push({
        key: "status",
        value: this.selectedStatus,
        operator: "="
      });
    }

    if (this.selectedDateRange) {
      const today = new Date();
      let startDate = new Date();
      
      switch(this.selectedDateRange) {
        case 'today':
          startDate = today;
          break;
        case 'week':
          startDate.setDate(today.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(today.getMonth() - 1);
          break;
      }

      if (this.selectedDateRange !== '') {
        this.pageConfig.whereClause.push({
          key: "created_on",
          value: [startDate.toISOString(), today.toISOString()],
          operator: "between"
        });
      }
    }

    // Update pagination parameters
    this.pageConfig.curPage = this.currentPage;
    this.pageConfig.perPage = this.itemsPerPage;

    console.log('Request payload:', this.pageConfig); // Add this to debug the request

    // Make API call with exact payload format
    this.userService.getAppliedJobs(this.pageConfig).subscribe({
      next: (response: any) => {
        if (response.statusCode === 200) {
          console.log('API Response:', response); // Add this to debug the response
          // Double-check filtering on client side
          this.applicants = response.data.filter((app: any) => {
            return app.job && app.job.id === this.jobId;
          });
          this.totalItems = this.applicants.length;
        } else {
          this.notifyService.showError(response.message);
        }
        this.spinner.hide();
      },
      error: (error) => {
        console.error('API Error:', error); // Add this to debug errors
        this.notifyService.showError('Failed to load applicants');
        this.spinner.hide();
      }
    });
  }

  onSearch() {
    this.currentPage = 1;
    this.loadApplicants();
  }

  onStatusChange() {
    this.currentPage = 1;
    this.loadApplicants();
  }

  onDateRangeChange() {
    this.currentPage = 1;
    this.loadApplicants();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadApplicants();
  }

  onPerPageChange(perPage: number) {
    this.itemsPerPage = perPage;
    this.currentPage = 1;
    this.loadApplicants();
  }

  onSort(field: string) {
    if (this.pageConfig.sortBy === field) {
      // Toggle direction if clicking same field
      this.pageConfig.direction = this.pageConfig.direction === 'asc' ? 'desc' : 'asc';
    } else {
      // Set new sort field and default to desc
      this.pageConfig.sortBy = field;
      this.pageConfig.direction = 'desc';
    }
    this.loadApplicants();
  }

  viewApplicantProfile(applicantId: string) {
    this.router.navigate(['/user-details', applicantId]);
  }

  goBack() {
    this.router.navigate(['/job-list']);
  }

  getTotalPages(): number {
    return Math.ceil(this.totalItems / this.pageConfig.perPage);
  }
}
