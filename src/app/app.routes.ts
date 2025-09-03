import { Routes } from '@angular/router';

import { AUGAnalysis } from './auganalysis/auganalysis';
import { LoginPage } from './login-page/login-page';
import { StaticComponent } from './static-component/static-component';
import { DataAnalysisAi } from './data-analysis-ai/data-analysis-ai';
import { SecurityGroup } from './security-group/security-group';
import { Users } from './users/users';
import { AuthGuard } from '../auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {path:'login' ,component: LoginPage },
  {

    path:'home', component: StaticComponent,canActivate: [AuthGuard],
    children: [
      { path: 'AugAi', component:  AUGAnalysis,canActivate: [AuthGuard]},
      { path: 'DataAi', component:  DataAnalysisAi,canActivate: [AuthGuard]},
      { path: 'SecurityGroup', component:  SecurityGroup,canActivate: [AuthGuard]},
      { path: 'Users', component:  Users,canActivate: [AuthGuard]},
    ]
  },
  { path: '**', redirectTo: 'login' }
];
