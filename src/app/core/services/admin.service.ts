import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

import { GenericService } from './generic.service';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private genericService: GenericService, private http: HttpClient) { }

  createOrUpdateJobPosting(payload: any): Observable<any> {
    return this.genericService.Post(`job-posting/create-update`, payload); 
  }
  
  uploadFile(payload: { folderName: string; file: File; userId: string }): Observable<any> {
    const formData = new FormData();
    formData.append('folderName', payload.folderName);
    formData.append('file', payload.file);
    formData.append('userId', payload.userId);
  
    return this.genericService.Post('uploads/files', formData);
  }
 

  getJobPostings(): Observable<any> {
    return this.genericService.Get(`/job-posting`);
  }
  // getJobPostings(params: {
  //   page?: number;
  //   limit?: number;
  //   search?: string;
  //   sortField?: string;
  //   sortOrder?: string;
  // }): Observable<any> {
  //   return this.genericService.Get('job-posting/find-all', params);
  // }
}
