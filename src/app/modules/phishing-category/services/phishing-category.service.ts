import { Injectable } from '@angular/core';
import { DataService } from 'src/app/core/Services/data-service.service';
import { IPhishingCategory } from '../models/IPhishingCategory';
import { Observable, map } from 'rxjs';
import { ApiResult } from 'src/app/core/Dtos/ApiResult';
import { IPhishingCategoryLanguage } from '../models/IPhishingCategoryLanguage';
import { IPaginationModel } from 'src/app/core/Dtos/IPaginationModel';

@Injectable({
    providedIn: 'root',
})
export class PhishingCategoryService {
    constructor(private dataService: DataService) {}

    getAllPhishingCategories(): Observable<IPhishingCategory[]> {
        return this.dataService
            .getAllReguest<ApiResult>('/PhishingCategory/GetAllPhishingCategories')
            .pipe(map((response) => response.data as IPhishingCategory[]));
    }


    getDefualtCategories(pagination: IPaginationModel): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>('/PhishingCategory/GetDefualtCategories', pagination);
    }

    getTenantCategories(pagination: IPaginationModel): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>('/PhishingCategory/GetTenantCategories', pagination);
    }

    getPhishingCategoryLangaugesByPhishingCategoryId(id: string): Observable<IPhishingCategoryLanguage[]> {
        return this.dataService
            .getByReguest<ApiResult>(`/PhishingCategory/GetPhishingCategoryLangaugesByPhishingCategoryId`, id)
            .pipe(map((response) => response.data as IPhishingCategoryLanguage[]));
    }

    getPhishingCategoryById(id: string): Observable<IPhishingCategory[]> {
        return this.dataService
            .getByReguest<ApiResult>(`/PhishingCategory/GetPhishingCategoryById`, id)
            .pipe(map((result) => result.data as IPhishingCategory[]));
    }

    addPhishingCategory(request: FormData): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>('/PhishingCategory/AddPhishingCategory', request);
    }

    editPhishingCategory(request: FormData): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>('/PhishingCategory/EditPhishingCategory', request);
    }

    deletePhishingCategoryById(id: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(`/PhishingCategory/DeletePhishingCategoryById/${id}`, null);
    }

    deActivatePhishingCategoryById(id: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(`/PhishingCategory/DeActivatePhishingCategoryById/${id}`, null);
    }

    activatePhishingCategoryById(id: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(`/PhishingCategory/ActivatePhishingCategoryById/${id}`, null);
    }

    //#region Phishing category language

    GetPhishingCategoryLangaugeById(id: string): Observable<IPhishingCategoryLanguage> {
        return this.dataService
            .getByReguest<ApiResult>(`/PhishingCategoryLanguage/GetPhishingCategoryLangaugeById`, id)
            .pipe(map((response) => response.data as IPhishingCategoryLanguage));
    }

    addPhishingCategoryLangauge(request: FormData): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(
            '/PhishingCategoryLanguage/AddPhishingCategoryLangauge',
            request
        );
    }

    editPhishingCategoryLangauge(request: FormData): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(
            '/PhishingCategoryLanguage/EditPhishingCategoryLangauge',
            request
        );
    }

    deletePhishingCategoryLangaugeById(id: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(
            `/PhishingCategoryLanguage/DeletePhishingCategoryLangaugeById/${id}`,
            null
        );
    }

    deActivatePhishingCategoryLangaugeById(id: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(
            `/PhishingCategoryLanguage/DeActivatePhishingCategoryLangaugeById/${id}`,
            null
        );
    }

    ActivatePhishingCategoryLangaugeById(id: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(
            `/PhishingCategoryLanguage/ActivatePhishingCategoryLangaugeById/${id}`,
            null
        );
    }

    //#endregion

    getAllPhishingCategoriesWithTemplates(): Observable<ApiResult> {
        return this.dataService.getAllReguest<ApiResult>(
            '/PhishingCategory/GetAllTrainingLessonCategoriesWithLessonsTreeNode'
        );
    }
}
