import { Component, Input } from '@angular/core';
import { IPointsModel } from 'src/app/modules/dashboards/models/IPointsModel';

@Component({
  selector: 'app-user-dashboard-personal-risk-score',
  templateUrl: './user-dashboard-personal-risk-score.component.html',
  styleUrl: './user-dashboard-personal-risk-score.component.scss'
})
export class UserDashboardPersonalRiskScoreComponent {
  @Input() userRisk: number; // Replace 'any' with a proper interface/type for userPhishingResults
  @Input() userPoints: IPointsModel={
    negativePoints: 0,
    positivePoints: 0,
    totalSumPoints: 0,
  };

  getTheNeedleValue(): number {
    return +this.userRisk;
  }
}