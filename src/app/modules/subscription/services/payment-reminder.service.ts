import { Injectable } from '@angular/core';
import { ApiResult } from 'src/app/core/Dtos/ApiResult';
import { DataService } from 'src/app/core/Services/data-service.service';
import { IPaymentReminderSettingModel } from '../models/IPaymentReminderSettingModel';
import { Observable, map } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class PaymentReminderSettingsService {
    constructor(private dataService: DataService) {}

    getAllPaymentReminderSettings(): Observable<IPaymentReminderSettingModel[]> {
        return this.dataService
            .getAllReguest<ApiResult>('/PaymentReminderSetting/GetAllPaymentReminderSettings')
            .pipe(map((response) => response.data));
    }

    getPaymentReminderSettingsById(id: string): Observable<ApiResult> {
        return this.dataService.getByReguest<ApiResult>('/PaymentReminderSetting/GetPaymentReminderSettingById', id);
    }

    createPaymentReminderSettings(paymentReminderSettingModel: IPaymentReminderSettingModel): Observable<ApiResult> {
        return this.dataService.postReguest(
            '/PaymentReminderSetting/AddPaymentReminderSetting',
            paymentReminderSettingModel
        );
    }

    EditPaymentReminderSettings(paymentReminderSettingModel: IPaymentReminderSettingModel): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(
            '/PaymentReminderSetting/EditPaymentReminderSetting',
            paymentReminderSettingModel
        );
    }

    deletePaymentReminderSettings(id: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(
            `/PaymentReminderSetting/DeletePaymentReminderSetting/${id}`,
            null
        );
    }

    activatePaymentReminderSettings(id: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(
            `/PaymentReminderSetting/ActivePaymentReminderSetting/${id}`,
            null
        );
    }

    dectivatePaymentReminderSettings(id: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(
            `/PaymentReminderSetting/DeActivePaymentReminderSetting/${id}`,
            null
        );
    }
}
