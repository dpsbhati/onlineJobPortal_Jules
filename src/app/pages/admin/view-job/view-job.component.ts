import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { UserRole } from 'src/app/core/enums/roles.enum';
import { AdminService } from 'src/app/core/services/admin/admin.service';
import { AuthService } from 'src/app/core/services/authentication/auth.service';
import { LoaderService } from 'src/app/core/services/loader.service';
// import { LoaderService } from 'src/app/core/services/loader.service';
import { NotifyService } from 'src/app/core/services/notify.service';
import { MaterialModule } from 'src/app/material.module';
import { TablerIconsModule } from 'angular-tabler-icons'
@Component({
  selector: 'app-view-job',
  imports: [CommonModule,
    FormsModule,
    RouterModule, TablerIconsModule,
    MaterialModule, ToastrModule],
  templateUrl: './view-job.component.html',

})
export class ViewJobComponent {
  jobDetails: any;
  loading: boolean = true;
  error: string = '';
  id: any;
  userRole: string = '';
  formattedSkills: any;
  formattedSocialMedia: any;

  constructor(
    private route: ActivatedRoute,
    private adminService: AdminService,
    private router: Router,
    private notifyService: NotifyService,
    private loader: LoaderService,
    private authService: AuthService
  ) {
    this.userRole = this.authService.getUserRole();
  }

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id') as string;
    if (this.id) {
      this.loadJobDetails(this.id);
    }
  }

  isAdmin(): boolean {
    return this.userRole.toUpperCase() === UserRole.ADMIN;
  }

  isApplicant(): boolean {
    return this.userRole.toLowerCase() === UserRole.APPLICANT.toLowerCase();
  }

  formatSkills(skills: string): string[] {
    try {
      if (!skills) return [];
      // Parse the JSON string and remove any special characters
      const parsedSkills = JSON.parse(skills.replace(/\\/g, ''));
      return parsedSkills.map((skill: string) => skill.replace(/["\[\]]/g, '').trim());
    } catch (error) {
      console.error('Error parsing skills:', error);
      return [];
    }
  }

  loadJobDetails(id: string): void {
    this.loader.show();
    this.adminService.getJobById(id).subscribe({
      next: (response: any) => {
        if (response.statusCode === 200 && response.data) {
          this.jobDetails = response.data;
          if (this.jobDetails?.skills_required) {
            this.formattedSkills = JSON.parse(this.jobDetails?.skills_required);
          }
          if (this.jobDetails.social_media_type) {
            this.formattedSocialMedia = JSON.parse(this.jobDetails.social_media_type);
          }
          this.loader.hide();
        } else {
          this.loader.hide();
          this.notifyService.showError(response.message);
        }
      },
      error: (error) => {
        this.loader.hide();
        this.notifyService.showError(error?.error?.message);
        console.error('Error:', error);
      }
    });
  }

  goBack() {
    this.router.navigate(['/applicant']);
  }

  navigate() {
    this.router.navigate([`/user-details/${this.id}`]);
  }

  applyNow() {
    this.router.navigate(['/Apply-Job', this.id]);
  }
}
