import { Routes } from '@angular/router';
import { NoUserGuard } from './core/guards/no-user.guard';
import { UserGuard } from './core/guards/user.guard';
import { PrestataireGuard } from './core/guards/prestataire.guard';

export const routes: Routes = [

  // =====================
  // PUBLIC
  // =====================
  {
    path: 'login',
    canMatch: [NoUserGuard],
    loadComponent: () =>
      import('./layouts/simple-layout/simple-layout').then(m => m.SimpleLayout),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/login/login').then(m => m.Login)
      },
      {
        path: 'reset',
        loadComponent: () =>
          import('./features/reset-password-page/reset-password-page').then(m => m.ResetPasswordPage)
      },
      {
        path: 'reset-page-link',
        loadComponent: () =>
          import('./features/reset-password-page-here/reset-password-page-here').then(m => m.ResetPasswordPageHere)
      },
      {
        path: 'create-account',
        loadComponent: () =>
          import('./features/create-account/create-account').then(m => m.CreateAccount)
      },
    ]
  },

  // =====================
  // PROTECTED
  // =====================
  {
    path: '',
    canMatch: [UserGuard],
    loadComponent: () =>
      import('./layouts/default-layout/default-layout').then(m => m.DefaultLayout),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./features/home/home').then(m => m.Home)
      },
      {
        canMatch: [PrestataireGuard],
        path: 'offers',
        loadComponent: () =>
          import('./features/offers/offers').then(m => m.Offers)
      },
      {
        path: 'jobs',
        loadComponent: () =>
          import('./features/jobs/jobs').then(m => m.Jobs)
      },
      {
        path: 'jobs/:jobsId',
        loadComponent: () =>
          import('./features/jobs/details-page/details-page').then(m => m.DetailsPage)
      },
      {
        path: 'services',
        loadComponent: () =>
          import('./features/services/services').then(m => m.Services)
      },
      {
        path: 'services/:serviceId',
        loadComponent: () =>
          import('./features/services/details-page/details-page').then(m => m.DetailsPage)
      },
      {
        path: 'services/:serviceId/request',
        loadComponent: () =>
          import('./features/services/start-service/start-service').then(m => m.StartService)
      },
      {
        path: 'faq',
        loadComponent: () =>
          import('./features/faq/faq').then(m => m.Faq)
      },
      {
        path: 'complaints/new',
        loadComponent: () =>
          import('./features/report/report').then(m => m.Report)
      },
      {
        path: 'complaints',
        loadComponent: () =>
          import('./features/report/all-my-reports/all-my-reports').then(m => m.AllMyReports)
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/profile').then(m => m.Profile)
      },
      {
        path: 'news/:newsId',
        loadComponent: () =>
          import('./features/news-details/news-details').then(m => m.NewsDetails)
      },
      {
        path: 'schedules',
        loadComponent: () =>
          import('./features/schedules/schedule-page/schedule-page').then(
            (m) => m.SchedulePage
          ),
      },
    ]
  },

  // =====================
  // CATCH ALL
  // =====================
  {
    path: '**',
    redirectTo: ''
  }
];