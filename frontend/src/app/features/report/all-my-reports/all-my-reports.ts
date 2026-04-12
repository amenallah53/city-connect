import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportCard } from '../../../shared/components/cards/report-card/report-card';
import { TicketService } from '../../../core/services/ticket.service';
import { Ticket } from '../../../shared/models/ticket.model';
import { SelectModule } from 'primeng/select';
import { PaginatorModule } from 'primeng/paginator';

@Component({
  selector: 'app-all-my-reports',
  imports: [CommonModule, ReportCard, SelectModule, PaginatorModule],
  templateUrl: './all-my-reports.html',
  styleUrl: './all-my-reports.css',
})
export class AllMyReports implements OnInit {
  tickets: Ticket[] = [];
  loading: boolean = false;

  constructor(private ticketService: TicketService) {}

  ngOnInit(): void {
    this.loadTickets();
  }

  loadTickets(): void {
    this.loading = true;
    this.ticketService.getAllTickets().subscribe({
      next: (data) => {
        this.tickets = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading tickets:', err);
        this.loading = false;
      }
    });
  }
}