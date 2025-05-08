import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AdminService } from 'src/app/core/services/admin/admin.service';
import { NotifyService } from '../../../core/services/notify.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { MaterialModule } from 'src/app/material.module';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { MatTableModule } from '@angular/material/table';
import { TablerIconsModule } from 'angular-tabler-icons';
@Component({
  selector: 'app-applicant-details',
  imports: [ CommonModule,
    FormsModule,
    RouterModule,MatTableModule ,TablerIconsModule,
  MaterialModule,ToastrModule],
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
  isLoading: boolean = false;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminService: AdminService,
    private notifyService: NotifyService,
    private loader: LoaderService,
    private toastr :ToastrService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.userId = params['id'];
      this.jobId = localStorage.getItem('currentJobId') || '';

      if (!this.userId) {
        this.toastr.error('Required parameters not found');
        return;
      }
      this.loadApplicantDetails();
    });
  }

  loadApplicantDetails() {
      this.loader.show();
      // this.isLoading = true;
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
          // this.isLoading = false;
          this.loader.hide();
        } else {
          this.toastr.warning(response.message);
          this.isLoading = false;
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.toastr.error(error?.error?.message || 'Error loading applicant details');
        this.isLoading = false;
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

    this.isLoading = true;
    const updateData = {
      status: this.selectedStatus,
      comments: this.adminComments,
      description: this.applicantDetails.description
    };

    this.adminService.updateApplicationStatus(this.userId, updateData)
      .subscribe({
        next: (response: any) => {
          if (response.statusCode === 200) {
            this.toastr.success(response.message);

            const jobId = localStorage.getItem('currentJobId');
            if (jobId) {
              this.router.navigate(['/applicants-details', jobId]);
            } else {
              this.router.navigate(['/applications']);
            }
          } else {
            this.toastr.warning(response.message || 'Failed to update status');
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error updating status:', error);
          this.toastr.error(error?.error?.message || 'Error updating status');
          this.isLoading = false;
        }
      });
  }
  extractFileName(cvPath: string): string {
    const urlSegments = cvPath.split("\\"); // Split by the backslash
    return urlSegments[urlSegments.length - 1]; // Get the last segment (filename)
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
