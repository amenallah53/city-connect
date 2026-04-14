import { CommonModule, NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { Service } from '../../shared/models/service.model';
import { ServiceCard } from '../../shared/components/cards/service-card/service-card';
import { allServices } from '../../shared/mock/services.mock';

interface ServiceFilter {
  name: string;
  code: string;
}

interface ServiceCategory {
  name: string;
  code: string;
}

@Component({
  selector: 'app-services',
  imports: [CommonModule, NgClass, FormsModule, SelectModule, PaginatorModule, ServiceCard],
  templateUrl: './services.html',
  styleUrl: './services.css',
  standalone: true
})
export class Services implements OnInit {
  filters: ServiceFilter[] = [];
  selectedFilter: ServiceFilter = { name: 'All', code: 'all' };

  categories: ServiceCategory[] = [];
  selectedCategory: ServiceCategory = { name: 'All Services', code: 'all' };

  allServicesList: Service[] = allServices;
  filteredServices: Service[] = [];
  pagedServices: Service[] = [];

  // Pagination
  first: number = 0;
  rows: number = 12;

  viewMode: 'grid' | 'list' = 'grid';

  setViewMode(mode: 'grid' | 'list') {
    this.viewMode = mode;
  }

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    this.filters = [
      { name: 'All', code: 'all' },
      { name: 'Electronic', code: 'electronic' },
      { name: 'With Fees', code: 'with-fees' },
      { name: 'Not Immediate', code: 'not-immediate' },
    ];

    this.categories = [
      { name: 'All Services', code: 'all' },
      { name: 'Building Permits', code: 'building-permits' },
      { name: 'Honoring the Dead', code: 'honoring-the-dead' },
      { name: 'Business Licenses', code: 'business-licenses' },
    ];

    this.route.queryParams.subscribe(params => {
      const categoryCode = params['category'] || 'all';
      const filterCode = params['filter'] || 'all';

      this.selectedCategory = this.categories.find(c => c.code === categoryCode) ?? this.categories[0];
      this.selectedFilter = this.filters.find(f => f.code === filterCode) ?? this.filters[0];

      this.first = 0; // reset to page 1 on filter change
      this.applyFilters();
    });
  }

  selectCategory(category: ServiceCategory) {
    this.selectedCategory = category;
    this.updateQueryParams();
  }

  onFilterChange() {
    this.updateQueryParams();
  }

  onPageChange(event: PaginatorState) {
    this.first = event.first ?? 0;
    this.rows = event.rows ?? 12;
    this.updatePagedServices();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private updateQueryParams() {
    const queryParams: any = {};
    if (this.selectedCategory.code !== 'all') queryParams['category'] = this.selectedCategory.code;
    if (this.selectedFilter.code !== 'all') queryParams['filter'] = this.selectedFilter.code;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      replaceUrl: true,
    });
  }

  private applyFilters() {
    this.filteredServices = this.allServicesList.filter(service => {
      const matchCategory =
        this.selectedCategory.code === 'all' ||
        service.type!.toLowerCase().replace(/\s+/g, '-') === this.selectedCategory.code;

      const matchFilter =
        this.selectedFilter.code === 'all' ||
        service.badges.some(
          badge => badge.toLowerCase().replace(/\s+/g, '-') === this.selectedFilter.code
        );

      return matchCategory && matchFilter;
    });

    this.updatePagedServices();
  }

  private updatePagedServices() {
    this.pagedServices = this.filteredServices.slice(this.first, this.first + this.rows);
  }
}