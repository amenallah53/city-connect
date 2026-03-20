import { Component, Input } from '@angular/core';
import { News } from '../../../models/news.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-news-card',
  imports: [RouterLink],
  templateUrl: './news-card.html',
  styleUrl: './news-card.css',
  standalone: true
})
export class NewsCard {
  @Input() news!: News;
}
