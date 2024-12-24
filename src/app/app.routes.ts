import { Routes } from '@angular/router';
import { JobseekerLoginComponent } from './pages/Jobseeker/jobseeker-login/jobseeker-login.component';
import { RecruiterListComponent } from './pages/Recruiter/recruiter-list/recruiter-list.component';
import { LoginPageComponent } from './Auth/login-page/login-page.component';
import { ForgetPasswordComponent } from './Auth/forget-password/forget-password.component';
import { RecruiterDashboardComponent } from './pages/Recruiter/recruiter-dashboard/recruiter-dashboard.component';
import { AuthGuard } from './guards/auth.guard';
import { JobseekerDashboardComponent } from './pages/Jobseeker/jobseeker-dashboard/jobseeker-dashboard.component';
export const routes: Routes = [
  // { path: '', redirectTo: '/RecruiterDashboardComponent', pathMatch: 'full' },
  {
    path: '',
    component: LoginPageComponent,
  },
  {
    path: 'forgot-password',
    component: ForgetPasswordComponent,
  },
  {
    path: 'RecruiterDashboardComponent',
    component: RecruiterDashboardComponent,
    canActivate: [AuthGuard],
    data: { role: 'Recruiter' },
  },
  {
    path: 'jobseeker',
    component: JobseekerDashboardComponent,
    canActivate: [AuthGuard],
    data: { role: 'JobSeeker' },
  },
];
