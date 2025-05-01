import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import { MatDialogModule } from '@angular/material/dialog';
@Component({
  selector: 'app-fileupload',
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './fileupload.component.html',
  styleUrl: './fileupload.component.scss',
})
export class FileuploadComponent {}
