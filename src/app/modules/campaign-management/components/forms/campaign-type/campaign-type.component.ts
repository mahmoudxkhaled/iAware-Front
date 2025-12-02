import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IUserModel } from 'src/app/modules/user/models/IUserModel';
import { ITenantGroupModel } from 'src/app/modules/tenantgroup/models/ITenantGroupModel';
import { MultiSelectChangeEvent, MultiSelectSelectAllChangeEvent } from 'primeng/multiselect';
import { PickListMoveAllToTargetEvent, PickListMoveToTargetEvent } from 'primeng/picklist';
import { CampaignManagementService } from '../../../services/campaign-management.service';
import { MessageService, TreeNode } from 'primeng/api';
import { LocalStorageService } from 'src/app/core/Services/local-storage.service';
import { ChangeDetectorRef } from '@angular/core';
import { DropdownChangeEvent } from 'primeng/dropdown';
import introJs from 'intro.js';
import { ITenantUnitModel } from 'src/app/modules/tenant-unit/models/ITenantUnitModel';
import { SelectButtonChangeEvent } from 'primeng/selectbutton';
import { TranslationService } from 'src/app/core/Services/translation.service';
import { DropdownListDataSourceService } from 'src/app/core/Services/dropdown-list-data-source.service';
@Component({
    selector: 'app-campaign-type',
    templateUrl: './campaign-type.component.html',
    styleUrl: './campaign-type.component.scss',
})
export class CampaignTypeComponent implements OnInit, AfterViewInit {
    campaignTypeForm: FormGroup;
    users: IUserModel[] = [];
    usersSelected: IUserModel[] = [];
    targetUsers: IUserModel[] = [];
    groups: ITenantGroupModel[] = [];
    groupsSelected: ITenantGroupModel[] = [];
    groupsWithUsers: IUserModel[] = [];
    groupsWithUsersVII: ITenantGroupModel[] = [];
    groupsWithUsersVIITree: TreeNode[] = [];
    tenantUnitsWithUsers: ITenantUnitModel[] = [];
    tenantUnitsUsersTree: TreeNode[] = [];
    selectedTenantUnitsUsers: any[] = [];
    selectedGroupsWithUsersVII: any[] = [];
    mixedUsers: IUserModel[] = [];
    groupIds: string[] = [];
    userIds: string[] = [];
    ids: string[] = [];
    activeLanguages: any[] = [];
    isGroup: boolean = false;
    isUsers: boolean = false;
    isDateInvalid: boolean = false;
    isDataOnLocalStorage: boolean = false;
    isDataTypeTraining: boolean = true;
    selectAllUsers: boolean = false;
    selectAllGroups: boolean = false;
    showInvalidDateMessage = false;
    doNotShaowCampaignStepAgain: boolean = false;
    selectUsersOptions: any[] = [];
    selectUsersValue: number = 1;
    types: any = [
        {
            name: 'Training',
            code: 1,
        },
        {
            name: 'Phishing',
            code: 2,
        },
    ];

    unitsUsers: boolean = false;
    groupsUsers: boolean = false;

    introJS = introJs.tour();

    constructor(
        private router: Router,
        private apiService: CampaignManagementService,
        private messageService: MessageService,
        private localstorageService: LocalStorageService,
        private cdr: ChangeDetectorRef,
        private translate : TranslationService,
        private dropdownListDataSourceService: DropdownListDataSourceService
    ) {
        this.doNotShaowCampaignStepAgain = this.localstorageService.getItem('doNotShowStepsAgain')
    }

