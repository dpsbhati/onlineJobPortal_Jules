// socket.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as io from 'socket.io-client';
// import { EncryptDecryptService } from '../encrypt-decrypt/encrypt-decrypt.service';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket: io.Socket;
  loginUserId: any;

  constructor(
  ) {
    let loginUserId: any = localStorage.getItem('user')
    this.loginUserId = JSON.parse(loginUserId);
  }

  connect(url: string): void {
    this.socket = io.io(url, {
      query: { userId: this.loginUserId?.id }
    });
  }

  listen(eventName: string, params?: any): Observable<any> {
    return new Observable(observer => {
      this.socket.on(eventName, (data: any) => observer.next({ data, params }));
      return () => this.socket.off(eventName,);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  emit(eventName: string, params?: any): void {
    this.socket.emit(eventName, params);
  }

  isConnect(): boolean {
    return this.socket && this.socket.connected;
  }
}
