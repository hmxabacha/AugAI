// file.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface StoredFile {
  id: number;        // ✅ usually comes from DB
  fileName: string;
  fileType: string;
  content: string;
  uploadedAt: string;
  fileUrl : string;
  userId?: number;   // optional if you want to track owner
}

@Injectable({ providedIn: 'root' })
export class FileHistoryService {
  private ApiUrl = 'http://localhost:5077/api/files';

  constructor(private http: HttpClient) {}

  uploadFile(userId: number, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userID', userId.toString());

    return this.http.post(`${this.ApiUrl}/upload/${userId}`, formData);
  }

  getUserFiles(userId: number): Observable<StoredFile[]> {
    return this.http.get<StoredFile[]>(`${this.ApiUrl}/${userId}`);
  }

  downloadFile(fileId: number): Observable<Blob> {
    return this.http.get(`${this.ApiUrl}/download/${fileId}`, { responseType: 'blob' });
  }



}
