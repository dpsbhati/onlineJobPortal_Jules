import { Routes } from '@angular/router';
import { JobseekerLoginComponent } from './pages/Jobseeker/jobseeker-login/jobseeker-login.component';
import { RecruiterListComponent } from './pages/Recruiter/recruiter-list/recruiter-list.component';
import { LoginComponent } from './auth/login/login.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { RecruiterDashboardComponent } from './pages/Recruiter/recruiter-dashboard/recruiter-dashboard.component';
import { JobseekerDashboardComponent } from './pages/Jobseeker/jobseeker-dashboard/jobseeker-dashboard.component';
import { AuthGuard } from './core/guards/auth.guard';
export const routes: Routes = [
  // { path: '', redirectTo: '/RecruiterDashboardComponent', pathMatch: 'full' },
  {
    path: '',
    component: LoginComponent,
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent,
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
