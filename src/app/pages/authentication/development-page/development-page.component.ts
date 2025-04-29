import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-development-page',
  imports: [RouterModule, MatButtonModule],
  templateUrl: './development-page.component.html',
  styleUrl: './development-page.component.scss'
})
export class DevelopmentPageComponent {

}
