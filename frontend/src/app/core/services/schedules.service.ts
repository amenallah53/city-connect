import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HoraireService } from '../../shared/models/horaire-service.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SchedulesService {
  private apiUrl = environment.schedulesUrl;

  constructor(private http: HttpClient) { }

  getSchedules(): Observable<HoraireService[]> {
    return this.http.get<HoraireService[]>(this.apiUrl);
  }
}
