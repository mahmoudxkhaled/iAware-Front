import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { DataService } from './data-service.service';
import { ApiResult } from '../Dtos/ApiResult';

@Injectable({
    providedIn: 'root',
})
export class VdoPlayerService {
    constructor(private dataService: DataService, private httpClient: HttpClient) {}

    BASE_URL = environment.apiUrl;

    getVideoCredentials(videoId: any): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(`/TrainingLessonLanguage/GetVideoCredentials/${videoId}`, null);
    }

    // getVideoOTP(): Observable<any> {
    //   return this.httpClient.post<any>('https://localhost:7201/api/TrainingLesson/GetVideoOTP', {});
    // }
}