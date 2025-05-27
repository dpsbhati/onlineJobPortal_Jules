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
    // this.checkwebsocket();
  }

  // checkwebsocket() {
  //   //Event
  //   let userId: any = localStorage.getItem('user');
  //   const params = { userId: JSON.parse(userId)?.id };
  //   this.webSocketSubscription = this.socketService
  //     .listen('jobApply', params)
  //     .subscribe({
  //       next: (messages) => {
  //         console.log(messages)
  //         if (messages) {
  //           //Add one to unread count in real time
  //           // this.unreadCount = this.unreadCount + 1;

  //           // messages.data.notification.isRead = false;
  //           // this._notificationsService.notificationsData.unshift(
  //           //   messages.data.notification
  //           // );
  //           // const updatedNotification =
  //           //   this._notificationsService.notificationsData;
  //           // this._notificationsService.updateNotificationsList(
  //           //   updatedNotification
  //           // );
  //         }
  //       },
  //       error: (err) => {
  //         console.log(err)
  //         // this.wbesocketSubscription.unsubscribe();
  //         // this.webSocketService.disconnect();
  //       },
  //     });
  // }
}
