import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DetailsModalComponent, RequestDetails } from './components/details-modal.component';
import { RequestService, Request } from './services/request.service';

interface RequestItem {
  id: number;
  title: string;
  email: string;
  type: 'permit request' | 'certificate request' | 'problem report';
  status: 'Pending' | 'Approved' | 'Rejected';
  statusColor: '#FFFBE1' | '#E1FBEB' | '#FBE1E1';
  statusTextColor: '#973C00' | '#0B7C41' | '#C1272D';
  timestamp: string;
  backendData?: Request; // Keep reference to backend data
}

type FilterType = 'All types' | 'Permit' | 'Certificate' | 'Problem';
type FilterStatus = 'All statuses' | 'Pending' | 'Approved' | 'Rejected';

@Component({
  selector: 'app-permits-problems-management',
  standalone: true,
  imports: [CommonModule, FormsModule, DetailsModalComponent, HttpClientModule],
  providers: [RequestService],
  templateUrl: './permits-problems-management.component.html',
  styleUrl: './permits-problems-management.component.css'
})
export class PermitsProblemsManagementComponent implements OnInit {
  searchQuery = signal('');
  selectedType = signal<FilterType>('All types');
  selectedStatus = signal<FilterStatus>('All statuses');
  currentPage = signal(1);

  isModalOpen = signal(false);
  selectedRequest = signal<RequestDetails | null>(null);

  typeOptions: FilterType[] = ['All types', 'Permit', 'Certificate', 'Problem'];
  statusOptions: FilterStatus[] = ['All statuses', 'Pending', 'Approved', 'Rejected'];

  requests = signal<RequestItem[]>([]);
  isLoading = signal(false);
  errorMessage = signal('');

  itemsPerPage = 4;

  constructor(private requestService: RequestService) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    // Map UI status to backend status
    const statusMap: { [key: string]: string } = {
      'All statuses': 'en_attente',
      'Pending': 'en_attente',
      'Approved': 'approuvee',
      'Rejected': 'rejetee'
    };

    const status = statusMap[this.selectedStatus()] || 'en_attente';
    
    this.requestService.getRequests(status, this.currentPage(), 100).subscribe({
      next: (response) => {
        // Map backend requests to RequestItem
        const mappedRequests = response.data.map(req => this.mapBackendRequestToRequestItem(req));
        this.requests.set(mappedRequests);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading requests:', error);
        this.errorMessage.set('Failed to load requests. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  private mapBackendRequestToRequestItem(backendReq: Request): RequestItem {
    const status = this.normalizeStatus(backendReq.status);
    const type = this.normalizeType(backendReq.type);

    return {
      id: backendReq.id,
      title: backendReq.service_name || 'Service Request',
      email: backendReq.email,
      type: type,
      status: status,
      statusColor: this.getStatusColor(status),
      statusTextColor: this.getStatusTextColor(status),
      timestamp: new Date(backendReq.requestedat).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      backendData: backendReq
    };
  }

  private normalizeStatus(status: string): 'Pending' | 'Approved' | 'Rejected' {
    const normalized = status.toLowerCase();
    if (normalized === 'approuvee') return 'Approved';
    if (normalized === 'rejetee') return 'Rejected';
    if (normalized === 'terminee') return 'Pending'; // completed = pending (can be reviewed)
    return 'Pending'; // en_attente, en_cours, etc.
  }

  private normalizeType(type: string): 'permit request' | 'certificate request' | 'problem report' {
    const normalized = type.toLowerCase();
    if (normalized.includes('certificate')) return 'certificate request';
    if (normalized.includes('problem') || normalized === 'report') return 'problem report';
    return 'permit request';
  }

  private getStatusColor(status: string): '#FFFBE1' | '#E1FBEB' | '#FBE1E1' {
    switch (status) {
      case 'Approved': return '#E1FBEB';
      case 'Rejected': return '#FBE1E1';
      default: return '#FFFBE1';
    }
  }

  private getStatusTextColor(status: string): '#973C00' | '#0B7C41' | '#C1272D' {
    switch (status) {
      case 'Approved': return '#0B7C41';
      case 'Rejected': return '#C1272D';
      default: return '#973C00';
    }
  }

  get filteredRequests(): RequestItem[] {
    let filtered = this.requests();

    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      filtered = filtered.filter(
        r => r.title.toLowerCase().includes(query) || r.email.toLowerCase().includes(query)
      );
    }

    if (this.selectedType() !== 'All types') {
      filtered = filtered.filter(r => {
        switch (this.selectedType()) {
          case 'Permit':
            return r.type.includes('permit');
          case 'Certificate':
            return r.type.includes('certificate');
          case 'Problem':
            return r.type.includes('problem');
          default:
            return true;
        }
      });
    }

    if (this.selectedStatus() !== 'All statuses') {
      filtered = filtered.filter(r => r.status === this.selectedStatus());
    }

    return filtered;
  }

  get paginatedRequests(): RequestItem[] {
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage;
    return this.filteredRequests.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredRequests.length / this.itemsPerPage);
  }

  get pageNumbers(): (number | string)[] {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (this.totalPages <= maxVisible) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (this.currentPage() > 3) {
        pages.push('...');
      }
      for (let i = Math.max(2, this.currentPage() - 1); i <= Math.min(this.totalPages - 1, this.currentPage() + 1); i++) {
        if (pages[pages.length - 1] !== '...') {
          pages.push(i);
        }
      }
      if (this.currentPage() < this.totalPages - 2) {
        pages.push('...');
      }
      pages.push(this.totalPages);
    }

    return pages;
  }

