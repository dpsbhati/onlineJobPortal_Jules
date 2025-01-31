import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { MaterialModule } from 'src/app/material.module';
@Component({
  selector: 'app-toastr',
  imports: [MaterialModule, CommonModule, ToastrModule],
  templateUrl: './toastr.component.html',
  styleUrl: './toastr.component.scss'
})
export class ToastrComponent {
  constructor(private toastr: ToastrService) {}

  showSuccess() {
    this.toastr.success('You are awesome!', 'Success!');
  }

  showError() {
    this.toastr.error('This is not good!', 'Oops!');
  }

  showWarning() {
    this.toastr.warning('You are being warned.', 'Alert!');
  }

  showInfo() {
    this.toastr.info('Just some information for you.');
  }
}


