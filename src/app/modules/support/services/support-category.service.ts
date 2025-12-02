import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResult } from 'src/app/core/Dtos/ApiResult';
import { DataService } from 'src/app/core/Services/data-service.service';

@Injectable({
    providedIn: 'root',
})
export class SupportCategoryService {
    constructor(private dataService: DataService) {}

    getAllCategories(): Observable<ApiResult> {
        return this.dataService.getAllReguest<ApiResult>('/HelpCategory');
    }

    getAllCategoriesWithSubjects(): Observable<ApiResult> {
        return this.dataService.getAllReguest<ApiResult>('/HelpCategory/WithSubjects');
    }
    getAllCategoriesWithMembers(): Observable<ApiResult> {
        return this.dataService.getAllReguest<ApiResult>('/HelpCategory/WithMembers');
    }

    getTenantUsers(): Observable<ApiResult> {
        return this.dataService.getAllReguest<ApiResult>('/AppUser/GetAllUsersByTenantId');
    }

    getUsersWithnCategory(ids: string[]): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>('/AppUser/GetUsersWithinIds', ids);
    }

    getCategory(id: string): Observable<ApiResult> {
        return this.dataService.getByReguest<ApiResult>('/HelpCategory', id);
    }

    addCategory(data: any): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>('/HelpCategory/Add', data);
    }

    editCategory(data: any): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>('/HelpCategory/Edit', data);
    }

    deleteCategory(id: any): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(`/HelpCategory/Delete/${id}`, null);
    }

    activateCategory(id: any): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(`/HelpCategory/Activate/${id}`, null);
    }

    deactivateCategory(id: any): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(`/HelpCategory/Deactivate/${id}`, null);
    }
}
