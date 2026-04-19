import { Component, OnInit,inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectModule } from 'primeng/select';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { UserCard } from '../../shared/components/cards/user-card/user-card';
import { UserFormDialog } from '../../shared/components/dialogs/user-form-dialog/user-form-dialog';
import { UsersServices } from '../../core/services/users-services';
import { computed, signal } from '@angular/core';

interface RoleFilter { name: string; code: string; }
interface StatusFilter { name: string; code: string; }

@Component({
  selector: 'app-users',
  imports: [CommonModule, FormsModule, SelectModule, Paginator, UserCard],
  providers: [DialogService],
  templateUrl: './users.html',
  styleUrl: './users.css',
  standalone: true,
})
export class Users implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private dialogService = inject(DialogService);
  private usersService = inject(UsersServices);

  // ← read directly from service signals
  allUsers = this.usersService.users;
  loading = this.usersService.loading;
  error = this.usersService.error;

  roleFilters: RoleFilter[] = [
    { name: 'All Roles', code: 'all' },
    { name: 'Citoyen', code: 'citoyen' },
    { name: 'Prestataire', code: 'prestataire' },
    { name: 'Admin', code: 'admin' },
  ];

  statusFilters: StatusFilter[] = [
    { name: 'All Status', code: 'all' },
    { name: 'Accepted', code: 'accepted' },
    { name: 'Pending', code: 'pending' },
    { name: 'Rejected', code: 'rejected' },
  ];

  searchQuery = signal('');
  selectedRoleFilter = signal<RoleFilter>({ name: 'All Roles', code: 'all' });
  selectedStatusFilter = signal<StatusFilter>({ name: 'All Status', code: 'all' });
  first = signal(0);
  rows = signal(6);

  filteredUsers = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    return this.allUsers().filter(user => {
      const matchRole =
        this.selectedRoleFilter().code === 'all' ||
        user.role === this.selectedRoleFilter().code;
      const matchStatus =
        this.selectedStatusFilter().code === 'all' ||
        user.status === this.selectedStatusFilter().code;
      const matchSearch =
        !q ||
        user.firstName.toLowerCase().includes(q) ||
        user.lastName.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        user.cin.toLowerCase().includes(q);
      return matchRole && matchStatus && matchSearch;
    });
  });

  pagedUsers = computed(() =>
    this.filteredUsers().slice(this.first(), this.first() + this.rows())
  );

  private dialogRef: DynamicDialogRef | null = null;

  ngOnInit() {
    this.usersService.loadAll();
    this.route.queryParams.subscribe(params => {
      const roleCode = params['role'] || 'all';
      const statusCode = params['status'] || 'all';
      this.searchQuery.set(params['q'] || '');
      this.selectedRoleFilter.set(this.roleFilters.find(r => r.code === roleCode) ?? this.roleFilters[0]);
      this.selectedStatusFilter.set(this.statusFilters.find(s => s.code === statusCode) ?? this.statusFilters[0]);
      this.first.set(0);
    });
  }

  loadUsers() {
    this.usersService.loadAll();
  }

  onRoleFilterChange(filter: RoleFilter) {
    this.selectedRoleFilter.set(filter);
    this.first.set(0);
    this.updateQueryParams();
  }

  onStatusFilterChange(filter: StatusFilter) {
    this.selectedStatusFilter.set(filter);
    this.first.set(0);
    this.updateQueryParams();
  }

  onSearchInput(event: Event) {
    this.searchQuery.set((event.target as HTMLInputElement).value);
    this.first.set(0);
  }

  onSearchKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.first.set(0);
      this.updateQueryParams();
    }
  }

  onPageChange(event: PaginatorState) {
    this.first.set(event.first ?? 0);
    this.rows.set(event.rows ?? 6);
  }

  callFormDialog() {
    this.dialogRef = this.dialogService.open(UserFormDialog, {
      header: ' ',
      width: '680px',
      modal: true,
      closable: true,
      styleClass: 'user-dialog',
    });
    this.dialogRef!.onClose.subscribe((success: boolean) => {
      if (success) this.loadUsers();
    });
  }

  private updateQueryParams() {
    const queryParams: any = {};
    if (this.selectedRoleFilter().code !== 'all') queryParams['role'] = this.selectedRoleFilter().code;
    if (this.selectedStatusFilter().code !== 'all') queryParams['status'] = this.selectedStatusFilter().code;
    if (this.searchQuery().trim()) queryParams['q'] = this.searchQuery().trim();
    this.router.navigate([], { relativeTo: this.route, queryParams, replaceUrl: true });
  }
}

