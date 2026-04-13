import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, switchMap } from 'rxjs/operators';
import { Ticket } from '../../shared/models/ticket.model';
import { environment } from '../../../environments/environment';
import { UploadService } from './upload.service';
import { of } from 'rxjs';

export interface PaginatedTickets {
  data: Ticket[];
  total: number;
}

export interface TicketFilters {
  city?: string;
  category?: string;
  status?: 'pending' | 'approved' | 'rejected';
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
    console.log('TicketService initialized with apiUrl:', this.apiUrl);
  }

  getAllTickets(filters?: TicketFilters): Observable<PaginatedTickets> {
    let params = new HttpParams();

    if (filters) {
      if (filters.city) params = params.set('city', filters.city);
      if (filters.category) params = params.set('category', filters.category);
      if (filters.status) params = params.set('status', filters.status);
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.limit) params = params.set('limit', filters.limit.toString());
    }

    return this.http.get<PaginatedTickets>(this.apiUrl, { params })
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  getTicketById(id: string): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.apiUrl}/${id}`)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  
  createTicket(ticket: Ticket, file?: File): Observable<Ticket> {
    if (file) {
      return this.uploadService.uploadImage(file).pipe(
        switchMap(res => {
          ticket.image = res.url;
          return this.http.post<Ticket>(this.apiUrl, ticket);
        }),
        catchError(this.handleError)
      );
    }
    return this.http.post<Ticket>(this.apiUrl, ticket)
      .pipe(
        catchError(this.handleError)
      );
  }

  
  updateTicket(id: string, ticket: Partial<Ticket>): Observable<Ticket> {
    return this.http.put<Ticket>(`${this.apiUrl}/${id}`, ticket)
      .pipe(
        catchError(this.handleError)
      );
  }

  
  deleteTicket(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }


  updateStatus(id: string, status: 'pending' | 'approved' | 'rejected'): Observable<Ticket> {
    return this.http.patch<Ticket>(`${this.apiUrl}/${id}/status`, { status })
      .pipe(
        catchError(this.handleError)
      );
  }

  
  searchTickets(query: string): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.apiUrl}/search?q=${query}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Something went wrong';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Server Error: ${error.status} - ${error.message}`;
    }

    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}







/*
Create ticket
this.ticketService.createTicket(form.value).subscribe({
  next: (res) => console.log('Created:', res),
  error: (err) => console.error(err)
});

Load tickets
this.ticketService.getAllTickets().subscribe(data => {
  this.tickets = data;
});


Filtering tickets:
this.ticketService.getAllTickets({ status: 'pending' })


Update status:
this.ticketService.updateStatus(id, 'approved')

*/