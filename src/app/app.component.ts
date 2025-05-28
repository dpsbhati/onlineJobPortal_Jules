import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, Subscription } from 'rxjs';
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
  private routerSubscription?: Subscription;


  constructor(
    private socketService: WebsocketService,
    private router: Router,

  ) { }

  ngOnInit() {
    this.socketService.connect(environment.webSocketUrl);

    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.listenToNotifications();
    });
  }

  listenToNotifications() {
    if (this.webSocketSubscription) {
      this.webSocketSubscription.unsubscribe();
    }

    const userJson = localStorage.getItem('user');
    const userId = userJson ? JSON.parse(userJson)?.id : null;

    if (userId) {
      this.webSocketSubscription = this.socketService
        .listen('adminNotification', { userId })
        .subscribe({
          next: (message) => {
            console.log('Received notification:', message);
          },
          error: (err) => console.error('WebSocket error:', err),
        });
    }
  }

  ngOnDestroy() {
    this.routerSubscription?.unsubscribe();
    this.webSocketSubscription?.unsubscribe();
  }
}

