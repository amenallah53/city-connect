import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Paginator } from 'primeng/paginator';
import { SelectModule } from 'primeng/select';
import { RequestCard } from '../../../shared/components/cards/request-card/request-card';
import { environment } from '../../../../environments/environment';

interface ServiceRequest {
  id: string;
  userName: string;
  serviceName: string;
  type: string;
  cin?: string;
  address?: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed' | string;
  backendStatus: 'pending' | 'in_progress' | 'approved' | 'rejected' | 'completed';
  email?: string;
  phone?: string;
  description?: string;
  location?: string;
  date_naissance?: string;
  attachments?: Array<{
    id?: number;
    name?: string;
    type?: string;
    size?: string;
    url?: string;
    bgColor?: string;
  }>;
}

interface ServiceRequestsApiResponse {
  success: boolean;
  data: Array<{
    id: string;
    first_name?: string;
    last_name?: string;
    fullname?: string;
    email?: string;
    telephone?: string;
    service_name?: string;
    type?: string;
    cin?: string;
    address?: string;
    date_naissance?: string;
    status: 'pending' | 'in_progress' | 'approved' | 'rejected' | 'completed';
    description?: string;
    submission_date?: string;
    attachments?: Array<{
      id?: number;
      name?: string;
      type?: string;
      size?: string;
      url?: string;
      bgColor?: string;
    }>;
  }>;
}

@Component({
  selector: 'app-requests',
  imports: [CommonModule, FormsModule, Paginator, SelectModule, RequestCard],
  templateUrl: './requests.html',
  styleUrl: './requests.css',
})
export class Requests implements OnInit {
  requests: ServiceRequest[] = [];

  filteredRequests: ServiceRequest[] = [];
  pagedRequests: ServiceRequest[] = [];

  searchQuery: string = '';

  statusFilters = [
    { name: 'All Statuses', value: null },
    { name: 'Pending', value: 'pending' },
    //{ name: 'In Progress', value: 'in_progress' },
    { name: 'Approved', value: 'approved' },
    { name: 'Rejected', value: 'rejected' },
    //{ name: 'Completed', value: 'completed' },
  ];
  selectedFilter: any = this.statusFilters[0];

  viewMode: 'grid' | 'list' = 'list';
  isLoading: boolean = false;
  actionMessage: string = '';
  actionMessageType: 'success' | 'error' = 'success';

