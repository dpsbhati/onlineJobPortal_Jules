import { Injectable } from '@angular/core';
// import * as CryptoJS from 'crypto-js';
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
  // public SetItem(key: string, data: string): void {
  //   if (typeof localStorage !== 'undefined') {
  //     const encryptedData = CryptoJS.AES.encrypt(data, this.secretKey).toString();
  //     localStorage.setItem(key, encryptedData);
  //   }
  // }

 
  // public GetItem(key: string): string | null {
  //   if (typeof localStorage !== 'undefined') {
  //     const encryptedData = localStorage.getItem(key);
  //     if (encryptedData) {
  //       try {
  //         const bytes = CryptoJS.AES.decrypt(encryptedData, this.secretKey);
  //         return bytes.toString(CryptoJS.enc.Utf8);
  //       } catch (error) {
  //         console.error('Error decrypting data:', error);
  //         return null;
  //       }
  //     }
  //   }
  //   return null;
  // }


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
