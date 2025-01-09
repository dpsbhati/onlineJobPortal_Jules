import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { NotifyService } from '../../../core/services/notify.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-view-job',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-job.component.html',
  styleUrls: ['./view-job.component.css']
})
export class ViewJobComponent implements OnInit {
  jobDetails: any;
  loading: boolean = true;
  error: string = '';
  id:any;
  
  constructor(
    private route: ActivatedRoute,
    private adminService: AdminService,
    private router: Router,
    private notifyService: NotifyService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id') as string;
    if (this.id) {
      this.loadJobDetails(this.id);
    }
  }

  loadJobDetails(id: string): void { 
    this.spinner.show();
    this.adminService.getJobById(id).subscribe({
      next: (response: any) => {
        if (response.statusCode === 200 && response.data) {
          this.jobDetails = response.data;  // Assigning to component property
          this.spinner.hide();
        } else {
          this.spinner.hide();
          this.notifyService.showError(response.message);
        }
      },
      error: (error) => {
        this.spinner.hide();
        this.notifyService.showError(error?.error?.message);
        console.error('Error:', error);
      }
    });
  }

  goBack() {
    this.router.navigate(['/job-list']);
  }
   
  navigate(){
    this.router.navigate([`/user-details/${this.id}`]);
  }
}
