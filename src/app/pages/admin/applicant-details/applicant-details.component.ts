import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AdminService } from 'src/app/core/services/admin/admin.service';
import { NotifyService } from '../../../core/services/notify.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { NgxSpinnerModule } from 'ngx-spinner';
import { LoaderService } from 'src/app/core/services/loader.service';
import { MaterialModule } from 'src/app/material.module';
@Component({
  selector: 'app-applicant-details',
  imports: [ CommonModule, 
    FormsModule, 
    RouterModule,
    NgxSpinnerModule,
  MaterialModule],
  templateUrl: './applicant-details.component.html',
  styleUrl: './applicant-details.component.scss'
})
export class ApplicantDetailsComponent {
  jobId: string = '';
  userId: string = '';
  applicantDetails: any = null;
  selectedStatus: string = '';
  adminComments: string = '';
  statusOptions: string[] = ['Pending', 'Shortlisted', 'Rejected', 'Hired'];
  keySkills: string[] = [];
  certifications: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminService: AdminService,
    private notifyService: NotifyService,
    private spinner: NgxSpinnerService,
    private loader: LoaderService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.userId = params['id'];
      this.jobId = localStorage.getItem('currentJobId') || '';
      
      if (!this.userId) {
        this.notifyService.showError('Required parameters not found');
        return;
      }
      this.loadApplicantDetails();
    });
  }
   
  loadApplicantDetails() {
      this.loader.show();
    this.adminService.allApplicantDetails(this.userId).subscribe({
      next: (response: any) => {
        if (response.statusCode === 200) {
          this.applicantDetails = response.data;
          this.selectedStatus = this.applicantDetails.status;
          this.adminComments = this.applicantDetails.comments ;
          
          // Parse key skills
          if (response.data.user?.userProfile?.key_skills) {
            try {
              // Remove forward slashes from skills when displaying
              this.keySkills = JSON.parse(response.data.user.userProfile.key_skills).map((skill: string) => skill.replace('/', ''));
            } catch (e) {
              console.warn('Error parsing key_skills:', e);
              this.keySkills = Array.isArray(response.data.user.userProfile.key_skills) ? 
                response.data.user.userProfile.key_skills : [];
            }
          }

          // Get certifications from courses_and_certification array
          this.certifications = this.applicantDetails.job?.courses_and_certification || [];
          this.loader.hide();
        } else {
          this.notifyService.showError(response.message);
          this.loader.hide();
        }
        this.loader.hide();
      },
      error: (error) => {
        this.notifyService.showError('Error loading applicant details');
        this.loader.hide();
      }
    });
  }

  // loadApplicantDetails() {
  //   // debugger
  //   this.spinner.show();
  //   this.adminService.allApplicantDetails(this.userId).subscribe({
  //     next: (response: any) => {
  //       if (response.statusCode === 200) {
  //         this.applicantDetails = response.data;
  //         this.selectedStatus = this.applicantDetails.status;
  //         this.adminComments = this.applicantDetails.comments ;
           
  //         // Parse key skills
  //         if (response.data.userProfile?.key_skills) {
  //           try {
  //             // Remove forward slashes from skills when displaying
  //             this.keySkills = JSON.parse(response.data.userProfile.key_skills).map((skill: string) => skill.replace('/', ''));
  //           } catch (e) {
  //             console.warn('Error parsing key_skills:', e);
  //             this.keySkills = Array.isArray(response.data.userProfile.key_skills) ? 
  //               response.data.userProfile.key_skills : [];
  //           }
  //         }
        

  //         // Get certifications from courses_and_certification array
  //         this.certifications = this.applicantDetails.job?.courses_and_certification || [];
  //       } else {
  //         this.notifyService.showError('Failed to load applicant details');
  //       }
  //       this.spinner.hide();
  //     },
  //     error: (error) => {
  //       this.notifyService.showError('Error loading applicant details');
  //       this.spinner.hide();
  //     }
  //   });
  // }

  updateStatus(): void {
    if (!this.userId || !this.selectedStatus) {
      this.notifyService.showError('Please select a status');
      return;
    }

    this.spinner.show();
    const updateData = {
      status: this.selectedStatus,
      comments: this.adminComments,
      description: this.applicantDetails.description
    };

    this.adminService.updateApplicationStatus(this.userId, updateData)
      .subscribe({
        next: (response: any) => {
          if (response.statusCode === 200) {
            this.notifyService.showSuccess('Application status updated successfully');
            // Get jobId from localStorage for navigation
            const jobId = localStorage.getItem('currentJobId');
            if (jobId) {
              this.router.navigate(['/applicants-details', jobId]);
            } else {
              this.router.navigate(['/applications']);
            }
          } else {
            this.notifyService.showError(response.message || 'Failed to update status');
          }
          this.spinner.hide();
        },
        error: (error) => {
          console.error('Error updating status:', error);
          this.notifyService.showError(error?.error?.message || 'Error updating status');
          this.spinner.hide();
        }
      });
  }

  goBack(): void {
    // Get jobId from localStorage for back navigation
    const jobId = localStorage.getItem('currentJobId');
    if (jobId) {
      this.router.navigate(['/applicant-details', jobId]);
    } else {
      this.router.navigate(['/applications']);
    }
  }
}
