import { Injectable } from '@angular/core';
import { ToastrService } from "ngx-toastr";

@Injectable({
  providedIn: 'root'
})
export class NotifyService {
  constructor(private toastr: ToastrService) {}

  showSuccess(message: string) {
    this.toastr.success(message, '', {
      enableHtml: true,
      toastClass: 'toast-success custom-toast'
    });
  }

  showError(message: string) {
    this.toastr.error(message, '', {
      enableHtml: true,
      toastClass: 'toast-error custom-toast highlight-error',
      timeOut: 5000
    });
  }

  showInfo(message: string) {
    this.toastr.info(message, '', {
      enableHtml: true,
      toastClass: 'toast-info custom-toast'
    });
  }

  showWarning(message: string) {
    this.toastr.warning(message, '', {
      enableHtml: true,
      toastClass: 'toast-warning custom-toast'
    });
  }
}
