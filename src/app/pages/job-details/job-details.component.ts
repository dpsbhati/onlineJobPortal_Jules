import { Component } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router';
import { TablerIconsModule } from 'angular-tabler-icons'
import { MaterialModule } from 'src/app/material.module'

@Component({
  selector: 'app-job-details',
  imports: [
    MaterialModule,TablerIconsModule
  ],
  templateUrl: './job-details.component.html',
  styleUrl: './job-details.component.scss'
})
export class JobDetailsComponent {
  
  
    constructor(
      private router: Router,
     
    ) {
    }
  goBack() {
    this.router.navigate(['/home']);
  }
  jobDetails = {
    title: 'Senior Frontend Developer',
    employer: 'TechNova Solutions Pvt. Ltd.',
    address: 'Bengaluru, India',
    assignment_duration: '6 Months (Extendable)',
    short_description:
      'Join our frontend team to develop UI for our web applications.',
    full_description:
      'We are looking for a frontend developer who can create pixel-perfect UIs using Angular and modern web technologies...',
    featured_image: 'https://images.pexels.com/photos/674010/pexels-photo-674010.jpeg?cs=srgb&dl=pexels-anjana-c-169994-674010.jpg&fm=jpg',
    job_type: 'Full-Time',
    start_salary: 80000,
    end_salary: 120000,
    deadline: new Date('2025-07-10'),
    required_experience: '3+ Years',
    posted_date: new Date('2025-05-10')
  }

  formattedSkills = ['Angular', 'TypeScript', 'HTML/CSS', 'RxJS', 'REST API']
}

