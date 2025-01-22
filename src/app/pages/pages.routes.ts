import { Routes } from '@angular/router';
import { StarterComponent } from './starter/starter.component';
import { EditProfileComponent } from './user/edit-profile/edit-profile.component';
import { AuthGuard } from '../core/guards/auth.guard';
import { JobListComponent } from './admin/job-list/job-list.component';
import { CreateJobPostingComponent } from './admin/create-job-posting/create-job-posting.component';

export const PagesRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'starter',
        component: StarterComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'job-list',
        component: JobListComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'create-job-posting',
        component: CreateJobPostingComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'create-job-posting/:id',
        component: CreateJobPostingComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'edit-profile',
        component: EditProfileComponent,
        canActivate: [AuthGuard]
      }
    ]
  }
];
