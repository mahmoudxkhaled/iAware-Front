import { Injectable } from '@angular/core';
import { DataService } from 'src/app/core/Services/data-service.service';
import { TenantModel } from '../models/TenantModel';
import { Observable, map } from 'rxjs';
import { ApiResult } from 'src/app/core/Dtos/ApiResult';

@Injectable({
    providedIn: 'root',
})
export class AccountSettingService {
    constructor(private dataService: DataService) {}

    getCurrentTenant(): Observable<TenantModel> {
        return this.dataService.getAllReguest<ApiResult>('/Tenant/GetTenant').pipe(
            map((res) => {
                return res.data as TenantModel;
            })
        );
    }

    saveTenantModel(data: TenantModel): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>('/Tenant/EditTenant', data);
    }

    getAllBadgesTenant(): Observable<ApiResult> {
        return this.dataService.getAllReguest<ApiResult>('/Tenant/GetAllBadges');
    }

    saveCompanyLogo(data: any): Observable<ApiResult> {
        const form = new FormData();
        form.append('file', data);
        return this.dataService.postReguest<ApiResult>('/Tenant/UploadCompanyLogo', form);
    }
}
