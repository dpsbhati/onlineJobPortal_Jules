import { Component, ViewEncapsulation } from '@angular/core'
import { OnInit, ViewChild } from '@angular/core'
import { MatDatepickerModule } from '@angular/material/datepicker'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatPaginatorModule } from '@angular/material/paginator'
import { MatSortModule } from '@angular/material/sort'
import { MaterialModule } from 'src/app/material.module'
import { provideNativeDateAdapter } from '@angular/material/core'
import { MatSliderModule } from '@angular/material/slider'
import { MatPaginator } from '@angular/material/paginator'
import { MatSort } from '@angular/material/sort'
import { MatTableDataSource } from '@angular/material/table'

@Component({
  selector: 'app-job-postings',
  imports: [
    MaterialModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatSliderModule
  ],
  providers: [provideNativeDateAdapter()],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './job-postings.component.html',
  styleUrl: './job-postings.component.scss'
})
export class JobPostingsComponent {
  displayedColumns: string[] = [
    'ID', 
    'Title', 
    'Employer', 
    'Job_Type', 
    'Published_Date', 
    'Deadline', 
    'Start_Salary', 
    'End_Salary', 
    'Job_Post', 
    'Country', 
    'action'
  ];
  
  dataSource = new MatTableDataSource<any>([])
  totalApplications = 0
  pageSize = 10
  pageIndex = 0

  @ViewChild(MatPaginator) paginator!: MatPaginator
  @ViewChild(MatSort) sort!: MatSort

  ngOnInit () {
    const dummyData = [
      {
        ID: 1,
        Title: 'John Doe',
        Employer: 'John Doe',
        Job_Type: 'Full Time',
        Published_Date: '2025-04-15',
        Deadline: '2025-04-22',
        Start_Salary: '$5000',
        End_Salary: '$7000',
        Job_Post: 'Chief Engineer',
        Country: 'India',
      },
     
    
    ]

    this.dataSource.data = dummyData
    this.totalApplications = dummyData.length
  }

  ngAfterViewInit () {
    this.dataSource.paginator = this.paginator
    this.dataSource.sort = this.sort
  }

  onPageChange (event: any) {
    this.pageIndex = event.pageIndex
    this.pageSize = event.pageSize
  }

  viewApplicantDetails (applicationId: string) {
    console.log('Viewing applicant:', applicationId)
  }

  deleteApplicant (applicationId: string) {
    console.log('Deleting applicant:', applicationId)
    this.dataSource.data = this.dataSource.data.filter(
      item => item.application_id !== applicationId
    )
    this.totalApplications = this.dataSource.data.length
  }
}
