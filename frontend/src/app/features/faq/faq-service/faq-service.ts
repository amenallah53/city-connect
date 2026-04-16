import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Faqq } from '../../../shared/models/faq.model';

@Injectable({
  providedIn: 'root',
})
export class FaqService {
  private http = inject(HttpClient);
  private API_URL = 'http://localhost:5000/api/faqs';

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    console.log('TOKEN:', localStorage.getItem('token'));
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  getAnsweredFaqs(): Observable<Faqq[]> {
    return this.http.get<Faqq[]>(
      `${this.API_URL}/answered`,
      { headers: this.getHeaders() }
    );
  }

  askQuestion(question: string): Observable<any> {
    return this.http.post(
      `${this.API_URL}/ask`,
      { question },
      { headers: this.getHeaders() }
    );
  }
}