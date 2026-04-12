import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Ticket } from '../../../models/ticket.model';

@Component({
  selector: 'app-report-card',
  imports: [CommonModule],
  templateUrl: './report-card.html',
  styleUrl: './report-card.css',
})

export class ReportCard {
  @Input() ticket?: Ticket;
  @Input() status: 'approved' | 'pending' | 'rejected' = 'pending';

  get cardStatus(): 'approved' | 'pending' | 'rejected' {
    return this.ticket?.status || this.status;
  }
}