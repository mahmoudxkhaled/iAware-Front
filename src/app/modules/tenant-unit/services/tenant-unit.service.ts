import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResult } from 'src/app/core/Dtos/ApiResult';
import { DataService } from 'src/app/core/Services/data-service.service';
import { ITenantUnitModel } from '../models/ITenantUnitModel';
import { IPaginationModel } from 'src/app/core/Dtos/IPaginationModel';

@Injectable({
    providedIn: 'root',
})
export class TenantUnitService {
    constructor(private dataService: DataService) {}

    getTenantUnites(pagination: IPaginationModel): Observable<ApiResult> {
        return this.dataService.postReguest('/TenantUnit', pagination);
    }

    addTenantUnite(tenantUnit: ITenantUnitModel): Observable<ApiResult> {
        return this.dataService.postReguest('/TenantUnit/Add', tenantUnit);
    }

    editTenantUnite(tenantUnit: ITenantUnitModel): Observable<ApiResult> {
        return this.dataService.postReguest('/TenantUnit/Edit', tenantUnit);
    }

    deleteTenantUnite(tenantUnitId: string): Observable<ApiResult> {
        return this.dataService.postReguest(`/TenantUnit/Delete/${tenantUnitId}`, null);
    }

    activeTenantUnite(tenantUnitId: string): Observable<ApiResult> {
        return this.dataService.postReguest(`/TenantUnit/Activate/${tenantUnitId}`, null);
    }

    deactiveTenantUnite(tenantUnitId: string): Observable<ApiResult> {
        return this.dataService.postReguest(`/TenantUnit/Deactivate/${tenantUnitId}`, null);
    }

    isADDataCompleted(): Observable<ApiResult> {
        return this.dataService.getAllReguest<ApiResult>('/Tenant/IsADDataCompleted');
    }
}
