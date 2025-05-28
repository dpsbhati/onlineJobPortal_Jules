// socket.service.ts
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import * as io from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket: io.Socket;
  loginUserId: any;

  constructor(
    private toastr: ToastrService
  ) {
    const userString = localStorage.getItem('user');
    this.loginUserId = userString ? JSON.parse(userString) : null;
    console.log(this.loginUserId);
    
  }

  connect(url: string): void {
    console.log(url)
    this.socket = io.io(url, {
      transports:['websocket', 'polling'],
      withCredentials:true,
      query: { userId: this.loginUserId?.id }
    });
    console.log(this.socket);
    
  }

  listen(eventName: string, params?: any): Observable<any> {
    return new Observable(observer => {
      this.socket.on(eventName, (data: any) =>{
        console.log(data)
        observer.next({ data, params })
        this.toastr.info(data.message, data.title, {timeOut:10000})
      });
      return () => this.socket.off(eventName);
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
