import { Injectable } from '@angular/core';

interface RoleRoutes {
  [key: string]: string[];
}

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private roles: RoleRoutes = {
    'ADMIN': [
      '/create-job-posting',
      '/job-list',
      '/user-profile'
    ],
    'applicant': [
      '/job-list',
      '/user-profile'
    ]
  };

  canAccess(userRole: string | undefined, route: string): boolean {
    if (!userRole) return false;
    
    const allowedRoutes = this.roles[userRole];
    if (!allowedRoutes) return false;

    // Check if the route starts with any of the allowed routes
    return allowedRoutes.some(allowedRoute => route.startsWith(allowedRoute));
  }
}
