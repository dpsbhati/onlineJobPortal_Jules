import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CoreService } from 'src/app/services/core.service';

@Component({
  selector: 'app-branding',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div
      class="branding d-none d-lg-flex align-items-center justify-content-left"
    >
      <a (click)="onLogoClick()" class="d-flex align-items-center">
        <span class="branding-text f-w-100">
          <img
            class="logo1"
            src="./assets/images/logos/Navilands logo - Light3.svg"
            style="object-fit: contain;"
          />
          <img
            class="logo2"
            src="./assets/images/logos/Navilands logo - Icon.svg"
            style="width: 35px; max-height: 40px; object-fit: contain;background: #fff; border-radius: 100px;"
            alt="Navilands Logo"
          />
        </span>
      </a>
    </div>
  `,
  styles: [
    `
      .branding img {
        max-width: 130px;
        width: 200px;
        object-fit: fill;
      }
      .branding-text {
        font-size: 25px;
        color: #fff;
        font-weight: 500; /* Optional: make text slightly bold */
      }

      .branding a {
        text-decoration: none; /* Remove underline from the link */
      }

      .d-flex {
        display: flex;
      }

      .align-items-center {
        align-items: center;
      }

      .ms-2 {
        margin-left: 0.5rem; /* Add spacing between the image and the text */
      }
    `,
  ],
})
export class BrandingComponent {
  options = this.settings.getOptions();
   userRole: string | null = null;

  constructor(private settings: CoreService, private router: Router) {
     this.loadUserRole();
  }

   loadUserRole() {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        this.userRole = user.role || null;
      }
    } catch (e) {
      this.userRole = null;
      console.error('Error parsing user data from localStorage', e);
    }
  }

  onLogoClick(): void {
    if (this.userRole === 'admin') {
      this.router.navigate(['/dashboard']);
    } else if (this.userRole === 'applicant') {
      this.router.navigate(['/Applied-Applications']);
    } else {
      this.router.navigate(['/']);
    }
  }

}
