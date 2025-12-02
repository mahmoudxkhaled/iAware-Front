import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResult } from 'src/app/core/Dtos/ApiResult';
import { DataService } from 'src/app/core/Services/data-service.service';

@Injectable({
  providedIn: 'root'
})
export class BlogCategoryPostLanguageService {

  constructor(private dataService: DataService) { }

  // Get all BlogCategoryPostLanguages
  getAllBlogCategoryPostLanguagesByPostId(id: string): Observable<ApiResult> {
    return this.dataService.getAllReguest(`/BlogCategoryPostLanguage/GetAllBlogCategoryPostLanguagesByPostId/${id}`);
  }

  // Get a specific BlogCategoryPostLanguage by its ID
  getBlogCategoryPostLanguageById(id: string): Observable<ApiResult> {
    return this.dataService.getByReguest(`/BlogCategoryPostLanguage/GetBlogCategoryPostLanguageById`, id);
  }

  // Add a new BlogCategoryPostLanguage
  addBlogCategoryPostLanguage(request: any): Observable<ApiResult> {
    return this.dataService.postReguest(`/BlogCategoryPostLanguage/AddBlogCategoryPostLanguage`, request);
  }

  // Edit an existing BlogCategoryPostLanguage
  editBlogCategoryPostLanguage(request: any): Observable<ApiResult> {
    return this.dataService.postReguest(`/BlogCategoryPostLanguage/EditBlogCategoryPostLanguage`, request);
  }

  // Delete a BlogCategoryPostLanguage by its ID
  deleteBlogCategoryPostLanguageById(id: string): Observable<ApiResult> {
    return this.dataService.postReguest(`/BlogCategoryPostLanguage/DeleteBlogCategoryPostLanguageById/${id}`, null);
  }

  // Activate a BlogCategoryPostLanguage by its ID
  activateBlogCategoryPostLanguage(id: string): Observable<ApiResult> {
    return this.dataService.postReguest(`/BlogCategoryPostLanguage/ActivateBlogCategoryPostLanguage/${id}`, null);
  }

  // Deactivate a BlogCategoryPostLanguage by its ID
  deactivateBlogCategoryPostLanguage(id: string): Observable<ApiResult> {
    return this.dataService.postReguest(`/BlogCategoryPostLanguage/DeactivateBlogCategoryPostLanguage/${id}`, null);
  }

  getAllLanguagesWithoutFilters(): Observable<ApiResult> {
    return this.dataService.getAllReguest(`/Language/GetAllLanguagesWithoutFilters`);
  }
}
