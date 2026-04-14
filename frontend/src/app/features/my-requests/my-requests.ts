import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ServiceRequestsService, ServiceRequest } from '../../core/services/service-requests.service';
import { UserAuthService } from '../../core/services/auth.service';
import { Subscription } from 'rxjs';

interface RequestItem extends ServiceRequest {
  statusDisplay?: string;
  statusColor?: string;
  formattedDate?: string;
}

@Component({
  selector: 'app-my-requests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-requests.html',
  styleUrl: './my-requests.css'
})
export class MyRequests implements OnInit, OnDestroy {
  requests = signal<RequestItem[]>([]);
  loading = signal<boolean>(false);
  errorMessage = signal<string>('');
  userInfo = signal<string>('');

  private subscriptions = new Subscription();

  constructor(
    private serviceRequestsService: ServiceRequestsService,
    private authService: UserAuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCurrentUserRequests();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadCurrentUserRequests(): void {
    // Get current logged-in user
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser || !currentUser.cin) {
      this.errorMessage.set('No user logged in. Please login first.');
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const userName = currentUser.name || `CIN: ${currentUser.cin}`;
    this.userInfo.set(userName);

    const sub = this.serviceRequestsService.getUserServiceRequests(currentUser.cin).subscribe({
      next: (data) => {
        const formattedRequests = data.map(req => ({
          ...req,
          statusDisplay: this.formatStatus(req.status),
          statusColor: this.getStatusColor(req.status),
          formattedDate: this.formatDate(req.date_creation || req.requestedat)
        }));

        this.requests.set(formattedRequests);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading requests:', error);
        this.errorMessage.set('Failed to load your service requests. Please try again.');
        this.requests.set([]);
        this.loading.set(false);
      }
    });

    this.subscriptions.add(sub);
  }

  private formatStatus(status: string): string {
    const statusMap: Record<string, string> = {
      'en_attente': 'Pending',
      'pending': 'Pending',
      'en_cours': 'In Progress',
      'in_progress': 'In Progress',
      'approuvee': 'Approved',
      'approved': 'Approved',
      'rejetee': 'Rejected',
      'rejected': 'Rejected',
      'terminee': 'Completed',
      'completed': 'Completed'
    };
    return statusMap[status] || status;
  }

  private getStatusColor(status: string): string {
    const colorMap: Record<string, string> = {
      'en_attente': '#FFA726', // Orange
      'pending': '#FFA726',
      'en_cours': '#42A5F5', // Blue
      'in_progress': '#42A5F5',
      'approuvee': '#00BCD4', // Teal/Approved
      'approved': '#00BCD4',
      'rejetee': '#EF5350', // Red
      'rejected': '#EF5350',
      'terminee': '#66BB6A', // Green
      'completed': '#66BB6A'
    };
    return colorMap[status] || '#9E9E9E';
  }

  private formatDate(date: string | Date | undefined): string {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
