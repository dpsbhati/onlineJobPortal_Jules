// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-applied-applications',
//   imports: [],
//   templateUrl: './applied-applications.component.html',
//   styleUrl: './applied-applications.component.scss'
// })
// export class AppliedApplicationsComponent {

// }
// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-social-media-integration',
//   imports: [],
//   templateUrl: './social-media-integration.component.html',
//   styleUrl: './social-media-integration.component.scss'
// })
// export class SocialMediaIntegrationComponent {

// }

// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-applicant',
//   imports: [],
//   templateUrl: './applicant.component.html',
//   styleUrl: './applicant.component.scss'
// })
// export class ApplicantComponent {

// }
import { Component, OnInit, ViewChild } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatCardModule } from '@angular/material/card'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatIconModule } from '@angular/material/icon'
import { MatButtonModule } from '@angular/material/button'
import { MatTableModule } from '@angular/material/table'
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator'
import { MatTableDataSource } from '@angular/material/table'
import { MatMenuModule } from '@angular/material/menu'
import { MatSelectModule } from '@angular/material/select'

@Component({
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    MatMenuModule,
    MatSelectModule
  ],
  selector: 'app-applied-applications',
  templateUrl: './applied-applications.component.html',
  styleUrl: './applied-applications.component.scss'
})
export class AppliedApplicationsComponent implements OnInit {
  displayedColumns: string[] = [
    'title',
    'employer',
    'jobType',
    'publishedDate',
    'deadline',
    'startSalary',
    'endSalary',
    'city',
    'jobPost',
    'action'
  ]
  dataSource = new MatTableDataSource<any>([
    {
      title: 'Amit Sharma',
      employer: 'TCS',
      jobType: 'Full-time',
      publishedDate: '2024-10-01',
      deadline: '2024-10-15',
      startSalary: '₹3,66,000',
      endSalary: '₹5,37,000',
      city: 'New Delhi',
      jobPost: 'Frontend Developer',
  
    },
    {
      title: 'Neha Verma',
      employer: 'Infosys',
      jobType: 'Part-time',
      publishedDate: '2024-09-20',
      deadline: '2024-10-10',
      startSalary: '₹4,00,000',
      endSalary: '₹6,00,000',
      city: 'New Delhi',
      jobPost: 'UI Designer',
    }
  ])

  @ViewChild(MatPaginator) paginator!: MatPaginator

  ngOnInit () {
    this.dataSource.paginator = this.paginator
  }

  applyFilter (filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase()
  }

  openDialog (action: string, element: any) {
    console.log(action, element)
    // Dialog open logic yahan add kar sakte ho
  }
}
