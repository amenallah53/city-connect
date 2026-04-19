import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Faq } from '../../shared/models/faq.model';

@Injectable({
  providedIn: 'root',
})
export class FaqServices {
  private base = 'http://localhost:5000/api/faqs';

  constructor(private http: HttpClient) {}

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') ?? '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getUnanswered(): Observable<Faq[]> {
    return this.http.get<Faq[]>(`${this.base}/unanswered`, { headers: this.authHeaders() });
  }

  ask(question: string,answer: string | null): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/ask`, { question, answer }, { headers: this.authHeaders() });
  }

  answer(id: number | string, answer: string | null): Observable<{ message: string; faq: Faq }> {
    return this.http.put<{ message: string; faq: Faq }>(`${this.base}/${id}`, { answer }, { headers: this.authHeaders() });
  }

  delete(id: number | string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/${id}`, { headers: this.authHeaders() });
  }
}