import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { SelectModule } from 'primeng/select';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ServiceCard } from '../../../shared/components/cards/service-card/service-card';
import { ServiceFormDialog } from '../../../shared/components/dialogs/service-form-dialog/service-form-dialog';
import { Service } from '../../../shared/models/service.model';
import { environment } from '../../../../environments/environment';

interface TypeFilter { name: string; code: string; }

interface CreateServicePayload {
  name: string;
  type: string;
  description?: string;
  badges: string[];
  requirements: string[];
  municipalite_id?: number;
}

interface ServicesApiResponse {
  success: boolean;
  data: Array<{
    id: string | number;
    name?: string;
    type?: string;
    description?: string;
    badges?: string[] | string;
    requirements?: string[] | string;
    municipalite_id?: number;
    municipaliteId?: number;
  }>;
}

@Component({
  selector: 'app-types-of-services',
  standalone: true,
  imports: [CommonModule, FormsModule, Paginator, SelectModule, ServiceCard],
  providers: [DialogService],
  templateUrl: './types-of-services.html',
  styleUrl: './types-of-services.css'
})
export class TypesOfServices implements OnInit {
  typeFilters: TypeFilter[] = [];
  selectedTypeCode: string = 'all';

  searchQuery: string = '';

  allServices: Service[] = [];
  filteredServices: Service[] = [];
  pagedServices: Service[] = [];
  isLoading: boolean = false;

  first: number = 0;
  rows: number = 6;

  private dialogRef: DynamicDialogRef | null = null;

  constructor(
    private dialogService: DialogService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.typeFilters = [
      { name: 'All Types', code: 'all' },
      { name: 'Business licenses', code: 'Business licenses' },
      { name: 'Honoring the dead', code: 'Honoring the dead' },
      { name: 'Building permits', code: 'Building permits' },
      { name: 'Civil Records', code: 'Civil Records' }
    ];
    this.selectedTypeCode = 'all';
    this.loadServices();
  }

  onFilterChange() {
    this.first = 0;
    this.applyFilters();
  }

  onSearchKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.first = 0;
      this.applyFilters();
    }
  }

  onPageChange(event: PaginatorState) {
    this.first = event.first ?? 0;
    this.rows = event.rows ?? 12;
    this.updatePagedServices();
  }

  addService() {
    this.dialogRef = this.dialogService.open(ServiceFormDialog, {
      header: ' ',
      width: '680px',
      modal: true,
      closable: true,
      styleClass: 'service-dialog',
    });

    if (this.dialogRef) {
      this.dialogRef.onClose.subscribe((serviceData?: Partial<Service>) => {
        if (!serviceData) {
          return;
        }

        this.createService(serviceData);
      });
    }
  }

  private createService(serviceData: Partial<Service>) {
    const payload = this.buildCreatePayload(serviceData);

    if (!payload) {
      console.warn('Service creation aborted: name and type are required.');
      return;
    }

    this.http.post(environment.servicesUrl, payload).subscribe({
      next: () => {
        this.loadServices();
        this.cdr.markForCheck();
      },
      error: (error: unknown) => {
        console.error('Failed to create service:', error);
        this.cdr.markForCheck();
      }
    });
  }

  private buildCreatePayload(serviceData: Partial<Service>): CreateServicePayload | null {
    const name = serviceData.name?.trim() || '';
    const type = serviceData.type?.trim() || '';

    if (!name || !type) {
      return null;
    }

    return {
      name,
      type,
      description: serviceData.description?.trim() || '',
      badges: (serviceData.badges || []).map(b => b.trim()).filter(Boolean),
      requirements: (serviceData.requirements || [])
        .flatMap(r => r.split(','))
        .map(r => r.trim())
        .filter(Boolean),
      municipalite_id: serviceData.municipaliteId
    };
  }

  private loadServices() {
    this.isLoading = true;
    const params = new HttpParams().set('page', '1').set('limit', '1000');

    this.http.get<ServicesApiResponse>(environment.servicesUrl, { params }).subscribe({
      next: (response: ServicesApiResponse) => {
        const services = (response?.data || []).map((item) => this.mapToService(item));
        this.allServices = services;
        this.deferViewUpdate(() => {
          this.applyFilters();
          this.isLoading = false;
          this.cdr.markForCheck();
        });
      },
      error: (error: unknown) => {
        console.error('Failed to load services from API:', error);
        this.allServices = [];
        this.deferViewUpdate(() => {
          this.applyFilters();
          this.isLoading = false;
          this.cdr.markForCheck();
        });
      }
    });
  }

  private deferViewUpdate(callback: () => void) {
    queueMicrotask(callback);
  }

  private mapToService(item: ServicesApiResponse['data'][number]): Service {
    const badges = Array.isArray(item.badges)
      ? item.badges
      : typeof item.badges === 'string'
        ? item.badges.split(',').map((b) => b.trim()).filter(Boolean)
        : [];

    const requirements = Array.isArray(item.requirements)
      ? item.requirements
      : typeof item.requirements === 'string'
        ? item.requirements.split(',').map((r) => r.trim()).filter(Boolean)
        : [];

    return {
      id: String(item.id),
      name: item.name || '',
      type: item.type || '',
      description: item.description || '',
      badges,
      requirements,
      municipaliteId: item.municipaliteId ?? item.municipalite_id
    };
  }

  private applyFilters() {
    const q = this.searchQuery.toLowerCase().trim();
    this.filteredServices = this.allServices.filter(s => {
      const matchType =
        this.selectedTypeCode === 'all' ||
        (s.type && s.type.toLowerCase() === this.selectedTypeCode.toLowerCase());
      const matchSearch =
        !q ||
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.type && s.type.toLowerCase().includes(q));

      return matchType && matchSearch;
    });
    this.updatePagedServices();
  }

  private updatePagedServices() {
    this.pagedServices = this.filteredServices.slice(this.first, this.first + this.rows);
  }
}

