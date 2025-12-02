import { Injectable } from '@angular/core';
import { DataService } from 'src/app/core/Services/data-service.service';
import { map, Observable } from 'rxjs';
import { ApiResult } from 'src/app/core/Dtos/ApiResult';
import { IPhishingEmailTemplateLanguage } from '../models/IPhishingEmailTemplateLanguage';
import { IPaginationModel } from 'src/app/core/Dtos/IPaginationModel';

@Injectable({
    providedIn: 'root',
})
export class PhishingEmailTemplateService {
    constructor(private dataService: DataService) { }

    getDefaultLanguage(): Observable<ApiResult> {
        return this.dataService.getAllReguest<ApiResult>('/Language/GetDefaultLanguage');
    }

    getAllPhishingTemplates(): Observable<ApiResult> {
        return this.dataService.getAllReguest<ApiResult>('/PhishingEmailTemplate/GetAllPhishingEmailTemplates');
    }
    
    getTenantPhishingAllTemplates(pagination : IPaginationModel): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(
            '/PhishingEmailTemplate/GetTenantPhishingEmailTemplates',
            pagination
        );
    }

    getDefaultPhishingAllTemplates(pagination : IPaginationModel): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(
            '/PhishingEmailTemplate/GetDefaultPhishingEmailTemplates',
            pagination
        );
    }

    getAllPhishingTemplateLanguages(id: string): Observable<ApiResult> {
        return this.dataService.getByReguest<ApiResult>(
            '/PhishingEmailTemplate/GetPhishingEmailTemplateLanguagesByPhishingEmailTemplateId',
            id
        );
    }

    addPhishingEmailTemplate(data: FormData): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>('/PhishingEmailTemplate/AddPhishingEmailTemplate', data);
    }

    addPhishingEmailTemplateLanguage(data: FormData): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(
            '/PhishingEmailTemplateLanguage/AddPhishingEmailTemplateLanguage',
            data
        );
    }

    editPhishingEmailTemplateLanguage(data: FormData): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(
            '/PhishingEmailTemplateLanguage/EditPhishingEmailTemplateLanguage',
            data
        );
    }

    updatePhishingTemplate(id: string, name: string, tages : string[]): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>('/PhishingEmailTemplate/UpdatePhishingTemplateEmailName', {
            Id: id,
            EmailName: name,
            PhishingDomainId: '',
            PhishingCategoryId: '',
            LanguageId: '',
            Tages:tages
        });
    }

    deletePhishingTemplate(id: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(
            `/PhishingEmailTemplate/DeletePhishingEmailTemplateById/${id}`,
            null
        );
    }

    deletePhishingTemplateLanguage(id: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(
            `/PhishingEmailTemplateLanguage/DeletePhishingEmailTemplateLanguageById/${id}`,
            null
        );
    }

    activatePhishingTemplate(id: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(
            `/PhishingEmailTemplate/ActivatPhishingEmailTemplateById/${id}`,
            null
        );
    }

    activatePhishingTemplateLanguage(id: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(
            `/PhishingEmailTemplateLanguage/ActivatePhishingEmailTemplateLanguageById/${id}`,
            null
        );
    }

    deactivatePhishingTemplate(id: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(
            `/PhishingEmailTemplate/DeActivatePhishingEmailTemplateById/${id}`,
            null
        );
    }

    deactivatePhishingTemplateLanguage(id: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(
            `/PhishingEmailTemplateLanguage/DeActivatePhishingEmailTemplateLanguageById/${id}`,
            null
        );
    }

    getPhishingEmailTemplateLanguageById(id: string): Observable<IPhishingEmailTemplateLanguage> {
        return this.dataService
            .getByReguest<ApiResult>(`/PhishingEmailTemplateLanguage/GetPhishingEmailTemplateLanguageById`, id)
            .pipe(map((response) => response.data as IPhishingEmailTemplateLanguage));
    }

    cloneTemplate(url: any): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(`/Helper/CloneVII`, url);
    }
}