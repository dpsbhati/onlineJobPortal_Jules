import { NavItem } from './nav-item/nav-item'
import { CreateJobPostingComponent } from 'src/app/pages/admin/create-job-posting/create-job-posting.component'
export const navItems: NavItem[] = [
  {
    navCap: 'Dashbord'
  },
  {
    displayName: 'Overview',
    iconName: 'home',
    route: '/dashboard'
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
  // {
  //   displayName: 'Applicant',
  //   iconName: 'dashboard',
  //   route: 'applicant'
  // },
  {
    displayName: 'Applications',
    iconName: 'dashboard',
    route: 'applications'
  },
  // {
  //   displayName: 'social media integration',
  //   iconName: 'dashboard',
  //   route: 'social-media-integration'
  // },

  {
    displayName: 'Job Postings',
    iconName: 'folder',
    route: '/menu-level',
    children: [
      {
        displayName: 'All Job Postings',
        iconName: 'point',
        route: 'job-list'
      },

      {
        displayName: 'Add New Job',
        iconName: 'point',
        route: 'create-job-posting'
      },

      {
        displayName: 'Categories',
        iconName: 'point',
        route: '/menu-2'
      },
      {
        displayName: 'Expired Job Postings',
        iconName: 'point',
        route: '/menu-2'
      }
    ]
  },

  {
    navCap: 'Settings'
  },
  {
    displayName: 'Notifications',
    iconName: 'notification',

    route: '/notifications'
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
    route: '/userlist'
    // chip: true,
    // chipClass: 'b-1 border-secondary text-secondary',
  }


];
const userRole = getUserRole(); // Retrieve the role

// Dynamically modify navItems based on the role
const filteredNavItems = navItems.filter(item => {
  if (userRole === 'admin') {
    // Admin: show everything, or add specific admin routes
    return true;
  } else if (userRole === 'applicant') {
    // Applicant: Hide 'Job Postings' and other admin items
    if (item.displayName === 'Job Postings' || item.displayName === 'Applications') {
      return true;
    }
    return false;
  }
  return true; // Default case: show everything
});

// Function to get role from localStorage
function getUserRole(): string {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.role || ''; // Return empty string if role is not found
}

console.log('test',filteredNavItems);
