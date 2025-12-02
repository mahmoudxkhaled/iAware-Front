import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResult } from 'src/app/core/Dtos/ApiResult';
import { DataService } from 'src/app/core/Services/data-service.service';

@Injectable({
    providedIn: 'root',
})
export class SupportSubjectService {
    constructor(private dataService: DataService) {}

    getAllSubject(): Observable<ApiResult> {
        return this.dataService.getAllReguest<ApiResult>('/HelpSubject');
    }

    getSubject(id: string): Observable<ApiResult> {
        return this.dataService.getByReguest<ApiResult>('/HelpSubject', id);
    }

    addSubject(data: any): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>('/HelpSubject/Add', data);
    }

    editSubject(data: any): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>('/HelpSubject/Edit', data);
    }

    deleteSubject(id: any): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(`/HelpSubject/Delete/${id}`, null);
    }

    activateSubject(id: any): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(`/HelpSubject/Activate/${id}`, null);
    }

    deactivateSubject(id: any): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(`/HelpSubject/Deactivate/${id}`, null);
    }
}
