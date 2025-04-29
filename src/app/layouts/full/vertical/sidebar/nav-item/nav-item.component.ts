import {
  Component,
  HostBinding,
  Input,
  OnInit,
  OnChanges,
  Output,
  EventEmitter
} from '@angular/core'
import { NavItem } from './nav-item'
import { Router } from '@angular/router'
import { NavService } from '../../../../../services/nav.service'
import { animate, state, style, transition, trigger } from '@angular/animations'
import { TranslateModule } from '@ngx-translate/core'
import { TablerIconsModule } from 'angular-tabler-icons'
import { MaterialModule } from 'src/app/material.module'
import { CommonModule } from '@angular/common'
import { SidebarService } from 'src/app/core/services/sidebar.service'

@Component({
  selector: 'app-nav-item',
  imports: [TranslateModule, TablerIconsModule, MaterialModule, CommonModule],
  templateUrl: './nav-item.component.html',
  styleUrls: [],
  animations: [
    trigger('indicatorRotate', [
      state('collapsed', style({ transform: 'rotate(0deg)' })),
      state('expanded', style({ transform: 'rotate(180deg)' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4,0.0,0.2,1)')
      )
    ])
  ]
})
export class AppNavItemComponent implements OnChanges {
  @Output() toggleMobileLink: any = new EventEmitter<void>()
  @Output() notify: EventEmitter<boolean> = new EventEmitter<boolean>()

  expanded: any = true
  disabled: any = false
  twoLines: any = false
  @HostBinding('attr.aria-expanded') ariaExpanded = this.expanded
  @Input() item: NavItem | any
  @Input() depth: any

  isCollapsed: boolean = false
  userRole: any
window: any

  constructor (
    public sidebarService: SidebarService,
    public navService: NavService,
    public router: Router
  ) {
    if (this.depth === undefined) {
      this.depth = 0
    }
  }

  ngOnInit(): void {
    this.sidebarService.isCollapsed$.subscribe((value) => {
      this.isCollapsed = value;
    });
    this.userRole = this.getUserRole();  // Get user role when the component is initialized
  }
  ngOnChanges () {
    const url = this.navService.currentUrl()
    if (this.item.route && url) {
      this.expanded = url.indexOf(`/${this.item.route}`) === 0
      this.ariaExpanded = this.expanded
    }
  }

  onItemSelected (item: NavItem) {
    if (!item.children || !item.children.length) {
      this.router.navigate([item.route])
    }
    if (item.children && item.children.length) {
      this.expanded = !this.expanded
    }
    //scroll
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth'
    })
    if (!this.expanded) {
      if (window.innerWidth < 1024) {
        this.notify.emit()
      }
    }
  }

  onSubItemSelected (item: NavItem) {
    if (!item.children || !item.children.length) {
      if (this.expanded && window.innerWidth < 1024) {
        this.notify.emit()
      }
    }
  }
  getUserRole(): string {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.role || ''; // Return role from localStorage
  }

  // Check if the item should be visible based on the user role
  isVisibleForRole(item: NavItem): boolean {
    if (item.visibleForRoles) {
      return item.visibleForRoles.includes(this.userRole);
    }
    return true; // Default: visible for all roles
  }
  trackById(index: number, item: NavItem): string {
    if (item.route) {
      return item.route; // If route is not undefined, return it
    }
    return ''; // Or provide a fallback value, like an empty string
  }
}
