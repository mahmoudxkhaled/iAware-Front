import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResult } from 'src/app/core/Dtos/ApiResult';
import { DataService } from 'src/app/core/Services/data-service.service';

@Injectable({
  providedIn: 'root'
})
export class NewsCategoryArticleLanguageService {

  constructor(private dataService: DataService) { }

  // Get all NewsCategoryArticleLanguages
  getAllNewsCategoryArticleLanguagesByArticleId(id: string): Observable<ApiResult> {
    return this.dataService.getAllReguest(`/NewsCategoryArticleLanguage/GetAllNewsCategoryArticleLanguagesByArticleId/${id}`);
  }

  // Get a specific NewsCategoryArticleLanguage by its ID
  getNewsCategoryArticleLanguageById(id: string): Observable<ApiResult> {
    return this.dataService.getByReguest(`/NewsCategoryArticleLanguage/GetNewsCategoryArticleLanguageById`, id);
  }

  // Add a new NewsCategoryArticleLanguage
  addNewsCategoryArticleLanguage(request: any): Observable<ApiResult> {
    return this.dataService.postReguest(`/NewsCategoryArticleLanguage/AddNewsCategoryArticleLanguage`, request);
  }

  // Edit an existing NewsCategoryArticleLanguage
  editNewsCategoryArticleLanguage(request: any): Observable<ApiResult> {
    return this.dataService.postReguest(`/NewsCategoryArticleLanguage/EditNewsCategoryArticleLanguage`, request);
  }

  // Delete a NewsCategoryArticleLanguage by its ID
  deleteNewsCategoryArticleLanguageById(id: string): Observable<ApiResult> {
    return this.dataService.postReguest(`/NewsCategoryArticleLanguage/DeleteNewsCategoryArticleLanguageById/${id}`, null);
  }

  // Activate a NewsCategoryArticleLanguage by its ID
  activateNewsCategoryArticleLanguage(id: string): Observable<ApiResult> {
    return this.dataService.postReguest(`/NewsCategoryArticleLanguage/ActivateNewsCategoryArticleLanguage/${id}`, null);
  }

  // Deactivate a NewsCategoryArticleLanguage by its ID
  deactivateNewsCategoryArticleLanguage(id: string): Observable<ApiResult> {
    return this.dataService.postReguest(`/NewsCategoryArticleLanguage/DeactivateNewsCategoryArticleLanguage/${id}`, null);
  }

  getAllLanguagesWithoutFilters(): Observable<ApiResult> {
    return this.dataService.getAllReguest(`/Language/GetAllLanguagesWithoutFilters`);
  }
}