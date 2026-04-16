import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataViewModule } from 'primeng/dataview';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DetailsPage } from './details-page/details-page';

export interface PermitItem {
  id: number;
  title: string;
  email: string;
  requestType: 'permit' | 'certificate' | 'problem';
  status: 'pending' | 'approved' | 'rejected';
  date: string;
}

@Component({
  selector: 'app-permits-problems-managment',
  imports: [CommonModule, FormsModule, DataViewModule, ButtonModule, TagModule, DetailsPage],
  templateUrl: './permits-problems-managment.html',
  styleUrl: './permits-problems-managment.css',
})
export class PermitsProblemsManagment implements OnInit {
  permits: PermitItem[] = [];
  filteredPermits: PermitItem[] = [];
  searchTerm: string = '';
  selectedType: string = 'All types';
  selectedStatus: string = 'All statuses';
  itemsPerPage: number = 4;
  selectedPermit = signal<PermitItem | null>(null);

  ngOnInit() {
    this.initializePermits();
    this.filterAndPaginate();
  }

  private initializePermits() {
    this.permits = [
      {
        id: 1,
        title: 'Issuing a building permit',
        email: 'benromdhanejaleleddine@gmail.com',
        requestType: 'permit',
        status: 'pending',
        date: '4 Mar 2026, 13:38',
      },
      {
        id: 2,
        title: 'Printing a burial certificate',
        email: 'leila@example.tn',
        requestType: 'certificate',
        status: 'approved',
        date: '4 Mar 2026, 13:38',
      },
      {
        id: 3,
        title: 'Broken street lights',
        email: 'karim@example.tn',
        requestType: 'problem',
        status: 'rejected',
        date: '4 Mar 2026, 13:38',
      },
      {
        id: 4,
        title: 'Broken street lights',
        email: 'karim@example.tn',
        requestType: 'problem',
        status: 'rejected',
        date: '4 Mar 2026, 13:38',
      },
      {
        id: 5,
        title: 'Road repair request',
        email: 'ahmed@example.tn',
        requestType: 'problem',
        status: 'pending',
        date: '3 Mar 2026, 10:15',
      },
      {
        id: 6,
        title: 'Business license application',
        email: 'fatima@example.tn',
        requestType: 'certificate',
        status: 'approved',
        date: '2 Mar 2026, 09:45',
      },
    ];
  }

  filterAndPaginate() {
    // Filter based on search, type, and status
    this.filteredPermits = this.permits.filter((permit) => {
      const matchesSearch =
        permit.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        permit.email.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesType =
        this.selectedType === 'All types' ||
        (this.selectedType === 'Permit requests' && permit.requestType === 'permit') ||
        (this.selectedType === 'Certificate requests' && permit.requestType === 'certificate') ||
        (this.selectedType === 'Problem reports' && permit.requestType === 'problem');

      const matchesStatus =
        this.selectedStatus === 'All statuses' ||
        (this.selectedStatus === 'Pending' && permit.status === 'pending') ||
        (this.selectedStatus === 'Approved' && permit.status === 'approved') ||
        (this.selectedStatus === 'Rejected' && permit.status === 'rejected');

      return matchesSearch && matchesType && matchesStatus;
    });
  }

  onSearch(term: string) {
    this.searchTerm = term;
    this.filterAndPaginate();
  }

  onTypeFilter(type: string) {
    this.selectedType = type;
    this.filterAndPaginate();
  }

  onStatusFilter(status: string) {
    this.selectedStatus = status;
    this.filterAndPaginate();
  }

  approve(permit: PermitItem) {
    const index = this.permits.findIndex((p) => p.id === permit.id);
    if (index !== -1) {
      this.permits[index].status = 'approved';
      this.filterAndPaginate();
    }
  }

  reject(permit: PermitItem) {
    const index = this.permits.findIndex((p) => p.id === permit.id);
    if (index !== -1) {
      this.permits[index].status = 'rejected';
      this.filterAndPaginate();
    }
  }

  openDetails(permit: PermitItem) {
    this.selectedPermit.set(permit);
  }

  closeDetails() {
    this.selectedPermit.set(null);
  }

  getPermitDetail() {
    const permit = this.selectedPermit();
    if (!permit) return null;

    return {
      id: permit.id,
      title: permit.title,
      type: permit.requestType,
      status: permit.status,
      requesterId: `REQ${permit.id.toString().padStart(3, '0')}`,
      requesterName: 'jalel ben romdhane',
      requesterEmail: permit.email,
      requesterPhone: '+216 55 123 456',
      requesterLocation: 'Tunis, Tunisia',
      submittedDate: permit.date,
      description: `I need a ${this.getRequestTypeLabel(permit.requestType)} for this request. The property is located at a verified location and all required documents have been prepared for submission.

All necessary supporting documents and evidence have been attached to this application. Please review and process accordingly with the standard procedures.

Contact me if any additional information or clarification is needed. Thank you for your attention to this matter.`,
      attachments: [
        { id: '1', name: 'ID_card.pdf', size: '1.2 MB', type: 'pdf' as const },
        { id: '2', name: 'Property_deed.pdf', size: '3.4 MB', type: 'pdf' as const },
        { id: '3', name: 'site_photo.jpg', size: '2.1 MB', type: 'image' as const },
        { id: '4', name: 'floor_plan.pdf', size: '0.8 MB', type: 'pdf' as const },
        { id: '5', name: 'tax_receipt.pdf', size: '0.5 MB', type: 'pdf' as const },
        { id: '6', name: 'location_map.png', size: '1.8 MB', type: 'image' as const },
      ],
    };
  }

  getRequestTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      permit: 'permit request',
      certificate: 'certificate request',
      problem: 'problem report',
    };
    return labels[type] || type;
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }
}
