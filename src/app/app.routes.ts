import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'app',
    pathMatch: 'full',
  },
  {
    path: 'app',
    loadComponent: () => import('../date-time-picker/date-time-picker.component').then(c => c.DateTimePickerComponent),
  },
];
