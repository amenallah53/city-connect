import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FaqInfoDialog } from '../../dialogs/faq-info-dialog/faq-info-dialog';
import { FaqFormDialog } from '../../dialogs/faq-form-dialog/faq-form-dialog';
import { Faq } from '../../../models/faq.model';
import { FaqServices } from '../../../../core/services/faq-services';

@Component({
  selector: 'app-faq-card',
  standalone: true,
  imports: [CommonModule],
  providers: [DialogService],
  templateUrl: './faq-card.html',
  styleUrl: './faq-card.css'
})
export class FaqCard {
  @Input() faq!: Faq;
  @Output() faqUpdated = new EventEmitter();

  private dialogService = inject(DialogService);
  private faqService = inject(FaqServices);
  private dialogRef: DynamicDialogRef | null = null;

  viewFaq() {
    this.dialogRef = this.dialogService.open(FaqInfoDialog, {
      data: { faq: this.faq },
      header: ' ',
      width: '680px',
      modal: true,
      closable: true,
      styleClass: 'faq-dialog',
    });
  }

  editFaq() {
    this.dialogRef = this.dialogService.open(FaqFormDialog, {
      data: { faq: this.faq },
      header: ' ',
      width: '680px',
      modal: true,
      closable: true,
      styleClass: 'faq-dialog',
    });
    this.dialogRef!.onClose.subscribe((success: boolean) => {
      if (success) this.faqUpdated.emit();
    });
  }

  deleteFaq() {
    this.faqService.delete(this.faq.id!).subscribe({
      next: () => this.faqUpdated.emit(),
      error: () => console.error('Failed to delete FAQ')
    });
  }
}