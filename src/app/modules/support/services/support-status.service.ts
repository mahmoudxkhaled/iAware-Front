import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResult } from 'src/app/core/Dtos/ApiResult';
import { DataService } from 'src/app/core/Services/data-service.service';

@Injectable({
    providedIn: 'root',
})
export class SupportStatusService {
    constructor(private dataService: DataService) {}

    getAllStatus(): Observable<ApiResult> {
        return this.dataService.getAllReguest<ApiResult>('/HelpStatus');
    }

    getStatus(id: string): Observable<ApiResult> {
        return this.dataService.getByReguest<ApiResult>('/HelpStatus', id);
    }

    addStatus(data: any): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>('/HelpStatus/Add', data);
    }

    editStatus(data: any): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>('/HelpStatus/Edit', data);
    }

    deleteStatus(id: any): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(`/HelpStatus/Delete/${id}`, null);
    }

    activateStatus(id: any): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(`/HelpStatus/Activate/${id}`, null);
    }

    deactivateStatus(id: any): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(`/HelpStatus/Deactivate/${id}`, null);
    }
}