  onApprove(request: RequestItem): void {
    if (request.backendData) {
      this.requestService.updateRequestStatus(request.id, 'approved').subscribe({
        next: () => {
          request.status = 'Approved';
          request.statusColor = '#E1FBEB';
          request.statusTextColor = '#0B7C41';
        },
        error: (error) => {
          console.error('Error approving request:', error);
          this.errorMessage.set('Failed to approve request');
        }
      });
    }
  }

  onReject(request: RequestItem): void {
    if (request.backendData) {
      this.requestService.updateRequestStatus(request.id, 'rejected').subscribe({
        next: () => {
          request.status = 'Rejected';
          request.statusColor = '#FBE1E1';
          request.statusTextColor = '#C1272D';
        },
        error: (error) => {
          console.error('Error rejecting request:', error);
          this.errorMessage.set('Failed to reject request');
        }
      });
    }
  }

  goToPage(page: number | string): void {
    if (typeof page === 'number' && page >= 1 && page <= this.totalPages) {
      this.currentPage.set(page);
    }
  }

  openDetails(request: RequestItem): void {
    if (!request.backendData) return;

    const details: RequestDetails = {
      id: request.id,
      title: request.title,
      type: request.type,
      status: request.status,
      requesterName: request.backendData.fullname || 'Unknown',
      email: request.email,
      phone: request.backendData.phone || 'N/A',
      location: request.backendData.location || 'N/A',
      submitted: request.timestamp,
      description: request.backendData.description || 'No description provided',
      attachments: request.backendData.attachments || [],
      notes: ''
    };

    this.selectedRequest.set(details);
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.selectedRequest.set(null);
  }

  onDetailApprove(request: RequestDetails): void {
    console.log('Approved request:', request.id);
    this.requestService.updateRequestStatus(request.id, 'approved').subscribe({
      next: () => {
        this.closeModal();
        this.loadRequests(); // Reload to update list
      },
      error: (error) => {
        console.error('Error approving request:', error);
        this.errorMessage.set('Failed to approve request');
      }
    });
  }

  onDetailReject(request: RequestDetails): void {
    console.log('Rejected request:', request.id);
    this.requestService.updateRequestStatus(request.id, 'rejected').subscribe({
      next: () => {
        this.closeModal();
        this.loadRequests(); // Reload to update list
      },
      error: (error) => {
        console.error('Error rejecting request:', error);
        this.errorMessage.set('Failed to reject request');
      }
    });
  }

  onDetailSendNote(data: { requestId: number; note: string }): void {
    console.log('Note sent for request:', data.requestId, 'Note:', data.note);
    // TODO: Implement backend API call to save note
  }
}

