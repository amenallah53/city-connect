import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FaqInfoDialog } from '../../dialogs/faq-info-dialog/faq-info-dialog';
import { FaqFormDialog } from '../../dialogs/faq-form-dialog/faq-form-dialog';
import { Faq } from '../../../models/faq.model';

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

  private dialogRef: DynamicDialogRef | null = null;

  constructor(private dialogService: DialogService) {}

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
  }
}

