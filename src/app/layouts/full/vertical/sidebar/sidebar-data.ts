import { NavItem } from './nav-item/nav-item';
import { CreateJobPostingComponent } from 'src/app/pages/admin/create-job-posting/create-job-posting.component';
export const navItems: NavItem[] = [
  {
    navCap: 'Dashbord',
  },
  {
    displayName: 'Overview',
    iconName: 'home',
    route: '/dashboard',
  },
  // {
  //   displayName: 'Login',
  //   iconName: 'lock',
  //   route: '/authentication/login',
  // },
  // {
  //   displayName: 'Register',
  //   iconName: 'user-edit',
  //   route: '/authentication/register',
  // },
  {
    navCap: 'ADMINISTRATION',
  },
  {
    displayName: 'Applications',
    iconName: 'dashboard',
    route: 'applications',
    // chip: true,
    // chipClass: 'bg-secondary text-white',
    // chipContent: '9',
  },
 
  {
    displayName: 'Job Postings',
    iconName: 'folder',
    route: '/menu-level',
    children: [
      {
        displayName: 'All Job Postings',
        iconName: '',
        route: 'job-list',
      },

      {
        displayName: 'Add New Job',
        iconName: '',
        route: 'create-job-posting',
      },
      {
        displayName: 'Categories',
        iconName: '',
        route: '/menu-2',
      },
      {
        displayName: 'Expired Job Postings',
        iconName: '',
        route: '/menu-2',
      },
    ],
  },
  {
    navCap: 'Settings',
  },
  {
    displayName: 'Notifications',
    iconName: 'notification',
    
    route: '/',
    // chip: true,
    // chipClass: 'b-1 border-secondary text-secondary',
    
  },
  {
    displayName: 'User',
    iconName: 'user',
    route: 'starter/edit-profile',
   
  },
];
