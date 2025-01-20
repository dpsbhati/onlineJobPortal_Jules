import { Routes } from '@angular/router';
import { StarterComponent } from './starter/starter.component';

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
];