  // Pagination
  first: number = 0;
  rows: number = 3;
  private readonly directServiceRequestsUrl = 'http://localhost:5006/api/service-requests';
  private readonly gatewayServiceRequestsUrl = environment.serviceRequestsUrl;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.loadRequests();
  }

  private loadRequests() {
    this.isLoading = true;
    this.loadRequestsFrom(this.directServiceRequestsUrl);
  }

  private loadRequestsFrom(baseUrl: string) {
    const params = new HttpParams().set('status', 'all').set('page', '1').set('limit', '1000');

    this.http.get<ServiceRequestsApiResponse>(baseUrl, { params }).subscribe({
      next: (response: ServiceRequestsApiResponse) => {
        this.requests = (response?.data || []).map((request) => this.mapToServiceRequest(request));
        this.applyFilters();
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error: unknown) => {
        if (baseUrl !== this.gatewayServiceRequestsUrl) {
          console.warn('Direct service-requests route failed; retrying gateway URL.');
          this.loadRequestsFrom(this.gatewayServiceRequestsUrl);
          return;
        }

        console.error('Failed to load service requests:', error);
        this.requests = [];
        this.applyFilters();
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  private mapToServiceRequest(request: ServiceRequestsApiResponse['data'][number]): ServiceRequest {
    const backendStatus = request.status || 'pending';
    const normalizedFullname = (request.fullname || '').replace(/\bnull\b/gi, '').trim();
    const fallbackName = `${request.first_name || ''} ${request.last_name || ''}`.trim();

    return {
      id: request.id,
      userName: normalizedFullname || fallbackName || 'Unknown user',
      serviceName: request.service_name || 'Unknown service',
      type: request.type || 'Unknown type',
      cin: request.cin || '',
      address: request.address || '',
      date: this.formatDate(request.submission_date),
      status: backendStatus,
      backendStatus,
      email: request.email || '',
      phone: request.telephone || '',
      description: request.description || '',
      location: '',
      date_naissance: request.date_naissance || '',
      attachments: Array.isArray(request.attachments) ? request.attachments : []
    };
  }

  private formatDate(value?: string): string {
    if (!value) return '';

    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }

  async generateServiceRequestCertificate(data: any) {

    const payload = {
      id: data.id || '',
      userName: data.userName || '',
      serviceName: data.serviceName || '',
      type: data.type || '',
      cin: data.cin || '',
      address: data.address || '',
      date_naissance: this.formatDate(data.date_naissance) || '',
      date: this.formatDate(data.date) || '',
      status: data.status || '',
      backendStatus: data.backendStatus || '',
      email: data.email || '',
      phone: data.phone || '',
      description: data.description || '',
      attachments: data.attachments || [],
      adminNotes: data.adminNotes || '', /** mch ma5douma */
      location: data.location || '', /** mch ma5douma */
    };

    const response = await fetch('https://amenallah23.app.n8n.cloud/webhook/7d27e881-89a9-4039-add7-b6cd784fb0ca', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    console.log('n8n response: ', result);

    if (result && result.file_url) {
      this.saveServiceRequestCertificate({
        file_url: result.file_url,
        demande_id: data.id,
        date_generation: new Date().toISOString()
      });
    }
  }

  private saveServiceRequestCertificate(payload: any) {
    this.http.post(`${this.directServiceRequestsUrl}/certificate`, payload).subscribe({
      next: (response) => {
        console.log('Certificate saved successfully:', response);
      },
      error: (error) => {
        console.error('Failed to save certificate:', error);
      }
    });
  }

  onStatusUpdate(event: { requestId: string; status: 'approved' | 'rejected' }) {
    if (!event?.requestId) {
      this.setActionMessage('Could not update request: missing request ID.', 'error');
      return;
    }

    // Optimistic local update so admin sees immediate feedback even before reload.
    this.requests = this.requests.map((request) => {
      if (request.id === event.requestId) {
        const updated = {
          ...request,
          backendStatus: event.status,
          //status: 'done' as const
        };
        this.generateServiceRequestCertificate(updated);
        console.log('Updated service request:', updated);
        return updated;
      }
      return request;
    });
    this.applyFilters();

    this.updateRequestStatus(this.directServiceRequestsUrl, event.requestId, event.status);
  }

  private updateRequestStatus(baseUrl: string, requestId: string, newStatus: 'approved' | 'rejected') {
    this.http.put(`${baseUrl}/${requestId}/status`, { status: newStatus }).subscribe({
      next: () => {
        this.setActionMessage(`Request ${newStatus} successfully.`, 'success');
        this.loadRequests();
        this.cdr.markForCheck();
      },
      error: (error: unknown) => {
        if (baseUrl !== this.gatewayServiceRequestsUrl) {
          console.warn('Direct status update failed; retrying gateway URL.');
          this.updateRequestStatus(this.gatewayServiceRequestsUrl, requestId, newStatus);
          return;
        }

        console.error('Failed to update request status:', error);
        this.setActionMessage('Failed to update request status. Please try again.', 'error');
        this.cdr.markForCheck();
      }
    });
  }

  private setActionMessage(message: string, type: 'success' | 'error') {
    this.actionMessage = message;
    this.actionMessageType = type;
    this.cdr.markForCheck();
    setTimeout(() => {
      if (this.actionMessage === message) {
        this.actionMessage = '';
        this.cdr.markForCheck();
      }
    }, 3500);
  }

  applyFilters() {
    let filtered = this.requests;

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(r =>
        r.userName.toLowerCase().includes(q) ||
        r.serviceName.toLowerCase().includes(q)
      );
    }

    if (this.selectedFilter && this.selectedFilter.value) {
      filtered = filtered.filter(r => r.status === this.selectedFilter.value);
    }

    this.filteredRequests = filtered;
    this.first = 0;
    this.updatePagedRequests();
  }

  onFilterChange() {
    this.applyFilters();
  }

  onSearchChange() {
    this.applyFilters();
  }

  onPageChange(event: any) {
    this.first = event.first;
    this.rows = event.rows;
    this.updatePagedRequests();
  }

  updatePagedRequests() {
    this.pagedRequests = this.filteredRequests.slice(this.first, this.first + this.rows);
  }

  setViewMode(mode: 'grid' | 'list') {
    this.viewMode = mode;
  }
}

