import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard)
  },
  {
    path: 'users',
    loadComponent: () => import('./features/users/users').then(m => m.Users)
  },
  {
    path: 'services',
    children: [
      { path: '', redirectTo: 'types-of-services', pathMatch: 'full' },
      { path: 'types-of-services', loadComponent: () => import('./features/services/types-of-services/types-of-services').then(m => m.TypesOfServices) },
      { path: 'requests', loadComponent: () => import('./features/services/requests/requests').then(m => m.Requests) }
    ]
  },
  {
    path: 'complaints',
    loadComponent: () => import('./features/complaints/complaints').then(m => m.Complaints)
  },
  {
    path: 'news',
    loadComponent: () => import('./features/news/news').then(m => m.NewsComponent)
  },
  {
    path: 'service-schedule',
    loadComponent: () => import('./features/service-schedule/service-schedule').then(m => m.ServiceSchedule)
  },
  {
    path: 'jobs',
    children: [
      { path: '', redirectTo: 'prestataire-requests', pathMatch: 'full' },
      { path: 'prestataire-requests', loadComponent: () => import('./features/jobs/prestataire-requests/prestataire-requests').then(m => m.PrestataireRequests) },
      { path: 'offers', loadComponent: () => import('./features/jobs/offers/offers').then(m => m.Offers) }
    ]
  },
  {
    path: 'faq',
    loadComponent: () => import('./features/faq/faq').then(m => m.Faq)
  }
];
