import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NotifyService } from '../../../core/services/notify.service';
import { UserService } from '../../../core/services/user/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../core/enums/roles.enum';
import { HelperService } from '../../../core/helpers/helper.service';

@Component({
  selector: 'app-applicant-applied-list',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxSpinnerModule],
  templateUrl: './applicant-applied-list.component.html',
  styleUrls: ['./applicant-applied-list.component.css']
})
export class ApplicantAppliedListComponent implements OnInit {
  appliedJobs: any[] = [];
  searchTerm: string = '';
  pageConfig: any = {
    curPage: 1,
    perPage: 10,
    sortBy: "created_on",
    direction: "desc",
    whereClause: [],
  }

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  
  // User role
  userRole: string = '';

  filters: any = {
    all: ""
  }

  constructor(
    private userService: UserService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private notify: NotifyService,
    private authService: AuthService,
    private helperService: HelperService
  ) {
    this.userRole = this.authService.getUserRole();
  }

  ngOnInit(): void {
    // Check if user is authorized to access this page
    if (!this.isAuthorized()) {
      this.router.navigate(['/']);
      return;
    }
    this.loadAppliedJobs();
  }

  isAuthorized(): boolean {
    return this.isApplicant();
  }

  isAdmin(): boolean {
    return this.userRole.toUpperCase() === UserRole.ADMIN;
  }

  isApplicant(): boolean {
    return this.userRole.toLowerCase() === UserRole.APPLICANT.toLowerCase();
  }

  OnSearch(event: any) {
    if (event?.target?.value) {
      this.filters.all = event.target.value.trim();
    } else {
      this.filters.all = "";
    }
    this.pageConfig.curPage = 1;
    this.loadAppliedJobs();
  }

  onSearch(): void {
    this.pageConfig.curPage = 1;
    this.loadAppliedJobs();
  }

  Clear() {
    this.filters.all = "";
    this.searchTerm = "";
    this.pageConfig.curPage = 1;
    this.pageConfig.perPage = 10;
    this.loadAppliedJobs();
  }

  loadAppliedJobs(): void {
    if (!this.isAuthorized()) return;

    this.spinner.show();
    this.pageConfig.whereClause = this.helperService.getAllFilters(this.filters);
    
    this.userService.getAppliedJobs(this.pageConfig).subscribe({
      next: (response: any) => {
        if (response.statusCode === 200) {
          this.appliedJobs = response.data;
          this.totalItems = response.count;
          this.spinner.hide();
        } else {
          this.notify.showError('Failed to load applied jobs');
          this.spinner.hide();
        }
      },
      error: (error) => {
        this.notify.showError(error?.error?.message || 'Failed to load applied jobs');
        this.spinner.hide();
      }
    });
  }

  OnPerPageChange(event?: any) {
    this.pageConfig.curPage = 1;
    if (event) this.pageConfig.perPage = +event.target.value;
    this.loadAppliedJobs();
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.pageConfig.curPage = page;
      this.loadAppliedJobs();
    }
  }

  paginationArray(): number[] {
    const pageCount = Math.ceil(this.totalItems / this.itemsPerPage);
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }

  viewJobDetails(jobId: string): void {
 
    if (!this.isAuthorized()) {
      this.notify.showError('You are not authorized to view job details');
      return;
    }
    this.router.navigate(['/applicant-jobview', jobId]);
  }

  canViewJobDetails(): boolean {
    return this.isApplicant();
  }

  goBack(): void {
    this.router.navigate(['/job-list']);
  }
}
