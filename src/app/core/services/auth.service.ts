import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { LocalStoargeService } from './local-stoarge.service';


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<{ role: string } | null>;
  public currentUser: Observable<{ role: string } | null>;

  constructor(private localStorageService: LocalStoargeService) {
    const storedUser = this.localStorageService.GetItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;
    this.currentUserSubject = new BehaviorSubject<{ role: string } | null>(user);
    this.currentUser = this.currentUserSubject.asObservable();
  }

  login(userData: { role: string }) {
    localStorage.setItem('user', JSON.stringify(userData));
    this.currentUserSubject.next(userData);
  }

  logout() {
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  get currentUserValue(): { role: string } | null {
    return this.currentUserSubject.value;
  }

  getUser(): { role: string } | null {
    return this.currentUserValue;
  }
}
