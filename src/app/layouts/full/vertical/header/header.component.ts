import {
  Component,
  Output,
  EventEmitter,
  Input,
  ViewEncapsulation,
  ViewChild,
} from '@angular/core';
import { CoreService } from 'src/app/services/core.service';
import { MatDialog } from '@angular/material/dialog';
import { navItems } from '../sidebar/sidebar-data';
import { TranslateService } from '@ngx-translate/core';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MaterialModule } from 'src/app/material.module';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { BrandingComponent } from '../sidebar/branding.component';
import { AppSettings } from 'src/app/config';
import { AuthService } from 'src/app/core/services/authentication/auth.service';
import { Router } from '@angular/router';
import { AppNavItemComponent } from '../sidebar/nav-item/nav-item.component';
import { SidebarService } from 'src/app/core/services/sidebar.service';
import { UserService } from 'src/app/core/services/user/user.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { AdminService } from 'src/app/core/services/admin/admin.service';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { WebsocketService } from 'src/app/core/services/websocket.service';

interface notifications {
  id: number;
  color: string;
  title: string;
  time: string;
  subtitle: string;
}

interface inbox {
  id: number;
  bgcolor: string;
  imagePath: string;
  title: string;
  time: string;
  subtitle: string;
}

interface profiledd {
  id: number;
  title: string;
  link: string;
  new?: boolean;
}

interface apps {
  id: number;
  icon: string;
  color: string;
  title: string;
  subtitle: string;
  link: string;
}

interface quicklinks {
  id: number;
  title: string;
  link: string;
}

