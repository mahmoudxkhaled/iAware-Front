import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResult } from 'src/app/core/Dtos/ApiResult';
import { IPaginationModel } from 'src/app/core/Dtos/IPaginationModel';
import { DataService } from 'src/app/core/Services/data-service.service';

@Injectable({
    providedIn: 'root',
})
export class LeaderboardService {
    constructor(private dataService: DataService) {}

    getLeaderboardStatisticsDataForUsers(pagination: IPaginationModel): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>('/Dashboard/LeaderboardStatisticsForUsers', pagination);
    }

    getLeaderboardStatisticsForTenantUnits(pagination: IPaginationModel): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>('/Dashboard/LeaderboardStatisticsForTenantUnits', pagination);
    }
}