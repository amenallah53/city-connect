import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobOffer } from 'src/app/shared/models/offer.model';


@Component({
  selector: 'app-offer-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './offer-card.html',
  styleUrl: './offer-card.css',
})
export class OfferCard {
  @Input() offer!: JobOffer;
  @Output() onAccept = new EventEmitter<void>();
  @Output() onDecline = new EventEmitter<void>();

  get statusLabel(): string {
    const map: Record<string, string> = {
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
      done: 'Done',
      cancelled: 'Cancelled',
    };
    return map[this.offer.status] ?? this.offer.status;
  }

  get statusColor(): string {
    const map: Record<string, string> = {
      pending: '#F8A000',
      approved: '#22A06B',
      rejected: '#E5484D',
      done: '#07839B',
      cancelled: '#8C8C8C',
    };
    return map[this.offer.status] ?? '#8C8C8C';
  }

  get isPending(): boolean {
    return this.offer.status === 'pending';
  }
}