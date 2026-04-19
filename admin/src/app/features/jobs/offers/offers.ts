import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { SelectModule } from 'primeng/select';
import { Paginator, PaginatorState } from 'primeng/paginator';

import { OfferCard } from '../../../shared/components/cards/offer-card/offer-card';
import { JobOffer } from '../../../shared/models/offer.model';
import { environment } from '../../../../environments/environment';

interface StatusFilter { name: string; code: string; }

interface JobOfferApiResponse {
  success: boolean;
  data: Array<{
    id: string;
    status: JobOffer['status'];
    dateJobSuggestion: string;
    dateCreation: string;
    prestataireId: string;
    offerorId: string;
    offeror?: {
      id: string;
      cin: string;
      firstName: string;
      lastName: string;
      email: string;
      addresse?: string;
      telephone?: string;
      status: 'pending' | 'accepted' | 'rejected';
      role: 'citoyen' | 'prestataire' | 'admin';
      createdAt: string;
    };
  }>;
}

@Component({
  selector: 'app-offers',
  imports: [CommonModule, FormsModule, SelectModule, Paginator, OfferCard],
  templateUrl: './offers.html',
  styleUrl: './offers.css',
  standalone: true,
})
export class Offers implements OnInit {
  statusFilters: StatusFilter[] = [];
  selectedStatusFilter: StatusFilter = { name: 'All Status', code: 'all' };

  searchQuery: string = '';

  allOffers: JobOffer[] = [];
  filteredOffers: JobOffer[] = [];
  pagedOffers: JobOffer[] = [];
  isLoading: boolean = false;

  first: number = 0;
  rows: number = 4;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
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
      this.loadOffers();
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
    this.updateOfferStatus(offerId, 'approved');
  }

  handleDecline(offerId: string) {
    this.updateOfferStatus(offerId, 'rejected');
  }

  private loadOffers() {
    this.isLoading = true;

    let params = new HttpParams().set('page', '1').set('limit', '1000');
    if (this.selectedStatusFilter.code !== 'all') {
      params = params.set('status', this.selectedStatusFilter.code);
    }
    if (this.searchQuery.trim()) {
      params = params.set('q', this.searchQuery.trim());
    }

    this.http.get<JobOfferApiResponse>(environment.offersUrl, { params }).subscribe({
      next: (response) => {
        this.allOffers = (response?.data || []).map((offer) => this.mapToJobOffer(offer));
        this.applyFilters();
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error: unknown) => {
        console.error('Failed to load offers:', error);
        this.allOffers = [];
        this.applyFilters();
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  private mapToJobOffer(apiOffer: JobOfferApiResponse['data'][number]): JobOffer {
    return {
      id: apiOffer.id,
      status: apiOffer.status,
      dateJobSuggestion: new Date(apiOffer.dateJobSuggestion),
      dateCreation: new Date(apiOffer.dateCreation),
      prestataireId: apiOffer.prestataireId,
      offerorId: apiOffer.offerorId,
      offeror: apiOffer.offeror
        ? {
          id: apiOffer.offeror.id,
          cin: apiOffer.offeror.cin,
          firstName: apiOffer.offeror.firstName,
          lastName: apiOffer.offeror.lastName,
          email: apiOffer.offeror.email,
          addresse: apiOffer.offeror.addresse,
          telephone: apiOffer.offeror.telephone,
          status: apiOffer.offeror.status,
          role: apiOffer.offeror.role,
          createdAt: new Date(apiOffer.offeror.createdAt),
        }
        : undefined,
    };
  }

  private updateOfferStatus(offerId: string, status: 'approved' | 'rejected') {
    this.http.patch<{ success: boolean }>(`${environment.offersUrl}/${offerId}/status`, { status }).subscribe({
      next: () => {
        this.allOffers = this.allOffers.map((offer) =>
          offer.id === offerId ? { ...offer, status } : offer
        );
        this.applyFilters();
        this.cdr.markForCheck();
      },
      error: (error: unknown) => {
        console.error('Failed to update offer status:', error);
        this.cdr.markForCheck();
      }
    });
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

