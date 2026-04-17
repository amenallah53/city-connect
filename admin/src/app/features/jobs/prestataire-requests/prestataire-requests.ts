import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { SelectModule } from 'primeng/select';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';

import { PrestataireCard } from '../../../shared/components/cards/prestataire-card/prestataire-card';
import { Prestataire } from '../../../shared/models/prestataire.model';
import { PrestataireFormDialog } from '../../../shared/components/dialogs/prestataire-form-dialog/prestataire-form-dialog';
import { environment } from '../../../../environments/environment';

interface StatusFilter { name: string; code: string; }

interface PrestatairesApiResponse {
  success: boolean;
  data: Array<{
    id: string;
    cin: string;
    firstName: string;
    lastName: string;
    email: string;
    addresse?: string;
    telephone?: string;
    status: 'pending' | 'accepted' | 'rejected';
    role: 'citoyen' | 'prestataire' | 'admin';
    document?: string;
    documentType?: string;
    createdAt: string;
    specialty?: string;
    rating?: number;
    description?: string;
    reach: 'new' | 'recommended' | 'on-demand';
    socialLinks?: string[];
    submissionDate: string;
  }>;
}

@Component({
  selector: 'app-prestataire-requests',
  imports: [CommonModule, FormsModule, SelectModule, Paginator, PrestataireCard],
  providers: [DialogService],
  templateUrl: './prestataire-requests.html',
  styleUrl: './prestataire-requests.css',
  standalone: true,
})
export class PrestataireRequests implements OnInit {
  statusFilters: StatusFilter[] = [];
  selectedStatusFilter: StatusFilter = { name: 'All Status', code: 'all' };

  searchQuery: string = '';

  allPrestataires: Prestataire[] = [];
  filteredPrestataires: Prestataire[] = [];
  pagedPrestataires: Prestataire[] = [];
  isLoading: boolean = false;

  first: number = 0;
  rows: number = 4;

  private dialogRef: DynamicDialogRef | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dialogService: DialogService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
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
      this.loadPrestataires();
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

    if (!this.dialogRef) {
      return;
    }

    this.dialogRef.onClose.subscribe((payload?: Partial<Prestataire>) => {
      if (!payload) {
        return;
      }

      this.createPrestataire(payload);
    });
  }

  onPrestataireStatusUpdated(event: { id: string; status: 'accepted' | 'rejected' }) {
    this.http.patch<{ success: boolean }>(`${environment.prestatairesUrl}/${event.id}/status`, { status: event.status }).subscribe({
      next: () => {
        this.allPrestataires = this.allPrestataires.map((prestataire) =>
          prestataire.id === event.id ? { ...prestataire, status: event.status } : prestataire
        );
        this.applyFilters();
        this.cdr.markForCheck();
      },
      error: (error: unknown) => {
        console.error('Failed to update prestataire status:', error);
        this.cdr.markForCheck();
      }
    });
  }

  onPrestataireEdited(id: string, payload: Partial<Prestataire>) {
    const requestPayload = this.buildPrestatairePayload(payload);

    this.http.put<{ success: boolean; data: PrestatairesApiResponse['data'][number] }>(`${environment.prestatairesUrl}/${id}`, requestPayload).subscribe({
      next: (response) => {
        const updated = response?.data ? this.mapApiPrestataire(response.data) : null;
        if (updated) {
          this.allPrestataires = this.allPrestataires.map((prestataire) =>
            prestataire.id === id ? updated : prestataire
          );
          this.applyFilters();
        } else {
          this.loadPrestataires();
        }
        this.cdr.markForCheck();
      },
      error: (error: unknown) => {
        console.error('Failed to update prestataire:', error);
        this.cdr.markForCheck();
      }
    });
  }

  onPrestataireDeleted(id: string) {
    this.http.delete<{ success: boolean }>(`${environment.prestatairesUrl}/${id}`).subscribe({
      next: () => {
        this.allPrestataires = this.allPrestataires.filter((prestataire) => prestataire.id !== id);
        this.applyFilters();
        this.cdr.markForCheck();
      },
      error: (error: unknown) => {
        console.error('Failed to delete prestataire:', error);
        this.cdr.markForCheck();
      }
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

  private loadPrestataires() {
    this.isLoading = true;

    let params = new HttpParams().set('page', '1').set('limit', '1000');
    if (this.selectedStatusFilter.code !== 'all') {
      params = params.set('status', this.selectedStatusFilter.code);
    }
    if (this.searchQuery.trim()) {
      params = params.set('q', this.searchQuery.trim());
    }

    this.http.get<PrestatairesApiResponse>(environment.prestatairesUrl, { params }).subscribe({
      next: (response) => {
        this.allPrestataires = (response?.data || []).map((item) => this.mapApiPrestataire(item));
        this.applyFilters();
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error: unknown) => {
        console.error('Failed to load prestataires:', error);
        this.allPrestataires = [];
        this.applyFilters();
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  private createPrestataire(payload: Partial<Prestataire>) {
    const requestPayload = this.buildPrestatairePayload(payload);

    this.http.post<{ success: boolean; data: PrestatairesApiResponse['data'][number] }>(environment.prestatairesUrl, requestPayload).subscribe({
      next: (response) => {
        const created = response?.data ? this.mapApiPrestataire(response.data) : null;
        if (created) {
          this.allPrestataires = [created, ...this.allPrestataires];
          this.applyFilters();
        } else {
          this.loadPrestataires();
        }
        this.cdr.markForCheck();
      },
      error: (error: unknown) => {
        console.error('Failed to create prestataire:', error);
        this.cdr.markForCheck();
      }
    });
  }

  private buildPrestatairePayload(payload: Partial<Prestataire>) {
    return {
      cin: payload.cin,
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      telephone: payload.telephone,
      addresse: payload.addresse,
      specialty: payload.specialty,
      description: payload.description,
      status: payload.status,
      reach: payload.reach,
      socialLinks: payload.socialLinks,
      document: payload.document,
      documentType: payload.documentType,
    };
  }

  private mapApiPrestataire(item: PrestatairesApiResponse['data'][number]): Prestataire {
    return {
      id: item.id,
      cin: item.cin,
      firstName: item.firstName,
      lastName: item.lastName,
      email: item.email,
      addresse: item.addresse,
      telephone: item.telephone,
      status: item.status,
      role: item.role,
      document: item.document,
      documentType: item.documentType,
      createdAt: new Date(item.createdAt),
      specialty: item.specialty,
      rating: item.rating,
      description: item.description,
      reach: item.reach,
      socialLinks: item.socialLinks,
      submissionDate: new Date(item.submissionDate),
    };
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

