import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { News } from '../../shared/models/news.model';
import { NEWS_LIST } from '../../shared/mock/news.data';
import { HeroSection } from '../../shared/components/news/hero-section/hero-section';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-news-details',
  standalone: true,
  imports: [HeroSection, CommonModule],
  templateUrl: './news-details.html',
  styleUrl: './news-details.css',
})
export class NewsDetails implements OnInit {
  news?: News;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const newsId = params['newsId'];

      const found = NEWS_LIST.find((n) => n.id === newsId);

      if (!found) {
        this.router.navigate(['/']); // fallback if not found
        return;
      }

      this.news = found;
    });
  }
}