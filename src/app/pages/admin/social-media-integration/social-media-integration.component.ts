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
  selector: 'app-applicant',
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
  templateUrl: './social-media-integration.component.html',
  styleUrl: './social-media-integration.component.scss'
})
export class SocialMediaIntegrationComponent implements OnInit {
  displayedColumns: string[] = [
    '#',
    'name',
    'email',
    'mobile',
    'city',
    'applications',
    'action'
  ]
  dataSource = new MatTableDataSource<any>([
    {
      id: 1,
      Name: 'Amit Sharma',
      Email: 'amit.sharma@example.com',
      Mobile: '9876543210',
      City: 'new delhi',
      Applications: '2'
    },
    {
      id: 2,
      Name: 'Neha Verma',
      Email: 'neha.verma@example.com',
      Mobile: '9123456780',
      City: 'new delhi',
      Applications: '2'
    }
  ])

  @ViewChild(MatPaginator) paginator!: MatPaginator

  ngOnInit () {
    this.dataSource.paginator = this.paginator
  }

  applyFilter (filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase()
  }

}
