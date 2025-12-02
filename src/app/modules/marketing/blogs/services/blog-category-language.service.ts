import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResult } from 'src/app/core/Dtos/ApiResult';
import { DataService } from 'src/app/core/Services/data-service.service';

@Injectable({
  providedIn: 'root'
})
export class BlogCategoryLanguageService {

  constructor(private dataService: DataService) { }

  // Get all BlogCategoryLanguages by BlogCategoryId
  getAllBlogCategoryLanguagesByCategoryId(categoryId: string): Observable<ApiResult> {
    return this.dataService.getAllReguest(`/BlogCategoryLanguage/GetAllBlogCategoryLanguagesByCategoryId/${categoryId}`);
  }

  // Get a specific BlogCategoryLanguage by its ID
  getBlogCategoryLanguageById(id: string): Observable<ApiResult> {
    return this.dataService.getByReguest(`/BlogCategoryLanguage/GetBlogCategoryLanguageById`, id);
  }

  // Add a new BlogCategoryLanguage
  addBlogCategoryLanguage(request: any): Observable<ApiResult> {
    return this.dataService.postReguest(`/BlogCategoryLanguage/AddBlogCategoryLanguage`, request);
  }

  // Edit an existing BlogCategoryLanguage
  editBlogCategoryLanguage(request: any): Observable<ApiResult> {
    return this.dataService.postReguest(`/BlogCategoryLanguage/EditBlogCategoryLanguage`, request);
  }

  // Delete a BlogCategoryLanguage by its ID
  deleteBlogCategoryLanguageById(id: string): Observable<ApiResult> {
    return this.dataService.postReguest(`/BlogCategoryLanguage/DeleteBlogCategoryLanguageById/${id}`, null);
  }

  // Activate a BlogCategoryLanguage by its ID
  activateBlogCategoryLanguage(id: string): Observable<ApiResult> {
    return this.dataService.postReguest(`/BlogCategoryLanguage/ActivateBlogCategoryLanguage/${id}`, null);
  }

  // Deactivate a BlogCategoryLanguage by its ID
  deactivateBlogCategoryLanguage(id: string): Observable<ApiResult> {
    return this.dataService.postReguest(`/BlogCategoryLanguage/DeactivateBlogCategoryLanguage/${id}`, null);
  }


  getAllLanguagesWithoutFilters(): Observable<ApiResult> {
    return this.dataService.getAllReguest(`/Language/GetAllLanguagesWithoutFilters`);
  }


}
