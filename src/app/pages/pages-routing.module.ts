import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserProfileComponent } from './user/user-profile/user-profile.component';
import { CreateJobPostingComponent } from './admin/create-job-posting/create-job-posting.component';
import { JobListComponent } from './admin/job-list/job-list.component';
import { UserDetailsComponent } from './user/user-details/user-details.component';
const routes: Routes = [
  // {
  //   path: 'user-profile', component: UserProfileComponent
  // },
  { path: 'user-profile', component: UserProfileComponent },
  {
    path: 'create-job-posting',
    component: CreateJobPostingComponent,
  },
  {
    path: 'create-job-posting/:id',
    component: CreateJobPostingComponent,
  },
  {path : 'job-list',
    component : JobListComponent
  },
  {
    path: 'user-details',
    component : UserDetailsComponent
  }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
