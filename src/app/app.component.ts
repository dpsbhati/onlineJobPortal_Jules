import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { WebsocketService } from './core/services/websocket.service';
import { environment } from 'src/environment/environment';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'MaterialPro Angular Admin Template';
  private webSocketSubscription: Subscription;

  constructor(
    private socketService: WebsocketService,
  ) { }

  ngOnInit() {
    this.socketService.connect(environment.webSocketUrl)
  }

}
