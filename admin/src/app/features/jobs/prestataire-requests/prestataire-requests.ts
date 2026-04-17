import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectModule } from 'primeng/select';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';

import { PrestataireCard } from '../../../shared/components/cards/prestataire-card/prestataire-card';
import { Prestataire } from '../../../shared/models/prestataire.model';
import { MOCK_PRESTATAIRES } from '../../../shared/mock/prestataires.mock';
import { PrestataireFormDialog } from '../../../shared/components/dialogs/prestataire-form-dialog/prestataire-form-dialog';

interface StatusFilter { name: string; code: string; }

@Component({
  selector: 'app-prestataire-requests',
  imports: [CommonModule, FormsModule, SelectModule, PaginatorModule, PrestataireCard],
  providers: [DialogService],
  templateUrl: './prestataire-requests.html',
  styleUrl: './prestataire-requests.css',
  standalone: true,
})
export class PrestataireRequests implements OnInit {
  statusFilters: StatusFilter[] = [];
  selectedStatusFilter: StatusFilter = { name: 'All Status', code: 'all' };

  searchQuery: string = '';

  allPrestataires: Prestataire[] = MOCK_PRESTATAIRES;
  filteredPrestataires: Prestataire[] = [];
  pagedPrestataires: Prestataire[] = [];

  first: number = 0;
  rows: number = 4;

  private dialogRef: DynamicDialogRef | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dialogService: DialogService,
  ) { }

  ngOnInit() {
    this.statusFilters = [
      { name: 'All Status', code: 'all' },
      { name: 'Accepted', code: 'accepted' },
      { name: 'Pending', code: 'pending' },
      { name: 'Rejected', code: 'rejected' },
    ];
    this.route.queryParams.subscribe(params => {
      const statusCode = params['status'] || 'all';
      this.searchQuery = params['q'] || '';
      this.selectedStatusFilter = this.statusFilters.find(s => s.code === statusCode) ?? this.statusFilters[0];
      this.first = 0;
      this.applyFilters();
    });
  }

  onFilterChange() { this.updateQueryParams(); }

  callFormDialog() {
    this.dialogRef = this.dialogService.open(PrestataireFormDialog, {
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
    this.rows = event.rows ?? 4;
    this.updatePagedPrestataires();
  }

  private updateQueryParams() {
    const queryParams: any = {};
    if (this.selectedStatusFilter.code !== 'all') queryParams['status'] = this.selectedStatusFilter.code;
    if (this.searchQuery.trim()) queryParams['q'] = this.searchQuery.trim();
    this.router.navigate([], { relativeTo: this.route, queryParams, replaceUrl: true });
  }

  private applyFilters() {
    const q = this.searchQuery.toLowerCase().trim();
    this.filteredPrestataires = this.allPrestataires.filter(prestataire => {
      const matchStatus =
        this.selectedStatusFilter.code === 'all' ||
        prestataire.status === this.selectedStatusFilter.code;
      const matchSearch =
        !q ||
        prestataire.firstName.toLowerCase().includes(q) ||
        prestataire.lastName.toLowerCase().includes(q) ||
        prestataire.email.toLowerCase().includes(q) ||
        prestataire.cin.toLowerCase().includes(q) ||
        (prestataire.specialty?.toLowerCase().includes(q));
      return matchStatus && matchSearch;
    });
    this.updatePagedPrestataires();
  }

  private updatePagedPrestataires() {
    this.pagedPrestataires = this.filteredPrestataires.slice(this.first, this.first + this.rows);
  }
}
