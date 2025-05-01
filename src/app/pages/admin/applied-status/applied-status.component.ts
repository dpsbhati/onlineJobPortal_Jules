import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule, MatFabButton } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterModule } from '@angular/router';
import { TablerIconsModule } from 'angular-tabler-icons';
import { ToastrModule } from 'ngx-toastr';
import { MaterialModule } from 'src/app/material.module';

@Component({
  selector: 'app-applied-status',
 imports: [
     CommonModule,
     FormsModule,
     RouterModule,
     TablerIconsModule,
     MaterialModule,
     ToastrModule,
     MatButtonModule,
     MatInputModule
   ],
  //  imports: [MatButtonModule, MatIconModule, TablerIconsModule],

  templateUrl: './applied-status.component.html',
  styleUrl: './applied-status.component.scss'
})
export class AppliedStatusComponent {
    constructor(
    
      private router: Router,
     
    ) {
    
    }
  goBack() {
    this.router.navigate(['/Applied-Applications']);
  }
}
