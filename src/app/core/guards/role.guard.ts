import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/authentication/auth.service';
import { RoleService } from '../services/role/role.service';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return (route) => {
    const authService = inject(AuthService);
    const roleService = inject(RoleService);
    const router = inject(Router);
    const user = authService.currentUserValue;  // Get current user from auth service

    if (!user) {
      // If user is not logged in, redirect to login page
      router.navigate(['/auth/login']);
      return false;
    }

    const currentRoute = route.url.map(segment => segment.path).join('/'); // Get the current route

    // Check if the user has the role to access this route
    if (allowedRoles.includes(user.role) || roleService.canAccess(user.role, currentRoute)) {
      return true; // Allow access if role matches
    }

    // If the user doesn't have access, navigate to a default route (e.g., job-list)
    router.navigate(['/dashboard']);
    return false;
  };
  };

