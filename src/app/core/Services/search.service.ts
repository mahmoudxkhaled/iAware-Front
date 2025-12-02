import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DataService } from 'src/app/core/Services/data-service.service';
import { TenantModel } from 'src/app/modules/auth/models/TenantModel';
import { environment } from 'src/environments/environment';
import { ApiResult } from '../Dtos/ApiResult';
@Injectable({
  providedIn: 'root'
})
export class SearchService {


  BASE_URL = environment.apiUrl;
  BASE_URLII = environment.apiUrlWithoutAPI;

  constructor(private dataService: DataService) { }
  searchByTag(tagName: string): Observable<ApiResult> {
    return this.dataService.getAllReguest<ApiResult>(`/Search/SearchByTag?tagName=${tagName}`);
  }
}
