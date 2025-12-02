import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResult } from 'src/app/core/Dtos/ApiResult';
import { IPaginationModel } from 'src/app/core/Dtos/IPaginationModel';
import { DataService } from 'src/app/core/Services/data-service.service';

@Injectable({
    providedIn: 'root',
})
export class EmailDomainService {
    constructor(private dataService: DataService) {}

    getPhishingDomains(pagination : IPaginationModel): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>('/PhishingDomain/GetPhishingDomains', pagination);
    }

    getDomainById(id: string, pagination: IPaginationModel): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(`/PhishingDomain/GetPhishingDomainById/${id}`, pagination);
    }

    addDomain(data: any): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>('/PhishingDomain/AddPhishingDomain', data);
    }

    editDomain(data: any): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>('/PhishingDomain/EditPhishingDomain', data);
    }

    activateDomain(id: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(`/PhishingDomain/ActivatePhishingDomain/${id}`, null);
    }

    deactivateDomain(id: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(`/PhishingDomain/DeactivatePhishingDomain/${id}`, null);
    }

    deleteDomain(id: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(`/PhishingDomain/DeletePhishingDomain/${id}`, null);
    }

    // Domain Email
    getDomainEmailByDomainId(id: string): Observable<ApiResult> {
        return this.dataService.getByReguest<ApiResult>('/PhishingDomainEmail/GetPhishingDomainById', id);
    }

    addDomainEmail(data: any): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>('/PhishingDomainEmail/AddPhishingDomainEmail', data);
    }

    editDomainEmail(data: any): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>('/PhishingDomainEmail/EditPhishingDomainEmail', data);
    }

    activateDomainEmail(id: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(`/PhishingDomainEmail/ActivatePhishingDomainEmail/${id}`, null);
    }

    deactivateDomainEmail(id: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(
            `/PhishingDomainEmail/DeactivatePhishingDomainEmail/${id}`,
            null
        );
    }

    deleteDomainEmail(id: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(`/PhishingDomainEmail/DeletePhishingDomainEmail/${id}`, null);
    }
}
