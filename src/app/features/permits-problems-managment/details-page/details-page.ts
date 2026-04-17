import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Attachment {
  id: string;
  name: string;
  size: string;
  type: 'image' | 'pdf' | 'document';
}

interface PermitDetail {
  id: string | number;
  title: string;
  type: 'permit' | 'certificate' | 'problem';
  status: 'pending' | 'approved' | 'rejected';
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  requesterPhone: string;
  requesterLocation: string;
  submittedDate: string;
  description: string;
  attachments: Attachment[];
}

@Component({
  selector: 'app-details-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './details-page.html',
  styleUrl: './details-page.css',
  standalone: true,
})
export class DetailsPage implements OnInit {
  @Input() permit: PermitDetail | null = null;
  @Output() close = new EventEmitter<void>();

  adminNote: string = '';

  ngOnInit() {
    if (!this.permit) {
      // Initialize with sample data if no permit provided
      this.permit = {
        id: '1',
        title: 'Issuing a building permit',
        type: 'permit',
        status: 'pending',
        requesterId: 'REQ001',
        requesterName: 'jalel ben romdhane',
        requesterEmail: 'benromdhanejaleleddine@gmail.com',
        requesterPhone: '+216 55 123 456',
        requesterLocation: 'Tunis, Tunisia',
        submittedDate: '4 Mar 2026, 13:38',
        description: `I need a building permit for a residential property located at 123 Main Street, Tunis. The property is 250m² and will be used for family housing. The construction will include a two-story building with a garden area.

I have attached all required documents including my national ID card, the property deed, a site photograph, and the architectural floor plan. Please review and approve at your earliest convenience.

Contact me if any additional documents are needed. Thank you.`,
        attachments: [
          { id: '1', name: 'ID_card.pdf', size: '1.2 MB', type: 'pdf' },
          { id: '2', name: 'Property_deed.pdf', size: '3.4 MB', type: 'pdf' },
          { id: '3', name: 'site_photo.jpg', size: '2.1 MB', type: 'image' },
          { id: '4', name: 'floor_plan.pdf', size: '0.8 MB', type: 'pdf' },
          { id: '5', name: 'tax_receipt.pdf', size: '0.5 MB', type: 'pdf' },
          { id: '6', name: 'location_map.png', size: '1.8 MB', type: 'image' },
        ],
      };
    }
  }

  getTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      permit: 'permit request',
      certificate: 'certificate request',
      problem: 'problem report',
    };
    return labels[type] || type;
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      pending: 'status-pending',
      approved: 'status-approved',
      rejected: 'status-rejected',
    };
    return classes[status] || '';
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      pending: '#f59e0b',
      approved: '#10b981',
      rejected: '#ef4444',
    };
    return colors[status] || '#f59e0b';
  }

  approve() {
    console.log('Approve clicked for permit:', this.permit?.id);
  }

  reject() {
    console.log('Reject clicked for permit:', this.permit?.id);
  }

  sendNote() {
    if (this.adminNote.trim()) {
      console.log('Sending note:', this.adminNote);
      this.adminNote = '';
    }
  }

  closeModal() {
    this.close.emit();
  }

  downloadAttachment(attachment: Attachment) {
    console.log('Downloading:', attachment.name);
  }

  previewAttachment(attachment: Attachment) {
    console.log('Previewing:', attachment.name);
  }
}
