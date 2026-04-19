import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { News, NewsArticle } from '../../shared/models/news.model';

export interface CreateNewsPayload {
  slug: string;
  author?: string;
  badges?: string[];
  hero_title: string;
  hero_subtitle?: string;
  hero_img?: string;
  municipalite_id?: number | null;
  articles: Array<{
    title: string;
    content: string;
    media_url?: string;
    media_type?: string;
    position?: number;
  }>;
}

interface CreateNewsResponse {
  message: string;
  news: {
    id: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class NewsAdminService {
  private readonly apiUrl = environment.newsAdminUrl || 'http://localhost:5000/api/news-service/news';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    if (typeof window !== 'undefined' && window.localStorage) {
      const token = localStorage.getItem('token') || localStorage.getItem('user_token');
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
    }
    return headers;
  }

  getAllNews(): Observable<News[]> {
    return this.http.get<any[]>(this.apiUrl, { headers: this.getAuthHeaders() }).pipe(
      map((items) => (Array.isArray(items) ? items.map((item) => this.mapNews(item)) : []))
    );
  }

  createNews(payload: CreateNewsPayload): Observable<CreateNewsResponse> {
    return this.http.post<CreateNewsResponse>(this.apiUrl, payload, { headers: this.getAuthHeaders() });
  }

  private mapNews(item: any): News {
    const rawArticles = item.articles || item.subArticles || item.sub_articles || [];

    const mappedArticles: NewsArticle[] = Array.isArray(rawArticles)
      ? rawArticles.map((article: any) => ({
          id: String(article.id ?? `tmp-${Date.now()}`),
          position: Number(article.position ?? 0),
          title: article.title || '',
          content: article.content || '',
          mediaUrl: article.mediaUrl || article.media_url || undefined,
          mediaType: article.mediaType || article.media_type || undefined,
        }))
      : [];

    return {
      id: String(item.id),
      slug: item.slug || '',
      author: item.author || undefined,
      date: item.date ? new Date(item.date) : new Date(),
      badges: Array.isArray(item.badges) ? item.badges : [],
      heroImg: item.heroImg || item.hero_img || '',
      heroTitle: item.heroTitle || item.hero_title || '',
      heroSubtitle: item.heroSubtitle || item.hero_subtitle || '',
      municipaliteId: item.municipaliteId || item.municipalite_id || undefined,
      subArticles: mappedArticles.sort((a, b) => a.position - b.position),
    };
  }
}
