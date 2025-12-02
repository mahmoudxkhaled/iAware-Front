import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResult } from 'src/app/core/Dtos/ApiResult';
import { IPaginationModel } from 'src/app/core/Dtos/IPaginationModel';
import { DataService } from 'src/app/core/Services/data-service.service';

@Injectable({
    providedIn: 'root',
})
export class SystemEmailService {
    constructor(private dataService: DataService) {}

    getSystemEmails(pagination: IPaginationModel): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>('/SystemEmail/GetSystemEmails', pagination);
    }

    getSystemEmailById(id: string): Observable<ApiResult> {
        return this.dataService.getByReguest<ApiResult>('/SystemEmail/GetSystemEmailById', id);
    }

    addSystemEmail(data: any): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>('/SystemEmail/AddSystemEmail', data);
    }

    editSystemEmail(data: any): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>('/SystemEmail/EditSystemEmail', data);
    }

    activateSystemEmail(id: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(`/SystemEmail/ActivateSystemEmail/${id}`, null);
    }

    deactivateSystemEmail(id: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(`/SystemEmail/DeactivateSystemEmail/${id}`,null);
    }

    deleteSystemEmail(id: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(`/SystemEmail/DeleteSystemEmail/${id}`, null);
    }
}