import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

import { GenericService } from './generic.service';

// import { RoleService } from '../role/role.service';

// import { AuthUtils } from 'app/core/auth/auth.utils';
// import jwtDecode from 'jwt-decode';

import { UserService } from './user/user.service';
import { LocalStorageService } from './local-stoarge.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _authenticated: boolean = false;
  private _httpClient = inject(HttpClient);
  private _userService = inject(UserService);
  // private _roleService = inject(RoleService);

  private currentUserSubject: BehaviorSubject<{ role: string } | null>;
  public currentUser: Observable<{ role: string } | null>;

  constructor(
    private localStorageService: LocalStorageService,
    private genericService: GenericService
  ) {
    const storedUser = this.localStorageService.GetItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;
    this.currentUserSubject = new BehaviorSubject<{ role: string } | null>(user);
    this.currentUser = this.currentUserSubject.asObservable();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Accessors
  // -----------------------------------------------------------------------------------------------------

  /**
   * Setter & getter for access token
   */
  set accessToken(token: string) {
    localStorage.setItem('accessToken', token);
  }

  get accessToken(): string {
    return localStorage.getItem('accessToken') ?? '';
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Forgot password
   *
   * @param email
   */
  // In auth.service.ts
  forgotPassword(email: string): Observable<any> {
    return this.genericService.Post('user/forget-password', { email }).pipe(
      catchError((error) => {
        console.error('Error in forgotPassword:', error);
        return throwError(() => new Error('Failed to send password reset email.'));
      })
    );
  }


  /**
   * Reset password
   *
   * @param password
   */
  resetPassword(payload: { newPassword: string }): Observable<any> {
    return this.genericService.Post(`user/reset-password`, payload); // Adjust the URL as necessary
  }

  /**
   * Sign in
   *
   * @param credentials
   */
  login(credentials: { email: string; password: string }): Observable<any> {
    return this.genericService.Post('user/login', credentials);
  }

  /**
   * Sign out
   */
  logout(): Observable<any> {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    this._authenticated = false;
    return of(true);
  }

  /**
   * Unlock session
   *
   * @param credentials
   */
  unlockSession(credentials: { email: string; password: string }): Observable<any> {
    return this._httpClient.post('api/auth/unlock-session', credentials);
  }

  /**
   * Check the authentication status
   */
  // check(): Observable<boolean> {
  //   if (this._authenticated) {
  //     return of(true);
  //   }

  //   if (!this.accessToken) {
  //     return of(false);
  //   }

  //   if (AuthUtils.isTokenExpired(this.accessToken)) {
  //     return of(false);
  //   }

  //   // Add a default return statement
  //   return of(false);
  // }



  /**
   * Decode JWT Token
   */
  // decodeToken(token: string): any {
  //   if (token) {
  //     const data = jwtDecode(token);
  //     if (data) {
  //       data['token'] = token;
  //       localStorage.setItem('user', JSON.stringify(data));
  //       return data;
  //     }
  //   }
  //   return null;
  // }

  /**
   * Get the current user
   */
  get currentUserValue(): { role: string } | null {
    return this.currentUserSubject.value;
  }

  getUser(): { role: string } | null {
    return this.currentUserValue;
  }
}
