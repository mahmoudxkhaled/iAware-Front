import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, finalize, map } from 'rxjs';
import { ApiResult } from 'src/app/core/Dtos/ApiResult';
import { DataService } from 'src/app/core/Services/data-service.service';
import { ILanguageModel } from '../../language/models/ILanguageModel';
import {
    ITrainingLesson,
    ITrainingLessonQuiz,
    ITrainingLessonQuote,
    ITrainingLessonScreenSaver,
    ITrainingLessonWallpaper,
    ITrainingLessonsLanguage,
} from '../models/ISecurityTrainingModel';
import { IPaginationModel } from 'src/app/core/Dtos/IPaginationModel';

@Injectable({
    providedIn: 'root',
})
export class TrainingLessonService {
    isLoadingSubject = new BehaviorSubject<boolean>(false);

    constructor(private dataService: DataService) {
        this.isLoadingSubject = new BehaviorSubject<boolean>(false);
    }

    //#region Training Lessons

    getAllTrainingLessons(pagination : IPaginationModel): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>('/TrainingLesson/GetAllTrainingLessons', pagination);
    }

    getTrainingLessonById(id: string): Observable<ITrainingLesson> {
        return this.dataService
            .getByReguest<ApiResult>(`/TrainingLesson/GetTrainingLessonById`, id)
            .pipe(map((response) => response.data as ITrainingLesson));
    }

    getAllWallpaperForLessonByLessonId(id: string): Observable<ApiResult> {
        return this.dataService.getByReguest<ApiResult>(`/TrainingLesson/GetAllWallpaperForLessonByLessonId`, id);
    }

    getTrainingLessonWithLessonsLanguagesById(id: string): Observable<ITrainingLesson> {
        return this.dataService
            .getByReguest<ApiResult>(`/TrainingLesson/GetTrainingLessonWithLessonsLanguagesById`, id)
            .pipe(map((response) => response.data as ITrainingLesson));
    }

    getLessonsLanguagesByTrainingLessonId(id: string): Observable<ITrainingLessonsLanguage[]> {
        return this.dataService
            .getByReguest<ApiResult>(`/TrainingLesson/GetLessonsLanguagesByTrainingLessonId`, id)
            .pipe(map((result) => result.data as ITrainingLessonsLanguage[]));
    }

    addTrainingLesson(request: FormData): Observable<ApiResult> {
        this.isLoadingSubject.next(true);
        return this.dataService
            .postReguest<ApiResult>('/TrainingLesson/AddTrainingLesson', request)
            .pipe(finalize(() => this.isLoadingSubject.next(false)));
    }

    addWallpaperToTrainingLesson(request: any): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>('/TrainingLesson/AddWallpaperToTrainingLesson', request);
    }

    editTrainingLesson(request: FormData): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>('/TrainingLesson/EditTrainingLesson', request);
    }
    //#endregion

    //#region Category

    getAllTrainigLessonCategorisWithLessons(): Observable<ApiResult> {
        return this.dataService.getAllReguest<ApiResult>(
            '/TrainingLessonCategory/GetAllTrainingLessonCategoriesWithLessons'
        );
    }

    editTrainingLessonCategory(request: FormData): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>('/TrainingLessonCategory/EditTrainingLessonCategory', request);
    }

    addTrainingLessonCategory(request: FormData): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>('/TrainingLessonCategory/AddTrainingLessonCategory', request);
    }

    deleteTrainingLessonCategoryById(id: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(
            `/TrainingLessonCategory/DeleteTrainingLessonCategory/${id}`,
            null
        );
    }

    deActivateTrainingLessonCategoryById(id: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(
            `/TrainingLessonCategory/DeActiveTrainingLessonCategory/${id}`,
            null
        );
    }

    activateTrainingLessonCategoryById(id: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(
            `/TrainingLessonCategory/ActiveTrainingLessonCategory/${id}`,
            null
        );
    }

    getAllCategories(pagination : IPaginationModel): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>('/TrainingLessonCategory/GetAllTrainingLessonCategories', pagination);
    }

    getTrainingLessonCategoryById(catId: string): Observable<ApiResult> {
        return this.dataService.getByReguest<ApiResult>(`/TrainingLessonCategory/GetTrainingLessonCategoryById`, catId);
    }

    getTrainingCategoryByIdWithLessons(catId: string): Observable<ApiResult> {
        return this.dataService.getByReguest<ApiResult>(`/TrainingLessonCategory/GetTrainingCategoryByIdWithLessons`, catId);
    }

    getTrainingCategoryLessons(): Observable<ApiResult> {
        return this.dataService.getAllReguest<ApiResult>(`/TrainingLesson/GetTrainingCategoryLessons`);
    }

    getTrainingLessonsWithPagination(paginationObject: IPaginationModel, categoryId?: any): Observable<ApiResult> {
        const categoryIdParam = categoryId === null ? 'null' : categoryId;
        return this.dataService.postReguest<ApiResult>(`/TrainingLesson/GetTrainingLessonsWithPagination/${categoryIdParam}`, paginationObject);
    }

    //#endregion

    //#region category langs

    getTrainingCategoryLanguagesByTrainingLessonCategoryId(id: string): Observable<ApiResult> {
        return this.dataService.getByReguest<ApiResult>(
            `/TrainingLessonCategoryLanguage/GetTrainingCategoryLanguagesByTrainingLessonCategoryId`,
            id
        );
    }
    getTrainingLessonCategoryLanguageById(id: string): Observable<ApiResult> {
        return this.dataService.getByReguest<ApiResult>(
            `/TrainingLessonCategoryLanguage/GetTrainingLessonCategoryLanguageById`,
            id
        );
    }

    editTrainingLessonCategoryLanguage(request: FormData): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(
            '/TrainingLessonCategoryLanguage/EditTrainingLessonCategoryLanguage',
            request
        );
    }

    addTrainingLessonCategoryLanguage(request: FormData): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(
            '/TrainingLessonCategoryLanguage/AddTrainingLessonCategoryLanguage',
            request
        );
    }

    deleteTrainingLessonCategoryLanguageById(id: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(
            `/TrainingLessonCategoryLanguage/DeleteTrainingLessonCategoryLanguageById/${id}`,
            null
        );
    }

    deActivateTrainingLessonCategoryLanguageById(id: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(
            `/TrainingLessonCategoryLanguage/DeActivateTrainingLessonCategoryLanguageById/${id}`,
            null
        );
    }

    activateTrainingLessonCategoryLanguageById(id: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(
            `/TrainingLessonCategoryLanguage/ActivateTrainingLessonCategoryLanguageById/${id}`,
            null
        );
    }

    //#endregion

    deleteTrainingLessonById(id: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(`/TrainingLesson/DeleteTrainingLessonById/${id}`, null);
    }

    deActivateTrainingLessonById(id: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(`/TrainingLesson/DeActivateTrainingLessonById/${id}`, null);
    }

    activateTrainingLessonById(id: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(`/TrainingLesson/ActivateTrainingLessonById/${id}`, null);
    }
    //#endregion

    getTrainingLessonLangaugeById(lessonId: string): Observable<ITrainingLessonsLanguage> {
        return this.dataService
            .getByReguest<ApiResult>(`/TrainingLessonLanguage/GetTrainingLessonLangaugeById`, lessonId)
            .pipe(map((response) => response.data as ITrainingLessonsLanguage));
    }

    addTrainingLessonLanguage(data: FormData): Observable<ApiResult> {
        this.isLoadingSubject.next(true);

        return this.dataService
            .postReguest<ApiResult>('/TrainingLessonLanguage/AddTrainingLessonLanguage', data)
            .pipe(finalize(() => this.isLoadingSubject.next(false)));
    }

    editTrainingLessonLangauge(request: FormData): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>('/TrainingLessonLanguage/EditTrainingLessonLangauge', request);
    }

    deleteTrainingLessonLangaugeById(lessonId: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(
            `/TrainingLessonLanguage/DeleteTrainingLessonLangaugeById/${lessonId}`,
            null
        );
    }

    activateTrainingLessonLanguageById(lessonId: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(
            `/TrainingLessonLanguage/ActivateTrainingLessonLanguageById/${lessonId}`,
            null
        );
    }

    dectivateTrainingLessonLanguageById(lessonId: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(
            `/TrainingLessonLanguage/DeActiveTrainingLessonLangaugeById/${lessonId}`,
            null
        );
    }

    getLessonLanguageWallpapersByLangIdAndLessonIdAsync(
        languageId: string,
        trainingLessonId: string
    ): Observable<ApiResult> {
        return this.dataService.getAllReguest<ApiResult>(
            `/TrainingLessonLanguage/GetLessonLanguageWallpapersByLangIdAndLessonId/${languageId}/${trainingLessonId}`
        );
    }
    //#endregion

    //#region ScreenSavers
    getScreenSaversByLessonLanguageId(lessonId: string): Observable<ITrainingLessonScreenSaver[]> {
        return this.dataService
            .getByReguest<ApiResult>(`/TrainingLessonLanguage/GetScreenSaversByLessonLanguageId`, lessonId)
            .pipe(map((result) => result.data as ITrainingLessonScreenSaver[]));
    }

    addScreenSaversByLessonLanguageId(lessonId: string, data: FormData): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(
            `/TrainingLessonLanguage/AddScreenSaversByLessonLanguageId/${lessonId}`,
            data
        );
    }

    deleteScreenSaverById(screenSaverId: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(
            `/TrainingLessonLanguage/DeleteScreenSaverById/${screenSaverId}`,
            null
        );
    }

    editScreenSaver(data: FormData): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(`/TrainingLessonLanguage/editScreenSaver`, data);
    }

    addSingleScreenSaver(data: FormData): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(`/TrainingLessonLanguage/AddSingleScreenSaver`, data);
    }

    //#endregion

    //#region Wallpapers

    getLibraryWallpaperCountByTrainingLessonId(lessonId: string): Observable<ApiResult> {
        return this.dataService.getByReguest<ApiResult>(
            `/TrainingLessonLanguage/GetLibraryWallpaperCountByTrainingLessonId`,
            lessonId
        );
    }

    getWallpapersByLessonLanguageId(lessonId: string): Observable<ITrainingLessonWallpaper[]> {
        return this.dataService
            .getByReguest<ApiResult>(`/TrainingLessonLanguage/GetWallpapersByLessonLanguageId`, lessonId)
            .pipe(map((response) => response.data as ITrainingLessonWallpaper[]));
    }

    addWallpapersByLessonLanguageId(lessonId: string, data: FormData): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(
            `/TrainingLessonLanguage/AddWallpapersByLessonLanguageId/${lessonId}`,
            data
        );
    }

    deleteWallpaperById(wallpaperId: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(
            `/TrainingLessonLanguage/DeleteWallpaperById/${wallpaperId}`,
            null
        );
    }

    editWallpaper(data: FormData): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(`/TrainingLessonLanguage/editWallpaper`, data);
    }

    addSingleWallpaper(data: FormData): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(`/TrainingLessonLanguage/AddSingleWallpaper`, data);
    }

    //#endregion

    //#region Images

    addLessonLanguageImages(id: string, formData: FormData, type: string): Observable<any> {
        const endpoint =
            type === 'screensavers'
                ? `/TrainingLessonLanguage/AddScreenSaversByLessonLanguageId/${id}`
                : `/TrainingLessonLanguage/AddWallpapersByLessonLanguageId/${id}`;
        return this.dataService.postReguest<ApiResult>(endpoint, formData);
    }
    //#endregion
    //#region Quotes
    getQuotesByLessonLanguageId(lessonId: string): Observable<ITrainingLessonQuote[]> {
        return this.dataService
            .getByReguest<ApiResult>(`/TrainingLessonLanguage/GetQuotesByLessonLanguageId`, lessonId)
            .pipe(map((response) => response.data as ITrainingLessonQuote[]));
    }

    addLessonLanguageQuotes(request: any): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>('/TrainingLessonLanguage/AddLessonLanguageQuotes', request);
    }

    editLessonLanguageQuote(request: ITrainingLessonQuote): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>('/TrainingLessonLanguage/EditLessonLanguageQuote', request);
    }

    deleteQuoteById(quoteId: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(`/TrainingLessonLanguage/DeleteQuoteById/${quoteId}`, null);
    }

    activateQuoteById(quoteId: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(`/TrainingLessonLanguage/ActivateQuoteById/${quoteId}`, null);
    }

    deActivateQuoteById(quoteId: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(`/TrainingLessonLanguage/DeActivateQuoteById/${quoteId}`, null);
    }
    //#endregion

    //#region Quiz
    getQuizzesWithAnswersByLessonLanguageId(lessonId: string): Observable<ITrainingLessonQuiz[]> {
        return this.dataService
            .getByReguest<ApiResult>(`/TrainingLessonLanguage/GetQuizzesWithAnswersByLessonLanguageId`, lessonId)
            .pipe(map((response) => response.data as ITrainingLessonQuiz[]));
    }

    addLessonLanguageQuizWithAnswers(request: any): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(
            '/TrainingLessonLanguage/AddLessonLanguageQuizWithAnswers',
            request
        );
    }

    editLessonLanguageQuizWithAnswers(request: any): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(
            '/TrainingLessonLanguage/EditLessonLanguageQuizWithAnswers',
            request
        );
    }

    deleteQuizWithAnswersByQuizId(quizId: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(
            `/TrainingLessonLanguage/DeleteQuizWithAnswersByQuizId/${quizId}`,
            null
        );
    }

    activateQuizById(quizId: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(`/TrainingLessonLanguage/ActivateQuizById/${quizId}`, null);
    }

    deActivateQuizById(quizId: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(`/TrainingLessonLanguage/DeActivateQuizById/${quizId}`, null);
    }
    //#endregion

    //#region Book
    editLessonLanguageBookById(lessonId: string, data: FormData): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(
            `/TrainingLessonLanguage/EditLessonLanguageBookById/${lessonId}`,
            data
        );
    }

    editLessonLanguageImageBookById(lessonId: string, data: FormData): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(
            `/TrainingLessonLanguage/AddLessonLanguageBookImageById/${lessonId}`,
            data
        );
    }

    deleteLessonLanguageBookById(lessonId: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(
            `/TrainingLessonLanguage/DeleteLessonLanguageBookById/${lessonId}`,
            null
        );
    }
    //#endregion

    //#region Video
    editLessonLanguageVideoById(lessonId: string, data: FormData): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(
            `/TrainingLessonLanguage/EditLessonLanguageVideoById/${lessonId}`,
            data
        );
    }

    editLessonLanguageVideoUrlById(lessonId: string, data: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(
            `/TrainingLessonLanguage/EditLessonLanguageVideoURLById/${lessonId}/${data}`,
            null
        );
    }

    editLessonLanguageImageVideoById(lessonId: string, data: FormData): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(
            `/TrainingLessonLanguage/AddLessonLanguageVideoImageById/${lessonId}`,
            data
        );
    }

    deleteLessonLanguageVideoById(lessonId: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(
            `/TrainingLessonLanguage/DeleteLessonLanguageVideoById/${lessonId}`,
            null
        );
    }
    //#endregion

    getCountOfActiveLanguage(): Observable<number> {
        return this.dataService.getAllReguest<ApiResult>('/Language/GetActiveLanguageCount').pipe(
            map((res) => {
                return res.data;
            })
        );
    }

    GetDefaultLanguage(): Observable<ILanguageModel> {
        return this.dataService
            .getAllReguest<ApiResult>('/Language/GetDefaultLanguage')

            .pipe(
                map((res) => {
                    return res.data as ILanguageModel;
                })
            );
    }

    getTenantDefaultLanguage(): Observable<ILanguageModel> {
        return this.dataService
            .getAllReguest<ApiResult>('/Language/GetDefaultTenantLanguage')

            .pipe(
                map((res) => {
                    return res.data as ILanguageModel;
                })
            );
    }

    GetAllLanguages(): Observable<ILanguageModel[]> {
        return this.dataService.getAllReguest<ApiResult>('/Language/GetAllLanguages').pipe(
            map((res) => {
                return res.data as ILanguageModel[];
            })
        );
    }

    getAllLanguagesForUser(): Observable<ApiResult> {
        return this.dataService.getAllReguest<ApiResult>('/Language/GetAllLanguages');
    }

    //#region Email

    getEmailByLessonLanguageId(lessonId: string): Observable<any> {
        return this.dataService
            .getByReguest<ApiResult>(`/TrainingLessonLanguage/GetEmailByLessonLanguageId`, lessonId)
            .pipe(map((response) => response.data));
    }

    editLessonLanguageEmail(request: any): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>('/TrainingLessonLanguage/EditLessonLanguageEmail', request);
    }

    //#endregion

    private activeLanguagesAdd: ILanguageModel[] = [];

    setActiveLanguagesAdd(activeLanguagesAdd: ILanguageModel[]): void {
        this.activeLanguagesAdd = activeLanguagesAdd;
    }

    getActiveLanguagesAdd(): ILanguageModel[] {
        return this.activeLanguagesAdd;
    }
}