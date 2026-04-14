import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportCard } from '../../../shared/components/cards/report-card/report-card';
import { TicketService } from '../../../core/services/ticket.service';
import { Ticket } from '../../../shared/models/ticket.model';
import { SelectModule } from 'primeng/select';
import { PaginatorModule } from 'primeng/paginator';
import { DialogModule } from 'primeng/dialog';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-all-my-reports',
  imports: [CommonModule, ReportCard, SelectModule, PaginatorModule, DialogModule, RouterLink],
  templateUrl: './all-my-reports.html',
  styleUrl: './all-my-reports.css',
})
export class AllMyReports implements OnInit {
  tickets: Ticket[] = [];
  errorMessage: string | null = null;
  loading: boolean = false;

  first: number = 0;
  rows: number = 12;
  totalRecords: number = 0;

  selectedTicket: Ticket | null = null;
  displayDialog: boolean = false;

  constructor(
    private ticketService: TicketService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadTickets();
  }

  openTicketDetails(ticket: Ticket): void {
    this.selectedTicket = ticket;
    this.displayDialog = true;
  }

  loadTickets(): void {
    this.loading = true;
    this.errorMessage = null;

    const page = Math.floor(this.first / this.rows) + 1;

    this.ticketService.getAllTickets({ page, limit: this.rows }).subscribe({
      next: (response) => {
        console.log('Tickets received in AllMyReports:', response);
        this.tickets = response.data;
        this.totalRecords = response.total;
        this.loading = false;
        this.cdr.detectChanges(); // Manual trigger to fix NG0100
      },
      error: (err) => {
        console.error('Error loading tickets:', err);
        this.errorMessage = `Failed to load reports: ${err.message || 'Unknown error'}`;
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onPageChange(event: any) {
    this.first = event.first;
    this.rows = event.rows;
    this.loadTickets();
  }
}