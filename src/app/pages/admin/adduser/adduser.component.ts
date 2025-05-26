import { Component } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { Router } from '@angular/router'
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
 // MatError comes with MatFormFieldModule

@Component({
  selector: 'app-adduser',
  imports: [MatCardModule, MatIconModule ,MatButtonModule,MatFormFieldModule , MatInputModule,
    ReactiveFormsModule,],
  templateUrl: './adduser.component.html',
  styleUrl: './adduser.component.scss'
})
export class AdduserComponent {
  constructor (private router: Router) {}
  goBack (): void {
    this.router.navigate(['userlist'])
  }
}