    ngOnInit() {
        // if (!this.doNotShaowCampaignStepAgain) {
        //     this.introJS
        //         .setOptions({
        //             steps: [
        //                 {
        //                     element: '#name',
        //                     intro: 'Enter the campaign name here.',
        //                     position: 'bottom',
        //                 },
        //                 {
        //                     element: '#type',
        //                     intro: 'Select the type of campaign.',
        //                     position: 'bottom',
        //                 },
        //                 {
        //                     element: '#startDate',
        //                     intro: 'Choose the start date for the campaign.',
        //                     position: 'bottom',
        //                 },
        //                 {
        //                     element: '#endDate',
        //                     intro: 'Choose the end date for the campaign.',
        //                     position: 'bottom',
        //                 },
        //                 {
        //                     element: '#users',
        //                     intro: 'Select the users for this campaign.',
        //                     position: 'bottom',
        //                 },
        //                 {
        //                     element: '#stepLast',
        //                     intro: `
        //                         <p>Thank you for completing the onboarding process!</p>
        //                         <p><input type="checkbox" id="doNotShaowCampaignStepAgain" /> <label for="doNotShaowCampaignStepAgain">Don't show again</label></p>
        //                     `,
        //                     position: 'bottom',
        //                     highlightClass: 'introjs-highlight',
        //                 },
        //             ],
        //             nextLabel: 'Next',
        //             prevLabel: 'Previous',
        //             doneLabel: 'Close',
        //         })
        //         .oncomplete(() => {
        //             const doNotShaowCampaignStepAgain = document.getElementById('doNotShaowCampaignStepAgain') as HTMLInputElement;
        //             if (doNotShaowCampaignStepAgain?.checked) {
        //                 localStorage.setItem('doNotShowStepsAgain', 'true');
        //             }
        //         })
        //         .start();
        // }
        this.initiateForm();
        this.fetchTenantUnitsWithUsers()
        this.fetchTenantGroups();
        this.fetchActiveLanguages();
        this.fetchTenantUsers();
        this.fetchTenantGroupsWithUsers();
        this.initiateStartDateAndEndDate();
        this.selectUsersOptions = [
            { name: this.translate.getInstant('campaign-management.campaign-create.campaign-type.fields.allUser'), value: 1, icon: 'fa fa-users' },
            { name: this.translate.getInstant('campaign-management.campaign-create.campaign-type.fields.departments'), value: 2, icon: 'fa fa-qrcode' },
            { name: this.translate.getInstant('campaign-management.campaign-create.campaign-type.fields.groupss'), value: 3, icon: 'fa fa-building' }
        ];
    }

    ngAfterViewInit() {
        this.initiateStartDateAndEndDate();
    }

    fetchTenantGroups() {
        this.dropdownListDataSourceService.getTenantGroups().subscribe({
            next: (response) => {
                this.groups = response.data;
            },
            error: (error) => {

            },
        });
    }

    fetchActiveLanguages() {
        this.dropdownListDataSourceService.getActiveLanguages().subscribe({
            next: (result) => {
                this.activeLanguages = result.data;
                this.addLanguageControls();
                this.cdr.detectChanges();
            },
            error: (error) => {

            },
        });
    }

    fetchTenantGroupsWithUsers() {
        this.apiService.getAllTenantGroupsWithUsers().subscribe({
            next: (result) => {
                this.groupsWithUsersVII = result.data;
                this.groupsWithUsersVIITree = this.groupsWithUsersVII?.map((parent) => ({
                    key: parent.id,
                    label: parent.name,
                    selectable: parent.users && parent.users.length > 0 ? true : false,
                    children: parent.users?.map((user) => ({
                        key: user.id,
                        label: user.name,
                        leaf: true,
                    })),
                })) ?? [];
                this.checkIfDataInLocalStorage();
            },
            error: (error) => {

            },
        });
    }

    fetchTenantUsers() {
        this.apiService.getAllUsersTenant().subscribe({
            next: (result) => {
                this.users = result.data;
            },
            error: (error) => {

            },
        });
    }

    fetchTenantUnitsWithUsers() {
        this.apiService.getAllTenantUnitsWithUsers().subscribe({
            next: (result) => {
                this.tenantUnitsWithUsers = result.data;
                this.tenantUnitsUsersTree = this.tenantUnitsWithUsers?.map((parent) => ({
                    key: parent.id,
                    label: parent.unitName,
                    selectable: parent.users && parent.users.length > 0 ? true : false,
                    children: parent.users?.map((user) => ({
                        key: user.id,
                        label: user.name,
                        leaf: true,
                    })),
                })) ?? [];
                this.checkIfDataInLocalStorage();
            },
            error: (error) => {

            },
        });
    }

    checkIfDataInLocalStorage() {
        const campaignType = this.localstorageService.getItem('campaignType');
        const mixedUsers = this.localstorageService.getItem('campaignUsers');
        if (campaignType != null && mixedUsers != null) {
            this.isDataOnLocalStorage = true;
            this.isDataTypeTraining = campaignType?.type === 1;

            // Format the startDate and endDate to yyyy-MM-ddThh:mm
            const formatDate = (dateStr: string | null) => {
                if (!dateStr) return null;
                const date = new Date(dateStr);
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                // const hours = String(date.getHours()).padStart(2, '0');
                // const minutes = String(date.getMinutes()).padStart(2, '0');
                return `${year}-${month}-${day}`;
                // return `${year}-${month}-${day}T${hours}:${minutes}`;
            };

            this.campaignTypeForm.patchValue({
                name: campaignType?.name,
                type: campaignType?.type,
                startDate: formatDate(campaignType?.startDate),
                endDate: formatDate(campaignType?.endDate),
            });
            this.assigneAwarenessCampaignLanguageEmails();
            this.onSelectUsersOptionsValue();
            if (this.unitsUsers)
                this.assigneExistingUsersFromTenantUnit(mixedUsers);
            if(this.groupsUsers)
                this.assigneExistingUsersFromTenantGroups(mixedUsers);
        } else {
            this.isDataOnLocalStorage = false;
        }
    }

