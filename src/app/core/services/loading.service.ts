import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  busyRequestCount = 0;
  private loading: boolean = false;

  constructor(private spinner: NgxSpinnerService) { }

  busy() {
    this.busyRequestCount++;
    this.spinner;
    this.spinner.show(undefined,
      {
        type: 'ball-scale-ripple',
        bdColor: 'rgba(0,0,0,0.8)',
        color: "#fff",
        size: 'default',
      })

  }

  idle() {
    this.busyRequestCount--;
    if (this.busyRequestCount <= 0) {
      this.busyRequestCount = 0;
      this.spinner.hide();
    }
  }
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
