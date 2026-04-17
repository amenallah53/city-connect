import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectModule } from 'primeng/select';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { UserCard } from '../../shared/components/cards/user-card/user-card';
import { User } from '../../shared/models/user.model';
import { MOCK_USERS } from '../../shared/mock/users.mock';
import { UserFormDialog } from '../../shared/components/dialogs/user-form-dialog/user-form-dialog';

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
  roleFilters: RoleFilter[] = [];
  selectedRoleFilter: RoleFilter = { name: 'All Roles', code: 'all' };

  statusFilters: StatusFilter[] = [];
  selectedStatusFilter: StatusFilter = { name: 'All Status', code: 'all' };

  searchQuery: string = '';

  allUsers: User[] = MOCK_USERS;
  filteredUsers: User[] = [];
  pagedUsers: User[] = [];

  first: number = 0;
  rows: number = 4;

  private dialogRef: DynamicDialogRef | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dialogService: DialogService,
  ) { }

  ngOnInit() {
    this.roleFilters = [
      { name: 'All Roles', code: 'all' },
      { name: 'Citoyen', code: 'citoyen' },
      { name: 'Prestataire', code: 'prestataire' },
      { name: 'Admin', code: 'admin' },
    ];
    this.statusFilters = [
      { name: 'All Status', code: 'all' },
      { name: 'Accepted', code: 'accepted' },
      { name: 'Pending', code: 'pending' },
      { name: 'Rejected', code: 'rejected' },
    ];
    this.route.queryParams.subscribe(params => {
      const roleCode = params['role'] || 'all';
      const statusCode = params['status'] || 'all';
      this.searchQuery = params['q'] || '';
      this.selectedRoleFilter = this.roleFilters.find(r => r.code === roleCode) ?? this.roleFilters[0];
      this.selectedStatusFilter = this.statusFilters.find(s => s.code === statusCode) ?? this.statusFilters[0];
      this.first = 0;
      this.applyFilters();
    });
  }

  onFilterChange() { this.updateQueryParams(); }

  callFormDialog() {
    this.dialogRef = this.dialogService.open(UserFormDialog, {
      header: ' ',
      width: '680px',
      modal: true,
      closable: true,
      styleClass: 'user-dialog',
    });
  }

  onSearchKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.updateQueryParams();
    }
  }

  onPageChange(event: PaginatorState) {
    this.first = event.first ?? 0;
    this.rows = event.rows ?? 6;
    this.updatePagedUsers();
  }

  private updateQueryParams() {
    const queryParams: any = {};
    if (this.selectedRoleFilter.code !== 'all') queryParams['role'] = this.selectedRoleFilter.code;
    if (this.selectedStatusFilter.code !== 'all') queryParams['status'] = this.selectedStatusFilter.code;
    if (this.searchQuery.trim()) queryParams['q'] = this.searchQuery.trim();
    this.router.navigate([], { relativeTo: this.route, queryParams, replaceUrl: true });
  }

  private applyFilters() {
    const q = this.searchQuery.toLowerCase().trim();
    this.filteredUsers = this.allUsers.filter(user => {
      const matchRole =
        this.selectedRoleFilter.code === 'all' ||
        user.role === this.selectedRoleFilter.code;
      const matchStatus =
        this.selectedStatusFilter.code === 'all' ||
        user.status === this.selectedStatusFilter.code;
      const matchSearch =
        !q ||
        user.firstName.toLowerCase().includes(q) ||
        user.lastName.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        user.cin.toLowerCase().includes(q);
      return matchRole && matchStatus && matchSearch;
    });
    this.updatePagedUsers();
  }

  private updatePagedUsers() {
    this.pagedUsers = this.filteredUsers.slice(this.first, this.first + this.rows);
  }
}

