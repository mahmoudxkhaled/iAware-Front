import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiResult } from 'src/app/core/Dtos/ApiResult';
import { DataService } from 'src/app/core/Services/data-service.service';
import { INotificationType, INotificationTypeLanguage } from '../models/notification-settings';
import { IPaginationModel } from 'src/app/core/Dtos/IPaginationModel';

@Injectable({
    providedIn: 'root',
})
export class NotificationSettingsService {
    constructor(private dataService: DataService) { }

    getAllNotificationTypes(): Observable<INotificationType[]> {
        return this.dataService
            .getAllReguest<ApiResult>('/NotificationType/GetAllNotificationTypes')
            .pipe(map((response) => response.data as INotificationType[]));
    }

    getAllNotificationTypesPagination(paginationObject: IPaginationModel): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(`/NotificationType/GetAllNotificationTypesPagination/`, paginationObject);
    }


    getNotificationTypeLangaugesByNotificationTypeId(id: string): Observable<INotificationTypeLanguage[]> {
        return this.dataService
            .getByReguest<ApiResult>(`/NotificationTypeLanguage/GetNotificationTypeLangaugesByNotificationTypeId`, id)
            .pipe(map((response) => response.data as INotificationTypeLanguage[]));
    }

    getNotificationTypeById(id: string): Observable<INotificationType[]> {
        return this.dataService
            .getByReguest<ApiResult>(`/NotificationType/GetNotificationTypeById`, id)
            .pipe(map((result) => result.data as INotificationType[]));
    }

    addNotificationType(request: FormData): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>('/NotificationType/AddNotificationType', request);
    }

    editNotificationType(request: FormData): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>('/NotificationType/EditNotificationType', request);
    }

    deleteNotificationTypeById(id: any): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(`/NotificationType/DeleteNotificationTypeById/${id}`, null);
    }

    deActiveNotificationTypeById(id: any): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(`/NotificationType/DeActiveNotificationTypeById/${id}`, null);
    }

    activeNotificationTypeById(id: any): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(`/NotificationType/ActiveNotificationTypeById/${id}`, null);
    }

    markAllNotifcationAsRead(id: any): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(
            `/NotificationTypeTransaction/MarkAllNotifcationAsRead/${id}`,
            null
        );
    }

    //#region Phishing category language

    getNotificationTypeLanguageById(id: string): Observable<INotificationTypeLanguage> {
        return this.dataService
            .getByReguest<ApiResult>(`/NotificationTypeLanguage/GetNotificationTypeLanguageById`, id)
            .pipe(map((response) => response.data as INotificationTypeLanguage));
    }

    addNotificationTypeLanguage(request: FormData): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(
            '/NotificationTypeLanguage/AddNotificationTypeLanguage',
            request
        );
    }

    editNotificationTypeLanguage(request: FormData): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(
            '/NotificationTypeLanguage/EditNotificationTypeLanguage',
            request
        );
    }

    deleteNotificationTypeLangaugeById(id: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(
            `/NotificationTypeLanguage/DeleteNotificationTypeLanguageById/${id}`,
            null
        );
    }

    deActiveNotificationTypeLanguage(id: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(
            `/NotificationTypeLanguage/DeActiveNotificationTypeLanguage/${id}`,
            null
        );
    }

    activeNotificationTypeLanguageById(id: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(
            `/NotificationTypeLanguage/ActiveNotificationTypeLanguageById/${id}`,
            null
        );
    }

    getUserNotifications(id: any): Observable<ApiResult> {
        return this.dataService.getByReguest<ApiResult>(`/NotificationTypeTransaction/GetUserNotifications`, id);
    }

    //#endregion

    getAllPhishingCategoriesWithTemplates(): Observable<ApiResult> {
        return this.dataService.getAllReguest<ApiResult>(
            '/NotificationType/GetAllTrainingLessonCategoriesWithLessonsTreeNode'
        );
    }

    readNotification(id: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(`/NotificationTypeTransaction/ReadNotifcation/${id}`, null);
    }
}
