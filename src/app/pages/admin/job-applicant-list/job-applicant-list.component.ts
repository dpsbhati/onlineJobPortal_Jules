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
    whereClause: [],
    jobId: ''
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
    this.jobId = this.route.snapshot.paramMap.get('jobId') || '';
    if (this.jobId) {
      this.pageConfig.jobId = this.jobId;
      this.loadApplicants();
    }
  }

  loadApplicants() {
    this.spinner.show();
    
    // Update whereClause based on filters
    this.pageConfig.whereClause = [];
    
    if (this.searchTerm) {
      this.pageConfig.whereClause.push({
        field: 'userData.name',
        operator: 'contains',
        value: this.searchTerm
      });
      // Also search in email
      this.pageConfig.whereClause.push({
        field: 'userData.email',
        operator: 'contains',
        value: this.searchTerm
      });
    }

    if (this.selectedStatus) {
      this.pageConfig.whereClause.push({
        field: 'status',
        operator: 'equals',
        value: this.selectedStatus
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
          field: 'created_on',
          operator: 'between',
          value: [startDate.toISOString(), today.toISOString()]
        });
      }
    }

    this.userService.getAppliedJobs(this.pageConfig).subscribe({
      next: (response: any) => {
        if (response.statusCode === 200) {
          this.applicants = response.data;
          this.totalItems = response.count || 0;
          
          // Log the response to see the structure
          console.log('Applicants:', this.applicants);
        } else {
          this.notifyService.showError(response.message);
        }
        this.spinner.hide();
      },
      error: (error) => {
        this.notifyService.showError(error?.error?.message || 'Error loading applicants');
        this.spinner.hide();
      }
    });
  }

  onSearch() {
    this.pageConfig.curPage = 1;
    this.loadApplicants();
  }

  onStatusChange() {
    this.pageConfig.curPage = 1;
    this.loadApplicants();
  }

  onDateRangeChange() {
    this.pageConfig.curPage = 1;
    this.loadApplicants();
  }

  onSort(field: string) {
    if (this.pageConfig.sortBy === field) {
      this.pageConfig.direction = this.pageConfig.direction === 'asc' ? 'desc' : 'asc';
    } else {
      this.pageConfig.sortBy = field;
      this.pageConfig.direction = 'asc';
    }
    this.loadApplicants();
  }

  onPageChange(page: number) {
    this.pageConfig.curPage = page;
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
