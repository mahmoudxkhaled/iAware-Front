import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResult } from 'src/app/core/Dtos/ApiResult';
import { DataService } from 'src/app/core/Services/data-service.service';

@Injectable({
  providedIn: 'root'
})
export class BlogCategoryPostService {

  constructor(private dataService: DataService) { }

  // Get all blog category posts
  getAllBlogCategoryPosts(): Observable<ApiResult> {
    return this.dataService.getAllReguest(`/BlogCategoryPost/GetAllBlogCategoryPosts`);
  }

  // Get a specific blog category post by its ID
  getBlogCategoryPostById(id: string): Observable<ApiResult> {
    return this.dataService.getByReguest(`/BlogCategoryPost/GetBlogCategoryPostById`, id);
  }

  getPostsByCategoryId(id: string): Observable<ApiResult> {
    return this.dataService.getByReguest(`/BlogCategoryPost/GetPostsByCategoryId`, id);
  }
  // Add a new blog category post
  addBlogCategoryPost(request: any): Observable<ApiResult> {
    return this.dataService.postReguest(`/BlogCategoryPost/AddBlogCategoryPost`, request);
  }

  // Edit an existing blog category post
  editBlogCategoryPost(request: any): Observable<ApiResult> {
    return this.dataService.postReguest(`/BlogCategoryPost/EditBlogCategoryPost`, request);
  }

  // Delete a blog category post by its ID
  deleteBlogCategoryPostById(id: string): Observable<ApiResult> {
    return this.dataService.postReguest(`/BlogCategoryPost/DeleteBlogCategoryPostById/${id}`, null);
  }

  // Activate a blog category post by its ID
  activateBlogCategoryPost(id: string): Observable<ApiResult> {
    return this.dataService.postReguest(`/BlogCategoryPost/ActivateBlogCategoryPost/${id}`, null);
  }

  // Deactivate a blog category post by its ID
  deactivateBlogCategoryPost(id: string): Observable<ApiResult> {
    return this.dataService.postReguest(`/BlogCategoryPost/DeactivateBlogCategoryPost/${id}`, null);
  }

  getAllTages(): Observable<ApiResult> {
    return this.dataService.getAllReguest<ApiResult>('/Tag');
  }
}



