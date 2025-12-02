import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiResult } from 'src/app/core/Dtos/ApiResult';
import { DataService } from 'src/app/core/Services/data-service.service';
import { IBadgeModel } from '../../account/models/IBadgeModel';

@Injectable({
    providedIn: 'root',
})
export class BadgeService {
    constructor(private dataService: DataService) {}

    getAllBadges(): Observable<ApiResult> {
        return this.dataService.getAllReguest<ApiResult>('/Badge');
    }

    getBadge(id: string): Observable<ApiResult> {
        return this.dataService.getByReguest<ApiResult>('/Badge', id);
    }

    addBadge(data: any): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>('/Badge/Add', data);
    }

    editBadge(data: any): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>('/Badge/Edit', data);
    }

    activateBadge(id: number): Observable<boolean> {
        return this.dataService.postReguest<ApiResult>(`/Badge/Activate/${id}`, null).pipe(
            map((result) => {
                return result.isSuccess;
            })
        );
    }

    deActivateBadge(id: number): Observable<boolean> {
        return this.dataService.postReguest<ApiResult>(`/Badge/Deactivate/${id}`, null).pipe(
            map((result) => {
                return result.isSuccess;
            })
        );
    }

    deleteBadge(id: number): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(`/Badge/Delete/${id}`, null);
    }
}
