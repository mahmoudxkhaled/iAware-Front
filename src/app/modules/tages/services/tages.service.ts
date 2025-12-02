import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResult } from 'src/app/core/Dtos/ApiResult';
import { DataService } from 'src/app/core/Services/data-service.service';
import { IPaginationModel } from 'src/app/core/Dtos/IPaginationModel';


@Injectable({
  providedIn: 'root',
})
export class TagesService {
  constructor(private dataService: DataService) { }

  getAllTages(): Observable<ApiResult> {
    return this.dataService.getAllReguest<ApiResult>('/Tag');
  }

  getAllTagesPagination(paginationObject: IPaginationModel): Observable<ApiResult> {
    return this.dataService.postReguest<ApiResult>(`/Tag/GetAllTagsPagination/`, paginationObject);
  }

  getAllTagesAccordingToUserLanguage(): Observable<ApiResult> {
    return this.dataService.getAllReguest<ApiResult>('/Tag/GetAllTagesAccordingToUserLanguage');
  }

  addTag(data: any): Observable<ApiResult> {
    return this.dataService.postReguest<ApiResult>('/Tag/Add', data);
  }

  editTag(data: any): Observable<ApiResult> {
    return this.dataService.postReguest<ApiResult>('/Tag/Edit', data);
  }

  deleteTag(id: string): Observable<ApiResult> {
    return this.dataService.postReguest<ApiResult>(`/Tag/Delete/${id}`, null);
  }

  activateTag(id: string): Observable<ApiResult> {
    return this.dataService.postReguest<ApiResult>(`/Tag/Activate/${id}`, null);
  }

  deActivateTag(id: string): Observable<ApiResult> {
    return this.dataService.postReguest<ApiResult>(`/Tag/Deactivate/${id}`, null);
  }
}