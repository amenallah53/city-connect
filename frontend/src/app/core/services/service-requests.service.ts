import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { UploadService } from './upload.service';

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
  attachments?: string[];
  attachments_name?: string[];
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
  private gatewayApiUrl = 'http://localhost:5006/api/service-requests';
  private directApiUrl = 'http://localhost:5006/api/service-requests';
  private apiUrl = this.gatewayApiUrl;

  constructor(
    private http: HttpClient,
    private uploadService: UploadService
  ) { }

  /**
   * Crée une nouvelle demande de service
   */
  createServiceRequest(request: {
    cin: number;
    service_id: string | number;
    requestdescription?: string;
    description?: string;
    telephone?: string;
    phone?: string;
    attachments?: File[];
  }): Observable<ServiceRequest> {
    const files = Array.isArray(request.attachments) ? request.attachments : [];

    const buildAndSendRequest = (payload: {
      cin: number;
      service_id: string | number;
      requestdescription?: string;
      description?: string;
      telephone?: string;
      phone?: string;
      attachments?: string[];
      attachments_name?: string[];
      attachment_types?: string[];
    }): Observable<ServiceRequest> => this.createServiceRequestFrom(this.gatewayApiUrl, payload).pipe(
      catchError((gatewayError) => {
        console.warn('Gateway create service request failed, retrying direct service URL.', gatewayError);
        return this.createServiceRequestFrom(this.directApiUrl, payload);
      }),
      catchError(error => {
        console.error('Error creating service request:', error);
        throw error;
      })
    );

    if (!files.length) {
      return buildAndSendRequest({
        ...request,
        attachments: [],
        attachments_name: [],
        attachment_types: []
      });
    }

    return forkJoin(
      files.map((file) =>
        this.uploadService.uploadFile(file).pipe(
          map((uploaded) => ({
            url: uploaded.url,
            name: file.name,
            type: file.type || 'application/octet-stream'
          }))
        )
      )
    ).pipe(
      switchMap((uploadedFiles) =>
        buildAndSendRequest({
          ...request,
          attachments: uploadedFiles.map((f) => f.url),
          attachments_name: uploadedFiles.map((f) => f.name),
          attachment_types: uploadedFiles.map((f) => f.type)
        })
      )
    );
  }

  private createServiceRequestFrom(
    baseUrl: string,
    request: {
      cin: number;
      service_id: string | number;
      requestdescription?: string;
      description?: string;
      telephone?: string;
      phone?: string;
      attachments?: string[];
      attachments_name?: string[];
      attachment_types?: string[];
    }
  ): Observable<ServiceRequest> {
    return this.http.post<ServiceRequestResponse>(baseUrl, request).pipe(
      map(response => {
        if (response && response.data && !Array.isArray(response.data)) {
          return response.data as ServiceRequest;
        }
        throw new Error('Invalid response from API');
      })
    );
  }

  /**
   * Récupère toutes les demandes d'un utilisateur
   */
  getUserServiceRequests(cin: number): Observable<ServiceRequest[]> {
    return this.fetchUserRequestsFrom(this.gatewayApiUrl, cin).pipe(
      catchError((gatewayError) => {
        console.warn('Gateway user requests failed, retrying direct service URL.', gatewayError);
        return this.fetchUserRequestsFrom(this.directApiUrl, cin);
      }),
      catchError((userEndpointError) => {
        // Fallback for inconsistent backend states: fetch all then filter by CIN on client side.
        console.warn('User-specific endpoint failed, falling back to all requests and client-side filter.', userEndpointError);
        return this.fetchAllAndFilterByCin(cin);
      }),
      catchError(error => {
        console.error('Error fetching user service requests:', error);
        return of([]);
      })
    );
  }

  private fetchUserRequestsFrom(baseUrl: string, cin: number): Observable<ServiceRequest[]> {
    return this.http.get<ServiceRequestResponse>(`${baseUrl}/user/${cin}`).pipe(
      map(response => {
        if (response && response.data && Array.isArray(response.data)) {
          return response.data;
        }
        return [];
      })
    );
  }

  private fetchAllAndFilterByCin(cin: number): Observable<ServiceRequest[]> {
    return this.http
      .get<ServiceRequestResponse>(`${this.directApiUrl}?status=all&page=1&limit=1000`)
      .pipe(
        map(response => {
          if (response && response.data && Array.isArray(response.data)) {
            const cinText = String(cin);
            return response.data.filter((req) => String(req.cin) === cinText);
          }
          return [];
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
    return this.updateServiceRequestStatusFrom(this.gatewayApiUrl, id, status).pipe(
      catchError((gatewayError) => {
        console.warn('Gateway status update failed, retrying direct service URL.', gatewayError);
        return this.updateServiceRequestStatusFrom(this.directApiUrl, id, status);
      }),
      catchError(error => {
        console.error('Error updating service request status:', error);
        throw error;
      })
    );
  }

  private updateServiceRequestStatusFrom(baseUrl: string, id: number, status: string): Observable<ServiceRequest> {
    return this.http.put<ServiceRequestResponse>(`${baseUrl}/${id}/status`, { status }).pipe(
      map(response => {
        if (response && response.data && !Array.isArray(response.data)) {
          return response.data as ServiceRequest;
        }
        throw new Error('Invalid response from API');
      })
    );
  }
}
