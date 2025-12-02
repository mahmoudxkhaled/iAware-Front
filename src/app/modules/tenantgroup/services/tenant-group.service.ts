import { Injectable } from '@angular/core';
import { ITenantGroupWithMemberCountModel } from '../models/ITenantGroupWithMemberCountModel';
import { Observable, map } from 'rxjs';
import { ApiResult } from 'src/app/core/Dtos/ApiResult';
import { DataService } from 'src/app/core/Services/data-service.service';
import { ITenantGroupModel } from '../models/ITenantGroupModel';
import { IPaginationModel } from 'src/app/core/Dtos/IPaginationModel';

@Injectable({
    providedIn: 'root',
})
export class TenantGroupService {
    constructor(private dataService: DataService) {}

    getTenantGroups(pagination: IPaginationModel): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>('/TenantGroup/GetTenantGroups', pagination);
    }

    isADDataCompleted(): Observable<ApiResult> {
        return this.dataService.getAllReguest<ApiResult>('/Tenant/IsADDataCompleted');
    }

    getTenantGroupById(id: string): Observable<ITenantGroupModel> {
        return this.dataService.getByReguest<ApiResult>('/TenantGroup/GetTenantGroupById', id).pipe(
            map((result) => {
                return result.data as ITenantGroupModel;
            })
        );
    }

    getTenantGroupMembers(id: string): Observable<ApiResult> {
        return this.dataService.getByReguest<ApiResult>('/TenantGroup/GetTenantGroupMembersByTenantGroupId', id);
    }

    createTenantGroup(tenatGroupModel: ITenantGroupModel): Observable<ApiResult> {
        return this.dataService.postReguest('/TenantGroup/AddTenantGroup', tenatGroupModel);
    }

    updateTenantGroup(TenantGroup: ITenantGroupModel): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>('/TenantGroup/EditTenantGroup', TenantGroup);
    }

    deleteTenantGroupById(id: string) {
        return this.dataService.postReguest<ApiResult>(`/TenantGroup/DeleteTenantGroup/${id}`, null);
    }

    activeTenantGroupById(id: string) {
        return this.dataService.postReguest<ApiResult>(`/TenantGroup/ActiveTenantGroup/${id}`, null);
    }

    deActiveTenantGroupById(id: string) {
        return this.dataService.postReguest<ApiResult>(`/TenantGroup/DeActiveTenantGroup/${id}`, null);
    }

    deleteTenantGroup(id: string) {
        return this.dataService.postReguest<ApiResult>(`/TenantGroup/DeleteTenantGroup/${id}`, null);
    }

    getTenantGroupMembersCount(id: string): Observable<ITenantGroupWithMemberCountModel> {
        return this.dataService.getByReguest<ApiResult>('/TenantGroup/GetTenantGroupByIdWithMembersCount', id).pipe(
            map((res) => {
                return res.data as ITenantGroupWithMemberCountModel;
            })
        );
    }

    deleteMemeberFromTenantGroup(tenantGroupId: string, memberId: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(
            `/TenantGroup/DeleteMemberFromTenantGroup/${tenantGroupId}/${memberId}`,
            null
        );
    }
}
