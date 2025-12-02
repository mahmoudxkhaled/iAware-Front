import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResult } from 'src/app/core/Dtos/ApiResult';
import { DataService } from 'src/app/core/Services/data-service.service';

@Injectable({
  providedIn: 'root'
})
export class NewsCategoryLanguageService {

  constructor(private dataService: DataService) { }

  // Get all NewsCategoryLanguages by NewsCategoryId
  getAllNewsCategoryLanguagesByCategoryId(categoryId: string): Observable<ApiResult> {
    return this.dataService.getAllReguest(`/NewsCategoryLanguage/GetAllNewsCategoryLanguagesByCategoryId/${categoryId}`);
  }

  // Get a specific NewsCategoryLanguage by its ID
  getNewsCategoryLanguageById(id: string): Observable<ApiResult> {
    return this.dataService.getByReguest(`/NewsCategoryLanguage/GetNewsCategoryLanguageById`, id);
  }

  // Add a new NewsCategoryLanguage
  addNewsCategoryLanguage(request: any): Observable<ApiResult> {
    return this.dataService.postReguest(`/NewsCategoryLanguage/AddNewsCategoryLanguage`, request);
  }

  // Edit an existing NewsCategoryLanguage
  editNewsCategoryLanguage(request: any): Observable<ApiResult> {
    return this.dataService.postReguest(`/NewsCategoryLanguage/EditNewsCategoryLanguage`, request);
  }

  // Delete a NewsCategoryLanguage by its ID
  deleteNewsCategoryLanguageById(id: string): Observable<ApiResult> {
    return this.dataService.postReguest(`/NewsCategoryLanguage/DeleteNewsCategoryLanguageById/${id}`, null);
  }

  // Activate a NewsCategoryLanguage by its ID
  activateNewsCategoryLanguage(id: string): Observable<ApiResult> {
    return this.dataService.postReguest(`/NewsCategoryLanguage/ActivateNewsCategoryLanguage/${id}`, null);
  }

  // Deactivate a NewsCategoryLanguage by its ID
  deactivateNewsCategoryLanguage(id: string): Observable<ApiResult> {
    return this.dataService.postReguest(`/NewsCategoryLanguage/DeactivateNewsCategoryLanguage/${id}`, null);
  }


  getAllLanguagesWithoutFilters(): Observable<ApiResult> {
    return this.dataService.getAllReguest(`/Language/GetAllLanguagesWithoutFilters`);
  }


}
