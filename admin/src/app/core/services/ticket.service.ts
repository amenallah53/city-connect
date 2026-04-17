import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, switchMap } from 'rxjs/operators';
import { Plainte } from '../../shared/models/plainte.model';
import { environment } from '../../../environments/environment';
import { UploadService } from './upload.service';

export interface PaginatedPlaintes {
  data: Plainte[];
  total: number;
}

export interface PlainteFilters {
  location?: string;
  category?: string;
  status?: 'pending' | 'accepted' | 'rejected' | 'in-process';
  page?: number;
  limit?: number;
}

@Injectable({
  providedIn: 'root'
})
export class TicketService {

  private apiUrl = environment.ticketsUrl;

  constructor(
    private http: HttpClient,
    private uploadService: UploadService
  ) {
    console.log('PlainteService API:', this.apiUrl);
  }

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

  getAllTickets(filters?: PlainteFilters): Observable<PaginatedPlaintes> {
    let params = new HttpParams();

    if (filters) {
      if (filters.location) params = params.set('city', filters.location);
      if (filters.category) params = params.set('category', filters.category);
      if (filters.status) params = params.set('status', filters.status);
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.limit) params = params.set('limit', filters.limit.toString());
    }

    return this.http.get<PaginatedPlaintes>(this.apiUrl, { params, headers: this.getAuthHeaders() })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  getTicketById(id: string): Observable<Plainte> {
    return this.http.get<Plainte>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  createTicket(plainte: Plainte, file?: File): Observable<Plainte> {
    if (file) {
      return this.uploadService.uploadImage(file).pipe(
        switchMap(res => {
          // Map to Plainte media structure
          plainte.media = [{
            id: 'temp-' + Date.now(),
            fileUrl: res.url,
            fileType: 'image/jpeg'
          }];
          return this.http.post<Plainte>(this.apiUrl, plainte, { headers: this.getAuthHeaders() });
        }),
        catchError(this.handleError)
      );
    }

    return this.http.post<Plainte>(this.apiUrl, plainte, { headers: this.getAuthHeaders() })
      .pipe(
        catchError(this.handleError)
      );
  }

  updateTicket(id: string, plainte: Partial<Plainte>): Observable<Plainte> {
    return this.http.put<Plainte>(`${this.apiUrl}/${id}`, plainte, { headers: this.getAuthHeaders() })
      .pipe(
        catchError(this.handleError)
      );
  }

  deleteTicket(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() })
      .pipe(
        catchError(this.handleError)
      );
  }

  updateStatus(id: string, status: 'pending' | 'accepted' | 'rejected' | 'in-process'): Observable<Plainte> {
    return this.http.patch<Plainte>(`${this.apiUrl}/${id}/status`, { status }, { headers: this.getAuthHeaders() })
      .pipe(
        catchError(this.handleError)
      );
  }

  searchTickets(query: string): Observable<Plainte[]> {
    return this.http.get<Plainte[]>(`${this.apiUrl}/search?q=${query}`, { headers: this.getAuthHeaders() })
      .pipe(
        catchError(this.handleError)
      );
  }

  getCategories(): Observable<{ id: number; type: string }[]> {
    return this.http.get<{ id: number; type: string }[]>(`${this.apiUrl}/categories`, { headers: this.getAuthHeaders() })
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Something went wrong';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      errorMessage = `Server Error: ${error.status} - ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
