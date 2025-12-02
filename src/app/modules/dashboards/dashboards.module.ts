import { NgModule } from '@angular/core';
import { DashboardsRoutingModule } from './dashboards-routing.module';
import { SharedModule } from 'src/app/Shared/shared/shared.module';
import { IawareDashboardComponent } from './components/iaware-dashboard/iaware-dashboard.component';
import { PhishingComponent } from './components/phishing/phishing.component';
import { TrainingComponent } from './components/training/training.component';
import { LeaderboardComponent } from '../leaderboard/components/leaderboard/leaderboard.component';
import { BadgeComponent } from './components/badge/badge.component';
import { OrganizationComponent } from './components/organization/organization.component';
import { PhishAlertButtonComponent } from './components/phish-alert-button/phish-alert-button.component';
import { UserDashboardComponent } from './components/user-dashboard/user-dashboard.component';
import { IAwareAdminDashboardComponent } from './components/iaware-admin-dashboard/iaware-admin-dashboard.component';
import { UserDashboardTrainingProgressComponent } from './components/user-dashboard/components/user-dashboard-training-progress/user-dashboard-training-progress.component';
import { UserDashboardPhishingResultComponent } from './components/user-dashboard/components/user-dashboard-phishing-result/user-dashboard-phishing-result.component';
import { BadgeRanskScetionComponent } from './components/user-dashboard/components/badge-ransk-scetion/badge-ransk-scetion.component';
import { UserDashboardPersonalRiskScoreComponent } from './components/user-dashboard/components/user-dashboard-personal-risk-score/user-dashboard-personal-risk-score.component';

@NgModule({

  declarations: [
    IawareDashboardComponent,
    PhishingComponent,
    TrainingComponent,
    BadgeComponent,
    LeaderboardComponent,
    PhishAlertButtonComponent,
    OrganizationComponent,
    UserDashboardComponent,
    IAwareAdminDashboardComponent,
    UserDashboardTrainingProgressComponent,
    UserDashboardPhishingResultComponent,
    BadgeRanskScetionComponent,
    UserDashboardPersonalRiskScoreComponent
  ],

  imports: [
    SharedModule,
    DashboardsRoutingModule
  ]
  
})
export class DashboardsModule { }