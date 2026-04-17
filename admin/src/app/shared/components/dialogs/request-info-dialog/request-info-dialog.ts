import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-request-info-dialog',
  standalone: true,
  imports: [CommonModule],
  providers: [DialogService],
  templateUrl: './request-info-dialog.html',
  styleUrl: './request-info-dialog.css'
})
export class RequestInfoDialog implements OnInit {
  req: any;

  constructor(public config: DynamicDialogConfig, public ref: DynamicDialogRef) {}

  ngOnInit() {
    this.req = this.config.data?.req;
  }

  approveRequest() {
    this.ref.close('approved');
  }

  rejectRequest() {
    this.ref.close('rejected');
  }

  getAttachments(): Array<{ name: string; type: string; url: string; bgColor: string }> {
    const incoming = Array.isArray(this.req?.attachments) ? this.req.attachments : [];

    return incoming
      .filter((item: any) => item && item.url)
      .map((item: any, index: number) => {
        const url = String(item.url || '').trim();
        const name = String(item.name || '').trim() || `Attachment_${index + 1}`;
        const rawType = String(item.type || '').toLowerCase();
        const type = rawType === 'image' || rawType === 'video' ? rawType : 'document';
        const bgColor = String(item.bgColor || '').trim() || '#E5E7EB';

        return { name, type, url, bgColor };
      });
  }

  previewAttachment(attachment: { url: string }) {
    if (!attachment?.url) return;
    window.open(attachment.url, '_blank', 'noopener');
  }

  downloadAttachment(attachment: { url: string; name: string }) {
    if (!attachment?.url) return;

    const anchor = document.createElement('a');
    anchor.href = attachment.url;
    anchor.download = attachment.name || 'attachment';
    anchor.target = '_blank';
    anchor.rel = 'noopener';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }
}
