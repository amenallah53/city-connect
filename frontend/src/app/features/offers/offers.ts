import { CommonModule, NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { OfferCard } from '../../shared/components/cards/offer-card/offer-card';
import { JobOffer } from 'src/app/shared/models/offer.model';
import { allJobOffers } from 'src/app/shared/mock/offers.mock';
import { UserAuthService } from 'src/app/core/services/auth.service';


interface OfferFilter {
  name: string;
  code: string;
}

@Component({
  selector: 'app-offers',
  standalone: true,
  imports: [CommonModule, NgClass, FormsModule, SelectModule, PaginatorModule, OfferCard],
  templateUrl: './offers.html',
  styleUrl: './offers.css',
})
export class Offers implements OnInit {
  filters: OfferFilter[] = [];
  selectedFilter: OfferFilter = { name: 'All', code: 'all' };

  allOffersList: JobOffer[] = allJobOffers;
  
  filteredOffers: JobOffer[] = [];
  pagedOffers: JobOffer[] = [];

  first: number = 0;
  rows: number = 12;

  viewMode: 'grid' | 'list' = 'grid';

  constructor(private router: Router, private route: ActivatedRoute, private auth: UserAuthService) {}

  setViewMode(mode: 'grid' | 'list') {
    this.viewMode = mode;
  }

  ngOnInit(): void {
    this.filters = [
      { name: 'All', code: 'all' },
      { name: 'Pending', code: 'pending' },
      { name: 'Approved', code: 'approved' },
      { name: 'Rejected', code: 'rejected' },
      { name: 'Done', code: 'done' },
      { name: 'Cancelled', code: 'cancelled' },
    ];

    this.route.queryParams.subscribe(params => {
      const filterCode = params['status'] || 'all';
      this.selectedFilter = this.filters.find(f => f.code === filterCode) ?? this.filters[0];
      this.first = 0;
      this.applyFilters();
    });
  }

  onFilterChange(): void {
    this.updateQueryParams();
  }

  onPageChange(event: PaginatorState): void {
    this.first = event.first ?? 0;
    this.rows = event.rows ?? 12;
    this.updatePagedOffers();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onAcceptOffer(offer: JobOffer): void {
    console.log('Accepted offer:', offer.id);
    // TODO: call service
  }

  onDeclineOffer(offer: JobOffer): void {
    console.log('Declined offer:', offer.id);
    // TODO: call service
  }

  private updateQueryParams(): void {
    const queryParams: any = {};
    if (this.selectedFilter.code !== 'all') queryParams['status'] = this.selectedFilter.code;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      replaceUrl: true,
    });
  }

  private applyFilters(): void {
    this.filteredOffers = this.allOffersList.filter(offer => {
      return (
        this.selectedFilter.code === 'all' ||
        offer.status === this.selectedFilter.code
      );
    });
    this.updatePagedOffers();
  }

  private updatePagedOffers(): void {
    this.pagedOffers = this.filteredOffers.slice(this.first, this.first + this.rows);
  }
}