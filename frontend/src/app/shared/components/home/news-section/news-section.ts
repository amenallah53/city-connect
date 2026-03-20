import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarouselModule } from 'primeng/carousel';

import { NEWS_LIST } from '../../../mock/news.data';
import { News } from '../../../models/news.model';
import { NewsCard } from '../../cards/news-card/news-card';

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

  featuredNews: News[] = NEWS_LIST;

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