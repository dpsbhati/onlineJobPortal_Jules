import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { NotifyService } from '../../../core/services/notify.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { NgxSpinnerModule } from 'ngx-spinner';

@Component({
  selector: 'app-applicant-details',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterModule,
    NgxSpinnerModule
  ],
  templateUrl: './applicant-details.component.html',
  styleUrls: ['./applicant-details.component.css']
})
export class ApplicantDetailsComponent implements OnInit {
  jobId: string = '';
  userId: string = '';
  applicantDetails: any = null;
  selectedStatus: string = '';
  adminComments: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminService: AdminService,
    private notifyService: NotifyService,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.userId = params['id'];
      this.jobId = params['jobId'];
      if (!this.userId) {
        this.notifyService.showError('Required parameters not found');
        return;
      }
      this.loadApplicantDetails();
    });
  }

  loadApplicantDetails() {
    if (this.userId) {
      this.spinner.show();
      this.adminService.allApplicantDetails(this.userId)
        .subscribe({
          next: (response: any) => {
            if (response.data) {
              this.applicantDetails = response.data;
              this.selectedStatus = response.data.status;
              this.adminComments = response.data.comments || '';
            }
            this.spinner.hide();
          },
          error: (error) => {
            console.error('Error loading applicant details:', error);
            this.notifyService.showError(error?.error?.message || 'Error loading applicant details');
            this.spinner.hide();
          }
        });
    }
  }

  goBack(): void {
    if (this.jobId) {
      this.router.navigate(['/job-applicants-list', this.jobId]);
    } else {
      this.router.navigate(['/job-list']);
    }
  }
}
