import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { finalize, take } from 'rxjs/operators';

import { NewsCard } from '../../shared/components/cards/news-card/news-card';
import { News } from '../../shared/models/news.model';
import { NewsFormDialog } from '../../shared/components/dialogs/news-form-dialog/news-form-dialog';
import { CreateNewsPayload, NewsAdminService } from '../../core/services/news-admin.service';

@Component({
  selector: 'app-news',
  imports: [CommonModule, FormsModule, Paginator, NewsCard],
  providers: [DialogService],
  templateUrl: './news.html',
  styleUrl: './news.css',
  standalone: true,
})
export class NewsComponent implements OnInit {

  searchQuery: string = '';

  allNews: News[] = [];
  filteredNews: News[] = [];
  pagedNews: News[] = [];
  isLoading = false;
  errorMessage = '';

  first: number = 0;
  rows: number = 8; // 8 items per page since news cards fit well in grid

  private dialogRef: DynamicDialogRef | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dialogService: DialogService,
    private newsAdminService: NewsAdminService,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['q'] || '';
      this.first = 0;
      this.applyFilters();
    });

    this.loadNews();
  }

  callFormDialog() {
    const dialogRef = this.dialogService.open(NewsFormDialog, {
      header: ' ',
      width: '680px',
      modal: true,
      closable: true,
      styleClass: 'user-dialog',
    });

    if (!dialogRef) {
      return;
    }

    this.dialogRef = dialogRef;

    dialogRef.onClose.pipe(take(1)).subscribe((formData: Partial<News> | undefined) => {
      if (!formData) {
        return;
      }

      const heroTitle = (formData.heroTitle || '').trim();
      if (!heroTitle) {
        this.errorMessage = 'Hero title is required to create news.';
        this.cdr.detectChanges();
        return;
      }

      const payload = this.buildCreatePayload(formData);
      this.isLoading = true;
      this.errorMessage = '';

      this.newsAdminService.createNews(payload).pipe(
        take(1),
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      ).subscribe({
        next: () => {
          this.loadNews();
        },
        error: (error) => {
          console.error('Failed to create news:', error);
          this.errorMessage = 'Failed to create news. Please check your admin token and try again.';
          this.cdr.detectChanges();
        }
      });
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

  private loadNews() {
    this.isLoading = true;
    this.errorMessage = '';

    this.newsAdminService.getAllNews().pipe(
      take(1),
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (items) => {
        this.allNews = items;
        this.first = 0;
        this.applyFilters();
      },
      error: (error) => {
        console.error('Failed to load admin news:', error);
        this.allNews = [];
        this.applyFilters();
        this.errorMessage = 'Unable to load news from backend.';
      }
    });
  }

  private buildCreatePayload(formData: Partial<News>): CreateNewsPayload {
    const normalizedArticles = (formData.subArticles || [])
      .filter((a) => (a.title || '').trim() || (a.content || '').trim())
      .map((article, index) => {
        const mediaUrl = (article.mediaUrl || '').trim() || undefined;
        return {
          title: (article.title || '').trim() || `Sub article ${index + 1}`,
          content: (article.content || '').trim() || 'No content provided.',
          media_url: mediaUrl,
          media_type: mediaUrl ? ((article.mediaType || '').trim() || 'image') : undefined,
          position: index,
        };
      });

    const heroTitle = (formData.heroTitle || '').trim();
    const slug = this.slugify(heroTitle);

    return {
      slug,
      author: (formData.author || '').trim() || 'City Council',
      badges: Array.isArray(formData.badges) ? formData.badges : [],
      hero_title: heroTitle,
      hero_subtitle: (formData.heroSubtitle || '').trim() || '',
      hero_img: (formData.heroImg || '').trim() || '',
      municipalite_id: formData.municipaliteId ?? null,
      articles: normalizedArticles,
    };
  }

  private slugify(value: string): string {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
}

