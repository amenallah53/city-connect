import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ComplaintInfoDialog } from '../../dialogs/complaint-info-dialog/complaint-info-dialog';
import { ComplaintReplyDialog } from '../../dialogs/complaint-reply-dialog/complaint-reply-dialog';
import { ComplaintDeleteDialog } from '../../dialogs/complaint-delete-dialog/complaint-delete-dialog';
import { Plainte } from '../../../models/plainte.model';
import { TicketService } from '../../../../core/services/ticket.service';

@Component({
  selector: 'app-complaint-card',
  standalone: true,
  imports: [CommonModule],
  providers: [DialogService],
  templateUrl: './complaint-card.html',
  styleUrl: './complaint-card.css'
})
export class ComplaintCard {
  @Input() complaint!: Plainte;
  @Output() actionExecuted = new EventEmitter<void>();

  private dialogRef: DynamicDialogRef | null = null;

  constructor(
    private dialogService: DialogService,
    private ticketService: TicketService
  ) {}

  viewComplaint() {
    this.dialogRef = this.dialogService.open(ComplaintInfoDialog, {
      data: { complaint: this.complaint },
      header: ' ',
      width: '680px',
      modal: true,
      closable: true,
      styleClass: 'complaint-dialog',
    });

    if (this.dialogRef) {
      this.dialogRef.onClose.subscribe((updated: boolean) => {
        if (updated) {
          this.actionExecuted.emit();
        }
      });
    }
  }

  replyComplaint() {
    const ref = this.dialogService.open(ComplaintReplyDialog, {
      data: { complaint: this.complaint },
      header: ' ',
      width: '600px',
      modal: true,
      closable: true,
      styleClass: 'complaint-reply-dialog',
    });

    if (ref) {
      ref.onClose.subscribe((reply: string) => {
        if (reply && this.complaint.id) {
          this.ticketService.updateStatus(this.complaint.id, 'accepted').subscribe({
            next: () => this.actionExecuted.emit(),
            error: (err) => console.error('Error replying/updating status', err)
          });
        }
      });
    }
  }

  deleteComplaint() {
    const ref = this.dialogService.open(ComplaintDeleteDialog, {
      data: { complaint: this.complaint },
      header: ' ',
      width: '400px',
      modal: true,
      closable: true,
      styleClass: 'complaint-delete-dialog',
    });

    if (ref) {
      ref.onClose.subscribe((confirmed: boolean) => {
        if (confirmed && this.complaint.id) {
          this.ticketService.deleteTicket(this.complaint.id).subscribe({
            next: () => this.actionExecuted.emit(),
            error: (err) => console.error('Error deleting complaint', err)
          });
        }
      });
    }
  }
}
