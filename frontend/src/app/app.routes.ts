import { Routes } from '@angular/router';

export const routes: Routes = [

  // =====================
  // DEFAULT (HOME)
  // =====================
  {
    path: '',
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
        path: 'services/:serviceId/start',
        loadComponent: () =>
          import('./features/services/start-service/start-service').then(m => m.StartService)
      },
      {
        path: 'faq',
        loadComponent: () =>
          import('./features/faq/faq').then(m => m.Faq)
      },
      {
        path: 'report',
        loadComponent: () =>
          import('./features/report/report').then(m => m.Report)
      },
      {
        path: 'my-reports',
        loadComponent: () =>
          import('./features/report/all-my-reports/all-my-reports').then(m => m.AllMyReports)
      },
      {
        path: 'my-requests',
        loadComponent: () =>
          import('./features/my-requests/my-requests').then(m => m.MyRequests)
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
      }
    ]
  },

  // =====================
  // PUBLIC AUTH
  // =====================
  {
    path: 'login',
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
  // CATCH ALL
  // =====================
  {
    path: '**',
    redirectTo: ''
  }
];