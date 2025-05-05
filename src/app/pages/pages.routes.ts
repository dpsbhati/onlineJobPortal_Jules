import { Routes } from '@angular/router';
import { StarterComponent } from './starter/starter.component';
import { EditProfileComponent } from './user/edit-profile/edit-profile.component';
import { AuthGuard } from '../core/guards/auth.guard';
import { JobListComponent } from './admin/job-list/job-list.component';
import { CreateJobPostingComponent } from './admin/create-job-posting/create-job-posting.component';
import { ApplicationsComponent } from './admin/applications/applications.component';
import { ApplicantDetailsComponent } from './admin/applicant-details/applicant-details.component';
import { ViewJobComponent } from './admin/view-job/view-job.component';
import { NotificationsComponent } from './Notifications/notifications/notifications.component';
import { UserComponent } from './admin/user/user.component';
import { ApplicantComponent } from './admin/applicant/applicant.component';
import { ApplicantJobComponent } from './applicant-job/applicant-job.component';
import { SocialMediaIntegrationComponent } from './admin/social-media-integration/social-media-integration.component';
import { SocialMediaDetailsComponent } from './admin/social-media-details/social-media-details.component';
import { JobPostDetailComponent } from './job-post-detail/job-post-detail.component';
import { AdduserComponent } from './admin/adduser/adduser.component';
import { roleGuard } from '../core/guards/role.guard';
import { ApplyJobComponent } from './admin/apply-job/apply-job.component';
import { AppliedApplicationsComponent } from './admin/applied-applications/applied-applications.component';
import { AppliedStatusComponent } from './admin/applied-status/applied-status.component';
import { ExpiredJobPostingComponent } from './admin/expired-job-posting/expired-job-posting.component';
export const PagesRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'dashboard',
        component: StarterComponent,
        data: {
          title: 'Overview',
          urls: [
            // { title: 'Applications List', url: '/applications' },
            // { title: 'Applications List' },
          ],
        },
        // canActivate: [roleGuard(['applicant','admin'])],
      },

      {
        path: 'job-list',
        component: JobListComponent,
        data: {
          title: 'Job Postings',
          urls: [
            { title: 'All Job List', url: '/job-list' },
            // { title: 'Job deatils' },
          ],
        },
        canActivate: [roleGuard(['admin'])],
      },
      {
        path: 'view-job',
        component: ViewJobComponent,
        data: {
          // title: 'view-job',
          urls: [
            // { title: 'All Job List', url: '/job-list' },
            // { title: 'Job deatils' },
          ],
        },
        // canActivate: [AuthGuard]
      },
      {
        path: 'view-job/:id',
        component: ViewJobComponent,
        data: {
          // title: 'view-job',
          urls: [
            // { title: 'All Job List', url: '/job-list' },
            // { title: 'Job deatils' },
          ],
        },
        canActivate: [roleGuard(['applicant', 'admin'])],
      },

      {
        path: 'create-job-posting',
        component: CreateJobPostingComponent,
        canActivate: [roleGuard(['admin'])],
      },
      {
        path: 'create-job-posting/:id',
        component: CreateJobPostingComponent,
        // canActivate: [AuthGuard]
      },
      {
        path: 'expired-job-posting',
        component: ExpiredJobPostingComponent,
        canActivate: [roleGuard(['admin'])],
        data: {
          title: 'Expired Job Posting',
          urls: [
            { title: 'Job List' },
            // { title: 'Applications List' },
          ],
        },
      },
      {
        path: 'edit-profile',
        component: EditProfileComponent,
        // canActivate: [AuthGuard]
      },
      {
        path: 'applicant',
        component: ApplicantComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Job List',
          urls: [
            { title: 'Job List' },
            // { title: 'Applications List' },
          ],
        },
      },
      {
        path: 'applications',
        component: ApplicationsComponent,
        data: {
          title: 'View Applications',
        },
        // canActivate:[AuthGuard]
      },
      {
        path: 'applicant-job',
        component: ApplicantJobComponent,
        data: {
          title: 'Applicant',
          urls: [{ title: 'Applicant List', url: '/applicant' }],
        },
        // canActivate:[AuthGuard]
      },
      {
        path: 'job-post-details',
        component: JobPostDetailComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'job-post-details/:id',
        component: JobPostDetailComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'Applied-Applications',
        component: AppliedApplicationsComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Applied Applications',
          urls: [{ title: 'Applied Applications' }],
        },
      },
      {
        path: 'Apply-Job',
        component: ApplyJobComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'Applied-Status',
        component: AppliedStatusComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'Applied-Status/:id',
        component: AppliedStatusComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'applicant-details/:id',
        component: ApplicantDetailsComponent,
        canActivate: [AuthGuard],
      },

      {
        path: 'notifications',
        component: NotificationsComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Notifications',
          // urls: [
          //   { title: 'Applications List', url: '/applications' },
          //   // { title: 'Applications List' },
          // ],
        },
      },
      {
        path: 'social-media-integration',
        component: SocialMediaIntegrationComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'social media integration',
          // urls: [
          //   { title: 'Applications List', url: '/applications' },
          //   // { title: 'Applications List' },
          // ],
        },
      },
      {
        path: 'social-media-Details',
        component: SocialMediaDetailsComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'social media Details',
        },
      },
      {
        path: 'add-user',
        component: AdduserComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Add User',
        },
      },
      {
        path: 'userlist',
        component: UserComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'User-list',
          // urls: [
          //   { title: 'Applications List', url: '/applications' },
          //   // { title: 'Applications List' },
          // ],
        },
      },
    ],
  },
];
