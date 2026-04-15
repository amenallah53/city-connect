import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Faqq } from '../../../shared/models/faq.model';
import { inject } from '@angular/core';
@Injectable({
  providedIn: 'root',
})
export class FaqService {
  private http = inject(HttpClient);
  private API_URL = 'http://localhost:5000/api/faqs';

  getAnsweredFaqs(): Observable<Faqq[]> {
    return this.http.get<Faqq[]>(`${this.API_URL}/answered`);
  }

  askQuestion(question: string): Observable<any> {
    return this.http.post(`${this.API_URL}/ask`, { question });
  }
}
