import { Routes } from '@angular/router';
import { JobseekerLoginComponent } from './pages/Jobseeker/jobseeker-login/jobseeker-login.component';
import { LoginComponent } from './auth/login/login.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { JobseekerDashboardComponent } from './pages/Jobseeker/jobseeker-dashboard/jobseeker-dashboard.component';
import { AuthGuard } from './core/guards/auth.guard';
import { CvUploadComponent } from './pages/Jobseeker/cv-upload/cv-upload.component';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';
import { EmailActivationComponent } from './auth/email-activation/email-activation.component';
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/login', // Redirect to the login page
    pathMatch: 'full', // Ensure it only matches the empty path
  },
  {
    path: 'reset-password',
    component: ResetPasswordComponent
  },

  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule),
  },
  // { path: '', component: LayoutComponent, loadChildren: () => import('./pages/pages.module').then(m => m.PagesModule), canActivate: [AuthGuard] },
  // { path: '**', component: Page404Component },
  // {
  {
    path: 'email-activation',
    children: [
      { path: 'email-activation', component: EmailActivationComponent },
    ],
  },


  {
    path: 'jobseeker',
    component: JobseekerDashboardComponent,
    canActivate: [AuthGuard],
    data: { role: 'JobSeeker' },
  },
  {
    path: 'cv-upload',
    component: CvUploadComponent,
  },
];
