import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectModule } from 'primeng/select';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ComplaintCard } from '../../shared/components/cards/complaint-card/complaint-card';
import { ComplaintFormDialog } from '../../shared/components/dialogs/complaint-form-dialog/complaint-form-dialog';
import { TicketService, PaginatedPlaintes, PlainteFilters } from '../../core/services/ticket.service';
import { Plainte } from '../../shared/models/plainte.model';

interface BadgeFilter { name: string; code: string; }

@Component({
  selector: 'app-complaints',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectModule, PaginatorModule, ComplaintCard],
  providers: [DialogService],
  templateUrl: './complaints.html',
  styleUrl: './complaints.css'
})
export class Complaints implements OnInit {
  badgeFilters: BadgeFilter[] = [];
  selectedBadgeFilter: BadgeFilter = { name: 'Filter by Badge', code: 'all' };

  searchQuery: string = '';

  allPlaintes: Plainte[] = [];
  pagedPlaintes: Plainte[] = [];

  first: number = 0;
  rows: number = 4;
  totalRecords: number = 0;

  private dialogRef: DynamicDialogRef | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dialogService: DialogService,
    private ticketService: TicketService
  ) { }

  ngOnInit() {
    this.badgeFilters = [
      { name: 'All Badges', code: 'all' },
      { name: 'Unread', code: 'pending' },
      { name: 'Read', code: 'accepted' }, 
    ];
    this.route.queryParams.subscribe(params => {
      const badgeCode = params['badge'] || 'all';
      this.searchQuery = params['q'] || '';
      this.selectedBadgeFilter = this.badgeFilters.find(b => b.code === badgeCode) ?? this.badgeFilters[0];
      this.first = 0;
      this.loadTickets();
    });
  }

  loadTickets() {
    const filters: PlainteFilters = {
      page: (this.first / this.rows) + 1,
      limit: this.rows
    };
    if (this.selectedBadgeFilter.code !== 'all') {
      filters.status = this.selectedBadgeFilter.code as any;
    }
    
    this.ticketService.getAllTickets(filters).subscribe({
      next: (res: PaginatedPlaintes) => {
        this.allPlaintes = res.data || [];
        this.totalRecords = res.total || 0;
        this.applyFrontendSearch();
      },
      error: (err) => console.error('Failed to load plaintes', err)
    });
  }

  onFilterChange() { this.updateQueryParams(); }

  callFormDialog() {
    const ref = this.dialogService.open(ComplaintFormDialog, {
      header: ' ',
      width: '680px',
      modal: true,
      closable: true,
      styleClass: 'complaint-dialog',
    });

    if (ref) {
      ref.onClose.subscribe((result: { complaint: Plainte, file: File | null }) => {
        if (result && result.complaint) {
            this.ticketService.createTicket(result.complaint, result.file || undefined).subscribe({
                next: () => this.loadTickets(),
                error: err => console.error("Error creating plainte", err)
            });
        }
      });
    }
  }

  onSearchKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.updateQueryParams();
    }
  }

  onPageChange(event: PaginatorState) {
    this.first = event.first ?? 0;
    this.rows = event.rows ?? 4;
    this.loadTickets();
  }

  private updateQueryParams() {
    const queryParams: any = {};
    if (this.selectedBadgeFilter.code !== 'all') queryParams['badge'] = this.selectedBadgeFilter.code;
    if (this.searchQuery.trim()) queryParams['q'] = this.searchQuery.trim();
    this.router.navigate([], { relativeTo: this.route, queryParams, replaceUrl: true });
  }

  private applyFrontendSearch() {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) {
      this.pagedPlaintes = this.allPlaintes;
      return;
    }
    
    this.pagedPlaintes = this.allPlaintes.filter(p => {
      return p.description?.toLowerCase().includes(q) || p.title?.toLowerCase().includes(q);
    });
  }
}
