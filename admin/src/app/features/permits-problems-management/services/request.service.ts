import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Request {
  id: number;
  cin: number;
  service_id: number;
  fullname: string;
  email: string;
  phone?: string;
  location?: string;
  service_name: string;
  type: 'permit request' | 'certificate request' | 'problem report';
  status: 'pending' | 'in_progress' | 'approved' | 'rejected' | 'completed';
  requestedat: string;
  description: string;
  attachments: Attachment[];
}

export interface Attachment {
  id: number;
  name: string;
  type: 'pdf' | 'image' | 'document';
  size: string;
  bgColor: string;
}

export interface RequestsResponse {
  success: boolean;
  data: Request[];
  pagination: {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class RequestService {
  private apiUrl = 'http://localhost:3004/api/service-requests'; // Services-Service URL

  constructor(private http: HttpClient) { }

  /**
   * Fetch all pending requests for admin dashboard
   * @param status Filter by status (default: 'pending')
   * @param page Page number (default: 1)
   * @param limit Items per page (default: 10)
   */
  getRequests(status: string = 'pending', page: number = 1, limit: number = 10): Observable<RequestsResponse> {
    let params = new HttpParams()
      .set('status', status)
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<RequestsResponse>(this.apiUrl, { params });
  }

  /**
   * Get a specific request by ID
   */
  getRequestById(id: number): Observable<{ success: boolean; data: Request }> {
    return this.http.get<{ success: boolean; data: Request }>(`${this.apiUrl}/${id}`);
  }

  /**
   * Update request status
   */
  updateRequestStatus(id: number, status: string): Observable<{ success: boolean; message: string }> {
    return this.http.put<{ success: boolean; message: string }>(
      `${this.apiUrl}/${id}/status`,
      { status }
    );
  }
}
