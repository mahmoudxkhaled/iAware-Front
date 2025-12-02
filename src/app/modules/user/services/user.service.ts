import { Injectable } from '@angular/core';
import { BehaviorSubject, finalize, Observable } from 'rxjs';
import { ApiResult } from 'src/app/core/Dtos/ApiResult';
import { DataService } from 'src/app/core/Services/data-service.service';
import { IUserModel } from '../models/IUserModel';
import { IUsersExcelModel } from '../models/IUsersExcelModel';
import { IAdministraorUserModel } from '../models/IAdministraorUserModel';
import { IPaginationModel } from 'src/app/core/Dtos/IPaginationModel';

@Injectable({
    providedIn: 'root',
})
export class UserService {
    isLoadingSubject = new BehaviorSubject<boolean>(false);
    constructor(private dataService: DataService) {
        this.isLoadingSubject = new BehaviorSubject<boolean>(false);
    }

    getAllUsers(paginationObject : IPaginationModel): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>('/AppUser/GetUsersByTenantId', paginationObject);
    }

    getAllDeletedUsers(paginationObject : IPaginationModel): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>('/AppUser/GetDeletedUsersByTenantId', paginationObject);
    }

    returnDeletedUser(userId: string): Observable<ApiResult> {
        const formData = new FormData();
        formData.append('userId', userId);
        return this.dataService.postReguest<ApiResult>('/AppUser/ReturnDeletedUser', formData);
    }

    getTenantAdministrators(): Observable<ApiResult> {
        return this.dataService.getAllReguest<ApiResult>('/AppUser/GetTenantAdministrators');
    }

    getTenantValidLicence(): Observable<ApiResult> {
        return this.dataService.getAllReguest('/AppUser/GetTenantValidLicence');
    }

    getAllUsersVII(): Observable<ApiResult> {
        return this.dataService.getAllReguest<ApiResult>('/AppUser/GetAllUsersWithGroupsByTenantId');
    }

    getAllActiveTenantGroups(): Observable<ApiResult> {
        return this.dataService.getAllReguest<ApiResult>('/TenantGroup/GetAllActiveTenantGroups');
    }

    isADDataCompleted(): Observable<ApiResult> {
        return this.dataService.getAllReguest<ApiResult>('/Tenant/IsADDataCompleted');
    }

    checkIfNumberOfUsersInTenantSubscriptionPlane(): Observable<ApiResult> {
        return this.dataService.getAllReguest<ApiResult>('/Tenant/NumberOfUsersInTenantSubscriptionPlaneCompleted');
    }

    CheckTenantUsersLicence(): Observable<ApiResult> {
        return this.dataService.getAllReguest<ApiResult>('/AppUser/CheckTenantUsersLicence');
    }

    createUser(user: IUserModel): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>('/AppUser/Register', user);
    }

    addUserList(users: IUsersExcelModel): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>('/AppUser/AddListOfUsers', users);
    }

    sendVerificationEmailToListOfUsers(data: any): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>('/AppUser/SendResetPasswordToListOfUsers', data);
    }

    updateUser(user: any): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>('/AppUser/EditeUser', user);
    }

    editProfileUser(user: FormData): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>('/AppUser/EditUserProfile', user);
    }

    editUserTheme(): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>('/AppUser/EditUserTheme', null);
    }

    editUserLanguage(languageId: string): Observable<ApiResult> {
        return this.dataService.getByReguest<ApiResult>('/AppUser/EditUserLanguage', languageId);
    }

    addNewAdministrator(user: IAdministraorUserModel): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>('/AppUser/AddNewAdministrator', user);
    }

    getUser(id: any): Observable<ApiResult> {
        return this.dataService.getByReguest<ApiResult>('/AppUser/GetUserById', id);
    }

    backUserToUserRole(id: any): Observable<ApiResult> {
        return this.dataService.getByReguest<ApiResult>('/AppUser/BackUserToUserRole', id);
    }

    getUserDetails(): Observable<ApiResult> {
        return this.dataService.getAllReguest<ApiResult>('/AppUser/GetUser');
    }

    getUserWithRole(id: string): Observable<ApiResult> {
        return this.dataService.getByReguest<ApiResult>('/AppUser/GetUserWithGroups', id);
    }

    deleteUser(id: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(`/AppUser/DeleteUserById/${id}`, null);
    }

    activeUser(id: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(`/AppUser/ActiveUser/${id}`, null);
    }

    deActiveUser(id: string): Observable<ApiResult> {
        return this.dataService.postReguest<ApiResult>(`/AppUser/DeActiveUser/${id}`, null);
    }

    // Dashboard APIs
    getUserBadges(userId: string): Observable<ApiResult> {
        return this.dataService.getByReguest<ApiResult>('/AppUser/GetBadgesForUser', userId);
    }

    getUserBadgesVI(): Observable<ApiResult> {
        return this.dataService.getAllReguest<ApiResult>('/Badge/GetBadgesForUser');
    }

    getUserRiskResults(id: string): Observable<ApiResult> {
        return this.dataService.getByReguest<ApiResult>('/AppUser/UserRiskResults', id);
    }

    getUserTrainingResults(id: string): Observable<ApiResult> {
        return this.dataService.getByReguest<ApiResult>('/AppUser/UserTrainingResults', id);
    }

    getUserTrainingResultsDetails(id: string): Observable<ApiResult> {
        return this.dataService.getByReguest<ApiResult>('/AppUser/UserTrainingResultsDetails', id);
    }

    getUserPoints(userId: string): Observable<ApiResult> {
        return this.dataService.getByReguest<ApiResult>('/AppUser/GetUserPoints', userId);
    }

    getUserPhishingResults(id: string): Observable<ApiResult> {
        return this.dataService.getByReguest<ApiResult>('/AppUser/UserPhishingResults', id);
    }

    getUserPhishingResultsDetails(id: string): Observable<ApiResult> {
        return this.dataService.getByReguest<ApiResult>('/AppUser/UserPhishingResultsDetails', id);
    }

    getCampaignsUserDashboard(id: string): Observable<ApiResult> {
        return this.dataService.getByReguest<ApiResult>('/AppUser/UserTrainingCampaigns', id);
    }

    getUserPhishingCampaignsTemplates(id: string): Observable<ApiResult> {
        return this.dataService.getByReguest<ApiResult>('/AppUser/UserPhishingCampaignsTemplates', id);
    }

    getUserRiskHistory(id: string): Observable<ApiResult> {
        return this.dataService.getByReguest<ApiResult>('/AppUser/UserRiskHistory', id);
    }

    getUserTrainingCampaignPieChartData(userId: string, campaignId: string): Observable<ApiResult> {
        return this.dataService.getByTwoIdsReguest<ApiResult>(
            `/AppUser/UserTrainingResultsForCampaign`,
            userId,
            campaignId
        );
    }

    getUserPhishingCampaignPieChartData(userId: string, campaignId: string): Observable<ApiResult> {
        return this.dataService.getByTwoIdsReguest<ApiResult>(
            `/AppUser/UserPhishingResultsForCampaign`,
            userId,
            campaignId
        );
    }

    getPhishingCampaignDetails(userId: string, campaignId: string): Observable<ApiResult> {
        return this.dataService.getByTwoIdsReguest<ApiResult>(
            `/AppUser/UserPhishingCampaignDetails`,
            userId,
            campaignId
        );
    }

    getAllCampaign(): Observable<ApiResult> {
        return this.dataService.getAllReguest<ApiResult>('/AwarenessCampaign/GetAllCampaign');
    }
}
