import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStoargeService {
  lToken: any;
  constructor() { }

  public GetItem(key: string) {
    return localStorage.getItem(key);
  }

  public SetItem(key: string, data: string): void {
    localStorage.setItem(key, data);
    this.lToken = data;
  }

  public RemoveItem(key: string) {
    localStorage.removeItem(key);
  }
}
