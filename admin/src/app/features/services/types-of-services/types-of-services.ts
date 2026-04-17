import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { SelectModule } from 'primeng/select';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ServiceCard } from '../../../shared/components/cards/service-card/service-card';
import { ServiceFormDialog } from '../../../shared/components/dialogs/service-form-dialog/service-form-dialog';
import { Service } from '../../../shared/models/service.model';
import { allServices } from '../../../shared/mock/services.mock';

interface BadgeFilter { name: string; code: string; }

@Component({
  selector: 'app-types-of-services',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginatorModule, SelectModule, ServiceCard],
  providers: [DialogService],
  templateUrl: './types-of-services.html',
  styleUrl: './types-of-services.css'
})
export class TypesOfServices implements OnInit {
  badgeFilters: BadgeFilter[] = [];
  selectedBadgeFilter: BadgeFilter = { name: 'Filter by Badge', code: 'all' };

  searchQuery: string = '';

  allServices: Service[] = allServices;
  filteredServices: Service[] = [];
  pagedServices: Service[] = [];

  first: number = 0;
  rows: number = 12;

  private dialogRef: DynamicDialogRef | null = null;

  constructor(private dialogService: DialogService) {}

  ngOnInit() {
    this.badgeFilters = [
      { name: 'All Badges', code: 'all' },
      { name: 'Electronic', code: 'Electronic' },
      { name: 'Not immediate', code: 'Not immediate' },
      { name: 'Free', code: 'Free' },
      { name: 'With Fees', code: 'With Fees' }
    ];
    this.selectedBadgeFilter = this.badgeFilters[0];
    this.applyFilters();
  }

  onFilterChange() {
    this.first = 0;
    this.applyFilters();
  }

  onSearchKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.first = 0;
      this.applyFilters();
    }
  }

  onPageChange(event: PaginatorState) {
    this.first = event.first ?? 0;
    this.rows = event.rows ?? 12;
    this.updatePagedServices();
  }

  addService() {
    this.dialogRef = this.dialogService.open(ServiceFormDialog, {
      header: ' ',
      width: '680px',
      modal: true,
      closable: true,
      styleClass: 'service-dialog',
    });
  }

  private applyFilters() {
    const q = this.searchQuery.toLowerCase().trim();
    this.filteredServices = this.allServices.filter(s => {
      const matchBadge =
        this.selectedBadgeFilter.code === 'all' ||
        (s.badges && s.badges.includes(this.selectedBadgeFilter.code));
      const matchSearch =
        !q ||
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.type && s.type.toLowerCase().includes(q));
      
      return matchBadge && matchSearch;
    });
    this.updatePagedServices();
  }

  private updatePagedServices() {
    this.pagedServices = this.filteredServices.slice(this.first, this.first + this.rows);
  }
}
