import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GenericService } from '../generic.service';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private readonly BASE_URL = 'https://onlinejobportal.microlent.com/api/';
  constructor(
    private genericService: GenericService,
    private http: HttpClient
  ) {}

  createOrUpdateJobPosting(payload: any): Observable<any> {
    return this.genericService.Post(`job-posting/create-update`, payload);
  }

  uploadFile(payload: {
    folderName: string;
    file: File;
    userId: string;
  }): Observable<any> {
    const formData = new FormData();
    formData.append('folderName', payload.folderName);
    formData.append('file', payload.file);
    formData.append('userId', payload.userId);

    return this.genericService.Post('uploads/files', formData);
  }

  getJobPostings(): Observable<any> {
    return this.genericService.Get(`job-posting`);
  }

  getallranks(): Observable<any> {
    return this.genericService.Get(`ranks/getAll`);
  }

  getJobById(jobId: string): Observable<any> {
    const key = 'id';
    return this.genericService.Get<any>(
      `job-posting/find-one?key=id&value=${jobId}`
    );
  }

  deleteJob(id: string): Observable<any> {
    return this.http.post(`${this.BASE_URL}job-posting/delete/${id}`, {});
  }

  jobPostingPagination(data: any): Observable<any> {
    return this.genericService.Post<any>(`job-posting/pagination`, data);
  }
  notificationPagination(data: any): Observable<any> {
    return this.genericService.Post<any>(`notifications/pagination`, data);
  }
  jobviewapplicationPagination(data: any): Observable<any> {
    return this.genericService.Post<any>(`applications/getApplicationsByJobId`, data);
  }
  applicationPagination(payload: any): Observable<any> {
    return this.genericService.Post<any>(`applications/pagination`, payload);
  }

  deleteApplicant(payload: { id: string }): Observable<any> {
    return this.http.post(`${this.BASE_URL}applications/delete`, payload);
  }

  applyJobs(payload: any): Observable<any> {
    return this.genericService.Post(`applications/apply`, payload);
  }

  deleteCertification(jobId: string): Observable<any> {
    const url = `${this.BASE_URL}courses-and-certification/delete`;
    const payload = { job_id: jobId };
    return this.http.post(url, payload);
  }

  allApplicantDetails(applicantId: string): Observable<any> {
    return this.genericService.Get(`applications/getOne/${applicantId}`);
  }
  userDetails(applicantId: string): Observable<any> {
    return this.genericService.Get(`user/get-by-id/${applicantId}`);
  }

  updateApplicationStatus(id: string, payload: any): Observable<any> {
    return this.genericService.Post(`applications/update/${id}`, payload);
  }

  toggleJobStatus(id: string, isActive: boolean): Observable<any> {
  const params = new URLSearchParams();
  params.set('id', id);
  params.set('isActive', String(isActive));

  // Using genericService.Get but with query params
  return this.genericService.Get(`job-posting/toggle-job-status?${params.toString()}`);
}
}
