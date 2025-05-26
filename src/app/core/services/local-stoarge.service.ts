import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  // private secretKey = '';
  constructor() { }

  public GetItem(key: string): string | null {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  }
 
  public SetItem(key: string, data: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, data);
    }
  }

  public RemoveItem(key: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
    }
  }
}
