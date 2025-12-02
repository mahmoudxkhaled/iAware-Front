import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResult } from 'src/app/core/Dtos/ApiResult';
import { IPaginationModel } from 'src/app/core/Dtos/IPaginationModel';
import { DataService } from 'src/app/core/Services/data-service.service';

@Injectable({
    providedIn: 'root',
})
export class PhishingcampaignsService {
    constructor(private dataService: DataService) {}

    getPhishingAwarenessCampaignAdminDashboard(): Observable<ApiResult> {
        return this.dataService.getAllReguest('/AwarenessCampaign/GetPhishingAwarenessCampaignAdminDashboard');
    }

    getCurrentPhishingCampaigns(pagination: IPaginationModel): Observable<ApiResult> {
        return this.dataService.postReguest('/AwarenessCampaign/GetCurrentPhishingCampaigns', pagination);
    }

    getHistoryPhishingCampaigns(pagination: IPaginationModel): Observable<ApiResult> {
        return this.dataService.postReguest('/AwarenessCampaign/GetHistoryPhishingCampaigns', pagination);
    }

    getAllPhishingAwarenessCampaignScheduleForUserVII(): Observable<ApiResult> {
        return this.dataService.getAllReguest('/AwarenessCampaign/GetAllPhishingAwarenessCampaignScheduleForUserVII');
    }

    getActivitiesByTemplateId(templateId: string): Observable<ApiResult> {
        return this.dataService.getByReguest('/AwarenessCampaignSimulationPhishing/activities', templateId);
    }

    getAllPhishingAwarenessCampaignScheduleHistoryForUser(): Observable<ApiResult> {
        return this.dataService.getAllReguest(
            '/AwarenessCampaign/GetAllPhishingAwarenessCampaignScheduleHistoryForUser'
        );
    }

    getAllUsersOnPhishingScedual(id: any): Observable<ApiResult> {
        return this.dataService.getByReguest(
            '/AwarenessCampaign/GetAllPhishingAwarenessCampaignScheduleUsersUsingScedualId',
            id
        );
    }

    getAwarenessCampaignSimulationPhishingWithAwarenessCampaignSimulationPhishingSchedules(
        ids: any
    ): Observable<ApiResult> {
        return this.dataService.postReguest(
            '/AwarenessCampaign/GetAwarenessCampaignSimulationPhishingSchedulesForAwarenessCampaignSimulationPhishingId',
            ids
        );
    }

    fetchAwarenessCampaignSimulationPhishingsForThisCampaign(id: string): Observable<ApiResult> {
        return this.dataService.getByReguest(
            '/AwarenessCampaign/GetAwarenessCampaignSimulationPhishingsForThisCampaign',
            id
        );
    }

    getGetAwarenessPhishingCampaignStatistics(id: any): Observable<ApiResult> {
        return this.dataService.getByReguest('/AwarenessCampaign/PhishingCampaign', id);
    }

    // Dashboard

    getCurrentPhishingCampaignsDashboard(campaignId: string | null): Observable<ApiResult> {
        return this.dataService.getByReguest('/Dashboard/GetCurrentAwarenessPhishingCampaignsForDashboard', campaignId);
    }

    getUsersByActionCurrentPhishingCampaignsDashboard(
        campaignId: string | null,
        action: string
    ): Observable<ApiResult> {
        return this.dataService.getByReguest(
            `/Dashboard/GetUsersByActionCurrentAwarenessPhishingCampaignsForDashboard/${campaignId}`,
            action
        );
    }

    getCompletedPhishingCampaignsDashboard(campaignId: string | null): Observable<ApiResult> {
        return this.dataService.getByReguest(
            '/Dashboard/GetCompletedAwarenessPhishingCampaignsForDashboard',
            campaignId
        );
    }

    getUsersByActionCompletedPhishingCampaignsDashboard(
        campaignId: string | null,
        action: string
    ): Observable<ApiResult> {
        return this.dataService.getByReguest(
            `/Dashboard/GetUsersByActionCompletedAwarenessPhishingCampaignsForDashboard/${campaignId}`,
            action
        );
    }

    getPhishingTrandAnalysis(monthsNumber: number): Observable<ApiResult> {
        return this.dataService.getByReguest('/Dashboard/GetTenantPhishingTrendAnalysis', monthsNumber);
    }

    getPhishingLeaderboard(campaignId: string): Observable<ApiResult> {
        return this.dataService.getByReguest('/Dashboard/LeaderboardStatisticsForPhishingCampaignss', campaignId);
    }
}
