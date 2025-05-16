import { CommonModule } from '@angular/common';
import { Component } from '@angular/core'
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TablerIconsModule } from 'angular-tabler-icons'
import { ToastrModule } from 'ngx-toastr';
import { AdminService } from 'src/app/core/services/admin/admin.service';
import { AuthService } from 'src/app/core/services/authentication/auth.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { NotifyService } from 'src/app/core/services/notify.service';
import { MaterialModule } from 'src/app/material.module'

@Component({
  selector: 'app-job-details',
  imports: [
    MaterialModule,TablerIconsModule,
     CommonModule,
        FormsModule,
        RouterModule,
        ToastrModule,
  ],
  templateUrl: './job-details.component.html',
  styleUrl: './job-details.component.scss'
})
export class JobDetailsComponent {


  jobDetails: any;
    loading: boolean = true;
    error: string = '';
    id: any;
    userRole: string = '';
    formattedSkills: string[] = [];

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

    // isAdmin(): boolean {
    //   return this.userRole.toUpperCase() === UserRole.ADMIN;
    // }

    // isApplicant(): boolean {
    //   return this.userRole.toLowerCase() === UserRole.APPLICANT.toLowerCase();
    // }

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
      this.adminService.getJobById(id).subscribe({
        next: (response: any) => {
          if (response.statusCode === 200 && response.data) {
            this.jobDetails = response.data;
            this.loader.hide();
            if (Array.isArray(this.jobDetails.skills_required)) {
            this.formattedSkills = this.jobDetails.skills_required;
          } else if (typeof this.jobDetails.skills_required === 'string') {
            // If for some reason it's a string, parse it safely
            try {
              this.formattedSkills = JSON.parse(this.jobDetails.skills_required);
            } catch {
              this.formattedSkills = [];
            }
          } else {
            this.formattedSkills = [];
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
        },
      });
    }
      goToLogin() {
  this.router.navigate(['/authentication/login']);
}



    navigate() {
      this.router.navigate([`/user-details/${this.id}`]);
    }
  goBack() {
    this.router.navigate(['/home']);
  }

}

