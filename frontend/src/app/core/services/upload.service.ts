import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private apiUrl = environment.uploadsUrl;

  constructor(private http: HttpClient) {}

  /**
   * Uploads any supported file and returns its accessible URL.
   */
  uploadFile(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('image', file);

    const token = localStorage.getItem('token');
    return this.http.post<{ url: string }>(this.apiUrl, formData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  /**
   * Backward-compatible alias used by older features.
   */
  uploadImage(file: File): Observable<{ url: string }> {
    return this.uploadFile(file);
  }
}
