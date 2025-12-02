import { Injectable } from '@angular/core';
import { ApiResult } from 'src/app/core/Dtos/ApiResult';
import { DataService } from 'src/app/core/Services/data-service.service';
import {
    ILibraryBackground,
    ILibraryLanguageCharacter,
    ILibraryLanguageQuote,
    ILibraryWallpaper,
    ILibraryWallpaperLanguage,
} from '../models/wallpaper-libraries';
import { BehaviorSubject, finalize, map, Observable } from 'rxjs';
import { ILanguageModel } from '../../language/models/ILanguageModel';
import { IPaginationModel } from 'src/app/core/Dtos/IPaginationModel';

@Injectable({
    providedIn: 'root',
})
export class WallpaperLibrariesService {
    isLoadingSubject = new BehaviorSubject<boolean>(false);
    constructor(private dataService: DataService) {
        this.isLoadingSubject = new BehaviorSubject<boolean>(false);
    }

    //#region  Library Wallpaper Language

    addSingleLibraryWallpaperLanguage(data: FormData): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(
            `/LibraryWallpaperLanguage/AddSingleLibraryWallpaperLanguage`,
            data
        );
    }
    editSingleLibraryWallpaperLanguage(data: FormData): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(
            `/LibraryWallpaperLanguage/EditSingleLibraryWallpaperLanguage`,
            data
        );
    }

    getLibraryWallpaperLanguageById(id: string): Observable<ILibraryWallpaperLanguage> {
        return this.dataService
            .getByReguest<ApiResult>(`/LibraryWallpaperLanguage/GetLibraryWallpaperLanguageById`, id)
            .pipe(map((response) => response.data as ILibraryWallpaperLanguage));
    }

    addLibraryWallpaperLanguage(request: any): Observable<ApiResult> {
        this.isLoadingSubject.next(true);

        return this.dataService
            .postReguest<ApiResult>(`/LibraryWallpaperLanguage/AddLibraryWallpaperLanguage`, request)
            .pipe(finalize(() => this.isLoadingSubject.next(false)));
    }

    editLibraryWallpaperLanguage(request: any): Observable<ApiResult> {
        this.isLoadingSubject.next(true);

        return this.dataService
            .postReguest<ApiResult>(`/LibraryWallpaperLanguage/EditLibraryWallpaperLanguage`, request)
            .pipe(finalize(() => this.isLoadingSubject.next(false)));
    }

    deleteLibraryWallpaperLanguageById(id: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(
            `/LibraryWallpaperLanguage/DeleteLibraryWallpaperLanguageById/${id}`,
            null
        );
    }

    activateLibraryWallpaperLanguageById(id: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(
            `/LibraryWallpaperLanguage/ActivateLibraryWallpaperLanguageById/${id}`,
            null
        );
    }

    deactivateLibraryWallpaperLanguageById(id: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(
            `/LibraryWallpaperLanguage/DeActivateLibraryWallpaperLanguageById/${id}`,
            null
        );
    }

    //#endregion

    //#region Library Wallpaper

    addSingleLibraryWallpaper(data: FormData): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(`/LibraryWallpaper/AddSingleLibraryWallpaper`, data);
    }

    getAllLibraryWallpapers(): Observable<ILibraryWallpaper[]> {
        return this.dataService
            .getAllReguest<ApiResult>(`/LibraryWallpaper/GetAllLibraryWallpapers`)
            .pipe(map((response) => response.data as ILibraryWallpaper[]));
    }

    getAllCompanyLibraryWallpapersWithPagination(paginationObject: IPaginationModel): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>('/LibraryWallpaper/GetAllCompanyLibraryWallpapersWithPagination', paginationObject);
    }

    getAllIAwareLibraryWallpapersWithPagination(paginationObject: IPaginationModel): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>('/LibraryWallpaper/GetAllIAwareLibraryWallpapersWithPagination', paginationObject);
    }



    getLibraryWallpaperById(id: string): Observable<ILibraryWallpaper> {
        return this.dataService
            .getByReguest<ApiResult>(`/LibraryWallpaper/GetLibraryWallpaperById`, id)
            .pipe(map((response) => response.data as ILibraryWallpaper));
    }

    getLibraryWallpaperByIdWithTages(id: string): Observable<ApiResult> {
        return this.dataService.getByReguest<ApiResult>(`/LibraryWallpaper/GetLibraryWallpaperByIdWithTages`, id);
    }

    getLibraryWallpaperLanguagesByLibraryWallpaperId(
        LibraryWallpaperId: string
    ): Observable<ILibraryWallpaperLanguage[]> {
        return this.dataService
            .getByReguest<ApiResult>(
                `/LibraryWallpaper/GetLibraryWallpaperLangaugesByLibraryWallpaperId`,
                LibraryWallpaperId
            )
            .pipe(map((response) => response.data as ILibraryWallpaperLanguage[]));
    }

    addLibraryWallpaper(request: any): Observable<ApiResult> {
        this.isLoadingSubject.next(true);

        return this.dataService
            .postReguest<ApiResult>(`/LibraryWallpaper/AddLibraryWallpaper`, request)
            .pipe(finalize(() => this.isLoadingSubject.next(false)));
    }

    editLibraryWallpaper(request: FormData): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(`/LibraryWallpaper/EditLibraryWallpaper`, request);
    }

    editLibraryWallpaperTages(id: string, request: string[]): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(`/LibraryWallpaper/EditLibraryWallpaperTages/${id}`, request);
    }

    deleteLibraryWallpaperById(id: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(`/LibraryWallpaper/DeleteLibraryWallpaperById/${id}`, null);
    }

    activateLibraryWallpaperById(id: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(`/LibraryWallpaper/ActivateLibraryWallpaperById/${id}`, null);
    }

    deactivateLibraryWallpaperById(id: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(`/LibraryWallpaper/DeActivateLibraryWallpaperById/${id}`, null);
    }

    //#endregion

    //#region Library Language Quote

    getAllLibraryLanguageQuotes(): Observable<ILibraryLanguageQuote[]> {
        return this.dataService
            .getAllReguest<ApiResult>(`/LibraryLanguageQuote/GetAllLibraryLanguageQuotes`)
            .pipe(map((response) => response.data as ILibraryLanguageQuote[]));
    }

    getAllLibraryLanguageQuotesGroupedByLanguageId(): Observable<ApiResult> {
        return this.dataService.getAllReguest<ApiResult>(
            `/LibraryLanguageQuote/GetAllLibraryLanguageQuotesGroupedByLanguageId`
        );
    }

    getLibraryLanguageQuoteById(id: string): Observable<ILibraryLanguageQuote> {
        return this.dataService
            .getByReguest<ApiResult>(`/LibraryLanguageQuote/GetLibraryLanguageQuoteById`, id)
            .pipe(map((response) => response.data as ILibraryLanguageQuote));
    }

    addLibraryLanguageQuote(request: any): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(`/LibraryLanguageQuote/AddLibraryLanguageQuote`, request);
    }

    editLibraryLanguageQuote(request: any): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(`/LibraryLanguageQuote/EditLibraryLanguageQuote`, request);
    }

    deleteLibraryLanguageQuoteById(id: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(
            `/LibraryLanguageQuote/DeleteLibraryLanguageQuoteById/${id}`,
            null
        );
    }

    activateLibraryLanguageQuoteById(id: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(
            `/LibraryLanguageQuote/ActivateLibraryLanguageQuoteById/${id}`,
            null
        );
    }

    deactivateLibraryLanguageQuoteById(id: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(
            `/LibraryLanguageQuote/DeActivateLibraryLanguageQuoteById/${id}`,
            null
        );
    }

    getLibraryLanguageQuoteByLanguageId(id: string): Observable<ILibraryLanguageQuote[]> {
        return this.dataService
            .getByReguest<ApiResult>(`/LibraryLanguageQuote/GetLibraryLanguageQuotesByLanguageId`, id)
            .pipe(map((response) => response.data as ILibraryLanguageQuote[]));
    }

    //#endregion

    //#region  Library Language Character

    getAllLibraryLanguageCharacters(): Observable<ILibraryLanguageCharacter[]> {
        return this.dataService
            .getAllReguest<ApiResult>(`/LibraryLanguageCharacter/GetAllLibraryLanguageCharacters`)
            .pipe(map((response) => response.data as ILibraryLanguageCharacter[]));
    }

    getAllLibraryLanguageCharactersGroupedByLanguageId(): Observable<ApiResult> {
        return this.dataService.getAllReguest<ApiResult>(
            `/LibraryLanguageCharacter/GetAllLibraryLanguageCharactersGroupedByLanguageId`
        );
    }

    getLibraryLanguageCharacterById(id: string): Observable<ILibraryLanguageCharacter> {
        return this.dataService
            .getByReguest<ApiResult>(`/LibraryLanguageCharacter/GetLibraryLanguageCharacterById`, id)
            .pipe(map((response) => response.data as ILibraryLanguageCharacter));
    }

    addLibraryLanguageCharacter(request: FormData): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(
            `/LibraryLanguageCharacter/AddLibraryLanguageCharacter`,
            request
        );
    }

    editLibraryLanguageCharacter(request: FormData): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(
            `/LibraryLanguageCharacter/EditLibraryLanguageCharacter`,
            request
        );
    }

    deleteLibraryLanguageCharacterById(id: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(
            `/LibraryLanguageCharacter/DeleteLibraryLanguageCharacterById/${id}`,
            null
        );
    }

    activateLibraryLanguageCharacterById(id: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(
            `/LibraryLanguageCharacter/ActivateLibraryLanguageCharacterById/${id}`,
            null
        );
    }

    deactivateLibraryLanguageCharacterById(id: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(
            `/LibraryLanguageCharacter/DeActivateLibraryLanguageCharacterById/${id}`,
            null
        );
    }

    getLibraryLanguageCharacterByLangaugeId(id: string): Observable<ILibraryLanguageCharacter[]> {
        return this.dataService
            .getByReguest<ApiResult>(`/LibraryLanguageCharacter/GetLibraryLanguageCharacterByLanguageId`, id)
            .pipe(map((response) => response.data as ILibraryLanguageCharacter[]));
    }
    //#endregion

    //#region Library Background
    getAllLibraryBackgrounds(): Observable<ILibraryBackground[]> {
        return this.dataService
            .getAllReguest<ApiResult>(`/LibraryBackground/GetAllLibraryBackgrounds`)
            .pipe(map((response) => response.data as ILibraryBackground[]));
    }

    getLibraryBackgroundById(id: string): Observable<ILibraryBackground> {
        return this.dataService
            .getByReguest<ApiResult>(`/LibraryBackground/GetLibraryBackgroundById`, id)
            .pipe(map((response) => response.data as ILibraryBackground));
    }

    addLibraryBackground(request: FormData): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(`/LibraryBackground/AddLibraryBackground`, request);
    }

    editLibraryBackground(request: FormData): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(`/LibraryBackground/EditLibraryBackground`, request);
    }

    deleteLibraryBackgroundById(id: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(`/LibraryBackground/DeleteLibraryBackgroundById/${id}`, null);
    }

    activateLibraryBackgroundById(id: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(`/LibraryBackground/ActivateLibraryBackgroundById/${id}`, null);
    }

    deactivateLibraryBackgroundById(id: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(
            `/LibraryBackground/DeActivateLibraryBackgroundById/${id}`,
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

    getTenantDefaultLanguage(): Observable<ILanguageModel> {
        return this.dataService
            .getAllReguest<ApiResult>('/Language/GetDefaultTenantLanguage')

            .pipe(
                map((res) => {
                    return res.data as ILanguageModel;
                })
            );
    }
}