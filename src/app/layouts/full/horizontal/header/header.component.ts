import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CoreService } from 'src/app/services/core.service';
import { MatDialog } from '@angular/material/dialog';
import { navItems } from '../../vertical/sidebar/sidebar-data';
import { TranslateService } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MaterialModule } from 'src/app/material.module';
import { BrandingComponent } from '../../vertical/sidebar/branding.component';
import { FormsModule } from '@angular/forms';
import { AppSettings } from 'src/app/config';


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
  selector: 'app-horizontal-header',
  imports: [RouterModule, TablerIconsModule, MaterialModule, BrandingComponent],
  templateUrl: './header.component.html',
})
export class AppHorizontalHeaderComponent {
  @Input() showToggle = true;
  @Input() toggleChecked = false;
  @Output() toggleMobileNav = new EventEmitter<void>();
  @Output() toggleMobileFilterNav = new EventEmitter<void>();
  @Output() toggleCollapsed = new EventEmitter<void>();


  isCollapse: boolean = false; // Initially hidden

  toggleCollpase() {
    this.isCollapse = !this.isCollapse; // Toggle visibility
  }

  showFiller = false;

  @Output() optionsChange = new EventEmitter<AppSettings>();
  
    options = this.settings.getOptions();
  
    constructor(
      private settings: CoreService,
      public dialog: MatDialog,
      private translate: TranslateService
    ) {
      translate.setDefaultLang('en');
    }
  
    openDialog() {
      const dialogRef = this.dialog.open(AppHorizontalSearchDialogComponent);
  
      dialogRef.afterClosed().subscribe((result) => {
      });
    }
    private emitOptions() {
      this.optionsChange.emit(this.options);
    }

  profiledd: profiledd[] = [
    {
      id: 1,
      title: 'My Profile',
      link: '/',
    },
    {
      id: 2,
      title: 'My Projects',
      link: '/',
    },
   
  ];
}

@Component({
  selector: 'app-search-dialog',
  imports: [RouterModule, MaterialModule, TablerIconsModule, FormsModule],
  templateUrl: 'search-dialog.component.html',
})
export class AppHorizontalSearchDialogComponent {
  searchText: string = '';
  navItems = navItems;
  navItemsData = navItems.filter((navitem) => navitem.displayName);
}
