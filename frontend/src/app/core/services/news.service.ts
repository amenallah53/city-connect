import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, throwError, timeout } from 'rxjs';
import { environment } from 'src/environments/environment';
import { News } from '../../shared/models/news.model';
import { NewsArticle } from '../../shared/models/news.model';

@Injectable({ providedIn: 'root' })
export class NewsService {
  private gatewayApiUrl = environment.newsUrl || 'http://localhost:5000/api/news';
  private directApiUrl = 'http://localhost:5013/api/news';

  constructor(private http: HttpClient) {}

  getLatestNews(limit = 4): Observable<News[]> {
    const url = `${this.gatewayApiUrl}?limit=${limit}`;
    const directUrl = `${this.directApiUrl}?limit=${limit}`;

    return this.http.get<any[]>(url).pipe(
      timeout(10000),
      catchError((gatewayError) => {
        console.warn('Gateway news list failed, retrying direct news-service URL.', gatewayError);
        return this.http.get<any[]>(directUrl).pipe(timeout(10000));
      }),
      map((items) => (Array.isArray(items) ? items.map((item) => this.mapNews(item)) : []))
    );
  }

  getNewsById(id: string): Observable<News> {
    const url = `${this.gatewayApiUrl}/${id}`;
    const directUrl = `${this.directApiUrl}/${id}`;

    return this.http.get<any>(url).pipe(
      timeout(10000),
      catchError((gatewayError) => {
        console.warn(`Gateway news details failed for ${id}, retrying direct news-service URL.`, gatewayError);
        return this.http.get<any>(directUrl).pipe(timeout(10000));
      }),
      catchError((error) => throwError(() => error)),
      map((item) => this.mapNews(item))
    );
  }

  private mapNews(item: any): News {
    const mappedArticles: NewsArticle[] = Array.isArray(item.subArticles)
      ? item.subArticles.map((article: any) => {
          const rawMediaType = (article.mediaType || '').toString().toLowerCase();
          let normalizedMediaType: string | undefined;
          if (rawMediaType.startsWith('image') || rawMediaType === 'image') {
            normalizedMediaType = 'image';
          } else if (rawMediaType.startsWith('video') || rawMediaType === 'video') {
            normalizedMediaType = 'video';
          }

          return {
            id: article.id,
            position: Number(article.position ?? 0),
            title: article.title || '',
            content: article.content || '',
            mediaUrl: article.mediaUrl || undefined,
            mediaType: normalizedMediaType,
          };
        })
      : [];

    return {
      id: item.id,
      slug: item.slug,
      author: item.author,
      date: item.date ? new Date(item.date) : new Date(),
      badges: Array.isArray(item.badges) ? item.badges : [],
      heroImg: item.heroImg || '',
      heroTitle: item.heroTitle || '',
      heroSubtitle: item.heroSubtitle || '',
      municipaliteId: item.municipaliteId,
      subArticles: mappedArticles.sort((a: NewsArticle, b: NewsArticle) => a.position - b.position),
    };
  }
}
