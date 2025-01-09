import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserProfileComponent } from './user/user-profile/user-profile.component';
import { CreateJobPostingComponent } from './admin/create-job-posting/create-job-posting.component';
import { JobListComponent } from './admin/job-list/job-list.component';
import { roleGuard } from '../core/guards/role.guard';
import { ViewJobComponent } from './admin/view-job/view-job.component';

const routes: Routes = [
  { 
    path: 'user-profile', 
    component: UserProfileComponent,
    canActivate: [() => roleGuard(['ADMIN', 'applicant'])]
  },
  {
    path: 'create-job-posting',
    component: CreateJobPostingComponent,
    canActivate: [() => roleGuard(['ADMIN'])]
  },
  {
    path: 'create-job-posting/:id',
    component: CreateJobPostingComponent,
    canActivate: [() => roleGuard(['ADMIN'])]
  },
  {
    path: 'job-list',
    component: JobListComponent,
    canActivate: [() => roleGuard(['ADMIN', 'applicant'])]
  },
  {
    path: 'view-job/:id',
    component: ViewJobComponent,
    canActivate: [() => roleGuard(['ADMIN', 'applicant'])]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
