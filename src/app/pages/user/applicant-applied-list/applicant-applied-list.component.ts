import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { NgxSpinnerModule } from 'ngx-spinner';
import { AdminService } from '../../../core/services/admin.service';
import { NotifyService } from '../../../core/services/notify.service';
import { UserService } from '../../../core/services/user/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../core/enums/roles.enum';

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
  
  constructor(
    private userService: UserService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private notify: NotifyService,
    private authService: AuthService
  ) {
    this.userRole = this.authService.getUserRole();
  }

  ngOnInit(): void {
    // Check if user is authorized to access this page
    if (!this.isAuthorized()) {
      this.notify.showError('You are not authorized to access this page');
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

  loadAppliedJobs(): void {
    if (!this.isAuthorized()) return;

    this.spinner.show();
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

  onSearch(): void {
    if (!this.isAuthorized()) return;

    if (!this.searchTerm.trim()) {
      this.loadAppliedJobs();
      return;
    }

    // Add search term to whereClause
    this.pageConfig.whereClause = [{
      field: 'job.title',
      operator: 'like',
      value: this.searchTerm
    }];
    this.pageConfig.curPage = 1; // Reset to first page when searching
    this.loadAppliedJobs();
  }

  onPageChange(page: number): void {
    if (!this.isAuthorized()) return;

    this.pageConfig.curPage = page;
    this.currentPage = page;
    this.loadAppliedJobs();
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  paginationArray(): number[] {
    const pages = [];
    const maxPages = Math.min(5, this.totalPages);
    let startPage = Math.max(1, this.currentPage - 2);
    let endPage = Math.min(this.totalPages, startPage + maxPages - 1);

    if (endPage - startPage + 1 < maxPages) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
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
}
