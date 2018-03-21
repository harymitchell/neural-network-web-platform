import { Route } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Route[] = [
  { path: '', pathMatch: 'full', redirectTo: 'datasets', canActivate: [AuthGuard]},
  { loadChildren: 'app/datasets/datasets.module#DatasetsModule', path: 'datasets', canActivate: [AuthGuard] },
  { loadChildren: 'app/models/models.module#ModelsModule', path: 'models', canActivate: [AuthGuard] },
  { loadChildren: 'app/evaluations/evaluations.module#EvaluationsModule', path: 'evaluations', canActivate: [AuthGuard] },
  { loadChildren: 'app/profile/profile.module#ProfileModule', path: 'profile', canActivate: [AuthGuard] },
  { loadChildren: 'app/weather/weather.module#WeatherModule', path: 'weather', canActivate: [AuthGuard] },
  { loadChildren: 'app/login/login.module#LoginModule', path: 'login' },
  { loadChildren: 'app/login/login.module#LoginModule', path: 'logout' },
  { path: '**', redirectTo: '' }
];
