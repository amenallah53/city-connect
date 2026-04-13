import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportCard } from '../../../shared/components/cards/report-card/report-card';
import { TicketService } from '../../../core/services/ticket.service';
import { Ticket } from '../../../shared/models/ticket.model';
import { SelectModule } from 'primeng/select';
import { PaginatorModule } from 'primeng/paginator';
import { DialogModule } from 'primeng/dialog';

const mockReports: Report[] = [
  { id: '1',  title: 'Broken streetlight',       category: 'Street lighting',  city: 'Tunis',    status: 'pending',  date: '2025-03-01' },
  { id: '2',  title: 'Pothole on main road',      category: 'Potholes',         city: 'Sousse',   status: 'approved', date: '2025-03-05' },
  { id: '3',  title: 'Overflowing garbage bin',   category: 'Sanitation',       city: 'Sfax',     status: 'rejected', date: '2025-03-07' },
  { id: '4',  title: 'Faulty traffic light',      category: 'Traffic lights',   city: 'Ariana',   status: 'pending',  date: '2025-03-10' },
  { id: '5',  title: 'Bus stop damaged',          category: 'Public transport', city: 'Bizerte',  status: 'approved', date: '2025-03-12' },
  { id: '6',  title: 'Graffiti on public wall',   category: 'Other',            city: 'Nabeul',   status: 'rejected', date: '2025-03-14' },
  { id: '7',  title: 'Water leak on street',      category: 'Sanitation',       city: 'Monastir', status: 'pending',  date: '2025-03-15' },
  { id: '8',  title: 'Broken park bench',         category: 'Other',            city: 'Tunis',    status: 'approved', date: '2025-03-17' },
  { id: '9',  title: 'Missing road sign',         category: 'Traffic lights',   city: 'Gafsa',    status: 'pending',  date: '2025-03-18' },
  { id: '10', title: 'Damaged sidewalk',          category: 'Potholes',         city: 'Mahdia',   status: 'rejected', date: '2025-03-19' },
  { id: '11', title: 'Illegal dumping',           category: 'Sanitation',       city: 'Kairouan', status: 'approved', date: '2025-03-20' },
  { id: '12', title: 'Flooded underpass',         category: 'Other',            city: 'Sfax',     status: 'pending',  date: '2025-03-21' },
  { id: '13', title: 'Street light flickering',   category: 'Street lighting',  city: 'Tunis',    status: 'approved', date: '2025-03-22' },
  { id: '14', title: 'Cracked road surface',      category: 'Potholes',         city: 'Sousse',   status: 'pending',  date: '2025-03-23' },
];

@Component({
  selector: 'app-all-my-reports',
  imports: [CommonModule, ReportCard, SelectModule, PaginatorModule, DialogModule],
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
  ) {}

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