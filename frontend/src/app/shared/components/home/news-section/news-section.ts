import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarouselModule } from 'primeng/carousel';
import { Observable, of } from 'rxjs';
import { catchError, startWith } from 'rxjs/operators';

import { News } from '../../../models/news.model';
import { NewsCard } from '../../cards/news-card/news-card';
import { NewsService } from 'src/app/core/services/news.service';

@Component({
  selector: 'app-news-section',
  standalone: true,
  imports: [
    CommonModule,
    CarouselModule,
    NewsCard
  ],
  templateUrl: './news-section.html',
  styleUrl: './news-section.css'
})
export class NewsSection {

  readonly featuredNews$: Observable<News[]>;

  constructor(private newsService: NewsService) {
    this.featuredNews$ = this.newsService.getLatestNews(4).pipe(
      catchError((error) => {
        console.error('Failed to fetch latest news:', error);
        return of([]);
      }),
      startWith([])
    );
  }

  responsiveOptions = [
    {
      breakpoint: '1400px',
      numVisible: 4,
      numScroll: 4
    },
    {
      breakpoint: '1024px',
      numVisible: 2,
      numScroll: 2
    },
    {
      breakpoint: '640px',
      numVisible: 1,
      numScroll: 1
    }
  ];

}