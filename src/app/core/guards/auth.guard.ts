import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/authentication/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const token = localStorage.getItem('accessToken');
    const user = this.authService.currentUserValue;
    // console.log(user);

    // Check if token exists and is not expired
    if (!token || !user) {
      // Clear any stored auth data
      this.authService.logout();
      this.router.navigate(['/authentication/login']);
      return false;
    }

    const requiredRole = route.data['role'];
    if (requiredRole && user.role !== requiredRole) {
      this.router.navigate(['/unauthorized']);
      return false;
    }

    return true;
  }

  private isTokenExpired(token: string): boolean {
    try {
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      const expirationDate = new Date(tokenData.exp * 1000);
      return expirationDate < new Date();
    } catch {
      return true;
    }
  }
}
