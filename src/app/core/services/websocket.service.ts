// socket.service.ts
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Observable } from 'rxjs';
import * as io from 'socket.io-client';
import { AdminService } from './admin/admin.service';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  currentUserId: any;
  notificationlist: any;
  total: any;
  pageConfig: any = {
    curPage: 1,
    perPage: 10,
    sortBy: 'created_at',
    direction: 'desc',
    whereClause: [],
  };
  private socket: io.Socket;
  loginUserId: any;
  private notificationListSubject = new BehaviorSubject<any[]>([]);
  public notificationList$ = this.notificationListSubject.asObservable();
  public notificationReceivedSubject = new BehaviorSubject<boolean>(false);

  private totalSubject = new BehaviorSubject<number>(0);
  public total$ = this.totalSubject.asObservable();
  notificationReceived$ = this.notificationReceivedSubject.asObservable();

  constructor(
    private toastr: ToastrService,
    private adminService: AdminService,

  ) {
    const userString = localStorage.getItem('user');
    this.loginUserId = userString ? JSON.parse(userString) : null;
    if (userString) {
      try {
        const user = JSON.parse(userString);
        this.currentUserId = user.id;
      } catch (error) {
        this.currentUserId = null;
      }
    }

  }

  connect(url: string): void {
    this.socket = io.io(url, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      query: { userId: this.loginUserId?.id }
    });

  }

  listen(eventName: string, params?: any): Observable<any> {
    return new Observable(observer => {
      this.socket.on(eventName, (data: any) => {
        observer.next({ data, params })
        this.toastr.info(data.message, data.title, { timeOut: 10000 });
        observer.next({ data, params });
        this.onPagination();

      });
      return () => this.socket.off(eventName);
    });
  }

  onPagination(): void {
    if (!this.currentUserId) {
      this.notificationListSubject.next([]);
      this.totalSubject.next(0);
      return;
    }
    this.pageConfig.whereClause = [
      {
        key: 'user_id',
        value: this.currentUserId,
        operator: '=',
      },
    ];
    this.adminService.notificationPagination(this.pageConfig).subscribe({
      next: (res: any) => {
        if (res.statusCode === 200) {
          this.notificationListSubject.next(res.data);
          this.totalSubject.next(res.count || 0);
        } else {
          this.notificationListSubject.next([]);
          this.totalSubject.next(0);
        }
      },
      error: (err: any) => {
        this.toastr.error(err?.error?.message);
        this.notificationListSubject.next([]);
        this.totalSubject.next(0);
      },
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
