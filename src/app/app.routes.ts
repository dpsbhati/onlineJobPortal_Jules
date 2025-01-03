import { Routes } from '@angular/router';
import { EmailActivationComponent } from './auth/email-activation/email-activation.component';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/login', // Redirect to the login page
    pathMatch: 'full', // Ensure it only matches the empty path
  },

  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule),
  },
  {
    path: '',
    loadChildren: () => import('./pages/pages.module').then(m => m.PagesModule),
    canActivate:[AuthGuard]
  },
  {
    path: 'email-activation',
    children: [
      { path: 'email-activation', component: EmailActivationComponent },
    ],
  },

];
