import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

import { GenericService } from './generic.service';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly BASE_URL = 'https://onlinejobportal.microlent.com/api/';
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

  getJobById(jobId: string): Observable<any> {
    const key = 'id';
    // return this.http.get<any>(`/job-posting/find-one`, { 
    //   params: { key, value: jobId } 
    // });
    return this.genericService.Get<any>(`job-posting/find-one?key=id&value=${jobId}`);

  }
  // deleteJob(id: string, ): Observable<any> {
  //   return this.http.post(`${this.BASE_URL}job-posting/${id}`);
  // }
  deleteJob(id: string): Observable<any> {
    return this.http.post(`${this.BASE_URL}job-posting/delete/${id}`, {});
  }

  jobPostingPagination(data: any): Observable<any> {
    return this.genericService.Post<any>(`job-posting/pagination`, data);
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
