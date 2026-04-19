import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectModule } from 'primeng/select';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';

import { ServiceScheduleCard } from '../../shared/components/cards/service-schedule-card/service-schedule-card';
import { HoraireService } from '../../shared/models/horaire-service.model';
import { SchedulesService } from '../../core/services/schedules.service';
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

  allSchedules: HoraireService[] = [];
  filteredSchedules: HoraireService[] = [];
  pagedSchedules: HoraireService[] = [];

  first: number = 0;
  rows: number = 4;

  private dialogRef: DynamicDialogRef | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dialogService: DialogService,
    private schedulesService: SchedulesService
  ) { }

  ngOnInit() {
    this.roleFilters = [
      { name: 'All Types', code: 'all' },
      { name: 'Collection', code: 'Collection' },
      { name: 'Administration', code: 'Administration' },
      { name: 'Health', code: 'Health' },
      { name: 'Education', code: 'Education' },
    ];

    this.loadSchedules();

    this.route.queryParams.subscribe((params) => {
      const roleCode = params['role'] || 'all';
      this.searchQuery = params['q'] || '';
      this.selectedRoleFilter =
        this.roleFilters.find((r) => r.code === roleCode) ?? this.roleFilters[0];
      this.first = 0;
      this.applyFilters();
    });
  }

  loadSchedules() {
    this.schedulesService.getSchedules().subscribe({
      next: (data) => {
        this.allSchedules = data;
        this.applyFilters();
      },
      error: (err) => console.error('Failed to load schedules', err)
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
      header: 'Add New Schedule',
      width: '700px',
      modal: true,
      closable: true,
      styleClass: 'user-dialog',
    });

    this.dialogRef!.onClose.subscribe((newSchedule: Partial<HoraireService>) => {
      if (newSchedule) {
        this.schedulesService.createSchedule(newSchedule).subscribe({
          next: () => this.loadSchedules(),
          error: (err) => console.error('Failed to create schedule', err)
        });
      }
    });
  }

  onEditSchedule(schedule: HoraireService) {
    this.dialogRef = this.dialogService.open(ServiceScheduleFormDialog, {
      header: 'Edit Schedule',
      width: '700px',
      modal: true,
      closable: true,
      styleClass: 'user-dialog',
      data: { schedule }
    });

    this.dialogRef!.onClose.subscribe((updatedSchedule: Partial<HoraireService>) => {
      if (updatedSchedule && schedule.id) {
        this.schedulesService.updateSchedule(schedule.id, updatedSchedule).subscribe({
          next: () => this.loadSchedules(),
          error: (err) => console.error('Failed to update schedule', err)
        });
      }
    });
  }

  onDeleteSchedule(id: string) {
    if (confirm('Are you sure you want to delete this schedule?')) {
      this.schedulesService.deleteSchedule(id).subscribe({
        next: () => this.loadSchedules(),
        error: (err) => console.error('Failed to delete schedule', err)
      });
    }
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

