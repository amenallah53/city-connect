import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Plainte } from '../../../models/plainte.model';
import { ComplaintReplyDialog } from '../complaint-reply-dialog/complaint-reply-dialog';

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
  window = window;

  private dialogRef: DynamicDialogRef | null = null;

  constructor(public config: DynamicDialogConfig, private dialogService: DialogService) { }

  ngOnInit() {
    this.complaint = this.config.data?.complaint;
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
