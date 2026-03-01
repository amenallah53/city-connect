import { Component, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DataViewModule } from 'primeng/dataview';
import { TagModule } from 'primeng/tag';
import { ServiceCard } from "../../shared/components/cards/service-card/service-card";
import { Service } from '../../shared/models/service.model';

interface FilterOptions {
  categories: Set<string>;
  tags: Set<string>;
}

@Component({
  selector: 'app-services',
  imports: [CommonModule, FormsModule, ButtonModule, DataViewModule, TagModule, ServiceCard],
  templateUrl: './services.html',
  styleUrl: './services.css',
})
export class Services implements OnInit {
  searchQuery: string = '';
  showFiltersPanel = signal<boolean>(false);
  selectedCategories = signal<Set<string>>(new Set());
  selectedBadges = signal<Set<string>>(new Set());

  constructor(public router: Router) {}

  services = signal<Service[]>([
    {
      id: '1',
      title: 'Issuing a building permit',
      type: 'Building permits',
      badges: ['Electronic', 'Not immediate']
    },
    {
      id: '2',
      title: 'Printing a burial certificate',
      type: 'Honoring the dead',
      badges: ['Electronic']
    },
    {
      id: '3',
      title: 'Renewing a business license',
      type: 'Business licenses',
      badges: ['With Fees', 'Not immediate']
    },
    {
      id: '4',
      title: 'Issuing a building demolition permit',
      type: 'Building permits',
      badges: ['Electronic', 'Not immediate']
    },
    {
      id: '5',
      title: 'Issuing a building permit',
      type: 'Building permits',
      badges: ['Electronic', 'Not immediate']
    },
    {
      id: '6',
      title: 'Printing a burial certificate',
      type: 'Honoring the dead',
      badges: ['Electronic']
    },
    {
      id: '7',
      title: 'Renewing a business license',
      type: 'Business licenses',
      badges: ['With Fees', 'Not immediate']
    },
    {
      id: '8',
      title: 'Issuing a building demolition permit',
      type: 'Building permits',
      badges: ['Electronic', 'Not immediate']
    },
    {
      id: '9',
      title: 'Issuing a building permit',
      type: 'Building permits',
      badges: ['Electronic', 'Not immediate']
    },
    {
      id: '10',
      title: 'Printing a burial certificate',
      type: 'Honoring the dead',
      badges: ['Electronic']
    },
    {
      id: '11',
      title: 'Renewing a business license',
      type: 'Business licenses',
      badges: ['With Fees', 'Not immediate']
    },
    {
      id: '12',
      title: 'Issuing a building demolition permit',
      type: 'Building permits',
      badges: ['Electronic', 'Not immediate']
    }
  ]);

  // Computed signals for filter options
  allCategories = computed(() => {
    const categories = new Set<string>();
    this.services().forEach(service => {
      categories.add(service.type);
    });
    return Array.from(categories).sort();
  });

  allBadges = computed(() => {
    const badges = new Set<string>();
    this.services().forEach(service => {
      service.badges.forEach(badge => {
        badges.add(badge);
      });
    });
    return Array.from(badges).sort();
  });

  // Filtered services based on search and filters
  filteredServices = computed(() => {
    let filtered = this.services();

    // Apply category filter
    if (this.selectedCategories().size > 0) {
      filtered = filtered.filter(service =>
        this.selectedCategories().has(service.type)
      );
    }

    // Apply badge filter
    if (this.selectedBadges().size > 0) {
      filtered = filtered.filter(service =>
        service.badges.some(badge => this.selectedBadges().has(badge))
      );
    }

    // Apply search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(service =>
        service.title.toLowerCase().includes(query) ||
        service.type.toLowerCase().includes(query) ||
        service.badges.some(badge => badge.toLowerCase().includes(query))
      );
    }

    return filtered;
  });

  ngOnInit(): void {
    // Initialize services data
    this.services.set(this.services());
  }

  onSearch(): void {
    // Search is handled by computed signal
    console.log('Searching for:', this.searchQuery);
  }

  onShowFilters(): void {
    this.showFiltersPanel.update(value => !value);
  }

  onSort(): void {
    // Implement sort logic
    console.log('Sort');
  }

  toggleCategory(category: string): void {
    const categories = new Set(this.selectedCategories());
    if (categories.has(category)) {
      categories.delete(category);
    } else {
      categories.add(category);
    }
    this.selectedCategories.set(categories);
  }

  toggleBadge(badge: string): void {
    const badges = new Set(this.selectedBadges());
    if (badges.has(badge)) {
      badges.delete(badge);
    } else {
      badges.add(badge);
    }
    this.selectedBadges.set(badges);
  }

  isCategorySelected(category: string): boolean {
    return this.selectedCategories().has(category);
  }

  isBadgeSelected(badge: string): boolean {
    return this.selectedBadges().has(badge);
  }

  clearFilters(): void {
    this.selectedCategories.set(new Set());
    this.selectedBadges.set(new Set());
    this.searchQuery = '';
  }

  hasActiveFilters(): boolean {
    return this.selectedCategories().size > 0 || this.selectedBadges().size > 0 || this.searchQuery.trim() !== '';
  }
}
