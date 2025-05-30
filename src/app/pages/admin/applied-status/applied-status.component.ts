import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule, MatFabButton } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TablerIconsModule } from 'angular-tabler-icons';
import { ToastrModule } from 'ngx-toastr';
import { UserRole } from 'src/app/core/enums/roles.enum';
import { AdminService } from 'src/app/core/services/admin/admin.service';
import { AuthService } from 'src/app/core/services/authentication/auth.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { NotifyService } from 'src/app/core/services/notify.service';
import { MaterialModule } from 'src/app/material.module';
@Component({
  selector: 'app-applied-status',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TablerIconsModule,
    MaterialModule,
    ToastrModule,
    MatButtonModule,
    MatInputModule,
  ],
  templateUrl: './applied-status.component.html',
  styleUrl: './applied-status.component.scss',
})
export class AppliedStatusComponent {
  jobDetails: any;
  allComments: string[] = [];
  loading: boolean = true;
  error: string = '';
  id: any;
  userRole: string = '';
  formattedSkills: any;
  formattedSocialMedia: any;
  userProfile: any;
  user: any;

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
toLowerCaseSafe(value: string | null | undefined): string {
  return value ? value.toLowerCase() : '';
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
      return parsedSkills.map((skill: string) =>
        skill.replace(/["\[\]]/g, '').trim()
      );
    } catch (error) {
      console.error('Error parsing skills:', error);
      return [];
    }
  }

  loadJobDetails(id: string): void {
    this.loader.show();
    this.adminService.allApplicantDetails(id).subscribe({
      next: (response: any) => {
        if (response.statusCode === 200 && response.data) {
          this.jobDetails = response.data;
           if (Array.isArray(this.jobDetails.comments)) {
          this.allComments = [...this.jobDetails.comments];
        } else {
          this.allComments = [];
        }
          this.user = this.jobDetails.user;
          this.userProfile = this.jobDetails.user?.userProfile;
          if (this.jobDetails?.job?.skills_required) {
            this.formattedSkills = JSON.parse(this.jobDetails?.job?.skills_required);
          }
          if (this.jobDetails?.job?.social_media_type) {
            this.formattedSocialMedia = JSON.parse(
              this.jobDetails?.job?.social_media_type
            );
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
      },
    });
  }

  goBack() {
    this.router.navigate(['/Applied-Applications']);
  }
  navigate() {
    this.router.navigate([`/user-details/${this.id}`]);
  }
}
