import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Plainte } from '../../../models/plainte.model';

@Component({
  selector: 'app-complaint-reply-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './complaint-reply-dialog.html',
  styleUrl: './complaint-reply-dialog.css'
})
export class ComplaintReplyDialog implements OnInit {
  complaint!: Plainte;
  replyText: string = "Thank you for bringing this to our attention. We are looking into it and will get back to you soon.";

  constructor(public config: DynamicDialogConfig, public ref: DynamicDialogRef) { }

  ngOnInit() {
    this.complaint = this.config.data?.complaint;
  }

  submitReply() {
    this.ref.close(this.replyText);
  }
}
