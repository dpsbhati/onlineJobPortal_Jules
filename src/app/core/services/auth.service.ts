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
import { UserRole } from '../enums/roles.enum';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _authenticated: boolean = false;
  private _httpClient = inject(HttpClient);
  private _userService = inject(UserService);
  // private _roleService = inject(RoleService);

  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;

  constructor(
    private localStorageService: LocalStorageService,
    private genericService: GenericService
  ) {
    const storedUser = this.localStorageService.GetItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;
    this.currentUserSubject = new BehaviorSubject<any>(user);
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

  public setCurrentUser(user: any): Promise<void> {
    return new Promise((resolve) => {
      this._authenticated = true;
      localStorage.setItem('user', JSON.stringify(user));
      this.currentUserSubject.next(user);
      // Small delay to ensure storage is updated
      setTimeout(resolve, 100);
    });
  }

  get currentUserValue(): any {
    return this.currentUserSubject.value;
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

  registerUser(user: { id?: string; firstName: string; lastName: string; email: string; password: string; role: UserRole }): Observable<any> {
    return this.genericService.Post('user/register', user)
    // .pipe(
    //   catchError((error) => {
    //     console.error('Error in registerUser:', error);
    //     return throwError(() => new Error('Failed to register user.'));
    //   })
    // );
  }
  verifyEmail(payload: { token: string }): Observable<any> {
    return this.genericService.Post('user/verify-email', payload).pipe(
      catchError((error) => {
        console.error('Error in verifyEmail:', error);
        return throwError(() => new Error('Failed to verify email.'));
      })
    );
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
  getCurrentUser(): any {
    return this.currentUserSubject.value;
  }

  getUser(): any {
    return this.getCurrentUser();
  }

  setCurrentUserLocal(user: any): void {
    if (user) {
      this.localStorageService.SetItem('user', JSON.stringify(user));
    } else {
      this.localStorageService.RemoveItem('user');
    }
    this.currentUserSubject.next(user);
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === UserRole.ADMIN;
  }

  isApplicant(): boolean {
    const user = this.getCurrentUser();
    return user?.role === UserRole.APPLICANT;
  }
}
