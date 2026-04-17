import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { RequestInfoDialog } from '../../dialogs/request-info-dialog/request-info-dialog';

@Component({
  selector: 'app-request-card',
  standalone: true,
  imports: [CommonModule],
  providers: [DialogService],
  templateUrl: './request-card.html',
  styleUrl: './request-card.css'
})
export class RequestCard {
  @Input() req!: any;
  @Input() viewMode: 'grid' | 'list' = 'list';
  @Output() actionExecuted = new EventEmitter<void>();
  @Output() statusUpdated = new EventEmitter<{ requestId: string; status: 'approved' | 'rejected' }>();

  private dialogRef: DynamicDialogRef | null = null;

  constructor(private dialogService: DialogService) { }

  viewRequest() {
    this.dialogRef = this.dialogService.open(RequestInfoDialog, {
      data: { req: this.req },
      header: ' ',
      width: '680px',
      modal: true,
      closable: true,
      styleClass: 'request-info-dialog',
    });

    if (this.dialogRef) {
      this.dialogRef.onClose.subscribe((result?: boolean | 'approved' | 'rejected') => {
        if (result === 'approved' || result === 'rejected') {
          this.emitStatus(result);
          this.actionExecuted.emit();
          return;
        }

        if (result) {
          this.actionExecuted.emit();
        }
      });
    }
  }

  approveRequest() {
    this.emitStatus('approved');
  }

  rejectRequest() {
    this.emitStatus('rejected');
  }

  private emitStatus(status: 'approved' | 'rejected') {
    const requestId = this.req?.id;
    if (!requestId) {
      console.warn('RequestCard: missing request id for status update action.');
      return;
    }

    this.statusUpdated.emit({ requestId, status });
  }
}
