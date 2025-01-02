import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

import { GenericService } from './generic.service';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private genericService: GenericService) { }

  createOrUpdateJobPosting(payload: any): Observable<any> {
    return this.genericService.Post(`job-posting/create-update`, payload); 
  }
  // uploadFile(payload: any): Observable<any> {
  //   return this.genericService.Post(`uploads/files`, payload);
  // }
  uploadFile(payload: { folderName: string; file: File; userId: string }): Observable<any> {
    const formData = new FormData();
    formData.append('folderName', payload.folderName);
    formData.append('file', payload.file);
    formData.append('userId', payload.userId);
  
    return this.genericService.Post('uploads/files', formData);
  }
  

  // getJobPostingById(id: string): Observable<any> {
  //   return this.genericService.get(`${this.baseUrl}/${id}`);
  // }
}
