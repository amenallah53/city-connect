import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UserProfile {
  email: string;
  firstName: string;
  lastName: string;
  cin: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = environment.profileUrl;

  constructor(private http: HttpClient) { }

  getProfile(): Observable<UserProfile> {
    const token = localStorage.getItem('token');
    return this.http.get<UserProfile>(`${this.apiUrl}/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  updateProfile(data: Partial<UserProfile & { newPassword?: string; confirmPassword?: string }>): Observable<any> {
    const token = localStorage.getItem('token');
    return this.http.put(`${this.apiUrl}/edit-profile`, data, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }
}
