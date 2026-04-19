import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  isLoading = true;

  // KPIs
  totalUsers = 0;
  totalComplaints = 0;
  pendingComplaints = 0;
  totalServiceReqs = 0;
  activeServiceReqs = 0;

  // Icons are now handled via PrimeIcons classes in HTML
  
  recentActivities: { type: string, message: string, date: Date, status: string }[] = [];

  constructor(private http: HttpClient) {}

  private get authHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    if (typeof window !== 'undefined' && window.localStorage) {
      const token = localStorage.getItem('token');
      if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  ngOnInit(): void {
    this.fetchMetrics();
  }

  fetchMetrics() {
    this.isLoading = true;

    // Users
    const usersReq = this.http.get<any[]>('http://localhost:5000/api/admin', { headers: this.authHeaders }).pipe(
      catchError(() => of([]))
    );

    // Tickets
    const ticketsReq = this.http.get<any>(`${environment.ticketsUrl}?limit=1`, { headers: this.authHeaders }).pipe(
      catchError(() => of({ total: 0, data: [] }))
    );

    const ticketsPendingReq = this.http.get<any>(`${environment.ticketsUrl}?status=pending&limit=1`, { headers: this.authHeaders }).pipe(
      catchError(() => of({ total: 0, data: [] }))
    );

    // Service Requests
    const serviceReqs = this.http.get<any>(`${environment.serviceRequestsUrl}?limit=1000`, { headers: this.authHeaders }).pipe(
      catchError(() => of({ data: [] }))
    );

    forkJoin([usersReq, ticketsReq, ticketsPendingReq, serviceReqs]).subscribe(
      ([users, tickets, pendingTickets, requests]) => {
        this.totalUsers = users?.length || 0;
        this.totalComplaints = tickets?.total || 0;
        this.pendingComplaints = pendingTickets?.total || 0;
        
        const reqData = requests?.data || requests || [];
        const reqArray = Array.isArray(reqData) ? reqData : [];
        this.totalServiceReqs = reqArray.length;
        this.activeServiceReqs = reqArray.filter(r => r.status === 'pending' || r.status === 'in_progress' || r.status === 'en_cours' || r.status === 'en_attente').length;

        // Build some recent mock activity logic just to populate the timeline
        this.buildRecentActivities(users, tickets?.data, reqArray);
        this.isLoading = false;
      }
    );
  }

  buildRecentActivities(users: any[], ticketsData: any[], srData: any[]) {
    let combined: { type: string, message: string, date: Date, status: string }[] = [];

    (users || []).slice(0, 3).forEach(u => {
      combined.push({
        type: 'user',
        message: `New citizen registered: ${u.first_name || 'User'} ${u.last_name || ''}`,
        date: new Date(u.created_at || new Date()),
        status: 'success'
      });
    });

    (ticketsData || []).forEach(t => {
      combined.push({
        type: 'complaint',
        message: `Complaint submitted regarding: ${t.category || 'City Services'}`,
        date: new Date(t.date_creation || new Date()),
        status: t.status === 'pending' ? 'warning' : 'success'
      });
    });

    (srData || []).slice(0, 5).forEach(s => {
      combined.push({
        type: 'service',
        message: `Service request created for: ${s.service_name || 'General Requirement'}`,
        date: new Date(s.submission_date || s.requestedat || new Date()),
        status: (s.status === 'pending' || s.status === 'en_attente') ? 'warning' : 'success'
      });
    });

    // Sort by date desc and take top 8
    this.recentActivities = combined
      .filter(item => !isNaN(item.date.getTime()))
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 8);
  }
}
