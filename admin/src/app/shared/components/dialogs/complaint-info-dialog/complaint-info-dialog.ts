import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Plainte } from '../../../models/plainte.model';
import { ComplaintReplyDialog } from '../complaint-reply-dialog/complaint-reply-dialog';
import { TicketService } from '../../../../core/services/ticket.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-complaint-info-dialog',
  standalone: true,
  imports: [CommonModule],
  providers: [DialogService],
  templateUrl: './complaint-info-dialog.html',
  styleUrl: './complaint-info-dialog.css'
})
export class ComplaintInfoDialog implements OnInit {
  complaint!: Plainte;
  categoryName: string = 'Not specified';
  window = window;

  private dialogRef: DynamicDialogRef | null = null;

  constructor(
    public config: DynamicDialogConfig,
    private dialogService: DialogService,
    private ticketService: TicketService
  ) { }

  ngOnInit() {
    const initialComplaint = this.config.data?.complaint;
    if (initialComplaint) {
      this.complaint = initialComplaint;
      // Pre-populate categoryName if available from the object (backend joins it)
      const rawComplaint = initialComplaint as any;
      if (rawComplaint.category) {
        this.categoryName = rawComplaint.category;
      }

      if (initialComplaint.id) {
        // Use complaint ID to fetch fresh details and categories
        forkJoin({
          fullComplaint: this.ticketService.getTicketById(initialComplaint.id),
          categories: this.ticketService.getCategories()
        }).subscribe({
          next: (res) => {
            this.complaint = res.fullComplaint;
            const rawFull = res.fullComplaint as any;

            // Prefer the joined category string from backend
            if (rawFull.category) {
              this.categoryName = rawFull.category;
            } else {
              // Fallback: match ID with categories list
              const catId = rawFull.categorie_id || rawFull.categorieId;
              const category = res.categories.find((c: any) => c.id === catId);
              if (category) {
                this.categoryName = category.type;
              }
            }
          },
          error: (err) => {
            console.error('Failed to fetch complaint details or categories:', err);
          }
        });
      }
    }
  }

  openReply() {
    this.dialogRef = this.dialogService.open(ComplaintReplyDialog, {
      data: { complaint: this.complaint },
      header: ' ',
      width: '600px',
      modal: true,
      closable: true,
      styleClass: 'complaint-reply-dialog',
    });
  }
}
