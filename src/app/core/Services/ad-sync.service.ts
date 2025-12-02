import { Injectable } from '@angular/core';
import { DataService } from './data-service.service';
import { BehaviorSubject, finalize, Observable } from 'rxjs';
import { ApiResult } from '../Dtos/ApiResult';

@Injectable({
    providedIn: 'root',
})
export class AdSyncService {
    isLoadingSubject = new BehaviorSubject<boolean>(false);
    constructor(private dataService: DataService) {
        this.isLoadingSubject = new BehaviorSubject<boolean>(false);
    }

    syncADUsers(): Observable<ApiResult> {
        return this.dataService.getAllReguest<ApiResult>('/AD/SyncADUsers');
    }

    insertFinalADUsers(data: any): Observable<ApiResult> {
        this.isLoadingSubject.next(true);
        return this.dataService
            .postReguest<ApiResult>('/AD/SyncADBasedOnOUs', data)
            .pipe(finalize(() => this.isLoadingSubject.next(false)));
    }

    syncADGroups(): Observable<ApiResult> {
        return this.dataService.getAllReguest<ApiResult>('/AD/SyncADGroups');
    }

    syncADOUs(): Observable<ApiResult> {
        return this.dataService.getAllReguest<ApiResult>('/AD/SyncADOUs');
    }
}
