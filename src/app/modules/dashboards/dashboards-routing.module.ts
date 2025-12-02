import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IawareDashboardComponent } from './components/iaware-dashboard/iaware-dashboard.component';
import { CampignDashboardDetailsComponent } from './components/campign-dashboard-details/campign-dashboard-details.component';
import { UserDashboardComponent } from './components/user-dashboard/user-dashboard.component';

const routes: Routes = [
  { path: '', component: IawareDashboardComponent }, 
  { path: 'userDashboard', component: UserDashboardComponent }, 
  { path: 'campaignDetails/:id', component: CampignDashboardDetailsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardsRoutingModule { }
