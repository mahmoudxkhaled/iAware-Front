import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResult } from 'src/app/core/Dtos/ApiResult';
import { DataService } from 'src/app/core/Services/data-service.service';

@Injectable({
    providedIn: 'root',
})
export class MultimediaService {
    constructor(private dataService: DataService) { }

    getAllTrainingCategoriesForSubscription(): Observable<ApiResult> {
        return this.dataService.getAllReguest<ApiResult>('/TrainingLesson/GetAllTrainingCategoriesForSubscription');
    }

    getAllTrainingLessonCategories(): Observable<ApiResult> {
        return this.dataService.getAllReguest<ApiResult>('/TrainingLessonCategory/GetAllTrainingLessonCategories');
    }


    getAllTrainingLessonCategoriesForMultiMedia(): Observable<ApiResult> {
        return this.dataService.getAllReguest<ApiResult>('/TrainingLessonCategory/GetAllTrainingLessonCategoriesForMultiMedia');
    }



    getTrainingLessonBooksByCategoryIdForSubscription(id: string): Observable<ApiResult> {
        return this.dataService.getByReguest<ApiResult>(
            `/TrainingLesson/   `,
            id
        );
    }

    getTrainingLessonVideosByCategoryIdForSubscription(id: string): Observable<ApiResult> {
        return this.dataService.getByReguest<ApiResult>(
            `/TrainingLesson/GetTrainingLessonVideosByCategoryIdForSubscription`,
            id
        );
    }

    trackUserVideoProgress(data: any): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(`/TrainingLesson/TrackUserVideoProgress`, data);
    }
}
