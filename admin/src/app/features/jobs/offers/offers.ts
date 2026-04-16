import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectModule } from 'primeng/select';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';

import { OfferCard } from '../../../shared/components/cards/offer-card/offer-card';
import { JobOffer } from '../../../shared/models/offer.model';
import { MOCK_OFFERS } from '../../../shared/mock/offers.mock';

interface StatusFilter { name: string; code: string; }

@Component({
  selector: 'app-offers',
  imports: [CommonModule, FormsModule, SelectModule, PaginatorModule, OfferCard],
  templateUrl: './offers.html',
  styleUrl: './offers.css',
  standalone: true,
})
export class Offers implements OnInit {
  statusFilters: StatusFilter[] = [];
  selectedStatusFilter: StatusFilter = { name: 'All Status', code: 'all' };

  searchQuery: string = '';

  allOffers: JobOffer[] = MOCK_OFFERS;
  filteredOffers: JobOffer[] = [];
  pagedOffers: JobOffer[] = [];

  first: number = 0;
  rows: number = 4;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.statusFilters = [
      { name: 'All Status', code: 'all' },
      { name: 'Accepted', code: 'approved' },
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

  onSearchKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.updateQueryParams();
    }
  }

  onPageChange(event: PaginatorState) {
    this.first = event.first ?? 0;
    this.rows = event.rows ?? 4;
    this.updatePagedOffers();
  }

  handleAccept(offerId: string) {
    const offer = this.allOffers.find(o => o.id === offerId);
    if (offer) {
      offer.status = 'approved';
      this.applyFilters();
    }
  }

  handleDecline(offerId: string) {
    const offer = this.allOffers.find(o => o.id === offerId);
    if (offer) {
      offer.status = 'rejected';
      this.applyFilters();
    }
  }

  private updateQueryParams() {
    const queryParams: any = {};
    if (this.selectedStatusFilter.code !== 'all') queryParams['status'] = this.selectedStatusFilter.code;
    if (this.searchQuery.trim()) queryParams['q'] = this.searchQuery.trim();
    this.router.navigate([], { relativeTo: this.route, queryParams, replaceUrl: true });
  }

  private applyFilters() {
    const q = this.searchQuery.toLowerCase().trim();
    this.filteredOffers = this.allOffers.filter(offer => {
      const matchStatus =
        this.selectedStatusFilter.code === 'all' ||
        offer.status === this.selectedStatusFilter.code;
      const matchSearch =
        !q ||
        offer.offeror?.firstName?.toLowerCase().includes(q) ||
        offer.offeror?.lastName?.toLowerCase().includes(q) ||
        offer.offeror?.email?.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
    this.updatePagedOffers();
  }

  private updatePagedOffers() {
    this.pagedOffers = this.filteredOffers.slice(this.first, this.first + this.rows);
  }
}
