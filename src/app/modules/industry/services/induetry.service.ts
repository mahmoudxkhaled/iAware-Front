import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResult } from 'src/app/core/Dtos/ApiResult';
import { IPaginationModel } from 'src/app/core/Dtos/IPaginationModel';
import { DataService } from 'src/app/core/Services/data-service.service';

@Injectable({
    providedIn: 'root',
})
export class InduetryService {
    constructor(private dataService: DataService) {}

    getIndustries(pagination: IPaginationModel): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>('/Industry', pagination);
    }

    addIndustry(data: any): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>('/Industry/Add', data);
    }

    editIndustry(data: any): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>('/Industry/Edit', data);
    }

    deleteIndustry(id: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(`/Industry/Delete/${id}`, null);
    }
}
