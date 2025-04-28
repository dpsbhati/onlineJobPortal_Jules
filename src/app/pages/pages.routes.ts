import { Routes } from '@angular/router'
import { StarterComponent } from './starter/starter.component'
import { EditProfileComponent } from './user/edit-profile/edit-profile.component'
import { AuthGuard } from '../core/guards/auth.guard'
import { JobListComponent } from './admin/job-list/job-list.component'
import { CreateJobPostingComponent } from './admin/create-job-posting/create-job-posting.component'
import { ApplicationsComponent } from './admin/applications/applications.component'
import { ApplicantDetailsComponent } from './admin/applicant-details/applicant-details.component'
import { ViewJobComponent } from './admin/view-job/view-job.component'
import { NotificationsComponent } from './Notifications/notifications/notifications.component'
import { UserComponent } from './admin/user/user.component'
import { ApplicantComponent } from './admin/applicant/applicant.component'
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
          ]
        }
        // canActivate: [AuthGuard]
      },

      {
        path: 'job-list',
        component: JobListComponent,
        data: {
          title: 'Job Postings',
          urls: [
            { title: 'All Job List', url: '/job-list' }
            // { title: 'Job deatils' },
          ]
        }
        // canActivate: [AuthGuard]
      },
      {
        path: 'view-job',
        component: ViewJobComponent,
        data: {
          title: 'view-job',
          urls: [
            // { title: 'All Job List', url: '/job-list' },
            // { title: 'Job deatils' },
          ]
        }
        // canActivate: [AuthGuard]
      },
      {
        path: 'view-job/:id',
        component: ViewJobComponent,
        data: {
          title: 'view-job',
          urls: [
            // { title: 'All Job List', url: '/job-list' },
            // { title: 'Job deatils' },
          ]
        }
        // canActivate: [AuthGuard]
      },

      {
        path: 'create-job-posting',
        component: CreateJobPostingComponent
        // canActivate: [AuthGuard]
      },
      {
        path: 'create-job-posting/:id',
        component: CreateJobPostingComponent
        // canActivate: [AuthGuard]
      },
      {
        path: 'edit-profile',
        component: EditProfileComponent
        // canActivate: [AuthGuard]
      },
      {
        path: 'applications',
        component: ApplicationsComponent,
        data: {
          title: 'Administration',
          urls: [
            { title: 'Applications List', url: '/applications' }
            // { title: 'Applications List' },
          ]
        }
        // canActivate:[AuthGuard]
      },
      {
        path: 'applicant-details/:id',
        component: ApplicantDetailsComponent,
        canActivate: [AuthGuard]
      },
     
      {
        path: 'notifications',
        component: NotificationsComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Notifications'
          // urls: [
          //   { title: 'Applications List', url: '/applications' },
          //   // { title: 'Applications List' },
          // ],
        }
      },
      {
        path: 'userlist',
        component: UserComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'User-list'
          // urls: [
          //   { title: 'Applications List', url: '/applications' },
          //   // { title: 'Applications List' },
          // ],
        }
      },
      {
        path: 'applicant',
        component: ApplicantComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'User-list',
          urls: [
            { title: 'Applications List', url: '/applications' },
            // { title: 'Applications List' },
          ],
        }
      },
    ]
  }
]
