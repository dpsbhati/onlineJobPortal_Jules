import { CommonModule } from '@angular/common';
import { Component } from '@angular/core'
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TablerIconsModule } from 'angular-tabler-icons'
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { AdminService } from 'src/app/core/services/admin/admin.service';
import { AuthService } from 'src/app/core/services/authentication/auth.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { NotifyService } from 'src/app/core/services/notify.service';
import { MaterialModule } from 'src/app/material.module'
import { BrandingComponent } from "../../layouts/full/vertical/sidebar/branding.component";
import { MatDialog } from '@angular/material/dialog';
import { ApplyJobComponent } from '../admin/apply-job/apply-job.component';
import { Subscription } from 'rxjs';
import { WebsocketService } from 'src/app/core/services/websocket.service';

@Component({
  selector: 'app-job-details',
  imports: [
    MaterialModule, TablerIconsModule,
    CommonModule,
    FormsModule,
    RouterModule,
    ToastrModule,
    BrandingComponent,
    ReactiveFormsModule
  ],
  templateUrl: './job-details.component.html',
  styleUrl: './job-details.component.scss'
})
export class JobDetailsComponent {
  showApplyModal = false;
  applyAdditionalInfo = '';
  jobDetails: any;
  showLoginSignupDialog = false;
  loading: boolean = true;
  error: string = '';
  id: any;
  userRole: string = '';
  formattedSkills: string[] = [];
  userDetailsForm: FormGroup;
  submitted = false;
  jobId: any;
  user: any;
  private wbesocketSubscription: Subscription;

  constructor(
    private route: ActivatedRoute,
    private adminService: AdminService,
    private router: Router,
    private notifyService: NotifyService,
    private loader: LoaderService,
    private authService: AuthService,
    public dialog: MatDialog,
    private toastr: ToastrService,
    private webSocketService: WebsocketService,
  ) {
    this.userRole = this.authService.getUserRole();
    this.userDetailsForm = new FormGroup({
      job_id: new FormControl(this.jobId),
      user_id: new FormControl(this.user),
      additional_info: new FormControl('', [
        Validators.maxLength(500),
      ]),
    });
  }

  ngOnInit() {
    this.jobId = this.route.snapshot.paramMap.get('id') as string;
    this.user = JSON.parse(localStorage.getItem('user') || '{}');

    this.userDetailsForm.patchValue({
      job_id: this.jobId,
      user_id: this.user?.id
    });
    this.id = this.route.snapshot.paramMap.get('id') as string;
    if (this.id) {
      this.loadJobDetails(this.id);
    }
  }

  formatSkills(skills: string): string[] {
    try {
      if (!skills) return [];
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
      },
    });
  }

  goToLogin() {
    const accessToken = localStorage.getItem('accessToken');
    const userStr = localStorage.getItem('user');
    if (!accessToken || !userStr) {
      this.router.navigate(['/authentication/login']);
      return;
    }
    try {
      const user = JSON.parse(userStr);
      const role = user.role?.toLowerCase();
      if (role === 'admin') {
        this.router.navigate(['/applications']);
      } else if (role === 'applicant') {
        this.router.navigate(['/Applied-Applications']);
      } else {
        this.router.navigate(['/authentication/login']);
      }
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      this.router.navigate(['/authentication/login']);
    }
  }

  onApplyNowClick() {
    if (this.authService.isLoggedIn()) {
      this.showApplyModal = true;
    } else {
      this.showLoginSignupDialog = true;
    }
  }

  goToEditProfile() {
    this.closeApplyModal();
    this.router.navigate(['/edit-profile']);
  }

  submitApplication(): void {
    this.loader.show();
    this.submitted = true;
    if (this.userDetailsForm.valid) {
      const formData = this.userDetailsForm.value;
      const apiPayload = {
        ...formData,
        job_id: this.jobId,
        user_id: this.user?.id,
      };
      this.adminService.applyJobs(apiPayload).subscribe({
        next: (response: any) => {
          if (response.statusCode === 200) {
            this.loader.hide();
            this.toastr.success(response.message);
            this.router.navigate(['/Applied-Applications']);
          } else {
            this.toastr.warning(response.message);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        },
        error: (error: any) => {
          this.loader.hide();
          this.toastr.error(error.error?.message || 'Failed to apply for job');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    } else {
      this.loader.hide();
    }
    this.loader.hide();
  }

  closeApplyModal() {
    this.showApplyModal = false;
    this.applyAdditionalInfo = '';
  }

  onLogin() {
    this.showLoginSignupDialog = false;
    this.router.navigate(['/authentication/login']);
  }

  onSignup() {
    this.showLoginSignupDialog = false;
    this.router.navigate(['/authentication/register']);
  }

  onCancel() {
    this.showLoginSignupDialog = false;
  }

  navigate() {
    this.router.navigate([`/user-details/${this.id}`]);
  }
  goBack() {
    this.router.navigate(['/home']);
  }

  get isApplicant(): boolean {
    return this.userRole.toLowerCase() === 'applicant';
  }

  get isAdmin(): boolean {
    return this.userRole.toLowerCase() === 'admin';
  }

  get showApplyButton(): boolean {
    let user: any = localStorage.getItem('user');
    if (JSON.parse(user)?.role.toLowerCase() === 'admin') {
      return false; // Not logged in, show button
    }
    else {
      return true;
    }
  }
}

