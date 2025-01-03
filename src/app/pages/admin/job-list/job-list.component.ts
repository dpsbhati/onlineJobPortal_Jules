import { Component } from '@angular/core';
import { AdminService } from '../../../core/services/admin.service';
import { FormsModule, NgModel } from '@angular/forms';
import { CommonModule, NgFor } from '@angular/common';
@Component({
  selector: 'app-job-list',
  standalone: true,
  imports: [FormsModule, NgFor, CommonModule],
  templateUrl: './job-list.component.html',
  styleUrl: './job-list.component.css'
})
export class JobListComponent {
  jobs: any[] = [];

  constructor(private adminService :AdminService) {}

  ngOnInit(): void {
    this.adminService.getJobPostings().subscribe({
      next: (response: any) => {
        console.log(response)
        if (response.statusCode === 200) {
          this.jobs = response.data;
        }
      },
      
    });
  }

  getFeaturedImage(imagePath: string): string {
    return imagePath.startsWith('http') ? imagePath : 'https://example.com/' + imagePath;
  }
}