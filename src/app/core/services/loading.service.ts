import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  busyRequestCount = 0;
  private loading: boolean = false;
  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  busy(): void {
    this.loadingSubject.next(true);
  }

  idle(): void {
    this.loadingSubject.next(false);
  }

  constructor() { }

  
  start() {
    this.loading = true;
  }

  stop() {
    this.loading = false;
  }

  isLoading(): boolean {
    return this.loading;
  }
}
