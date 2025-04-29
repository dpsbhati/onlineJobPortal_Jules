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
  selector: 'app-delete',
  imports: [
    MatDialogActions,
    MatDialogTitle,
    MatDialogContent,
    MatDialogModule,
    MatButtonModule
  ],
  templateUrl: './delete.component.html',
  styleUrl: './delete.component.scss'
})
export class DeleteComponent {

  constructor(
    public dialogRef: MatDialogRef<DeleteComponent>,
  ) {}

  onCancel(): void {
    this.dialogRef.close(false); // Pass 'false' when the dialog is cancelled
  }

  onDelete(): void {
    this.dialogRef.close(true); // Pass 'true' when the delete action is confirmed
  }

}
