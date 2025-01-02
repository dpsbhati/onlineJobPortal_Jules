import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { LocalStorageService } from './core/services/local-stoarge.service';
import { CommonModule } from '@angular/common';
import { NgxSpinnerModule } from 'ngx-spinner';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule,CommonModule, NgxSpinnerModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  providers:[LocalStorageService]
})
export class AppComponent {
  title = 'onlinejobportal';
}
