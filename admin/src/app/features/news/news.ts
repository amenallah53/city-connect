import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';

import { NewsCard } from '../../shared/components/cards/news-card/news-card';
import { News } from '../../shared/models/news.model';
import { NEWS_LIST } from '../../shared/mock/news.data';
import { NewsFormDialog } from '../../shared/components/dialogs/news-form-dialog/news-form-dialog';

@Component({
  selector: 'app-news',
  imports: [CommonModule, FormsModule, PaginatorModule, NewsCard],
  providers: [DialogService],
  templateUrl: './news.html',
  styleUrl: './news.css',
  standalone: true,
})
export class NewsComponent implements OnInit {

  searchQuery: string = '';

  allNews: News[] = NEWS_LIST;
  filteredNews: News[] = [];
  pagedNews: News[] = [];

  first: number = 0;
  rows: number = 8; // 8 items per page since news cards fit well in grid

  private dialogRef: DynamicDialogRef | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dialogService: DialogService,
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['q'] || '';
      this.first = 0;
      this.applyFilters();
    });
  }

  callFormDialog() {
    this.dialogRef = this.dialogService.open(NewsFormDialog, {
      header: ' ',
      width: '680px',
      modal: true,
      closable: true,
      styleClass: 'user-dialog',
    });
  }

  onSearchKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.updateQueryParams();
    }
  }

  onPageChange(event: PaginatorState) {
    this.first = event.first ?? 0;
    this.rows = event.rows ?? 8;
    this.updatePagedNews();
  }

  private updateQueryParams() {
    const queryParams: any = {};
    if (this.searchQuery.trim()) queryParams['q'] = this.searchQuery.trim();
    this.router.navigate([], { relativeTo: this.route, queryParams, replaceUrl: true });
  }

  private applyFilters() {
    const q = this.searchQuery.toLowerCase().trim();
    this.filteredNews = this.allNews.filter(news => {
      const matchSearch =
        !q ||
        news.heroTitle.toLowerCase().includes(q) ||
        news.heroSubtitle.toLowerCase().includes(q);
      return matchSearch;
    });
    this.updatePagedNews();
  }

  private updatePagedNews() {
    this.pagedNews = this.filteredNews.slice(this.first, this.first + this.rows);
  }
}
