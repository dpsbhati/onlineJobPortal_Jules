import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserRole } from 'src/app/core/enums/roles.enum';
import { AdminService } from 'src/app/core/services/admin/admin.service';
import { AuthService } from 'src/app/core/services/authentication/auth.service';
// import { LoaderService } from 'src/app/core/services/loader.service';
import { NotifyService } from 'src/app/core/services/notify.service';

@Component({
  selector: 'app-view-job',
  imports: [],
  templateUrl: './view-job.component.html',
  // styleUrl: './view-job.component.scss'
})
export class ViewJobComponent {
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
    // private spinner: NgxSpinnerService,
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
    // this.spinner.show();
    this.adminService.getJobById(id).subscribe({
      next: (response: any) => {
        if (response.statusCode === 200 && response.data) {
          this.jobDetails = response.data;
          if (this.jobDetails.skills_required) {
            this.formattedSkills = this.formatSkills(this.jobDetails.skills_required);
          }
          // this.spinner.hide();
        } else {
          // this.spinner.hide();
          this.notifyService.showError(response.message);
        }
      },
      error: (error) => {
        // this.spinner.hide();
        this.notifyService.showError(error?.error?.message);
        console.error('Error:', error);
      }
    });
  }

  goBack() {
    this.router.navigate(['/job-list']);
  }

  navigate() {
    this.router.navigate([`/user-details/${this.id}`]);
  }

 }
