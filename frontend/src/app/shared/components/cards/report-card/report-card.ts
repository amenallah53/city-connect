import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
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
  @Output() viewDetails = new EventEmitter<Ticket>();

  get cardStatus(): 'approved' | 'pending' | 'rejected' {
    const rawStatus = this.ticket?.status?.toLowerCase() || this.status;
    
    // Map French DB statuses to English UI categories
    if (rawStatus === 'en_attente') return 'pending';
    if (rawStatus === 'en_cours') return 'pending'; // or maybe an 'in-progress' if we add it
    if (rawStatus === 'resolu') return 'approved';
    if (rawStatus === 'rejete') return 'rejected';
    
    return rawStatus as 'approved' | 'pending' | 'rejected';
  }

  onViewClick() {
    if (this.ticket) {
      this.viewDetails.emit(this.ticket);
    }
  }
}