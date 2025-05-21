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
  imports: [CommonModule,
    FormsModule,
    RouterModule, MatTableModule, TablerIconsModule,
    MaterialModule, ToastrModule],
  templateUrl: './applicant-details.component.html',
  styleUrl: './applicant-details.component.scss'
})
export class ApplicantDetailsComponent {
  noticePeriodFormatted:string = '-';
  languageSpokenFormatted: string = '-';
  languageWrittenFormatted: string = '-';
  formattedCourseInfo: string = '';
  formattedCertificationInfo: string = '';
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
    private toastr: ToastrService
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

  formatLanguages(langs: any): string {
    if (langs && langs.length > 0) {
      return langs.map((lang: any) => `${lang.language} (${lang.proficiency})`).join(', ');
    }
    return '-';
  }

 formatUTCDateToReadable(utcDateStr: string): string {
  if (!utcDateStr) return '';
  
  const utcDate = new Date(utcDateStr);
  
  // Use toLocaleDateString with options for full month name
  return utcDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC'  // Isse timezone shift avoid hota hai
  });
}

formatPreferences(prefs: any): string {
  if (!prefs) return '-';

  const parts: string[] = [];

  if (prefs.department?.length) {
    parts.push(`Department: ${prefs.department.join(', ')}`);
  }

  if (prefs.location?.length) {
    parts.push(`Locations: ${prefs.location.join(', ')}`);
  }

  return parts.length ? parts.join(' | ') : '-';
}


  loadApplicantDetails() {
    this.loader.show();
    // this.isLoading = true;
    this.adminService.allApplicantDetails(this.userId).subscribe({
      next: (response: any) => {
        if (response.statusCode === 200) {
          this.applicantDetails = response.data;
          this.selectedStatus = this.applicantDetails.status;
          this.adminComments = this.applicantDetails.comments;

          this.languageSpokenFormatted = this.formatLanguages(this.applicantDetails.user?.userProfile?.language_spoken_info);
          this.languageWrittenFormatted = this.formatLanguages(this.applicantDetails.user?.userProfile?.language_written_info);
          this.noticePeriodFormatted = this.applicantDetails.user?.userProfile?.notice_period_info
            ? (this.applicantDetails.user.userProfile.notice_period_info.notice_period_months ?? '-') +
            ' months, ' +
            this.formatUTCDateToReadable(this.applicantDetails.user.userProfile.notice_period_info.commence_work_date)
            : '-';
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
          // Format course_info
          const courses = response.data.user?.userProfile?.course_info || [];
          if (courses.length > 0) {
            this.formattedCourseInfo = courses.map((c: any) => {
              const from = c.course_from ? new Date(c.course_from).toLocaleDateString() : '';
              const to = c.course_to ? new Date(c.course_to).toLocaleDateString() : '';
              let dateRange = '';
              if (from && to) dateRange = ` (${from} - ${to})`;
              else if (from) dateRange = ` (${from})`;
              else if (to) dateRange = ` (${to})`;
              return `${c.course_title || '-'}${dateRange} - ${c.course_provider || '-'}`;
            }).join(', ');
          } else {
            this.formattedCourseInfo = '-';
          }

          // Format certification_info similarly
          const certifications = response.data.user?.userProfile?.certification_info || [];
          if (certifications.length > 0) {
            this.formattedCertificationInfo = certifications.map((c: any) => {
              const from = c.certification_from ? new Date(c.certification_from).toLocaleDateString() : '';
              const to = c.certification_to ? new Date(c.certification_to).toLocaleDateString() : '';
              let dateRange = '';
              if (from && to) dateRange = ` (${from} - ${to})`;
              else if (from) dateRange = ` (${from})`;
              else if (to) dateRange = ` (${to})`;
              return `${c.certification_title || '-'}${dateRange} - ${c.certification_issuer || '-'}`;
            }).join('; ');
          } else {
            this.formattedCertificationInfo = '-';
          }
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
