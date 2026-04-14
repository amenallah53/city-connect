import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { Service } from '../../shared/models/service.model';

interface ApiResponse {
  success: boolean;
  data: Service[];
  pagination?: {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
  };
}

@Injectable({ providedIn: 'root' })
export class ServicesService {
  private apiUrl = 'http://localhost:3004/api/services';

  constructor(private http: HttpClient) {}

  /**
   * Récupère tous les services disponibles
   */
  getAllServices(): Observable<Service[]> {
    return this.http.get<ApiResponse>(this.apiUrl).pipe(
      map(response => {
        if (response && response.data) {
          // Map API response to local model (name -> title for compatibility)
          return response.data.map(service => ({
            ...service,
            title: service.name
          }));
        }
        return [];
      }),
      catchError(error => {
        console.error('Failed to fetch services from API:', error);
        return of([]);
      })
    );
  }

  /**
   * Récupère un service par ID
   */
  getServiceById(id: string): Observable<Service | undefined> {
    return this.http
      .get<{ success: boolean; data: Service }>(`${this.apiUrl}/${id}`)
      .pipe(
        map(response => {
          if (response && response.data) {
            return {
              ...response.data,
              title: response.data.name
            };
          }
          return undefined;
        }),
        catchError(error => {
          console.error(`Failed to fetch service ${id}:`, error);
          return of(undefined);
        })
      );
  }

  /**
   * Récupère les services filtrés par type
   */
  getServicesByCategory(type: string): Observable<Service[]> {
    return this.http
      .get<ApiResponse>(`${this.apiUrl}/type/${type}`)
      .pipe(
        map(response => {
          if (response && response.data) {
            return response.data.map(service => ({
              ...service,
              title: service.name
            }));
          }
          return [];
        }),
        catchError(error => {
          console.error(`Failed to fetch services by type:`, error);
          return of([]);
        })
      );
  }

  /**
   * Récupère les services filtrés par badge
   */
  getServicesByFilter(filter: string): Observable<Service[]> {
    return this.http
      .get<ApiResponse>(`${this.apiUrl}?search=${filter}`)
      .pipe(
        map(response => {
          if (response && response.data) {
            return response.data.map(service => ({
              ...service,
              title: service.name
            }));
          }
          return [];
        }),
        catchError(error => {
          console.error(`Failed to fetch filtered services:`, error);
          return of([]);
        })
      );
  }
}
