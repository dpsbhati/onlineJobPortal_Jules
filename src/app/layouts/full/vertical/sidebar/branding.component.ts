import { Component } from '@angular/core'
import { RouterModule } from '@angular/router'
import { CoreService } from 'src/app/services/core.service'

@Component({
  selector: 'app-branding',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="branding d-none d-lg-flex align-items-center justify-content-center">
      <a [routerLink]="['/']" class="d-flex align-items-center">
        <span class="branding-text  mt-2 f-w-100">
          <img class="logo1"
            src="./assets/images/logos/Navilandslogo.svg" 
            style="object-fit: contain; width: 250px; height: 40px;
            "
          />
          <img class="logo2"
            src="./assets/images/logos/Navilands Faci.svg"
            style="background-color: white; border-radius: 50%; max-width: 100px; max-height: 40px; object-fit: contain;"
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
    `
  ]
})
export class BrandingComponent {
  options = this.settings.getOptions()

  constructor (private settings: CoreService) {}
}
