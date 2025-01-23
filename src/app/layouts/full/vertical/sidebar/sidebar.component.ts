import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { TablerIconsModule } from 'angular-tabler-icons';
import { AuthService } from 'src/app/core/services/authentication/auth.service';
import { MaterialModule } from 'src/app/material.module';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [TablerIconsModule, MaterialModule, CommonModule],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent implements OnInit {
  userName: string = '';
  
  constructor(
    private authService: AuthService
  ) {}

  @Input() showToggle = true;
  @Output() toggleMobileNav = new EventEmitter<void>();
  @Output() toggleCollapsed = new EventEmitter<void>();

  ngOnInit(): void {
    this.loadUserName();
  }

  private loadUserName() {
    const currentUser = this.authService.currentUserValue;
    if (currentUser && currentUser.userProfile) {
      const firstName = currentUser.userProfile.first_name;
      const lastName = currentUser.userProfile.last_name;
      this.userName = `${firstName} ${lastName}`.trim();
    }
  }
}
