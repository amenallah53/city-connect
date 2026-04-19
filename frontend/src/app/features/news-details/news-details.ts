import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { News } from '../../shared/models/news.model';
import { HeroSection } from '../../shared/components/news/hero-section/hero-section';
import { CommonModule } from '@angular/common';
import { NewsService } from 'src/app/core/services/news.service';
import { finalize, take } from 'rxjs/operators';

@Component({
  selector: 'app-news-details',
  standalone: true,
  imports: [HeroSection, CommonModule],
  templateUrl: './news-details.html',
  styleUrl: './news-details.css',
})
export class NewsDetails implements OnInit {
  news?: News;
  isLoading = true;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private newsService: NewsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const newsId = this.route.snapshot.paramMap.get('newsId');
    if (!newsId) {
      this.errorMessage = 'News item not found.';
      this.isLoading = false;
      this.cdr.detectChanges();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.news = undefined;

    this.newsService.getNewsById(newsId).pipe(
      take(1),
      finalize(() => {
        this.isLoading = false;
        // In zoneless mode, async callbacks do not always refresh the view.
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (found) => {
        this.news = found;
        this.cdr.detectChanges();
      },
      error: () => {
        this.news = undefined;
        this.errorMessage = 'Unable to load this news item.';
        this.cdr.detectChanges();
      }
    });
  }

  goBackHome(): void {
    this.router.navigate(['/']);
  }
}