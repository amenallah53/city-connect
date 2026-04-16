import { CommonModule, NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Prestataire } from '../../shared/models/prestataire.model';
import { JobCard } from '../../shared/components/cards/job-card/job-card';
import { allJobs } from '../../shared/mock/jobs.mock';
import { PrestataireFormDialog } from '../../shared/components/dialogs/prestataire-form-dialog/prestataire-form-dialog/prestataire-form-dialog';

interface JobFilter { name: string; code: string; }
interface JobCategory { name: string; code: string; }

@Component({
  selector: 'app-jobs',
  imports: [CommonModule, NgClass, FormsModule, SelectModule, PaginatorModule, JobCard],
  providers: [DialogService],
  templateUrl: './jobs.html',
  styleUrl: './jobs.css',
  standalone: true
})
export class Jobs implements OnInit {
  filters: JobFilter[] = [];
  selectedFilter: JobFilter = { name: 'All', code: 'all' };

  categories: JobCategory[] = [];
  selectedCategory: JobCategory = { name: 'All Jobs', code: 'all' };

  allJobsList: Prestataire[] = allJobs;
  filteredJobs: Prestataire[] = [];
  pagedJobs: Prestataire[] = [];

  first: number = 0;
  rows: number = 12;
  viewMode: 'grid' | 'list' = 'grid';

  private dialogRef: DynamicDialogRef | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dialogService: DialogService,
  ) {}

  setViewMode(mode: 'grid' | 'list') { this.viewMode = mode; }

  ngOnInit() {
    this.filters = [
      { name: 'All', code: 'all' },
      { name: 'Recommended', code: 'recommended' },
      { name: 'On Demand', code: 'on-demand' },
      { name: 'New', code: 'new' },
    ];
    this.categories = [
      { name: 'All Jobs', code: 'all' },
      { name: 'Private Tutor', code: 'private-tutor' },
      { name: 'Electrician', code: 'electrician' },
      { name: 'Plumber', code: 'plumber' },
      { name: 'Contractor', code: 'contractor' },
      { name: 'Accountant', code: 'accountant' },
    ];
    this.route.queryParams.subscribe(params => {
      const categoryCode = params['category'] || 'all';
      const filterCode = params['filter'] || 'all';
      this.selectedCategory = this.categories.find(c => c.code === categoryCode) ?? this.categories[0];
      this.selectedFilter = this.filters.find(f => f.code === filterCode) ?? this.filters[0];
      this.first = 0;
      this.applyFilters();
    });
  }

  selectCategory(category: JobCategory) {
    this.selectedCategory = category;
    this.updateQueryParams();
  }

  onFilterChange() { this.updateQueryParams(); }

  callFormDialog() {
    const ref = this.dialogService.open(PrestataireFormDialog, {
      header: 'Add a new prestataire',
      width: '680px',
      modal: true,
      closable: true,
      styleClass: 'prestataire-dialog',
    });

    if (ref) {
      this.dialogRef = ref;
    }
  }

  onPageChange(event: PaginatorState) {
    this.first = event.first ?? 0;
    this.rows = event.rows ?? 12;
    this.updatePagedJobs();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private updateQueryParams() {
    const queryParams: any = {};
    if (this.selectedCategory.code !== 'all') queryParams['category'] = this.selectedCategory.code;
    if (this.selectedFilter.code !== 'all') queryParams['filter'] = this.selectedFilter.code;
    this.router.navigate([], { relativeTo: this.route, queryParams, replaceUrl: true });
  }

  private applyFilters() {
    this.filteredJobs = this.allJobsList.filter(job => {
      const matchCategory =
        this.selectedCategory.code === 'all' ||
        job.specialty!.toLowerCase().replace(/\s+/g, '-') === this.selectedCategory.code;
      const matchFilter =
        this.selectedFilter.code === 'all' ||
        job.reach === this.selectedFilter.code;
      return matchCategory && matchFilter;
    });
    this.updatePagedJobs();
  }

  private updatePagedJobs() {
    this.pagedJobs = this.filteredJobs.slice(this.first, this.first + this.rows);
  }
}