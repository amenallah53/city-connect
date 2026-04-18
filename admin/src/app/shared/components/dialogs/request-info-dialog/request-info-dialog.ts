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
  certificate: { name: string; type: string; url: string; bgColor: string } | null = null;

  constructor(public config: DynamicDialogConfig, public ref: DynamicDialogRef) { }

  ngOnInit() {
    this.req = this.config.data?.req;
    this.loadCertificate();
  }

  approveRequest() {
    this.ref.close('approved');
  }

  rejectRequest() {
    this.ref.close('rejected');
  }

  async loadCertificate() {
    try {
      const response = await fetch(`http://localhost:5006/api/service-requests/certificate/${this.req.id}`);
      const result = await response.json();

      if (result.success && result.data) {
        const cert = result.data;

        this.certificate = {
          name: 'Certificate-' + String(cert.id || '').trim(),
          type: 'document',
          url: String(cert.file_url || '').trim(),
          bgColor: '#E5E7EB'
        };
      } else {
        this.certificate = null;
      }
    } catch (error) {
      console.error('Error loading certificate:', error);
      this.certificate = null;
    }
  }


  /*getCertificate(): { name: string; type: string; url: string; bgColor: string } {

    const certificate = fetch(`http://localhost:5006/api/service-requests/certificate/${this.req.id}`)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        return data;
      });

    const incoming = Array.isArray(this.req?.attachments) ? this.req.attachments : [];

    const url = String(certificate.file_url || '').trim();
    const name = "Certificate";
    const rawType = "pdf";
    const type = 'document';
    const bgColor = '#E5E7EB';

    return { name, type, url, bgColor };
    ;
  }*/

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
