import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiResult } from 'src/app/core/Dtos/ApiResult';
import { DataService } from 'src/app/core/Services/data-service.service';
import { UserQuizAnswerDto } from '../components/campaign-details/steps/campaign-quiz/campaign-quiz.component';
import { ITrainingLessonQuiz } from '../../security-training/models/ISecurityTrainingModel';
import { IPaginationModel } from 'src/app/core/Dtos/IPaginationModel';

@Injectable({
    providedIn: 'root',
})
export class CampaignService {
    constructor(private dataService: DataService) {}

    getUserCurrentTrainingCampaigns(pagination: IPaginationModel): Observable<ApiResult> {
        return this.dataService.postReguest('/AwarenessCampaign/GetUserCurrentTrainingCampaigns', pagination);
    }

    getUserHistoryTrainingCampaigns(pagination: IPaginationModel): Observable<ApiResult> {
        return this.dataService.postReguest('/AwarenessCampaign/GetUserHistoryTrainingCampaigns', pagination);
    }

    getUserCampaigns(): Observable<ApiResult> {
        return this.dataService.getAllReguest('/AwarenessCampaign/GetUserCampaigns');
    }

    getAllTreainingAwarenessCampaignScheduleForAdminDashboard(): Observable<ApiResult> {
        return this.dataService.getAllReguest(
            '/AwarenessCampaign/GetAllTreainingAwarenessCampaignScheduleForAdminDashboard'
        );
    }

    getAllTreainingAwarenessCampaignScheduleHistoryForAdminDashboard(): Observable<ApiResult> {
        return this.dataService.getAllReguest(
            '/AwarenessCampaign/GetAllTreainingAwarenessCampaignScheduleHistoryForAdminDashboard'
        );
    }

    getAllPhishingAwarenessCampaignScheduleForUser(): Observable<ApiResult> {
        return this.dataService.getAllReguest('/AwarenessCampaign/GetAllPhishingAwarenessCampaignScheduleForUser');
    }

    getActivitiesByTemplateId(templateId: string): Observable<ApiResult> {
        return this.dataService.getByReguest('/AwarenessCampaignSimulationPhishing/activities', templateId);
    }

    getAllPhishingAwarenessCampaignScheduleHistoryForUser(): Observable<ApiResult> {
        return this.dataService.getAllReguest(
            '/AwarenessCampaign/GetAllPhishingAwarenessCampaignScheduleHistoryForUser'
        );
    }

    getAllUsersOnPhishingScedual(id: any): Observable<ApiResult> {
        return this.dataService.getByReguest(
            '/AwarenessCampaign/GetAllPhishingAwarenessCampaignScheduleUsersUsingScedualId',
            id
        );
    }

    getCurrentLessonForCurrentCampaign(lessonId: string, lessonLanguageId: string): Observable<ApiResult> {
        return this.dataService.getAllReguest(
            `/TrainingLesson/GetLessonLanguagesByIdAndTrainingLessonId/${lessonId}/${lessonLanguageId}`
        );
    }

    getAwarenessCampaignSimulationPhishingWithAwarenessCampaignSimulationPhishingSchedules(
        ids: any
    ): Observable<ApiResult> {
        return this.dataService.postReguest(
            '/AwarenessCampaign/GetAwarenessCampaignSimulationPhishingSchedulesForAwarenessCampaignSimulationPhishingId',
            ids
        );
    }

    updateScedualUserUpdateVideoViewingTime(scedualUserId: string): Observable<ApiResult> {
        return this.dataService.postReguest(
            `/AwarenessCampaign/UpdateScedualUserUpdateVideoViewingTime/${scedualUserId}`,
            null
        );
    }

    updateScedualUserUpdateBookViewingTime(scedualUserId: string): Observable<ApiResult> {
        return this.dataService.postReguest(
            `/AwarenessCampaign/UpdateScedualUserUpdateBookViewingTime/${scedualUserId}`,
            null
        );
    }

    updateScedualUserUpdateQuizViewingTime(scedualUserId: string): Observable<ApiResult> {
        return this.dataService.postReguest(
            `/AwarenessCampaign/UpdateScedualUserUpdateQuizViewingTime/${scedualUserId}`,
            null
        );
    }

    updateScedualUserUpdateLessonViewingTime(scedualUserId: string): Observable<ApiResult> {
        return this.dataService.postReguest(
            `/AwarenessCampaign/UpdateScedualUserUpdateLessonViewingTime/${scedualUserId}`,
            null
        );
    }

