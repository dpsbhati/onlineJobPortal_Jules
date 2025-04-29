import { inject, Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { GenericService } from '../generic.service';


@Injectable({ providedIn: 'root' })
export class UserService {

    constructor(private genericService: GenericService) { }

    private _user: ReplaySubject<any> = new ReplaySubject<any>(1);



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

    getUserById(userId: string): Observable<any> {
        const key = 'id';
        return this.genericService.Get<any>(`user-profile/get-one?id=${userId}`);
    }

    uploadFile(payload: { folderName: string; file: File; userId: string }): Observable<any> {
        const formData = new FormData();
        formData.append('folderName', payload.folderName);
        formData.append('file', payload.file);
        formData.append('userId', payload.userId);

        return this.genericService.Post('uploads/files', formData);
    }

    // getAllComapny(): Observable<any> {
    //     return this._generic.Get<any>(`company/getAllCompanies`);
    // }

    // getAllRole(): Observable<any> {
    //     return this._generic.Get<any>(`role/getAll`);
    // }

    SaveUserProfile(data: any): Observable<any> {
        return this.genericService.Post<any>(`user-profile/update-user-profile`, data);
    }

    getAppliedJobs(payload:any): Observable<any> {
        return this.genericService.Post(`applications/pagination`, payload);
      }

}
