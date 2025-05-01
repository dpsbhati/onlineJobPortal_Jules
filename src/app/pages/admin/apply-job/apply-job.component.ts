import { Component } from '@angular/core'
import { Router } from '@angular/router'
import { TablerIconsModule } from 'angular-tabler-icons'
import { ToastrModule } from 'ngx-toastr'
import { MaterialModule } from 'src/app/material.module'

@Component({
  selector: 'app-apply-job',
  imports: [TablerIconsModule,
     MaterialModule,ToastrModule],
  templateUrl: './apply-job.component.html',
  styleUrl: './apply-job.component.scss'
})
export class ApplyJobComponent {
  constructor (private router: Router) {}
  goBack () {
    this.router.navigate(['/applicant'])
  }
}
