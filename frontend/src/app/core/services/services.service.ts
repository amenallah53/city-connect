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
  private gatewayApiUrl = 'http://localhost:5000/api/services';
  private directApiUrl = 'http://localhost:5006/api/services';

  constructor(private http: HttpClient) { }

  private mapServices(services: Service[]): Service[] {
    return services;
  }

  private mapSingleService(service: Service): Service {
    return service;
  }

  private fetchList(url: string): Observable<Service[]> {
    return this.http.get<ApiResponse>(url).pipe(
      map(response => {
        if (response && response.data) {
          return this.mapServices(response.data);
        }
        return [];
      })
    );
  }

  private fetchById(url: string): Observable<Service | undefined> {
    return this.http.get<{ success: boolean; data: Service }>(url).pipe(
      map(response => {
        if (response && response.data) {
          return this.mapSingleService(response.data);
        }
        return undefined;
      })
    );
  }

  /**
   * Récupère tous les services disponibles
   */
  getAllServices(): Observable<Service[]> {
    return this.fetchList(this.gatewayApiUrl).pipe(
      catchError((gatewayError) => {
        console.warn('Gateway services list failed, retrying direct services-service URL.', gatewayError);
        return this.fetchList(this.directApiUrl);
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
    return this.fetchById(`${this.gatewayApiUrl}/${id}`).pipe(
      catchError((gatewayError) => {
        console.warn(`Gateway service details failed for ${id}, retrying direct services-service URL.`, gatewayError);
        return this.fetchById(`${this.directApiUrl}/${id}`);
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
    return this.fetchList(`${this.gatewayApiUrl}/type/${type}`).pipe(
      catchError((gatewayError) => {
        console.warn(`Gateway services by type failed for ${type}, retrying direct services-service URL.`, gatewayError);
        return this.fetchList(`${this.directApiUrl}/type/${type}`);
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
    return this.fetchList(`${this.gatewayApiUrl}?search=${encodeURIComponent(filter)}`).pipe(
      catchError((gatewayError) => {
        console.warn(`Gateway filtered services failed for query ${filter}, retrying direct services-service URL.`, gatewayError);
        return this.fetchList(`${this.directApiUrl}?search=${encodeURIComponent(filter)}`);
      }),
      catchError(error => {
        console.error(`Failed to fetch filtered services:`, error);
        return of([]);
      })
    );
  }
}
