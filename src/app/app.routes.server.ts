import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // All routes render in the browser (Client mode)
  // This avoids SSR trying to call the API or access localStorage on the server
  {
    path: '**',
    renderMode: RenderMode.Client
  }
];