import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResult } from 'src/app/core/Dtos/ApiResult';
import { DataService } from 'src/app/core/Services/data-service.service';
import { IPoinitngTypeModel } from '../models/IPoinitngTypeModel';
import { IPaginationModel } from 'src/app/core/Dtos/IPaginationModel';

@Injectable({
    providedIn: 'root',
})
export class PointingTypeService {
    constructor(private dataService: DataService) {}

    getPoinitngTypes(pagination: IPaginationModel): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>('/PointingType', pagination);
    }

    editPointingType(model: IPoinitngTypeModel): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>('/PointingType/Edit', model);
    }
}