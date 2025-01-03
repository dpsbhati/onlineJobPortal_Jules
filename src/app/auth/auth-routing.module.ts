import { NgModule } from '@angular/core';
import { provideRouter, RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { NewUserRegistrationComponent } from './new-user-registration/new-user-registration.component';
import { EmailActivationComponent } from './email-activation/email-activation.component';
import { CreateJobPostingComponent } from '../pages/admin/create-job-posting/create-job-posting.component';
import { JobListComponent } from '../pages/admin/job-list/job-list.component';
const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent
  },

  {
    path: 'reset-password',
    component: ResetPasswordComponent
  },
  {
    path:'new-user-registration',
    component : NewUserRegistrationComponent
  },
  {
    path: 'email-activation',
    component: EmailActivationComponent,
  },
  {
    path: 'create-job-posting',
    component: CreateJobPostingComponent,
  },
  {path : 'job-list',
    component : JobListComponent
  }
  

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
