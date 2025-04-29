import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/authentication/auth.service';
import { RoleService } from '../services/role/role.service';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return (route) => {
    const authService = inject(AuthService);
    const roleService = inject(RoleService);
    const router = inject(Router);

    const user = authService.currentUserValue;
    
    if (!user) {
      router.navigate(['/auth/login']);
      return false;
    }

    const currentRoute = route.url.map(segment => segment.path).join('/');
    if (roleService.canAccess(user.role, '/' + currentRoute)) {
      return true;
    }

    router.navigate(['/job-list']);
    return false;
  };
};
