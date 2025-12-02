import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResult } from 'src/app/core/Dtos/ApiResult';
import { IPaginationModel } from 'src/app/core/Dtos/IPaginationModel';
import { DataService } from 'src/app/core/Services/data-service.service';

@Injectable({
  providedIn: 'root'
})
export class SystemEmailActivityService {
  constructor(private dataService: DataService) {}

  getSystemEmailActivities(pagination: IPaginationModel): Observable<ApiResult> {
      return this.dataService.postReguest<ApiResult>('/SystemEmailActivity/GetSystemEmailActivities', pagination);
  }

  getSystemEmailActivityById(id: number): Observable<ApiResult> {
      return this.dataService.getByReguest<ApiResult>('/SystemEmailActivity/GetSystemEmailActivityById', id);
  }

  addSystemEmailActivity(data: any): Observable<ApiResult> {
      return this.dataService.postReguest<ApiResult>('/SystemEmailActivity/AddSystemEmailActivity', data);
  }

  editSystemEmailActivity(data: any): Observable<ApiResult> {
      return this.dataService.postReguest<ApiResult>('/SystemEmailActivity/EditSystemEmailActivity', data);
  }

  activateSystemEmailActivity(id: number): Observable<ApiResult> {
      return this.dataService.postReguest<ApiResult>(`/SystemEmailActivity/ActivateSystemEmailActivity/${id}`, null);
  }

  deactivateSystemEmailActivity(id: number): Observable<ApiResult> {
      return this.dataService.postReguest<ApiResult>(`/SystemEmailActivity/DeactivateSystemEmailActivity/${id}`,null);
  }

  deleteSystemActivityEmail(id: number): Observable<ApiResult> {
      return this.dataService.postReguest<ApiResult>(`/SystemEmailActivity/DeleteSystemEmailActivity/${id}`, null);
  }
}