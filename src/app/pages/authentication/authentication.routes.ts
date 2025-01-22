import { Routes } from '@angular/router';

import { AppErrorComponent } from './error/error.component';
import { AppSideLoginComponent } from './side-login/side-login.component';
import { AppSideRegisterComponent } from './side-register/side-register.component';
import { EmailActivationComponent } from './email-activation/email-activation.component';
import { CreateJobPostingComponent } from '../admin/create-job-posting/create-job-posting.component';
import { Application, ApplicationsComponent } from '../admin/applications/applications.component';
export const AuthenticationRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./side-login/side-login.component').then(
            (c) => c.AppSideLoginComponent
          ),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./side-register/side-register.component').then(
            (c) => c.AppSideRegisterComponent
          ),
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./side-forgot-password/side-forgot-password.component').then(
            (c) => c.SideForgotPasswordComponent
          ),
      },
      {
        path: 'reset-password',
        loadComponent: () =>
          import('./side-reset-password/side-reset-password.component').then(
            (c) => c.SideResetPasswordComponent
          ),
      },
      {
        path: 'error',
        loadComponent: () =>
          import('./error/error.component').then(
            (c) => c.AppErrorComponent
          ),
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
      {
        path: '**',
        redirectTo: 'error'
      }
    ],
  },
  {
    path: 'email-activation',
    component: EmailActivationComponent,
  },
  {
    path: 'create-job-posting',
    component: CreateJobPostingComponent,
  },
  {
    path: 'applications',
    component: ApplicationsComponent,
  },
];
