import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiResult } from 'src/app/core/Dtos/ApiResult';
import { ISubscriptionPlanModel } from '../models/ISubscriptionPlanModel';
import { DataService } from 'src/app/core/Services/data-service.service';
import { environment } from 'src/environments/environment';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
    providedIn: 'root',
})
export class SubscriptionService {
    constructor(private dataService: DataService) {}

    getAllsusbcriptions(): Observable<ISubscriptionPlanModel[]> {
        return this.dataService.getAllReguest<ApiResult>('/SubscriptionPlan/GetAllSubscriptionPlans').pipe(
            map((response) => {
                return response.data;
            })
        );
    }

    getSubscriptionPlanById(id: string): Observable<ISubscriptionPlanModel> {
        return this.dataService.getByReguest<ApiResult>('/SubscriptionPlan/GetSubscriptionPlanById', id).pipe(
            map((result) => {
                return result.data as ISubscriptionPlanModel;
            })
        );
    }

    createSubscriptionPlan(subscription: ISubscriptionPlanModel): Observable<ApiResult> {
        console.log(subscription);
        return this.dataService.postReguest('/SubscriptionPlan/CreateSubscriptionPlan', subscription);
    }

    EditSubscriptionPlan(subscriptionPlanModel: ISubscriptionPlanModel): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>('/SubscriptionPlan/EditSubscriptionPlan', subscriptionPlanModel);
    }

    deleteSubscriptionPlan(id: string) {
        return this.dataService.postReguest<ApiResult>(`/SubscriptionPlan/DeleteSubscriptionPlan/${id}`, null);
    }

    activateSubscriptionPlan(id: string) {
        return this.dataService.postReguest<ApiResult>(`/SubscriptionPlan/ActiveSubscriptionPlan/${id}`, null);
    }

    dectivateSubscriptionPlan(id: string) {
        return this.dataService.postReguest<ApiResult>(`/SubscriptionPlan/DeActiveSubscriptionPlan/${id}`, null);
    }

    activateFreeSubscriptionPlan(id: string) {
        return this.dataService.postReguest<ApiResult>(`/SubscriptionPlan/FreeSubscriptionPlan/${id}`, null);
    }

    deActivateFreeSubscriptionPlan(id: string) {
        return this.dataService.postReguest<ApiResult>(`/SubscriptionPlan/NotFreeSubscriptionPlan/${id}`, null);
    }

    activateIAwareSubscriptionPlan(id: string) {
        return this.dataService.postReguest<ApiResult>(`/SubscriptionPlan/IAwareSubscriptionPlan/${id}`, null);
    }

    deActivateIAwareSubscriptionPlan(id: string) {
        return this.dataService.postReguest<ApiResult>(`/SubscriptionPlan/NotIAwareSubscriptionPlan/${id}`, null);
    }

    getTenantSubscription(): Observable<ApiResult> {
        return this.dataService.getAllReguest<ApiResult>('/TenantSubscription/GetTenantSubscription').pipe(
            map((response) => {
                return response;
            })
        );
    }

    previewRenewTenantSubscription(): Observable<ApiResult> {
        return this.dataService.getAllReguest<ApiResult>('/TenantSubscription/PreviewRenewTenantSubscription');
    }

    confirmRenewTenantSubscription() {
        return this.dataService.postReguest<ApiResult>(`/TenantSubscription/ConfirmRenewTenantSubscription`, null);
    }

    previewUpgradeTenantSubscription(id: string): Observable<ApiResult> {
        return this.dataService.getAllReguest<ApiResult>(`/TenantSubscription/PreviewUpgradeTenantSubscription/${id}`);
    }

    confirmUpgradeTenantSubscription(id: string) {
        return this.dataService.postReguest<ApiResult>(
            `/TenantSubscription/ConfirmUpgradeTenantSubscription/${id}`,
            null
        );
    }

    previewPurchaseUsersTenantSubscription(numOfUsers: number): Observable<ApiResult> {
        return this.dataService.getAllReguest<ApiResult>(
            `/TenantSubscription/PreviewPurchaseUsersTenantSubscription/${numOfUsers}`
        );
    }

    confirmPurchaseUsersTenantSubscription(numOfUsers: number) {
        return this.dataService.postReguest<ApiResult>(
            `/TenantSubscription/ConfirmPurchaseUsersTenantSubscription/${numOfUsers}`,
            null
        );
    }
}