    fetchAwarenessCampaignSimulationPhishingsForThisCampaign(id: string): Observable<ApiResult> {
        return this.dataService.getByReguest(
            '/AwarenessCampaign/GetAwarenessCampaignSimulationPhishingsForThisCampaign',
            id
        );
    }

    saveUserQuizAnswers(userQuizAnswerDto: UserQuizAnswerDto): Observable<any> {
        const formData: FormData = new FormData();
        formData.append('scedualUserId', userQuizAnswerDto.scedualUserId);
        formData.append('trainingLessonId', userQuizAnswerDto.trainingLessonId);
        formData.append('isUserPassed', userQuizAnswerDto.isUserPassed);
        formData.append('score', userQuizAnswerDto.score);
        userQuizAnswerDto.trainingLessonQuizAnswerIds.forEach((id, index) => {
            formData.append(`trainingLessonQuizAnswerIds[${index}]`, id);
        });

        return this.dataService.postReguest(`/AwarenessCampaign/SaveQuizAnswers`, userQuizAnswerDto);
    }

    getQuizzesWithAnswersByLessonLanguageId(lessonId: string): Observable<ITrainingLessonQuiz[]> {
        return this.dataService
            .getByReguest<ApiResult>(`/TrainingLessonLanguage/GetQuizzesWithAnswersByLessonLanguageId`, lessonId)
            .pipe(map((response) => response.data as ITrainingLessonQuiz[]));
    }

    getGetAwarenessTrainingCampaignStatistics(id: any): Observable<ApiResult> {
        return this.dataService.getByReguest('/AwarenessCampaign/TrainingCampaign', id);
    }

    getGetAwarenessPhishingCampaignStatistics(id: any): Observable<ApiResult> {
        return this.dataService.getByReguest('/AwarenessCampaign/PhishingCampaign', id);
    }

    getTrainingCampaignScedualDetails(id: any): Observable<ApiResult> {
        return this.dataService.getByReguest('/AwarenessCampaign/TrainingCampaignScedualDetails', id);
    }

    checkUserEligibilityForCertificateAsync(userId: string, awarenessCampaignId: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(
            `/AwarenessCampaign/CheckUserEligibilityForCertificateAsync/${userId}/${awarenessCampaignId}`,
            null
        );
    }

    getCompanyLogo(): Observable<ApiResult> {
        return this.dataService.getAllReguest<ApiResult>('/Tenant/GetTenantLogo');
    }

    getPointingValues(): Observable<ApiResult> {
        return this.dataService.getAllReguest<ApiResult>('/PointingType/PointingValues');
    }

    // Dashboard

    getCurrentCampaignsDashboard(campaignId: string | null): Observable<ApiResult> {
        return this.dataService.getByReguest('/Dashboard/GetCurrentAwarenessCampaignsForDashboard', campaignId);
    }

    getUsersByActionCurrentCampaignsDashboard(campaignId: string | null, action: string): Observable<ApiResult> {
        return this.dataService.getByReguest(
            `/Dashboard/GetUsersByActionCurrentAwarenessCampaignsForDashboard/${campaignId}`,
            action
        );
    }

    getCompletedCampaignsDashboard(campaignId: string | null): Observable<ApiResult> {
        return this.dataService.getByReguest('/Dashboard/GetCompletedAwarenessCampaignsForDashboard', campaignId);
    }

    getUsersByActionCompletedCampaignsDashboard(campaignId: string | null, action: string): Observable<ApiResult> {
        return this.dataService.getByReguest(
            `/Dashboard/GetUsersByActionCompletedAwarenessCampaignsForDashboard/${campaignId}`,
            action
        );
    }

    getTrainingTrandAnalysis(monthsNumber: number): Observable<ApiResult> {
        return this.dataService.getByReguest('/Dashboard/GetTenantTrainingTrendAnalysis', monthsNumber);
    }

    getTrainingLeaderboard(campaignId: string): Observable<ApiResult> {
        return this.dataService.getByReguest('/Dashboard/LeaderboardStatisticsForTrainingCampaignss', campaignId);
    }

    getGetUsersCompletedAllLessonsInThisCampaign(campaignId: string): Observable<ApiResult> {
        return this.dataService.getByReguest(
            '/AwarenessCampaign/GetUsersCompletedAllLessonsInThisCampaign',
            campaignId
        );
    }

    getGetUsersNotCompletedAllLessonsInThisCampaign(campaignId: string): Observable<ApiResult> {
        return this.dataService.getByReguest(
            '/AwarenessCampaign/GetUsersNotCompletedAllLessonsInThisCampaign',
            campaignId
        );
    }
}
