import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, pipe, map, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environment/environment';
import { GenericService } from './generic.service';
@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;
  // public   userId: Observable<any>
  private apiUrl = environment.baseUrl;
  constructor(private http: HttpClient,
    private genricService: GenericService,

  ) {
    this.currentUserSubject = new BehaviorSubject<any>(
      localStorage.getItem("currentUser") ? JSON.parse(localStorage.getItem("currentUser") ?? "") : ""
      // localStorage.getItem("currentUser") ? JSON.parse( localStorage.getItem("userId")?? "") : ""
    );
    this.currentUser = this.currentUserSubject.asObservable();
    // this.userId = this.currentUserSubject.asObservable();
  }
  public get currentUserValue(): any {
    return this.currentUserSubject.value;
  }



  getLoginDetail(model: any): Observable<any> {
    //   const endpoint = 'Account/Login';
    //    const url = `${this.apiUrl}/${endpoint}`;
    // //  return this.http.post(url,loginValue);

    return this.genricService.Post<any>(`/Account/Login`, model)
      .pipe(map(user => {
        if (user.data && user.data.token) {
          localStorage.setItem('currentUser', JSON.stringify(user.data));
          this.currentUserSubject.next(user.data);
        }
        return user;
      }));

  }

  //    postResetPassword(userName: string, data: any): Observable<any> {
  //   const endpoint ='Account/UserResetPassword';
  //     const url = `${this.apiUrl}/${endpoint}`;
  //   const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  //  return this.http.post(url, {userName}, { headers });
  // }

  // postForgetPassword(data:any ): Observable<any> {
  //   const endpoint='Account/ForgetPassword';
  //   const url = `${this.apiUrl}/${endpoint}`;
  //   const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  //   return this.http.post(url, {data}, { headers });
  // }

  forgetPassword(data: any): Observable<any> {
    return this.genricService.Post('/Account/ForgetPassword', data);
  }

  ChangePassword(data: any): Observable<any> {
    return this.genricService.Post('/Account/UserResetPassword', data);
  }

  // login(model:any) {

  //   return this.genricService.Post<any>(`Account/login`, model)
  //     .pipe(map(user => {
  //       if (user.data && user.data.token) {

  //         localStorage.setItem('userId', JSON.stringify(user.data));
  //         this.currentUserSubject.next(user.data);
  //       }
  //       return user;
  //     }));


  // }
}
