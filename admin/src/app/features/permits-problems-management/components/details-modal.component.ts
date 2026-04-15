import { Component, EventEmitter, input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface Attachment {
  id: number;
  name: string;
  size: string;
  type: 'pdf' | 'image' | 'document';
  bgColor: string;
}

export interface RequestDetails {
  id: number;
  title: string;
  type: 'permit request' | 'certificate request' | 'problem report';
  status: 'Pending' | 'Approved' | 'Rejected';
  requesterName: string;
  email: string;
  phone: string;
  location: string;
  submitted: string;
  description: string;
  attachments: Attachment[];
  notes: string;
}

@Component({
  selector: 'app-details-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './details-modal.component.html',
  styleUrl: './details-modal.component.css'
})
export class DetailsModalComponent {
  isOpen = input(false);
  request = input<RequestDetails | null>(null);
  @Output() onClose = new EventEmitter<void>();
  @Output() onApprove = new EventEmitter<RequestDetails>();
  @Output() onReject = new EventEmitter<RequestDetails>();
  @Output() onSendNote = new EventEmitter<{ requestId: number; note: string }>();

  adminNote = signal('');

  close(): void {
    this.onClose.emit();
  }

  approve(): void {
    const req = this.request();
    if (req) {
      this.onApprove.emit(req);
      this.close();
    }
  }

  reject(): void {
    const req = this.request();
    if (req) {
      this.onReject.emit(req);
      this.close();
    }
  }

  sendNote(): void {
    const req = this.request();
    if (req && this.adminNote()) {
      this.onSendNote.emit({
        requestId: req.id,
        note: this.adminNote()
      });
      this.adminNote.set('');
    }
  }

  getStatusColor(): string {
    const req = this.request();
    if (!req) return '#FFFBE1';
    switch (req.status) {
      case 'Pending':
        return '#FFFBE1';
      case 'Approved':
        return '#E1FBEB';
      case 'Rejected':
        return '#FBE1E1';
      default:
        return '#FFFBE1';
    }
  }

  getStatusTextColor(): string {
    const req = this.request();
    if (!req) return '#973C00';
    switch (req.status) {
      case 'Pending':
        return '#973C00';
      case 'Approved':
        return '#0B7C41';
      case 'Rejected':
        return '#C1272D';
      default:
        return '#973C00';
    }
  }

  getTypeColor(): string {
    const req = this.request();
    if (!req) return '#E0F2FE';
    switch (req.type) {
      case 'permit request':
        return '#E0F2FE';
      case 'certificate request':
        return '#FEE2E2';
      case 'problem report':
        return '#FEE2E2';
      default:
        return '#E0F2FE';
    }
  }

  getAttachmentBgColor(type: string): string {
    switch (type) {
      case 'pdf':
        return '#FEE2E2';
      case 'image':
        return '#FEE2E2';
      case 'document':
        return '#E0E7FF';
      default:
        return '#DBEAFE';
    }
  }
}
