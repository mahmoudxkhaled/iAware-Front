import { Injectable } from '@angular/core';
import { IAspNetPageItemModel } from 'src/app/modules/page-management/models/IAspNetPageItemModel';
import { LocalStorageService } from './local-storage.service';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root',
})
export class PermessionsService {
    private _userData : any;
    private _permessions : any[] =[];
    
    constructor(        private route : Router, private localStorageService : LocalStorageService) {
        this._userData = this.localStorageService.getItem('userData');
        this._permessions = this._userData ? this._userData?.permessions as IAspNetPageItemModel[] : [];
    }

    getCurrentPermessions() : IAspNetPageItemModel[]{
        return this._permessions = this._userData ? this._userData?.permessions as IAspNetPageItemModel[] : [];
    }

    getPagePermessions(pageName : string) : any{
        const pagePermessions = this._permessions.filter((p) => p.aspNetPageName?.toLowerCase() === pageName?.toLowerCase())
        if(pagePermessions.length == 0){
            this.route.navigate(['/'])
        }
        return pagePermessions;
    }}