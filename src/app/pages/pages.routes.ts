import { Routes } from '@angular/router';
import { StarterComponent } from './starter/starter.component';
import { CreateJobPostingComponent } from './admin/create-job-posting/create-job-posting.component';
export const PagesRoutes: Routes = [
  {
    path: '',
    component: StarterComponent,
    data: {
      title: 'Administration',
      urls: [
        { title: 'Applications', url: '/starter' },
        { title: 'Applications List' },
      ],
    },
  },
  {
    path: 'createjob',
    component : CreateJobPostingComponent
  }
];
