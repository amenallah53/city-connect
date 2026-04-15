import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';

export interface ServiceRequest {
  id: string;
  user_id?: string;
  cin: number;
  service_id: string;
  status: 'pending' | 'in_progress' | 'approved' | 'rejected' | 'completed' | 'en_attente' | 'en_cours' | 'approuvee' | 'rejetee' | 'terminee';
  description?: string;
  requestdescription?: string;
  date_creation?: Date | string;
  submission_date?: Date | string;
  requestedat?: Date | string;
  approvedat?: Date | string;
  completedat?: Date | string;
  estimatedcompletiondate?: Date | string;
  service_name?: string;
  fullname?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  telephone?: string;
  phone?: string;
  type?: string;
}

export interface ServiceRequestResponse {
  success: boolean;
  message?: string;
  data?: ServiceRequest | ServiceRequest[];
  pagination?: {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
  };
}

@Injectable({ providedIn: 'root' })
export class ServiceRequestsService {
  private apiUrl = 'http://localhost:3004/api/service-requests';

  constructor(private http: HttpClient) {}

  /**
   * Crée une nouvelle demande de service
   */
  createServiceRequest(request: {
    cin: number;
    service_id: number;
    requestdescription?: string;
  }): Observable<ServiceRequest> {
    return this.http.post<ServiceRequestResponse>(this.apiUrl, request).pipe(
      map(response => {
        if (response && response.data && !Array.isArray(response.data)) {
          return response.data as ServiceRequest;
        }
        throw new Error('Invalid response from API');
      }),
      catchError(error => {
        console.error('Error creating service request:', error);
        throw error;
      })
    );
  }

  /**
   * Récupère toutes les demandes d'un utilisateur
   */
  getUserServiceRequests(cin: number): Observable<ServiceRequest[]> {
    return this.http.get<ServiceRequestResponse>(`${this.apiUrl}/user/${cin}`).pipe(
      map(response => {
        if (response && response.data && Array.isArray(response.data)) {
          return response.data;
        }
        return [];
      }),
      catchError(error => {
        console.error('Error fetching user service requests:', error);
        return of([]);
      })
    );
  }

  /**
   * Récupère les détails d'une demande de service
   */
  getServiceRequestById(id: number): Observable<ServiceRequest | undefined> {
    return this.http.get<ServiceRequestResponse>(`${this.apiUrl}/${id}`).pipe(
      map(response => {
        if (response && response.data && !Array.isArray(response.data)) {
          return response.data as ServiceRequest;
        }
        return undefined;
      }),
      catchError(error => {
        console.error('Error fetching service request:', error);
        return of(undefined);
      })
    );
  }

  /**
   * Met à jour le statut d'une demande
   */
  updateServiceRequestStatus(id: number, status: string): Observable<ServiceRequest> {
    return this.http.put<ServiceRequestResponse>(`${this.apiUrl}/${id}/status`, { status }).pipe(
      map(response => {
        if (response && response.data && !Array.isArray(response.data)) {
          return response.data as ServiceRequest;
        }
        throw new Error('Invalid response from API');
      }),
      catchError(error => {
        console.error('Error updating service request status:', error);
        throw error;
      })
    );
  }
}
