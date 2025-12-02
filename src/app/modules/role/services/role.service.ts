import { Injectable } from '@angular/core';
import { DataService } from 'src/app/core/Services/data-service.service';
import { IRoleModel } from '../models/IRoleModel';
import { Observable, map } from 'rxjs';
import { ApiResult } from 'src/app/core/Dtos/ApiResult';
import { IAspNetPageModel } from 'src/app/modules/page-management/models/IAspNetPageModel';
import { IPaginationModel } from 'src/app/core/Dtos/IPaginationModel';

@Injectable({
    providedIn: 'root',
})
export class RoleService {
    constructor(private dataService: DataService) {}

    getRoles(): Observable<IRoleModel[]> {
        return this.dataService
            .getAllReguest<ApiResult>('/RoleManagement/GetAllWithSubscriptionTenantId')
            .pipe(map((response) => response.data));
    }

    getAllRoles(pagination: IPaginationModel): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>('/RoleManagement/GetRoles', pagination);
    }

    getAdministratorRoles(): Observable<IRoleModel[]> {
        return this.dataService
            .getAllReguest<ApiResult>('/RoleManagement/GetAllAdministratorRolesWithSubscriptionTenantId')
            .pipe(map((response) => response.data));
    }

    getTenantRoles(): Observable<IRoleModel[]> {
        return this.dataService
            .getAllReguest<ApiResult>('/RoleManagement/GetAllActiveTenantRoles')
            .pipe(map((response) => response.data));
    }

    getAllPagesWithItems(): Observable<IAspNetPageModel[]> {
        return this.dataService
            .getAllReguest<ApiResult>('/AspNetPage/GetAllPagesWithItems')
            .pipe(map((response) => response.data));
    }

    getUsers(id: string): Observable<ApiResult> {
        return this.dataService.getByReguest<ApiResult>('/RoleManagement/GetUsersByRoleId', id);
    }

    getRoleById(id: string): Observable<IRoleModel> {
        return this.dataService.getByReguest<ApiResult>('/RoleManagement/GetRoleByIdWithPermessions', id).pipe(
            map((result) => {
                return result.data as IRoleModel;
            })
        );
    }

    getRoleByIdWithPermession(id: string): Observable<IRoleModel> {
        return this.dataService.getByReguest<ApiResult>('/RoleManagement/GetRoleByIdWithPermessions', id).pipe(
            map((result) => {
                return result.data as IRoleModel;
            })
        );
    }

    createRole(role: IRoleModel): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>('/RoleManagement/AddRole', role);
    }

    updateRole(role: IRoleModel): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>('/RoleManagement/EditRole', role);
    }

    deleteRoleById(id: string) {
        return this.dataService.postReguest<ApiResult>(`/RoleManagement/DeleteRole/${id}`, null);
    }

    activeRoleById(id: string) {
        return this.dataService.postReguest<ApiResult>(`/RoleManagement/ActiveRole/${id}`, null);
    }

    deActiveRoleById(id: string) {
        return this.dataService.postReguest<ApiResult>(`/RoleManagement/DeActiveRole/${id}`, null);
    }

    deleteUserFromRole(roleId: string, userId: string) {
        return this.dataService.postReguest<ApiResult>(`/RoleManagement/DeleteUserFromRole/${roleId}/${userId}`, null);
    }
}
