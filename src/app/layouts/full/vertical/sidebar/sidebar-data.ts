import { NavItem } from './nav-item/nav-item'
import { CreateJobPostingComponent } from 'src/app/pages/admin/create-job-posting/create-job-posting.component'
export const navItems: NavItem[] = [
  {
    navCap: 'Dashbord'
  },
  {
    displayName: 'Overview',
    iconName: 'home',
    route: '/dashboard',
    visibleForRoles: ['admin', 'applicant']
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
    navCap: 'ADMINISTRATION'
  },
  {
    displayName: 'Job List',
    iconName: 'dashboard',
    route: 'applicant',
    visibleForRoles: ['applicant']
  },
  {
    displayName: 'Applied Applications',
    iconName: 'dashboard',
    route: 'Applied-Applications',
    visibleForRoles: ['applicant']
  },
  {
    displayName: 'View Applications',
    iconName: 'dashboard',
    route: 'applications',
    visibleForRoles: ['admin']
  },
  // {
  //   displayName: 'social media integration',
  //   iconName: 'dashboard',
  //   route: 'social-media-integration'
  // },
  // {
  //   displayName: 'All Job Postings',
  //   iconName: 'point',
  //   route: 'job-list',
  //   visibleForRoles: ['applicant']
  // },

  {
    displayName: 'Job Postings',
    iconName: 'folder',
    route: '/menu-level',
   visibleForRoles: ['admin'],
    children: [
      {
        displayName: 'All Job Postings',
        iconName: 'point',
        route: 'job-list',
        visibleForRoles: ['admin']
      },

      {
        displayName: 'Add New Job',
        iconName: 'point',
        route: 'create-job-posting',
        visibleForRoles: ['admin']
      },

      // {
      //   displayName: 'Categories',
      //   iconName: 'point',
      //   route: '/menu-2',
      //   visibleForRoles: ['admin']
      // },
      {
        displayName: 'Expired Job Postings',
        iconName: 'point',
        route: 'expired-job-posting',
        visibleForRoles: ['admin']
      }
    ]
  },

  {
    navCap: 'Settings'
  },
  {
    displayName: 'Notifications',
    iconName: 'notification',

    // route: '/notifications',
    route: 'authentication/Development-page',
    visibleForRoles: ['admin', 'applicant']
    // chip: true,
    // chipClass: 'b-1 border-secondary text-secondary',
  },
  // {
  //   displayName: 'User',
  //   iconName: 'user',
  //   route: 'starter/edit-profile',

  // },
  {
    displayName: 'User',
    iconName: 'user',
    // route: '/userlist',
    route: 'authentication/Development-page',
    visibleForRoles: ['admin']
    // chip: true,
    // chipClass: 'b-1 border-secondary text-secondary',
  }


];
// Get the user role dynamically (e.g., from localStorage)
const userRole = getUserRole(); // Retrieve the role

// Dynamically modify navItems based on the role
const filteredNavItems = navItems.filter(item => {

  // If the item has the 'visibleForRoles' property, filter it based on the role
  if (item.visibleForRoles) {
    return item.visibleForRoles.includes(userRole); // Show only if the role is in the list
  }

  // If the 'visibleForRoles' property is not defined, show the item
  return true;
});

// Function to get role from localStorage
function getUserRole(): string {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.role || ''; // Return empty string if role is not found
}
