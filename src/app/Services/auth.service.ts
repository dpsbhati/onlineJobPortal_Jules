import { Injectable } from '@angular/core';
import { LocalStoargeService } from './local-stoarge.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private user: { role: string } | null = null;

  constructor(
   private localStorageService: LocalStoargeService
  ) {}

  login(userData: { role: string }) {
    this.user = userData; 
    localStorage.setItem('user', JSON.stringify(userData));
  }

  logout() {
    this.user = null;
    localStorage.removeItem('user');
  }

  getUser() {
    if (!this.user) {
      const storedUser = this.localStorageService.GetItem('user');
      this.user = storedUser ? JSON.parse(storedUser) : null;
    }
    return this.user;
  }
}
