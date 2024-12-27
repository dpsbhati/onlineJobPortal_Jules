import { inject, Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { GenericService } from '../generic.service';


@Injectable({ providedIn: 'root' })
export class UserService {
    private _user: ReplaySubject<any> = new ReplaySubject<any>(1);
    private _generic = inject(GenericService)

    /**
     * Setter & getter for user
     *
     * @param value
     */
    set user(value: any) {
        // Store the value
        this._user.next(value);
    }

    get user$(): Observable<any> {
        return this._user.asObservable();
    }

    //user pagination api
    // userPagination(payload) {
    //     // return this._generic.Post<any>(`user/pagination`, payload);
    //     return this._generic.Get<any>(`user/get-All`);
    // }

    // getuserById(id: any): Observable<any> {
    //     return this._generic.Get<any>(`user/getOne/${id}`);
    // }

    // getAllComapny(): Observable<any> {
    //     return this._generic.Get<any>(`company/getAllCompanies`);
    // }

    // getAllRole(): Observable<any> {
    //     return this._generic.Get<any>(`role/getAll`);
    // }

    // EditUserDetials(data: any): Observable<any> {
    //     return this._generic.Post<any>(`user/editUser`, data);
    // }

    // updateProfileImage(id: any, data: any): Observable<any> {
    //     return this._generic.Post<any>(`user/${id}/profile-image`, data);
    // }

    // archiveUser(id: any): Observable<any> {
    //     return this._generic.Post<any>(`user/${id}/archive`, null);
    // }

    // userGetAll(): Observable<any> {
    //     return this._generic.Get<any>(`user/get-All`);
    // }

    // GetUserByRoleName(Role: string, vesselId?: any): Observable<any> {
    //     if (vesselId) return this._generic.Get<any>(`user/userByRole/${Role}?vesselId=${vesselId}`);
    //     else return this._generic.Get<any>(`user/userByRole/${Role}`);
    // }

    // removeProfileImage(id: any): Observable<any> {
    //     return this._generic.Get<any>(`user/updateProfileImageToNull/${id}`);
    // }

}
