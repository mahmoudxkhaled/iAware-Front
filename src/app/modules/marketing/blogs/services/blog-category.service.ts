import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResult } from 'src/app/core/Dtos/ApiResult';
import { DataService } from 'src/app/core/Services/data-service.service';

@Injectable({
  providedIn: 'root'
})
export class BlogCategoryService {

  constructor(private dataService: DataService) { }


  getAllBlogCategories(): Observable<ApiResult> {
    return this.dataService
      .getAllReguest<ApiResult>(`/BlogCategory/GetAllBlogCategories`)
  }
  getBlogCategoryById(id: string): Observable<ApiResult> {
    return this.dataService
      .getByReguest<ApiResult>(`/BlogCategory/GetBlogCategoryById`, id)
  }

  addBlogCategory(request: FormData): Observable<ApiResult> {
    return this.dataService.postReguest<ApiResult>(`/BlogCategory/AddBlogCategory`, request);
  }

  editBlogCategory(request: FormData): Observable<ApiResult> {
    return this.dataService.postReguest<ApiResult>(`/BlogCategory/EditBlogCategory`, request);
  }

  deleteBlogCategoryById(id: string): Observable<ApiResult> {
    return this.dataService.postReguest<ApiResult>(`/BlogCategory/DeleteBlogCategoryById/${id}`, null);
  }

  activateBlogCategory(id: string): Observable<ApiResult> {
    return this.dataService.postReguest<ApiResult>(`/BlogCategory/ActivateBlogCategory/${id}`, null);
  }

  deactivateBlogCategory(id: string): Observable<ApiResult> {
    return this.dataService.postReguest<ApiResult>(`/BlogCategory/DeactivateBlogCategory/${id}`, null);
  }


  getAllTages(): Observable<ApiResult> {
    return this.dataService.getAllReguest<ApiResult>('/Tag');
  }

}
