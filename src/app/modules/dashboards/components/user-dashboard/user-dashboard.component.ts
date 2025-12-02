import { Component, OnInit } from '@angular/core';
import { IawareDashboardService } from '../../services/iaware-dashboard.service';
import { Router } from '@angular/router';
import { IUserDashboardPhishingResultsModel } from '../../models/IUserDashboardPhishingResultsModel';
import { IUserDashboardTrainingResultsModel } from '../../models/IUserDashboardTrainingResultsModel';
import { UserService } from 'src/app/modules/user/services/user.service';
import { ITenantUnitModel } from 'src/app/modules/tenant-unit/models/ITenantUnitModel';
import { ITeamDashboardPhishingResultsModel } from '../../models/ITeamDashboardPhishingResultsModel';
import { ITeamDashboardTrainingResultsModel } from '../../models/ITeamDashboardTrainingResultsModel';
import { IPointsModel } from '../../models/IPointsModel';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.scss'
})
export class UserDashboardComponent implements OnInit {

  userRisk: number = 0;
  userTeanatUnitRankedNumber: number = 0;
  usersBadgesEarnedNumber: number = 0;
  
  userPhishingResults: IUserDashboardPhishingResultsModel = {
    emailsDelivered: 0,
    emailsFailures: 0,
    emailsReported: 0,
    emailsDeliveredPercentage: 0,
    emailsFailuresPercentage: 0,
    emailsReportedPercentage: 0,
    personalUserRiskScore: 0,
  };

  teamPhishingResults: ITeamDashboardPhishingResultsModel = {
    emailsDelivered: 0,
    emailsFailures: 0,
    emailsReported: 0,
    emailsDeliveredPercentage: 0,
    emailsFailuresPercentage: 0,
    emailsReportedPercentage: 0,
    teamUserRiskScore: 0,
  };

  userTrainingResults: IUserDashboardTrainingResultsModel = {
    totalAssignments: 0,
    completedAssignments: 0,
    assignmentsPercentage: 0,
  };

  teamTrainingResults: ITeamDashboardTrainingResultsModel = {
    totalAssignments: 0,
    completedAssignments: 0,
    assignmentsPercentage: 0,
  };

  userPoints: IPointsModel = {
    negativePoints: 0,
    positivePoints: 0,
    totalSumPoints: 0,
  };

  showMydashboard: boolean = true;

  tenantUnits: ITenantUnitModel[] = [];
  tenantUnitIdSelected: string;

  constructor(private apiService: IawareDashboardService, private router: Router, private apiUserService: UserService) { }

  ngOnInit() {
    this.fetchgetUserTenantUnitRankingNumberAndBadgesNumber();
    this.fetchUserPhishingResults();
    this.fetchUserTrainingResults();
    this.fetchUserPoints();
    this.fetchTenantUserRisk();
  }

  fetchUserPoints() {
    this.apiService.getUserPoints().subscribe({
      next: (response) => {
        this.userPoints = response.data;
      },
      error: (error) => {
        console.error('Error fetching user points:', error);
      },
    });
  }


  fetchgetUserTenantUnitRankingNumberAndBadgesNumber() {
    this.apiService.getUserTenantUnitRankingNumber().subscribe({
      next: (response) => {
        this.userTeanatUnitRankedNumber = response.data.tenantUnitRankingNo;
        this.usersBadgesEarnedNumber = response.data.badgesEarnedNumber;
      },
      error: (err) => {

      }
    })
  }

  fetchUserPhishingResults() {
    this.apiService.getUserPhishingResults().subscribe({
      next: (response) => {
        this.userPhishingResults = response.data;
      },
      error: (err) => { }
    })
  }

  fetchTeamPhishingResults() {
    this.apiService.getTeamPhishingResults().subscribe({
      next: (response) => {
        this.teamPhishingResults = response.data;
      },
      error: (err) => {

      }
    })
  }

  fetchUserTrainingResults() {
    this.apiService.getUserTrainingResults().subscribe({
      next: (response) => {
        this.userTrainingResults = response.data;
      },
      error: (err) => {

      }
    })
  }

  fetchTenantUserRisk() {
    this.apiService.getTenantUserRisk().subscribe({
      next: (response) => {
        this.userRisk = response.data;
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  fetchTeamTrainingResults() {
    this.apiService.getTeamTrainingResults().subscribe({
      next: (response) => {
        this.teamTrainingResults = response.data;
      },
      error: (err) => {

      }
    })
  }

  navigateToLeaderboard() {
    this.router.navigate(['/leaderboard']);
  }

  navigateToTraining() {
    this.router.navigate(['/training-campaign']);
  }

  showMyDashboard() {
    this.showMydashboard = true;
  }

  showTeamDashboard() {
    this.showMydashboard = false;
  }

  refresh() {
    this.ngOnInit;
  }

  showTeamSelectedDetails() {

  }

  getTheNeedleValue() {
    return +this.userPhishingResults.personalUserRiskScore;
  }

  navigateToHowLearnBadge() {
    const queryParams = { tapIndex: 1 }; // Define your query parameters
    this.router.navigate(['/users/profile'], { queryParams }); // Pass query parameters properly
  }
}