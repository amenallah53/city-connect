import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HoraireService } from '../../shared/models/horaire-service.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SchedulesService {
  private apiUrl = environment.schedulesUrl;

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    if (typeof window !== 'undefined' && window.localStorage) {
        const token = localStorage.getItem('token');
        if (token) {
            headers = headers.set('Authorization', `Bearer ${token}`);
        }
    }
    return headers;
  }

  getSchedules(): Observable<HoraireService[]> {
    return this.http.get<HoraireService[]>(this.apiUrl, { headers: this.getAuthHeaders() });
  }

  createSchedule(schedule: Partial<HoraireService>): Observable<HoraireService> {
    return this.http.post<HoraireService>(this.apiUrl, schedule, { headers: this.getAuthHeaders() });
  }

  updateSchedule(id: string, schedule: Partial<HoraireService>): Observable<HoraireService> {
    return this.http.put<HoraireService>(`${this.apiUrl}/${id}`, schedule, { headers: this.getAuthHeaders() });
  }

  deleteSchedule(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }
}