    assigneExistingUsersFromTenantUnit(mixedUsers: any) {
        const parents = this.tenantUnitsUsersTree.filter(z => z.children !== null);
        const childrens: any[] = [];

        this.tenantUnitsUsersTree.forEach(z => {
            if (z.children) {
                childrens.push(...z.children)
            }
        });


        const existingParents = parents?.filter((item) => mixedUsers.map((x: any) => { return x?.name }).includes(item.label));
        const existingChilderen = childrens?.filter((item) => mixedUsers.map((x: any) => { return x?.name }).includes(item.label));

        this.selectedTenantUnitsUsers.push(...existingParents)
        this.selectedTenantUnitsUsers.push(...existingChilderen)
    }

    assigneExistingUsersFromTenantGroups(mixedUsers: any) {
        const parents = this.groupsWithUsersVIITree.filter(z => z.children !== null);
        const childrens: any[] = [];

        this.groupsWithUsersVIITree.forEach(z => {
            if (z.children) {
                childrens.push(...z.children)
            }
        });


        const existingParents = parents?.filter((item) => mixedUsers.map((x: any) => { return x?.name }).includes(item.label));
        const existingChilderen = childrens?.filter((item) => mixedUsers.map((x: any) => { return x?.name }).includes(item.label));

        this.selectedGroupsWithUsersVII.push(...existingParents)
        this.selectedGroupsWithUsersVII.push(...existingChilderen)
    }

    assigneAwarenessCampaignLanguageEmails() {
        const data = this.localstorageService.getItem('campaignType');
        const languageControls = this.campaignTypeForm.get('awarenessCampaignLanguageEmails') as FormGroup;
        if (data?.awarenessCampaignLanguageEmails) {
            Object.keys(data.awarenessCampaignLanguageEmails).forEach((code) => {
                const languageData = data.awarenessCampaignLanguageEmails[code];
                if (languageControls.get(code)) {
                    (languageControls.get(code) as FormGroup).patchValue(languageData);
                }
            });
        }
    }

    initiateStartDateAndEndDate() {
        if (!this.isDataOnLocalStorage) {
            const elements = document.querySelectorAll('.startDate');

            elements.forEach((element: any, index: number) => {
                const now = new Date();
                let adjustedDate: Date;

                if (index === 0) {
                    adjustedDate = now;
                    // Format date to yyyy-MM-ddThh:mm
                    const year = now.getFullYear();
                    const month = String(now.getMonth() + 1).padStart(2, '0');
                    const day = String(now.getDate()).padStart(2, '0');
                    const hours = String(now.getHours()).padStart(2, '0');
                    const minutes = String(now.getMinutes()).padStart(2, '0');
                    const formattedDate = `${year}-${month}-${day}`;
                    element.value = formattedDate;
                    this.campaignTypeForm.patchValue({
                        startDate: formattedDate,
                    });
                } else {
                    adjustedDate = new Date(now);
                    adjustedDate.setDate(now.getDate() + 30);
                }

                // Format date to yyyy-MM-ddThh:mm
                const year = adjustedDate.getFullYear();
                const month = String(adjustedDate.getMonth() + 1).padStart(2, '0');
                const day = String(adjustedDate.getDate()).padStart(2, '0');
                const hours = String(adjustedDate.getHours()).padStart(2, '0');
                const minutes = String(adjustedDate.getMinutes()).padStart(2, '0');

                const formattedDate = `${year}-${month}-${day}`;
                element.value = formattedDate;
                this.campaignTypeForm.patchValue({
                    endDate: formattedDate,
                });
            });
        }
    }

