import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginatorModule } from 'primeng/paginator';
import { SelectModule } from 'primeng/select';
import { RequestCard } from '../../../shared/components/cards/request-card/request-card';

interface ServiceRequest {
  id: string;
  userName: string;
  serviceName: string;
  date: string;
  status: 'pending' | 'done';
}

@Component({
  selector: 'app-requests',
  imports: [CommonModule, FormsModule, PaginatorModule, SelectModule, RequestCard],
  templateUrl: './requests.html',
  styleUrl: './requests.css',
})
export class Requests implements OnInit {
  requests: ServiceRequest[] = [
    { id: '1', userName: 'amenallah Kalai', serviceName: 'Issuing a building permit', date: '12-04-2026', status: 'pending' },
    { id: '2', userName: 'amenallah Kalai', serviceName: 'Issuing a building permit', date: '12-04-2026', status: 'pending' },
    { id: '3', userName: 'ghazi mouaddeb', serviceName: 'Issuing a birth certificate', date: '22-03-2026', status: 'done' },
    { id: '4', userName: 'wassim zayen', serviceName: 'Issuing a death certificate', date: '15-02-2026', status: 'done' },
    { id: '5', userName: 'samer khouja', serviceName: 'Issuing a building permit', date: '10-01-2026', status: 'pending' }
  ];

  filteredRequests: ServiceRequest[] = [];
  pagedRequests: ServiceRequest[] = [];

  searchQuery: string = '';
  
  statusFilters = [
    { name: 'All Statuses', value: null },
    { name: 'Pending', value: 'pending' },
    { name: 'Done', value: 'done' }
  ];
  selectedFilter: any = this.statusFilters[0];

  viewMode: 'grid' | 'list' = 'list';

  // Pagination
  first: number = 0;
  rows: number = 3;

  ngOnInit() {
    this.applyFilters();
  }

  applyFilters() {
    let filtered = this.requests;

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(r => 
        r.userName.toLowerCase().includes(q) || 
        r.serviceName.toLowerCase().includes(q)
      );
    }

    if (this.selectedFilter && this.selectedFilter.value) {
      filtered = filtered.filter(r => r.status === this.selectedFilter.value);
    }

    this.filteredRequests = filtered;
    this.first = 0;
    this.updatePagedRequests();
  }

  onFilterChange() {
    this.applyFilters();
  }

  onSearchChange() {
    this.applyFilters();
  }

  onPageChange(event: any) {
    this.first = event.first;
    this.rows = event.rows;
    this.updatePagedRequests();
  }

  updatePagedRequests() {
    this.pagedRequests = this.filteredRequests.slice(this.first, this.first + this.rows);
  }

  setViewMode(mode: 'grid' | 'list') {
    this.viewMode = mode;
  }
}
