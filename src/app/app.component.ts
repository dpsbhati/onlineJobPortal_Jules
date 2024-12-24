import { Component } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { LocalStoargeService } from './core/services/local-stoarge.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule],
  providers: [LocalStoargeService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'jobApplication';
}
