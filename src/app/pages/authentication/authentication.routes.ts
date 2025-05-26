import { Routes } from '@angular/router'

import { AppErrorComponent } from './error/error.component'
import { AppSideLoginComponent } from './side-login/side-login.component'
import { AppSideRegisterComponent } from './side-register/side-register.component'
import { EmailActivationComponent } from './email-activation/email-activation.component'
import { DevelopmentPageComponent } from './development-page/development-page.component'
import { JobDetailsComponent } from '../job-details/job-details.component'

export const AuthenticationRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./side-login/side-login.component').then(
            c => c.AppSideLoginComponent
          )
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./side-register/side-register.component').then(
            c => c.AppSideRegisterComponent
          )
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./side-forgot-password/side-forgot-password.component').then(
            c => c.SideForgotPasswordComponent
          )
      },
      {
        path: 'reset-password',
        loadComponent: () =>
          import('./side-reset-password/side-reset-password.component').then(
            c => c.SideResetPasswordComponent
          )
      },
     
      {
        path: 'Development-page',
        loadComponent: () =>
          import('./development-page/development-page.component').then(
            c => c.DevelopmentPageComponent
          )
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
        path: 'email-activation',
        component: EmailActivationComponent
      },
      {
        path: 'Job-Details',
        component: JobDetailsComponent
      },
      {
        path: 'Job-Details/:id',
        component: JobDetailsComponent
      },
       {
        path: 'error',
        loadComponent: () =>
          import('./error/error.component').then(c => c.AppErrorComponent)
      }
    ]
  }
]
