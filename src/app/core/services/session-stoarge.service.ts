import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SessionStoargeService {
  lToken: any;
  constructor() { }

  public GetItem(key: string) {
      return sessionStorage.getItem(key);
  }

  public SetItem(key: string, data: string): void {
      sessionStorage.setItem(key, data);
      this.lToken = data;
  }

  public RemoveItem(key: string) {
      sessionStorage.removeItem(key);
  }
}
