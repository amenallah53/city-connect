import { CommonModule, NgClass } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { OfferCard } from '../../shared/components/cards/offer-card/offer-card';
import { JobOffer } from 'src/app/shared/models/offer.model';
// import { allJobOffers } from 'src/app/shared/mock/offers.mock';
import { UserAuthService } from 'src/app/core/services/auth.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { filter, take } from 'rxjs/operators';


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

  allOffersList: JobOffer[] = [];
  isLoading = false;

  filteredOffers: JobOffer[] = [];
  pagedOffers: JobOffer[] = [];

  first: number = 0;
  rows: number = 12;

  viewMode: 'grid' | 'list' = 'grid';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private auth: UserAuthService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) { }

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
      this.loadOffers();
    });
  }

  loadOffers() {
    this.auth.currentUser$.pipe(
      filter(user => !!user),
      take(1)
    ).subscribe(user => {
      if (!user) return;

      this.isLoading = true;
      let params = new HttpParams().set('page', '1').set('limit', '1000');

      if (user.role === 'prestataire') {
        params = params.set('prestataireId', user.id);
      } else {
        params = params.set('offerorId', user.id);
      }

      this.http.get<any>(environment.offersUrl, { params }).subscribe({
        next: (res) => {
          this.allOffersList = (res.data || []).map((o: any) => this.mapApiOffer(o));
          this.applyFilters();
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Failed to load offers:', err);
          this.allOffersList = [];
          this.applyFilters();
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      });
    });
  }

  private mapApiOffer(item: any): JobOffer {
    return {
      id: item.id,
      status: item.status,
      dateJobSuggestion: new Date(item.dateJobSuggestion),
      dateCreation: new Date(item.dateCreation),
      prestataireId: item.prestataireId,
      offerorId: item.offerorId,
      offeror: item.offeror
        ? {
          ...item.offeror,
          createdAt: new Date(item.offeror.createdAt),
        }
        : undefined,
      prestataire: item.prestataire
        ? {
          ...item.prestataire,
          createdAt: new Date(item.prestataire.createdAt),
          submissionDate: new Date(item.prestataire.submissionDate),
        }
        : undefined,
    };
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
    console.log('Accepting offer:', offer.id);
    this.updateOfferStatus(offer.id, 'approved');
  }

  onDeclineOffer(offer: JobOffer): void {
    console.log('Declining offer:', offer.id);
    this.updateOfferStatus(offer.id, 'rejected');
  }

  private updateOfferStatus(offerId: string, status: string): void {
    this.http.patch(`${environment.offersUrl}/${offerId}/status`, { status }).subscribe({
      next: () => {
        this.allOffersList = this.allOffersList.map(o => o.id === offerId ? { ...o, status: status as any } : o);
        this.applyFilters();
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Failed to update offer status:', err);
        this.cdr.markForCheck();
      }
    });
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