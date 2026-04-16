import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'login',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'login/reset',
    renderMode: RenderMode.Prerender
  },
  // Dynamic routes with parameters - use server rendering
  {
    path: 'services/:serviceId',
    renderMode: RenderMode.Server
  },
  {
    path: 'services/:serviceId/start',
    renderMode: RenderMode.Server
  },
  {
    path: 'jobs/:jobsId',
    renderMode: RenderMode.Server
  },
  {
    path: 'news/:newsId',
    renderMode: RenderMode.Server
  },
  // Catch-all for other routes - use server rendering
  {
    path: '**',
    renderMode: RenderMode.Server
  }
];
