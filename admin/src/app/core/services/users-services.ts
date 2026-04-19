import { Injectable, inject } from '@angular/core';
import { User } from '../../shared/models/user.model';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UsersServices {
  private base = 'http://localhost:5000/api/admin';
  private http = inject(HttpClient);

  readonly users = signal<User[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') ?? '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  loadAll(filters?: { role?: string; status?: string }) {
    const hasFilters =
      (filters?.role && filters.role !== 'all') ||
      (filters?.status && filters.status !== 'all');

    let url = this.base;
    let params = new HttpParams();

    if (hasFilters) {
      url = `${this.base}/users`;
      if (filters?.role && filters.role !== 'all') params = params.set('role', filters.role);
      if (filters?.status && filters.status !== 'all') params = params.set('status', filters.status);
    }

    this.loading.set(true);
    this.error.set(null);

    this.http.get<User[]>(url, { headers: this.authHeaders(), params }).subscribe({
      next: (data) => { this.users.set(data); this.loading.set(false); },
      error: () => { this.error.set('Failed to load users'); this.loading.set(false); }
    });
  }
  create(data: Partial<User>) {
  const payload: any = {};
  if (data.firstName !== undefined) payload.first_name = data.firstName;
  if (data.lastName !== undefined)  payload.last_name  = data.lastName;
  if (data.email !== undefined)     payload.email      = data.email;
  if (data.cin !== undefined)       payload.cin        = data.cin;
  if (data.role !== undefined)      payload.role       = data.role;
  if (data.status !== undefined)    payload.status     = data.status;

  return this.http.post<User>(`${this.base}`, payload, { headers: this.authHeaders() });
}

  update(id: string, data: Partial<User>) {
    // map camelCase → snake_case for backend
    const payload: any = {};
    if (data.firstName !== undefined) payload.first_name = data.firstName;
    if (data.lastName !== undefined)  payload.last_name  = data.lastName;
    if (data.email !== undefined)     payload.email      = data.email;
    if (data.cin !== undefined)       payload.cin        = data.cin;
    if (data.role !== undefined)      payload.role       = data.role;
    if (data.status !== undefined)    payload.status     = data.status;

    return this.http.put<User>(`${this.base}/${id}`, payload, { headers: this.authHeaders() });
  }

  delete(id: string) {
    return this.http.delete<{ message: string }>(`${this.base}/${id}`, { headers: this.authHeaders() });
  }

  getById(id: string) {
    return this.http.get<User>(`${this.base}/${id}`, { headers: this.authHeaders() });
  }
}