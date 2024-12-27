import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class GenericService {
  apiUrl: string = environment.baseUrl;

  constructor(private httpClient: HttpClient) { }

  public Get<T>(url: string): Observable<T> {
    return this.httpClient.get<T>(this.apiUrl + url);
  }

  public Post<T>(url: string, data: any, option?: any): Observable<T> {
    return this.httpClient.post<T>(this.apiUrl + url, data);
  }


  public DeleteRequest<T>(requestUrl: string): Observable<T> {
    return this.httpClient.delete<T>(this.apiUrl + requestUrl);
  }

  public DownloadFile(requestUrl: string, options: any): any {
    return this.httpClient.get(this.apiUrl + requestUrl, options);
  }
}