    nextPage() {
        const usersSelectedFromTenantUnit = this.selectedTenantUnitsUsers.flatMap(user => ({ 
            name: user.label, 
            id: user.key, 
            isParent: !!user.children 
        }));
    
        const usersSelectedFromTenantGroups = this.selectedGroupsWithUsersVII.flatMap(user => ({ 
            name: user.label, 
            id: user.key, 
            isParent: !!user.children 
        }));
    
        const usersSelected = this.users.flatMap(user => ({ 
            name: user.name, 
            id: user.id, 
            isParent: false 
        }));
    
        const data = [
            { item: 'campaignType', data: this.campaignTypeForm.value },
            { item: 'type', data: this.campaignTypeForm.value.type },
            { 
                item: 'campaignUsers', 
                data: this.selectUsersValue === 1 
                    ? usersSelected 
                    : this.selectUsersValue === 2 
                        ? usersSelectedFromTenantUnit 
                        : this.selectUsersValue === 3 
                            ? usersSelectedFromTenantGroups 
                            : []  
            },
            { item: 'selectUsersValue', data: this.selectUsersValue },
        ];
    
        // Save each item to local storage
        data.forEach((c) => {
            this.localstorageService.setItem(c.item, c.data);
        });
    
        // Determine number of users selected without parents and show success message
        const selectedUserCount = (
            this.selectUsersValue === 1 
                ? usersSelected 
                : this.selectUsersValue === 2 
                    ? usersSelectedFromTenantUnit 
                    : this.selectUsersValue === 3 
                        ? usersSelectedFromTenantGroups 
                        : []
        ).filter((c) => !c.isParent).length;
    
        if (selectedUserCount){

            this.messageService.add({
                severity: 'success',
                summary: 'Info',
                detail: `You selected ${selectedUserCount} user(s) to schedule`,
                life: 3000,
            });
            
            // Navigate to the next page
            this.router.navigate(['campaign-management/create/campaign-build']);
        }else{
            this.messageService.add({
                severity: 'info',
                summary: 'Info',
                detail: `please selecte users to schedule`,
                life: 3000,
            });
        }
    }    

    initiateForm() {
        const startDate = new Date();
        this.campaignTypeForm = new FormGroup({
            name: new FormControl<string>('', [Validators.required]),
            type: new FormControl<string>('', [Validators.required]),
            startDate: new FormControl<Date>(new Date(), [Validators.required]),
            endDate: new FormControl<Date>(this.addDays(startDate, 30), [Validators.required]),
            awarenessCampaignLanguageEmails: new FormGroup({}),
        });
    }

    addDays(date: Date, days: number): Date {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }

    addLanguageControls() {
        const languageControls = this.campaignTypeForm.get('awarenessCampaignLanguageEmails') as FormGroup;

        this.activeLanguages.forEach((language) => {
            const languageFormGroup = new FormGroup({
                awarenessCampaignEmailContentHtml: new FormControl<string>(''),
                awarenessCampaignEmailSubject: new FormControl<string>(''),
                languageId: new FormControl<string>(language.id),
            });

            languageControls.addControl(language.code, languageFormGroup);
        });
    }

    getLanguageFormGroup(code: string): FormGroup | null {
        const languageControls = this.campaignTypeForm.get('awarenessCampaignLanguageEmails') as FormGroup;
        return languageControls.get(code) as FormGroup | null;
    }

    filterUsersBeforSendThemToTarget(event: PickListMoveAllToTargetEvent) {
        this.targetUsers = this.chooseUniquUsersIfUsersDuplicatedAndMakePiorityForUserFromTenantGroup(event.items);
    }

    filterUserBeforSendHimToTarget(event: PickListMoveToTargetEvent) {
        this.targetUsers = this.chooseUniquUsersIfUsersDuplicatedAndMakePiorityForUserFromTenantGroup(this.targetUsers);
    }

    chooseUniquUsersIfUsersDuplicatedAndMakePiorityForUserFromTenantGroup(data: any): any[] {
        const idMap = new Map<string, any>();
        const ids = data?.map((x: any) => {
            return x.id;
        });
        data.forEach((item: any) => {
            if (idMap.has(item.id)) {
                const existingItem = idMap.get(item.id);
                if (!existingItem.tenantGroupId && item.tenantGroupId) {
                    idMap.set(item.id, item);
                }
            } else {
                idMap.set(item.id, item);
            }
        });

        const uniqueArray = Array.from(idMap.values());
        return uniqueArray;
    }

    onCampaignTypeChange(event: DropdownChangeEvent) {
        if (event.value === 1) {
            this.isDataTypeTraining = true;
        } else {
            this.isDataTypeTraining = false;
        }
    }

