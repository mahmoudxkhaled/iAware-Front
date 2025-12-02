import { Injectable } from '@angular/core';
import { BehaviorSubject, finalize, map, Observable } from 'rxjs';
import { ApiResult } from 'src/app/core/Dtos/ApiResult';
import { DataService } from 'src/app/core/Services/data-service.service';
import { ICampaignChartModel } from '../models/ICampaignChartModel';
import { IPhishingTestsChartModel } from '../models/IPhishingTestsChartModel';
import { ICampaignsForDashboardStatisticModel } from '../models/ICampaignsForDashboardStatisticModel';

@Injectable({
    providedIn: 'root',
})
export class IawareDashboardService {
    isLoadingSubject = new BehaviorSubject<boolean>(false);
    constructor(private dataService: DataService) {
        this.isLoadingSubject = new BehaviorSubject<boolean>(false);
    }

    getUserPoints(): Observable<ApiResult> {
        return this.dataService.getAllReguest<ApiResult>('/PointingType/GetUserPoints');
    }

    getOrganizationPoints(): Observable<ApiResult> {
        return this.dataService.getAllReguest<ApiResult>('/PointingType/GetOrganizationPoints');
    }

    getDataFromLastSixMonths(number: number): Observable<ApiResult> {
        return this.dataService.getByReguest<ApiResult>('/Dashboard/GetDataOfSecurityAwarenessCampaigns', number);
    }

    getPhishingTestsChartData(number: number): Observable<ApiResult> {
        return this.dataService.getByReguest<ApiResult>('/Dashboard/GetPhishingTestsChartData', number);
    }

    getCampaignsForDashboardStatistic() {
        return this.dataService
            .getAllReguest<ApiResult>('/Dashboard/GetCampaignsForDashboardStatistic')
            .pipe(map((response) => response.data as ICampaignsForDashboardStatisticModel[]));
    }

    getTenantRisk(): Observable<ApiResult> {
        return this.dataService.getAllReguest<ApiResult>('/Dashboard/TenantRisk');
    }

    getTenantUserRisk(): Observable<ApiResult> {
        return this.dataService.getAllReguest<ApiResult>('/Dashboard/TenantUserRisk');
    }

    getTenantRiskHistory(): Observable<ApiResult> {
        return this.dataService.getAllReguest<ApiResult>('/Dashboard/TenantRiskHistory');
    }

    // User Dashboard
    getUserTenantUnitRankingNumber(): Observable<ApiResult> {
        return this.dataService.getAllReguest<ApiResult>('/Dashboard/GetUserTenantUnitRankingNumber');
    }

    getUserPhishingResults(): Observable<ApiResult> {
        return this.dataService.getAllReguest<ApiResult>('/Dashboard/GetUserDashboardPhishingResults');
    }

    getTeamPhishingResults(): Observable<ApiResult> {
        return this.dataService.getAllReguest<ApiResult>('/Dashboard/GetTeamDashboardPhishingResults');
    }

    getUserTrainingResults(): Observable<ApiResult> {
        return this.dataService.getAllReguest<ApiResult>('/Dashboard/GetUserDashboardTrainingResults');
    }

    getTeamTrainingResults(): Observable<ApiResult> {
        return this.dataService.getAllReguest<ApiResult>('/Dashboard/GetTeamDashboardTrainingResults');
    }

    getCampaignsUsersInThisMonth(month: string, action: string): Observable<ApiResult> {
        const formForm = new FormData();
        formForm.append('month', month.trim().replace(' ', '_'));
        formForm.append('action', action);
        return this.dataService.postReguest<ApiResult>(`/Dashboard/GetCampaignsUsersInThisMonth`, formForm);
    }

    // iAwrae Admin Dashboard
    getAllTenants(): Observable<ApiResult> {
        return this.dataService.getAllReguest<ApiResult>('/Tenant/GetAllTenantsVII');
    }

    getTenantsStatistics(): Observable<ApiResult> {
        return this.dataService.getAllReguest<ApiResult>('/Tenant/GetTenantsStatistics');
    }

    getAllSupscriptionPlans(): Observable<ApiResult> {
        return this.dataService.getAllReguest<ApiResult>('/SubscriptionPlan/GetAllSubscriptionPlansVII');
    }

    deleteTenant(id: string): Observable<ApiResult> {
        this.isLoadingSubject.next(true);
        return this.dataService.postReguest<ApiResult>(`/Tenant/DeleteTenant/${id}`, null)
        .pipe(finalize(() => this.isLoadingSubject.next(false)));
    }

    unDeleteTenant(id: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(`/Tenant/UnDeleteTenant/${id}`, null);
    }

    activeTenant(id: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(`/Tenant/ActiveTenant/${id}`, null);
    }

    deActiveTenant(id: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(`/Tenant/DeActiveTenant/${id}`, null);
    }
}