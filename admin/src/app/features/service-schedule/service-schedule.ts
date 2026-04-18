import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectModule } from 'primeng/select';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';

import { ServiceScheduleCard } from '../../shared/components/cards/service-schedule-card/service-schedule-card';
import { HoraireService } from '../../shared/models/horaire-service.model';
import { MOCK_HORAIRE_SERVICES } from '../../shared/mock/horaire-service.mock';
import { ServiceScheduleFormDialog } from '../../shared/components/dialogs/service-schedule-form-dialog/service-schedule-form-dialog';

interface RoleFilter {
  name: string;
  code: string;
}

@Component({
  selector: 'app-service-schedule',
  imports: [CommonModule, FormsModule, SelectModule, Paginator, ServiceScheduleCard],
  providers: [DialogService],
  templateUrl: './service-schedule.html',
  styleUrl: './service-schedule.css',
  standalone: true,
})
export class ServiceSchedule implements OnInit {
  roleFilters: RoleFilter[] = [];
  selectedRoleFilter: RoleFilter = { name: 'Filter by role', code: 'all' };

  searchQuery: string = '';

  allSchedules: HoraireService[] = MOCK_HORAIRE_SERVICES;
  filteredSchedules: HoraireService[] = [];
  pagedSchedules: HoraireService[] = [];

  first: number = 0;
  rows: number = 4;

  private dialogRef: DynamicDialogRef | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dialogService: DialogService
  ) { }

  ngOnInit() {
    this.roleFilters = [
      { name: 'All Types', code: 'all' },
      { name: 'Collection', code: 'Collection' },
      { name: 'Administration', code: 'Administration' },
      { name: 'Health', code: 'Health' },
      { name: 'Education', code: 'Education' },
    ];

    this.route.queryParams.subscribe((params) => {
      const roleCode = params['role'] || 'all';
      this.searchQuery = params['q'] || '';
      this.selectedRoleFilter =
        this.roleFilters.find((r) => r.code === roleCode) ?? this.roleFilters[0];
      this.first = 0;
      this.applyFilters();
    });
  }

  onFilterChange() {
    this.updateQueryParams();
  }

  onSearchKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.updateQueryParams();
    }
  }

  onPageChange(event: PaginatorState) {
    this.first = event.first ?? 0;
    this.rows = event.rows ?? 4;
    this.updatePagedSchedules();
  }

  callAddScheduleDialog() {
    this.dialogRef = this.dialogService.open(ServiceScheduleFormDialog, {
      header: ' ',
      width: '700px',
      modal: true,
      closable: true,
      styleClass: 'user-dialog',
    });

    this.dialogRef!.onClose.subscribe((newSchedule: HoraireService) => {
      if (newSchedule) {
        newSchedule.id = String(Date.now());
        this.allSchedules.unshift(newSchedule);
        this.applyFilters();
      }
    });
  }

  private updateQueryParams() {
    const queryParams: any = {};
    if (this.selectedRoleFilter.code !== 'all')
      queryParams['role'] = this.selectedRoleFilter.code;
    if (this.searchQuery.trim()) queryParams['q'] = this.searchQuery.trim();
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      replaceUrl: true,
    });
  }

  private applyFilters() {
    const q = this.searchQuery.toLowerCase().trim();
    this.filteredSchedules = this.allSchedules.filter((schedule) => {
      const matchRole =
        this.selectedRoleFilter.code === 'all' ||
        schedule.type === this.selectedRoleFilter.code;
      const matchSearch =
        !q ||
        schedule.name?.toLowerCase().includes(q) ||
        schedule.type?.toLowerCase().includes(q);
      return matchRole && matchSearch;
    });
    this.updatePagedSchedules();
  }

  private updatePagedSchedules() {
    this.pagedSchedules = this.filteredSchedules.slice(
      this.first,
      this.first + this.rows
    );
  }
}