@Component({
  selector: 'app-header',
  imports: [
    RouterModule,
    CommonModule,
    NgScrollbarModule,
    TablerIconsModule,
    MaterialModule,
    BrandingComponent,
  ],
  templateUrl: './header.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class HeaderComponent {
  @Input() showToggle = true;
  @Input() toggleChecked = false;
  @Output() toggleMobileNav = new EventEmitter<void>();
  @Output() toggleMobileFilterNav = new EventEmitter<void>();
  @Output() toggleCollapsed = new EventEmitter<void>();

  userName: string = '';
  userEmail: string = '';
  isCollapse: boolean = false; // Initially hidden
  notificationlist: any;
  total: any;
  currentUserId: any;
  toggleCollpase() {
    this.isCollapse = !this.isCollapse; // Toggle visibility
  }
   private notificationSub?: Subscription;
  private totalSub?: Subscription;
  pageConfig: any = {
    curPage: 1,
    perPage: 10,
    sortBy: 'created_at',
    direction: 'desc',
    whereClause: [],
  };
  showFiller = false;

  public selectedLanguage: any = {
    language: 'English',
    code: 'en',
    type: 'US',
    icon: '/assets/images/flag/icon-flag-en.svg',
  };

  public languages: any[] = [
    {
      language: 'English',
      code: 'en',
      type: 'US',
      icon: '/assets/images/flag/icon-flag-en.svg',
    },
    {
      language: 'Español',
      code: 'es',
      icon: '/assets/images/flag/icon-flag-es.svg',
    },
    {
      language: 'Français',
      code: 'fr',
      icon: '/assets/images/flag/icon-flag-fr.svg',
    },
    {
      language: 'German',
      code: 'de',
      icon: '/assets/images/flag/icon-flag-de.svg',
    },
  ];

  @Output() optionsChange = new EventEmitter<AppSettings>();

  options = this.settings.getOptions();

  isCollapsed: boolean = false; // Initially hidden

  constructor(
    private settings: CoreService,
    private vsidenav: CoreService,
    public dialog: MatDialog,
    private translate: TranslateService,
    private authService: AuthService,
    private _router: Router,
    private sidebarService: SidebarService,
    private userService: UserService,
    private loader: LoaderService,
    private adminService: AdminService,
    private toastr: ToastrService,
    private websocketService: WebsocketService,
  ) {
    translate.setDefaultLang('en');
    this.loadUserName();
  }

  ngOnInit() {
    this.sidebarService.setCollapsed(this.isCollapsed);
    const userString = localStorage.getItem('user');

    if (userString) {
      try {
        const parsedUser = JSON.parse(userString);
        this.userName = parsedUser?.userProfile?.first_name || 'User';
        this.userEmail = parsedUser?.email || '';
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
      }
    }

    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        this.currentUserId = user.id;
      } catch (error) {
        this.currentUserId = null;
      }
    }
    this.loadUserData();
    // this.onPagination();
      this.notificationSub = this.websocketService.notificationList$.subscribe(list => {
      this.notificationlist = list;
    });

    this.totalSub = this.websocketService.total$.subscribe(count => {
      this.total = count;
    });

    // Initial load of notifications
    this.websocketService.onPagination();
  }

    ngOnDestroy() {
    this.notificationSub?.unsubscribe();
    this.totalSub?.unsubscribe();
  }

 navigateToNotification(type: string | undefined, application_id?: string, job_id?: string) {
  if (!type) return;

  switch (type) {
    case 'job_application':
    case 'application_cancelled':
      // Yeh teenon ke liye application_id jayegi
      if (application_id) {
        this._router.navigate(['/applicant-details', application_id]);
      } 
      break;

    case 'application_status_update':
      if(application_id){
        this._router.navigate(['Applied-Status',application_id])
      }
      break;

    case 'job_expired':
    case 'job_posting':
      // Yeh dono ke liye job_id jayegi
      if (job_id) {
        // Note: aapke route me spelling dikkat na ho, 'job-expired' vs 'job_expired'
        if(type === 'job_expired'){
          this._router.navigate(['/job-post-details', job_id]);
        } else {
          this._router.navigate(['/authentication/Job-Details', job_id]);
        }
      }
      break;

    default:
      console.warn('No route mapped for notification type:', type);
  }
}


  loadUserData(): void {
    const userString = localStorage.getItem('user');

    if (userString) {
      try {
        const parsedUser = JSON.parse(userString);
        const userId = parsedUser?.id; // Assuming `id` is available in the user object
        if (userId) {
          this.userService.getUserById(userId).subscribe({
            next: (response: any) => {
              if (response.statusCode === 200 && response.data) {
                const data = response.data;
                const firstName = data.first_name || 'User';
                const lastName = data.last_name || '';
                this.userName = `${firstName} ${lastName}`.trim();
                this.userEmail = data.user?.email || '';
              } else {
                console.error(
                  'Error fetching user profile data:',
                  response.message
                );
              }
            },
            error: (error: any) => {
              console.error('Error fetching user profile data:', error);
            },
          });
        }
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
      }
    }
  }

  onPagination(): void {
    this.loader.show();
    this.pageConfig.whereClause = [
      {
        key: 'user_id',
        value: this.currentUserId,
        operator: '=',
      },
    ];
    this.adminService.notificationPagination(this.pageConfig).subscribe({
      next: (res: any) => {
        if (res.statusCode === 200) {
          this.notificationlist = res.data;
          this.total = res.count || 0;
          this.loader.hide();
        } else {
          this.notificationlist = [];
          this.total = 0;
          this.loader.hide();
        }
      },
      error: (err: any) => {
        this.loader.hide();
        this.toastr.error(err?.error?.message);
        this.notificationlist = [];
        this.total = 0;
      },
    });
  }

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
    this.sidebarService.setCollapsed(this.isCollapsed); // Share value
  }

  openDialog() {
    const dialogRef = this.dialog.open(AppSearchDialogComponent);

    dialogRef.afterClosed().subscribe((result) => {});
  }

  changeLanguage(lang: any): void {
    this.translate.use(lang.code);
    this.selectedLanguage = lang;
  }

  setlightDark(theme: string) {
    this.options.theme = theme;
    this.emitOptions();
  }

  private emitOptions() {
    this.optionsChange.emit(this.options);
  }

  private loadUserName() {
    const currentUser = this.authService.currentUserValue;
    if (currentUser && currentUser.userProfile) {
      const firstName = currentUser.userProfile.first_name;
      const lastName = currentUser.userProfile.last_name;
      this.userName = `${firstName} ${lastName}`.trim();
    }
  }

  notifications: notifications[] = [
    {
      id: 1,
      color: 'primary',
      time: '9:00 AM',
      title: 'Job Created',
      subtitle: 'New job posting for “Chief Engineer” created.',
    },
    {
      id: 2,
      color: 'success',
      time: '8:45 AM',
      title: 'Application Received',
      subtitle: 'You have received 3 new applications.',
    },
    {
      id: 4,
      color: 'warning',
      time: '8:00 AM',
      title: 'Job Updated',
      subtitle: '“First Officer” job post details modified.',
    },
  ];

  inbox: inbox[] = [
    {
      id: 1,
      bgcolor: 'bg-success',
      imagePath: 'assets/images/profile/user-6.jpg',
      time: 'just now',
      title: 'Michell Flintoff',
      subtitle: 'You: Yesterdy was great...',
    },
    {
      id: 2,
      bgcolor: 'bg-success',
      imagePath: 'assets/images/profile/user-2.jpg',
      time: '5 mins ago',
      title: 'Bianca Anderson',
      subtitle: 'Nice looking dress you...',
    },
    {
      id: 3,
      bgcolor: 'bg-success',
      imagePath: 'assets/images/profile/user-3.jpg',
      time: '10 mins ago',
      title: 'Andrew Johnson',
      subtitle: 'Sent a photo',
    },
    {
      id: 4,
      bgcolor: 'bg-success',
      imagePath: 'assets/images/profile/user-4.jpg',
      time: 'days ago',
      title: 'Marry Strokes',
      subtitle: 'If I don’t like something',
    },
    {
      id: 5,
      bgcolor: 'bg-success',
      imagePath: 'assets/images/profile/user-5.jpg',
      time: 'year ago',
      title: 'Josh Anderson',
      subtitle: '$230 deducted from account',
    },
  ];

  profiledd: profiledd[] = [
    {
      id: 6,
      title: 'Sign Out',
      link: '/authentication/login',
    },
  ];

  signOut(): void {
    // Clear all authentication data
    localStorage.clear();

    // Clear specific items to ensure they're removed
    localStorage.removeItem('rememberedEmail');
    localStorage.removeItem('rememberedPassword');
    localStorage.removeItem('rememberDevice');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');

    // Navigate to login
    this._router.navigate(['/home']);
  }

  apps: apps[] = [
    {
      id: 1,
      icon: 'message',
      color: 'primary',
      title: 'Chat Application',
      subtitle: 'Messages & Emails',
      link: '/',
    },
    {
      id: 2,
      icon: 'list-check',
      color: 'secondary',
      title: 'Todo App',
      subtitle: 'Completed task',
      link: '/',
    },
    {
      id: 3,
      icon: 'file-invoice',
      color: 'success',
      title: 'Invoice App',
      subtitle: 'Get latest invoice',
      link: '/',
    },
    {
      id: 4,
      icon: 'calendar',
      color: 'error',
      title: 'Calendar App',
      subtitle: 'Get Dates',
      link: '/',
    },
    {
      id: 5,
      icon: 'device-mobile',
      color: 'warning',
      title: 'Contact Application',
      subtitle: '2 Unsaved Contacts',
      link: '/',
    },
    {
      id: 6,
      icon: 'ticket',
      color: 'primary',
      title: 'Tickets App',
      subtitle: 'Create new ticket',
      link: '/',
    },
    {
      id: 7,
      icon: 'mail',
      color: 'secondary',
      title: 'Email App',
      subtitle: 'Get new emails',
      link: '/',
    },
    {
      id: 8,
      icon: 'book-2',
      color: 'warning',
      title: 'Courses',
      subtitle: 'Create new course',
      link: '/',
    },
  ];
  quicklinks: quicklinks[] = [
    {
      id: 1,
      title: 'Pricing Page',
      link: '/',
    },
    {
      id: 2,
      title: 'Authentication Design',
      link: '/',
    },
    {
      id: 3,
      title: 'Register Now',
      link: '/authentication/register',
    },
    {
      id: 4,
      title: '404 Error Page',
      link: '/authentication/error',
    },
    {
      id: 5,
      title: 'Notes App',
      link: '/',
    },
    {
      id: 6,
      title: 'Employee App',
      link: '/',
    },
    {
      id: 7,
      title: 'Todo Application',
      link: '/',
    },
  ];
}

@Component({
  selector: 'search-dialog',
  imports: [RouterModule, MaterialModule, TablerIconsModule, FormsModule],
  templateUrl: 'search-dialog.component.html',
})
export class AppSearchDialogComponent {
  searchText: string = '';
  navItems = navItems;

  navItemsData = navItems.filter((navitem) => navitem.displayName);
}
