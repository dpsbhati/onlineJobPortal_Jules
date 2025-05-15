import { CommonModule } from '@angular/common'
import { Component } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatSelectModule } from '@angular/material/select'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatSidenavModule } from '@angular/material/sidenav';
import { Router } from '@angular/router'

@Component({
  selector: 'app-home',
  // imports: [TablerIconsModule, MaterialModule, BrandingComponent],
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,MatSidenavModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  ranks = ['Captain', 'Chief Engineer', 'Oiler']
  employers = ['Maersk', 'Anglo-Eastern', 'Bernhard Schulte']
  locations = ['India', 'Philippines', 'Greece']

  selectedRank = ''
  selectedEmployer = ''
  selectedLocation = ''
  keyword = ''
   constructor(private router: Router,



    ){}


  goToLogin() {
  this.router.navigate(['/authentication/login']);
}
}
