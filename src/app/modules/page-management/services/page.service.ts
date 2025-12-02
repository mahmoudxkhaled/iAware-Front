import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiResult } from 'src/app/core/Dtos/ApiResult';
import { DataService } from 'src/app/core/Services/data-service.service';
import { IAspNetPageModel } from '../models/IAspNetPageModel';
import { IAspNetPageItemModel } from '../models/IAspNetPageItemModel';
import { IPaginationModel } from 'src/app/core/Dtos/IPaginationModel';

@Injectable({
    providedIn: 'root',
})
export class PageService {
    constructor(private dataService: DataService) {}
    getPages(pagination: IPaginationModel): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>('/AspNetPage/GetPages', pagination);
    }

    getAspNetPage(id: string): Observable<ApiResult> {
        return this.dataService.getByReguest<ApiResult>('/AspNetPage/GetPageById', id);
    }

    getPageItems(id: string, pagination: IPaginationModel): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(`/AspNetPageItem/GetPageItems/${id}`, pagination);
    }

    activeAspNetPage(id: string): Observable<boolean> {
        return this.dataService.postReguest<ApiResult>(`/AspNetPage/ActivePage/${id}`, null).pipe(
            map((result) => {
                return result.isSuccess;
            })
        );
    }

    deActiveAspNetPage(id: string): Observable<boolean> {
        return this.dataService.postReguest<ApiResult>(`/AspNetPage/DeActivePage/${id}`, null).pipe(
            map((result) => {
                return result.isSuccess;
            })
        );
    }

    deleteAspNetPage(id: string): Observable<boolean> {
        return this.dataService.postReguest<ApiResult>(`/AspNetPage/DeletePage/${id}`, null).pipe(
            map((result) => {
                return result.isSuccess;
            })
        );
    }

    updateAspNetPage(data: IAspNetPageModel): Observable<boolean> {
        return this.dataService.postReguest<ApiResult>(`/AspNetPage/EditPage`, data).pipe(
            map((result) => {
                return result.isSuccess;
            })
        );
    }

    createAspNetPage(data: IAspNetPageModel): Observable<boolean> {
        return this.dataService.postReguest<ApiResult>(`/AspNetPage/AddPage`, data).pipe(
            map((result) => {
                return result.isSuccess;
            })
        );
    }

    updateAspNetPageItem(data: IAspNetPageItemModel): Observable<boolean> {
        return this.dataService.postReguest<ApiResult>(`/AspNetPageItem/EditPageItem`, data).pipe(
            map((result) => {
                return result.isSuccess;
            })
        );
    }

    createAspNetPageItem(data: IAspNetPageItemModel): Observable<boolean> {
        return this.dataService.postReguest<ApiResult>(`/AspNetPageItem/AddPageItem`, data).pipe(
            map((result) => {
                return result.isSuccess;
            })
        );
    }
    deleteItemFromPage(id: string): Observable<boolean> {
        return this.dataService.postReguest<ApiResult>(`/AspNetPageItem/DeletePageItem/${id}`, null).pipe(
            map((result) => {
                return result.isSuccess;
            })
        );
    }
}
