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
   * Uploads an image file and returns the server response containing the image URL.
   * @param file The image file to upload
   */
  uploadImage(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('image', file);

    return this.http.post<{ url: string }>(this.apiUrl, formData);
  }
}