    onDropDownChange(event: MultiSelectChangeEvent, from: string) {
        this.ids = [];
        this.mixedUsers = [];

        if (from === 'u') {
            this.userIds = [];
            this.userIds = this.usersSelected.map((c) => c.id!);
        }

        if (from === 'g') {
            this.groupIds = [];
            this.groupIds = this.groupsSelected.map((c) => c.id);
        }

        this.updateMixedUsers();
    }

    onSelectAllChange(event: MultiSelectSelectAllChangeEvent, from: string) {
        this.ids = [];
        this.mixedUsers = [];

        if (from === 'u') {
            this.userIds = [];
            this.selectAllUsers = event.checked;
            this.usersSelected = event.checked ? [...this.users] : [];
            this.userIds = this.usersSelected.map((c) => c.id!);
        }

        if (from === 'g') {
            this.groupIds = [];
            this.selectAllGroups = event.checked;
            this.groupsSelected = event.checked ? [...this.groups] : [];
            this.groupIds = this.groupsSelected.map((c) => c.id);
        }

        this.updateMixedUsers();
    }

    updateMixedUsers() {
        this.ids.push(...this.userIds);
        this.ids.push(...this.groupIds);

        const data1 = this.users.filter((x) => this.ids.includes(x.id!));
        const data2 = this.groupsWithUsers.filter((x) => this.ids.includes(x.tenantGroupId!));

        data1.forEach((user) => {
            if (!this.mixedUsers.some((u) => u.id === user.id)) {
                this.mixedUsers.push(user);
            }
        });
        data2.forEach((groupUser) => {
            // if (!this.mixedUsers.some(g => g.tenantGroupId === groupUser.tenantGroupId)) {
            this.mixedUsers.push(groupUser);
            // }
        });
    }

    onEndDateChange(event: any) {
        if (event.target.value) {
            const selectedEndDate = new Date(event.target.value);
            const startDate = this.campaignTypeForm.value.startDate
                ? new Date(this.campaignTypeForm.value.startDate)
                : new Date();
            if (selectedEndDate > startDate) {
                this.isDateInvalid = false;
            } else {
                this.isDateInvalid = true;
            }
        }
    }

    onStartDateChange(event: any) {
        const now = new Date();
        const selectedStartDate = new Date(event.target.value);

        if (selectedStartDate < now) {
            // Update start date to be at least the current date
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');

            const formattedDate = `${year}-${month}-${day}`;

            this.campaignTypeForm.patchValue({
                startDate: formattedDate,
            });

            // Show the message
            this.showInvalidDateMessage = true;
        } else {
            // Hide the message if the date is valid
            this.showInvalidDateMessage = false;
        }

        setTimeout(() => {
            this.showInvalidDateMessage = false;
        }, 2000);
    }

    onSelectStartDateValue(event: any) {
        const now = new Date();
        const selectedStartDate = new Date(event);

        if (selectedStartDate < now) {

            this.campaignTypeForm.patchValue({
                startDate: selectedStartDate,
            });

            // Show the message
            this.showInvalidDateMessage = true;
        } else {
            // Hide the message if the date is valid
            this.showInvalidDateMessage = false;
        }

        setTimeout(() => {
            this.showInvalidDateMessage = false;
        }, 2000);
    }

    onSelectEndDateValue(event: any) {
        if (event) {
            const selectedEndDate = new Date(event);
            const startDate = this.campaignTypeForm.value.startDate
                ? new Date(this.campaignTypeForm.value.startDate)
                : new Date();
            if (selectedEndDate > startDate) {
                this.isDateInvalid = false;
            } else {
                this.isDateInvalid = true;
            }
        }
    }

    onSelectUsersOptionsChange(event: SelectButtonChangeEvent) {
        switch (event.value) {
            case 1:
                this.unitsUsers = false;
                this.groupsUsers = false;
                break;
            case 2:
                this.unitsUsers = true;
                this.groupsUsers = false;
                break;
            case 3:
                this.unitsUsers = false;
                this.groupsUsers = true;
                break;
            default:
                this.unitsUsers = false;
                this.groupsUsers = false;
                break;
        }
    }

    onSelectUsersOptionsValue() {
        const value = this.localstorageService.getItem('selectUsersValue');
        if (value) {
            this.selectUsersValue = value;
            switch (this.selectUsersValue) {
                case 1:
                    this.unitsUsers = false;
                    this.groupsUsers = false;
                    break;
                case 2:
                    this.unitsUsers = true;
                    this.groupsUsers = false;
                    break;
                case 3:
                    this.unitsUsers = false;
                    this.groupsUsers = true;
                    break;
                default:
                    this.unitsUsers = false;
                    this.groupsUsers = false;
                    break;
            }
        }
    }
}