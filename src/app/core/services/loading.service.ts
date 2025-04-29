import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  busyRequestCount = 0;
  private loading: boolean = false;

  constructor() { }

  
  start() {
    this.loading = true;
    // console.log('Loading started:', this.isLoading()); // Log loading state
  }

  stop() {
    this.loading = false;
    // console.log('Loading stop:', this.isLoading());
  }

  isLoading(): boolean {
    return this.loading;
  }
}
