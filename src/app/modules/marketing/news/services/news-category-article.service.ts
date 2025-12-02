import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResult } from 'src/app/core/Dtos/ApiResult';
import { DataService } from 'src/app/core/Services/data-service.service';

@Injectable({
  providedIn: 'root'
})
export class NewsCategoryArticleService {

  constructor(private dataService: DataService) { }

  // Get all News category posts
  getAllNewsCategoryArticles(): Observable<ApiResult> {
    return this.dataService.getAllReguest(`/NewsCategoryArticle/GetAllNewsCategoryArticles`);
  }

  // Get a specific News category post by its ID
  getNewsCategoryArticleById(id: string): Observable<ApiResult> {
    return this.dataService.getByReguest(`/NewsCategoryArticle/GetNewsCategoryArticleById`, id);
  }

  getArticlesByCategoryId(id: string): Observable<ApiResult> {
    return this.dataService.getByReguest(`/NewsCategoryArticle/GetArticlesByCategoryId`, id);
  }
  // Add a new News category post
  addNewsCategoryArticle(request: any): Observable<ApiResult> {
    return this.dataService.postReguest(`/NewsCategoryArticle/AddNewsCategoryArticle`, request);
  }

  // Edit an existing News category post
  editNewsCategoryArticle(request: any): Observable<ApiResult> {
    return this.dataService.postReguest(`/NewsCategoryArticle/EditNewsCategoryArticle`, request);
  }

  // Delete a News category post by its ID
  deleteNewsCategoryArticleById(id: string): Observable<ApiResult> {
    return this.dataService.postReguest(`/NewsCategoryArticle/DeleteNewsCategoryArticleById/${id}`, null);
  }

  // Activate a News category post by its ID
  activateNewsCategoryArticle(id: string): Observable<ApiResult> {
    return this.dataService.postReguest(`/NewsCategoryArticle/ActivateNewsCategoryArticle/${id}`, null);
  }

  // Deactivate a News category post by its ID
  deactivateNewsCategoryArticle(id: string): Observable<ApiResult> {
    return this.dataService.postReguest(`/NewsCategoryArticle/DeactivateNewsCategoryArticle/${id}`, null);
  }

  getAllTages(): Observable<ApiResult> {
    return this.dataService.getAllReguest<ApiResult>('/Tag');
  }
}



