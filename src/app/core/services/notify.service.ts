import { Injectable } from '@angular/core';
import { ToastrService } from "ngx-toastr";
@Injectable({
  providedIn: 'root'
})
export class NotifyService {
  constructor(private toastr: ToastrService) {}

  showSuccess(msg: any) {
    this.toastr.success(msg ,"Success");
  }
  showWarning(msg: any) {
    this.toastr.warning("Warning", msg);
  }
  showError(msg: any) {
    this.toastr.error("Error", msg);
  }
}
