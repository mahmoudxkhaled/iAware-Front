import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResult } from 'src/app/core/Dtos/ApiResult';
import { DataService } from 'src/app/core/Services/data-service.service';
import { IAddAwarenessCampaignRequest } from '../models/IAddAwarenessCampaignRequest';
import { IPaginationModel } from 'src/app/core/Dtos/IPaginationModel';

@Injectable({
    providedIn: 'root',
})
export class CampaignManagementService {
    constructor(private dataService: DataService) { }

    getAllCampaign(pagination: IPaginationModel): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>('/AwarenessCampaign/GetAllCampaign', pagination);
    }

    getAllPhishingDomainWithEmails(): Observable<ApiResult> {
        return this.dataService.getAllReguest<ApiResult>('/PhishingDomain/GetAllPhishingDomainWithEmails');
    }

    getCampaignById(id: string): Observable<ApiResult> {
        return this.dataService.getByReguest<ApiResult>('/AwarenessCampaign', id);
    }

    getAllUsersTenant(): Observable<ApiResult> {
        return this.dataService.getAllReguest<ApiResult>('/AppUser/GetAllUsersByTenantId');
    }

    getAllTenantUnitsWithUsers(): Observable<ApiResult> {
        return this.dataService.getAllReguest<ApiResult>('/TenantUnit/GetTenantUnitsWithUsers');
    }

    getLessonsByIds(ids: any): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>('/TrainingLessonLanguage/GetLessonsByIds', ids);
    }

    getTrainingLessonLangaugesByParentId(id: string): Observable<ApiResult> {
        return this.dataService.getByReguest<ApiResult>(
            '/TrainingLessonLanguage/GetTrainingLessonLangaugesByParentId',
            id
        );
    }

    getPhishingCategoryWithTemplates(): Observable<ApiResult> {
        return this.dataService.getAllReguest<ApiResult>('/PhishingCategory/GetAllPhishingCategoriesWithTemplates');
    }

    getTenantPhishingAllTemplatesForCampaign(pagination: IPaginationModel): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(
            '/PhishingEmailTemplate/GetTenantPhishingEmailTemplatesForCampaign',
            pagination
        );
    }

    getDefaultPhishingAllTemplatesForCampaign(pagination: IPaginationModel): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(
            '/PhishingEmailTemplate/GetDefaultPhishingEmailTemplatesForCampaign',
            pagination
        );
    }

    getAllTrainigLessonCategorisWithLessons(): Observable<ApiResult> {
        return this.dataService.getAllReguest<ApiResult>(
            '/TrainingLessonCategory/GetAllTrainingLessonCategoriesWithLessonsForSubscriptionAsync'
        );
    }

    getTrainingLessonsInSubscriptionForCampaign(pagination: IPaginationModel): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>('/TrainingLesson/GetTrainingLessonsInSubscriptionForCampaign', pagination);
    }

    getAllTenantGroupsWithUsers(): Observable<ApiResult> {
        return this.dataService.getAllReguest<ApiResult>('/TenantGroup/GetAllTenantGroupWithUsers');
    }

    getEmailByTrainingLessonId(id: string): Observable<ApiResult> {
        return this.dataService.getByReguest<ApiResult>(`/TrainingLesson/GetEmailByTrainingLessonId`, id);
    }

    addCampaign(data: IAddAwarenessCampaignRequest): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>('/AwarenessCampaign/AddCampaign', data);
    }

    updateCampaign(data: any) {
        return this.dataService.postReguest<ApiResult>(`/AwarenessCampaign/edit`, data);
    }

    activeCampaign(id: string) {
        return this.dataService.postReguest<ApiResult>(`/AwarenessCampaign/activate/${id}`, null);
    }

    deActiveCampaign(id: string) {
        return this.dataService.postReguest<ApiResult>(`/AwarenessCampaign/deactivate/${id}`, null);
    }

    deleteCampaign(id: string) {
        return this.dataService.postReguest<ApiResult>(`/AwarenessCampaign/delete/${id}`, null);
    }

    editLessonLanguageEmail(request: any): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>('/TrainingLesson/EditLessonEmail', request);
    }
}
