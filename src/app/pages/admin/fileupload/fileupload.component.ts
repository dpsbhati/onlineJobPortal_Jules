import { Component } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'

import {
  MatDialog,
  MatDialogRef,
  MatDialogActions,
  MatDialogClose,
  MatDialogTitle,
  MatDialogContent,
  MatDialogModule
} from '@angular/material/dialog'
@Component({
  selector: 'app-fileupload',
  imports: [
    MatDialogActions,
    MatDialogClose,
    MatDialogTitle,
    MatDialogContent,
    MatDialogModule,MatButtonModule 
  ],
  templateUrl: './fileupload.component.html',
  styleUrl: './fileupload.component.scss'
})
export class FileuploadComponent {}
