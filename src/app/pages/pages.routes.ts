import { Routes } from '@angular/router';
import { StarterComponent } from './starter/starter.component';
import { EditProfileComponent } from './user/edit-profile/edit-profile.component';
import { AuthGuard } from '../core/guards/auth.guard';
import { JobListComponent } from './admin/job-list/job-list.component';
import { CreateJobPostingComponent } from './admin/create-job-posting/create-job-posting.component';
export const PagesRoutes: Routes = [
  {
    path: '',
    component: StarterComponent,
    data: {
      title: 'Administration',
      urls: [
        { title: 'Applications', url: '/starter' },
        { title: 'Applications List' },
      ],
    },
  },
  {
    path: 'createjob',
    component : CreateJobPostingComponent
  }
  {
    path: 'edit-profile',
    component: EditProfileComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'Edit Profile',
      // urls: [
      //   { title: 'Dashboard', url: '/starter' },
      //   { title: 'Edit Profile' },
      // ],
    },
  },
  {
    path: 'job-list',
    component: JobListComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'Job Listings',
    },
  },
];
