import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResult } from 'src/app/core/Dtos/ApiResult';
import { DataService } from 'src/app/core/Services/data-service.service';

@Injectable({
  providedIn: 'root'
})
export class NewsCategoryService {

  constructor(private dataService: DataService) { }


  getAllNewsCategories(): Observable<ApiResult> {
    return this.dataService
      .getAllReguest<ApiResult>(`/NewsCategory/GetAllNewsCategories`)
  }
  getNewsCategoryById(id: string): Observable<ApiResult> {
    return this.dataService
      .getByReguest<ApiResult>(`/NewsCategory/GetNewsCategoryById`, id)
  }

  addNewsCategory(request: FormData): Observable<ApiResult> {
    return this.dataService.postReguest<ApiResult>(`/NewsCategory/AddNewsCategory`, request);
  }

  editNewsCategory(request: FormData): Observable<ApiResult> {
    return this.dataService.postReguest<ApiResult>(`/NewsCategory/EditNewsCategory`, request);
  }

  deleteNewsCategoryById(id: string): Observable<ApiResult> {
    return this.dataService.postReguest<ApiResult>(`/NewsCategory/DeleteNewsCategoryById/${id}`, null);
  }

  activateNewsCategory(id: string): Observable<ApiResult> {
    return this.dataService.postReguest<ApiResult>(`/NewsCategory/ActivateNewsCategory/${id}`, null);
  }

  deactivateNewsCategory(id: string): Observable<ApiResult> {
    return this.dataService.postReguest<ApiResult>(`/NewsCategory/DeactivateNewsCategory/${id}`, null);
  }


  getAllTages(): Observable<ApiResult> {
    return this.dataService.getAllReguest<ApiResult>('/Tag');
  }

}
