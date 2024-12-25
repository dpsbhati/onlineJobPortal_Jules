import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const user = this.authService.currentUserValue; // Replace with your user retrieval logic

    if (!user) {
      this.router.navigate(['/login']); // Redirect to login if not authenticated
      return false;
    }

    const requiredRole = route.data['role'];
    if (requiredRole && user.role !== requiredRole) {
      this.router.navigate(['/unauthorized']); // Redirect if role mismatch
      return false;
    }

    return true;
  }
}

