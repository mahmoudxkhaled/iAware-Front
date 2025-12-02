import { Component, OnInit } from '@angular/core';
import { LeaderboardService } from '../../services/leaderboard.service';
import { ILeaderboardStatisticsModel } from '../../models/ILeaderboardStatisticsModel';
import { ILeaderboardStatisticsForTenantUnitsModel } from '../../models/ILeaderboardStatisticsForTenantUnitsModel';
import { PermessionsService } from 'src/app/core/Services/permessions.service';
import { IAspNetPageItemModel } from 'src/app/modules/page-management/models/IAspNetPageItemModel';
import { constants } from 'src/app/core/constatnts/constatnts';
import { TableLoadingService } from 'src/app/core/Services/table-loading.service';
import { IPaginationModel } from 'src/app/core/Dtos/IPaginationModel';
import { PaginatorState } from 'primeng/paginator';
import { IRankedUsersModel } from '../../models/IRankedUsersModel';
import { IRankedTenantUnitsModel } from '../../models/IRankedTenantUnitsModel';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.scss'
})
export class LeaderboardComponent implements OnInit {
  tableLoadingSpinner: boolean = true;
  pagePermessions: IAspNetPageItemModel[] = [];
  actions = constants.pageActions;
  leaderboardDataForUsers: ILeaderboardStatisticsModel;
  leaderboardDataForTenantUnits: ILeaderboardStatisticsForTenantUnitsModel;
  topThreeRankedUsers: IRankedUsersModel[] = [];
  topThreeRankedTenantUnits: IRankedTenantUnitsModel[] = [];
  totalRecords: number = 0;
  totalRecordsUnits: number = 0;
  pagination: IPaginationModel = {
    page : 0,
    size : 9,
    searchQuery : ''
  };
  paginationUnits: IPaginationModel = {
    page : 0,
    size : 5,
    searchQuery : ''
  };

  
  constructor(private apiService: LeaderboardService,
    private tableLoadingService: TableLoadingService,
    private permessionService: PermessionsService,) {
    this.pagePermessions = this.permessionService.getPagePermessions(constants.pages.leaderboard);
  }

  ngOnInit(): void {
    this.tableLoadingService.loading$.subscribe((isLoading) => {
      this.tableLoadingSpinner = isLoading;
    });
    this.fetchLeaderboardDataForUsers();
    this.fetchLeaderboardDataForTenantUnits();
  }

  fetchLeaderboardDataForUsers() {
    this.tableLoadingService.show();
    this.apiService.getLeaderboardStatisticsDataForUsers(this.pagination).subscribe({
      next: (data) => {
        this.leaderboardDataForUsers = data.data;
        this.totalRecords = data.totalRecords;
        if(this.pagination.page == 0){
          this.topThreeRankedUsers = this.leaderboardDataForUsers.topThreeRankedUsers;
        }
        this.tableLoadingService.hide();
      }
    });
  }

  fetchLeaderboardDataForTenantUnits() {
    this.tableLoadingService.show();
    this.apiService.getLeaderboardStatisticsForTenantUnits(this.paginationUnits).subscribe({
      next: (data) => {
        this.leaderboardDataForTenantUnits = data.data;
        this.totalRecordsUnits = data.totalRecords;
        if(this.paginationUnits.page == 0){
          this.topThreeRankedTenantUnits = this.leaderboardDataForTenantUnits.topThreeRankedTenantUnits;
        }
        this.tableLoadingService.hide();
      },
      error: (err) => {
        this.tableLoadingService.hide();
      }
    });
  }

  hasPermission(controlKey: string): boolean {
    return this.pagePermessions.some((p) => p.controlKey === controlKey);
  }

  onPageChange(event: PaginatorState) {
    this.pagination.page = event.page || 0;
    this.pagination.size = event.rows || 9;
    this.fetchLeaderboardDataForUsers();
  }
  onPageChangeUnits(event: PaginatorState) {
    this.paginationUnits.page = event.page || 0;
    this.paginationUnits.size = event.rows || 5;
    this.fetchLeaderboardDataForTenantUnits();
  }
}