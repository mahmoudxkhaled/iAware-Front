import { Injectable } from '@angular/core';
import { finalize, map, Observable } from 'rxjs';
import { ApiResult } from 'src/app/core/Dtos/ApiResult';
import { DataService } from 'src/app/core/Services/data-service.service';

@Injectable({
    providedIn: 'root',
})
export class InvoiceService {
    constructor(private dataService: DataService) {}

    getAllSubscriptionTenantInvoices(): Observable<ApiResult> {
        return this.dataService.getAllReguest<ApiResult>(
            `/SubscriptionTenantInvoices/GetAllSubscriptionTenantInvoices`
        );
    }

    getInProgressTenantSubscriptionInvoices(): Observable<ApiResult> {
        return this.dataService.getAllReguest<ApiResult>(
            `/SubscriptionTenantInvoices/GetInProgressTenantSubscriptionInvoices`
        );
    }

    getCompletedTenantSubscriptionInvoices(): Observable<ApiResult> {
        return this.dataService.getAllReguest<ApiResult>(
            `/SubscriptionTenantInvoices/GetCompletedTenantSubscriptionInvoices`
        );
    }

    getAllSubscriptionTenantInvoicesForTenant(): Observable<ApiResult> {
        return this.dataService.getAllReguest<ApiResult>(
            `/SubscriptionTenantInvoices/GetAllSubscriptionTenantInvoicesForTenant`
        );
    }
    getSubscriptionTenantInvoiceById(id: string): Observable<ApiResult> {
        return this.dataService.getByReguest<ApiResult>(
            `/SubscriptionTenantInvoices/GetSubscriptionTenantInvoiceById`,
            id
        );
    }

    getRemainingAmountOfSubscriptionTenantInvoiceById(id: string): Observable<ApiResult> {
        return this.dataService.getByReguest<ApiResult>(
            `/SubscriptionTenantInvoices/GetRemainingAmountOfSubscriptionTenantInvoiceById`,
            id
        );
    }

    createSubscriptionTenantInvoice(request: any): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(
            `/SubscriptionTenantInvoices/CreateSubscriptionTenantInvoice`,
            request
        );
    }

    editSubscriptionTenantInvoice(request: any): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(
            `/SubscriptionTenantInvoices/EditSubscriptionTenantInvoice`,
            request
        );
    }

    deleteSubscriptionTenantInvoiceById(id: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(
            `/SubscriptionTenantInvoices/DeleteSubscriptionTenantInvoice/${id}`,
            null
        );
    }

    activateTenantSubscriptionInvoice(id: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(
            `/SubscriptionTenantInvoices/ActiveSubscriptionTenantInvoice/${id}`,
            null
        );
    }

    deactivateTenantSubscriptionInvoice(id: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(
            `/SubscriptionTenantInvoices/DeActiveSubscriptionTenantInvoice/${id}`,
            null
        );
    }

    createTenantSubscriptionInvoicePaymentRequest(request: FormData): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(
            `/TenantSubscriptionInvoicePaymentRequest/CreateTenantSubscriptionInvoicePaymentRequest`,
            request
        );
    }

    editTenantSubscriptionInvoicePaymentRequest(request: FormData): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(
            `/TenantSubscriptionInvoicePaymentRequest/EditTenantSubscriptionInvoicePaymentRequest`,
            request
        );
    }
}
