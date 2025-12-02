import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Table, TableLazyLoadEvent } from 'primeng/table';
import { IAwarenessCampaignModel } from '../../models/IAwarenessCampaignModel';
import { InputSwitchChangeEvent } from 'primeng/inputswitch';
import { CampaignManagementService } from '../../services/campaign-management.service';
import { IAspNetPageItemModel } from 'src/app/modules/page-management/models/IAspNetPageItemModel';
import { PermessionsService } from 'src/app/core/Services/permessions.service';
import { LocalStorageService } from 'src/app/core/Services/local-storage.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DropdownChangeEvent } from 'primeng/dropdown';
import { IUserModel } from 'src/app/modules/user/models/IUserModel';
import { MultiSelectChangeEvent, MultiSelectSelectAllChangeEvent } from 'primeng/multiselect';
import { ITenantGroupModel } from 'src/app/modules/tenantgroup/models/ITenantGroupModel';
import { PickListMoveAllToTargetEvent, PickListMoveToTargetEvent } from 'primeng/picklist';
import { MenuItem, MessageService, TreeNode } from 'primeng/api';
import { Subscription } from 'rxjs';
import { constants } from 'src/app/core/constatnts/constatnts';
import { TranslationService } from 'src/app/core/Services/translation.service';
import { TableLoadingService } from 'src/app/core/Services/table-loading.service';
import { ITenantUnitModel } from 'src/app/modules/tenant-unit/models/ITenantUnitModel';
import { SelectButtonChangeEvent } from 'primeng/selectbutton';
import { IPaginationModel } from 'src/app/core/Dtos/IPaginationModel';

@Component({
    selector: 'app-campaign-listing',
    templateUrl: './campaign-listing.component.html',
    styleUrl: './campaign-listing.component.scss',
})
export class CampaignListingComponent implements OnInit, OnDestroy {
    tableLoadingSpinner: boolean = true;
    unsubscribe: Subscription[] = [];
    campaignTypeForm: FormGroup;
    campiagns: IAwarenessCampaignModel[] = [];
    pagePermessions: IAspNetPageItemModel[] = [];
    actions = constants.pageActions;
    activationDialog: boolean = false;
    deleteDialog: boolean = false;
    editeDialog: boolean = false;
    lessonsDialog: boolean = false;
    isDataTypeTraining: boolean = true;
    users: IUserModel[] = [];
    usersSelected: IUserModel[] = [];
    mixedUsers: IUserModel[] = [];
    groupIds: string[] = [];
    userIds: string[] = [];
    targetUsers: IUserModel[] = [];
    groups: ITenantGroupModel[] = [];
    groupsSelected: ITenantGroupModel[] = [];
    activeLanguages: any[] = [];
    groupsWithUsers: IUserModel[] = [];
    tenantUnitsWithUsers: ITenantUnitModel[] = [];
    tenantUnitsUsersTree: TreeNode[] = [];
    ids: string[] = [];
    selectAllUsers: boolean = false;
    selectAllGroups: boolean = false;
    isDateInvalid: boolean = false;
    campaignDataForEdit: any;
    currentSelected: IAwarenessCampaignModel = {
        isActive: false,
        name: '',
        lessonIds: [],
        campaignType: 0,
        id: '',
        awarenessCampaignLanguageEmails: [],
        users: [],
    };
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
    originalCampaignUsers: any[] = [];
    menuItems: MenuItem[] = [];

    selectUsersOptions: any[] = [];
    selectUsersValue: number = 1;

    unitsUsers: boolean = false;
    groupsUsers: boolean = false;

    groupsWithUsersVII: ITenantGroupModel[] = [];
    groupsWithUsersVIITree: TreeNode[] = [];
    selectedTenantUnitsUsers: TreeNode[] = [];
    selectedGroupsWithUsersVII: TreeNode[] = [];

    totalRecords: number = 0;
    pagination: IPaginationModel = {
        page: 0,
        size: 10,
        searchQuery: '',
    };

    constructor(
        private router: Router,
        private apiService: CampaignManagementService,
        private permessionService: PermessionsService,
        private messageService: MessageService,
        private cdr: ChangeDetectorRef,
        private translate: TranslationService,
        private tableLoadingService: TableLoadingService
    ) {
        this.pagePermessions = this.permessionService.getPagePermessions(constants.pages.campaignManagement);
    }

    ngOnInit(): void {
        this.tableLoadingService.loading$.subscribe((isLoading) => {
            this.tableLoadingSpinner = isLoading;
        });

        this.assigneButtonsMenu();
        this.initiateEditCampaignForm();
    }

    assigneCurrentSelect(campaign: IAwarenessCampaignModel) {
        this.currentSelected = campaign;
    }

    assigneButtonsMenu(){
        const editBtn = {
            label: this.translate.getInstant('shared.actions.edit'),
            icon: 'pi pi-fw pi-user-edit',
            command: () => this.openEditDialog(this.currentSelected),
        };
        const deleteBtn = {
            label: this.translate.getInstant('shared.actions.delete'),
            icon: 'pi pi-fw pi-trash',
            command: () => this.openDeleteDialog(this.currentSelected),
        };
        this.menuItems = [];
        if (this.hasPermission(this.actions.edit)) {
            this.menuItems.push(editBtn);
        }
        if (this.hasPermission(this.actions.delete)) {
            this.menuItems.push(deleteBtn);
        }
    }

    onLazyLoad(event: any) {
        this.pagination.searchQuery = event.globalFilter || '';
        this.pagination.page = event.first / event.rows;
        this.pagination.size = event.rows;
        this.fetchCampaigns();
    }

    fetchCampaigns() {
        this.tableLoadingService.show();
        const sub = this.apiService.getAllCampaign(this.pagination).subscribe({
            next: (res) => {
                this.campiagns = res.data;
                this.totalRecords = res.totalRecords;
                this.tableLoadingService.hide();
            },
        });
        this.unsubscribe.push(sub);
    }

    fetchTenantUnitsWithUsers() {
        const sub = this.apiService.getAllTenantUnitsWithUsers().subscribe({
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
                        selectable : true
                    })),
                })) ?? [];

                this.assigneAlredyExistingTenantUsers();
            },
            error: (error) => {

            },
        });
        this.unsubscribe.push(sub);
    }

    fetchTenantGroupsWithUsers() {
        const sub = this.apiService.getAllTenantGroupsWithUsers().subscribe({
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
                        selectable : true
                    })),
                })) ?? [];
                this.assigneAlredyExistingGroupUsers();
            },
            error: (error) => { },
        });
        this.unsubscribe.push(sub);
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    navigateToCreateNewCampaign() {
        this.router.navigate(['campaign-management/create']);
    }

    getCampaignTypeName(type: number): string {
        let t = this.types.find((x: any) => x.code === type);
        return t.name;
    }

    openDeleteDialog(campaign: IAwarenessCampaignModel) {
        this.deleteDialog = true;
        this.currentSelected = campaign;
    }

    openActivationDialog(campaign: IAwarenessCampaignModel, e: InputSwitchChangeEvent) {
        this.activationDialog = true;
        this.currentSelected = campaign;
    }

    openLessonsDialog(campaign: IAwarenessCampaignModel) {
        this.lessonsDialog = true;
        this.currentSelected = campaign;
        this.apiService.getLessonsByIds(this.currentSelected.lessonIds).subscribe({
            next: (res) => { },
            error: (err) => { },
        });
    }

    openEditDialog(campaign: any) {
        this.currentSelected = campaign;
        this.fetchCampaignData(campaign.id!);
        this.fetchTenantUnitsWithUsers()
        this.fetchTenantGroupsWithUsers();
        this.selectUsersOptions = [
            { name: this.translate.getInstant('campaign-management.campaign-create.campaign-type.fields.departments'), value: 1, icon: 'fa fa-qrcode' },
            { name: this.translate.getInstant('campaign-management.campaign-create.campaign-type.fields.groupss'), value: 2, icon: 'fa fa-building' }
        ];
        this.editeDialog = true;
        this.cdr.detectChanges();
    }

    assigneAlredyExistingTenantUsers(): void {
        if (this.currentSelected.usersSource !== 2) {
            return;
        }

        const selectedTenantUnitsUsers: any[] = [];
        const tenantUnitsUsersMap = new Map(
            this.tenantUnitsWithUsers.flatMap(unit => unit.users?.map(user => [user.id, { ...user, isDisabled: true }]) || [])
        );

        const parents = this.tenantUnitsUsersTree.filter(z => z.children !== null);
        const childrens: any[] = [];
        this.tenantUnitsUsersTree.forEach(z => {
            if (z.children) {
                childrens.push(...z.children);
            }
        });

        // Assign users
        this.currentSelected.users?.forEach(userId => {
            if (userId && tenantUnitsUsersMap.has(userId)) {
                const user = tenantUnitsUsersMap.get(userId);
                if (user) {
                    selectedTenantUnitsUsers.push(user);
                }
            }
        });

        // Get parents and children
        const existingParents = parents?.filter((item) =>
            selectedTenantUnitsUsers.map((user: any) => user?.name).includes(item.label)
        );

        const existingChildren = childrens?.filter((item) =>
            selectedTenantUnitsUsers.map((user: any) => user?.name).includes(item.label)
        );

        this.selectedTenantUnitsUsers.push(...existingParents);
        this.selectedTenantUnitsUsers.push(...existingChildren);

        // Mark users as disabled
        this.selectedTenantUnitsUsers.forEach(user => (user.selectable = false));
        this.tenantUnitsUsersTree.forEach((node) => {
            this.expandRecursive(node, true);
        });
    }

    assigneAlredyExistingGroupUsers(): void {

        if (this.currentSelected.usersSource !== 3) {
            return;
        }

        const selectedGroupsWithUsers: any[] = [];
        const groupsWithUsersMap = new Map(
            this.groupsWithUsersVII.flatMap(group => group.users?.map(user => [user.id, { ...user, isDisabled: true }]) || [])
        );

        const parents = this.groupsWithUsersVIITree.filter(z => z.children !== null);
        const childrens: any[] = [];
        this.groupsWithUsersVIITree.forEach(z => {
            if (z.children) {
                childrens.push(...z.children);
            }
        });

        // Assign users
        this.currentSelected.users?.forEach(userId => {
            if (userId && groupsWithUsersMap.has(userId)) {
                const user = groupsWithUsersMap.get(userId);
                if (user) {
                    selectedGroupsWithUsers.push(user);
                }
            }
        });

        // Get parents and children
        const existingParents = parents?.filter((item) =>            
            selectedGroupsWithUsers.map((user: any) => user?.name).includes(item.label)
        );

        const existingChildren = childrens?.filter((item) =>
            selectedGroupsWithUsers.map((user: any) => user?.name).includes(item.label)
        );

        this.selectedGroupsWithUsersVII.push(...existingParents);
        this.selectedGroupsWithUsersVII.push(...existingChildren);

        // Mark users as disabled
        this.selectedGroupsWithUsersVII.forEach(user => (user.selectable = false));

        this.groupsWithUsersVIITree.forEach((node) => {
            this.expandRecursive(node, true);
        });
    }

    expandRecursive(node: TreeNode, isExpand: boolean) {
        node.expanded = isExpand;
    }

    onSelectUsersOptionsChange(event: SelectButtonChangeEvent) {
        switch (event.value) {
            case 1:
                this.unitsUsers = true;
                this.groupsUsers = false;
                break;
            case 2:
                this.unitsUsers = false;
                this.groupsUsers = true;
                break;
            default:
                this.unitsUsers = false;
                this.groupsUsers = false;
                break;
        }
    }

    fetchCampaignData(id: string) {
        const sub = this.apiService.getCampaignById(id).subscribe({
            next: (res) => {
                this.assigneCampaignUsers(res.data);
                this.campaignDataForEdit = res.data?.awarenessCampaign;

                const formatDate = (dateStr: string | null) => {
                    if (!dateStr) return null;
                    const date = new Date(dateStr);
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    return `${year}-${month}-${day}`;
                };

                this.campaignTypeForm.patchValue({
                    name: this.campaignDataForEdit.name,
                    type: this.campaignDataForEdit.type,
                    startDate: formatDate(this.campaignDataForEdit.startDate),
                    endDate: formatDate(this.campaignDataForEdit.endDate),
                });
                this.disableEditCampaignTypeForm();
            },
            error: (err) => { },
        });
        this.unsubscribe.push(sub);
    }

    assigneCampaignUsers(data: any) {
        const usersIds = new Set<string>();
        const usersFromGroupsIds = new Set<string>();
        this.originalCampaignUsers = data?.awarenessCampaignUser;
        for (const user of data?.awarenessCampaignUser || []) {
            if (user?.tenantGroupId === null) {
                usersIds.add(user?.userId);
            } else {
                usersFromGroupsIds.add(user?.userId);
            }
        }

        const users = this.users.filter((user) => usersIds.has(user.id!));
        const usersFromGroups = this.groupsWithUsers.filter((group) => usersFromGroupsIds.has(group.id!));
        this.targetUsers = [...users, ...usersFromGroups];
    }

    initiateEditCampaignForm() {
        this.campaignTypeForm = new FormGroup({
            name: new FormControl<string>('', [Validators.required]),
            type: new FormControl<string>('', [Validators.required]),
            startDate: new FormControl<Date>(new Date(), [Validators.required]),
            endDate: new FormControl<Date>(new Date(), [Validators.required]),
        });
    }

    onEndDateChange(event: any) {
        if (event.target.value) {
            const selectedDate = new Date(event.target.value);
            const currentEndDate = this.currentSelected.endDate ? new Date(this.currentSelected.endDate) : new Date();
            if (selectedDate >= currentEndDate) {
                this.isDateInvalid = false;
            } else {
                this.isDateInvalid = true;
            }
        }
    }

    onSelectEndDateValue(event: any) {
        if (event) {
            const selectedDate = new Date(event);
            const currentEndDate = this.currentSelected.endDate ? new Date(this.currentSelected.endDate) : new Date();
            if (selectedDate >= currentEndDate) {
                this.isDateInvalid = false;
            } else {
                this.isDateInvalid = true;
                setTimeout(() => {
                    this.campaignTypeForm.patchValue({
                        endDate: new Date(this.campaignDataForEdit.endDate),
                    });
                }, 1000);
            }
        }
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
            if (!this.mixedUsers.some((g) => g.tenantGroupId === groupUser.tenantGroupId)) {
                this.mixedUsers.push(groupUser);
            }
        });
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

    delete() {
        this.apiService.deleteCampaign(this.currentSelected.id!).subscribe({
            next: (res) => {
                this.fetchCampaigns();
                this.deleteDialog = false;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'campaign deleted successfully',
                    life: 3000,
                });
            },
            error: (error) => { },
        });
    }

    activation(value: boolean) {
        if (value) {
            const sub = this.apiService.activeCampaign(this.currentSelected.id!).subscribe({
                next: (res) => {
                    this.fetchCampaigns();
                    this.activationDialog = false;
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'campaign activated successfully',
                        life: 3000,
                    });
                },
                error: (error) => { },
            });
            this.unsubscribe.push(sub);
        } else {
            const sub = this.apiService.deActiveCampaign(this.currentSelected.id!).subscribe({
                next: (res) => {
                    this.fetchCampaigns();
                    this.activationDialog = false;
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'campaign deactivated successfully',
                        life: 3000,
                    });
                },
                error: (error) => { },
            });
            this.unsubscribe.push(sub);
        }
    }

    hideDialog() {
        this.editeDialog = false;
        this.cdr.detectChanges();
    }

    edit() {
        this.enableEditCampaignTypeForm();

        const newUsersFromTenantUnits = this.selectUsersValue == 1
            ? this.selectedTenantUnitsUsers
                .filter(c => !c?.children && c.selectable)
                .map(c => {
                    return {  userId: c?.key, tenantGroupId: null}
                })
            : [];

        const newUsersFromTenantGroups = this.selectUsersValue == 2
            ? this.selectedGroupsWithUsersVII
                .filter(c => !c?.children && c.selectable)
                .map(c => {
                  return {  userId: c?.key, tenantGroupId: c?.parent?.key ?? null}
                })
            : [];

        const backObject = {
            id: this.currentSelected.id,
            usersSource: this.selectUsersValue + 1,
            endDate: this.campaignTypeForm.value.endDate,
            awarenessCampaignUsers: this.selectUsersValue == 1 ? newUsersFromTenantUnits : newUsersFromTenantGroups,
        };

        this.disableEditCampaignTypeForm();
        const sub = this.apiService.updateCampaign(backObject).subscribe({
            next: (res) => {
                this.hideDialog();
                this.fetchCampaigns();
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'campaign updated successfully',
                });
            },
            error: (e) => { },
        });
        this.unsubscribe.push(sub);
        this.cdr.detectChanges();
    }

    disableEditCampaignTypeForm() {
        Object.keys(this.campaignTypeForm.controls).forEach((controlName) => {
            if (controlName !== 'endDate') {
                this.campaignTypeForm.controls[controlName].disable();
            }
        });
    }

    enableEditCampaignTypeForm() {
        Object.keys(this.campaignTypeForm.controls).forEach((controlName) => {
            this.campaignTypeForm.controls[controlName].enable();
        });
    }

    hasPermission(controlKey: string): boolean {
        return this.pagePermessions.some((p) => p.controlKey === controlKey);
    }

    ngOnDestroy(): void {
        this.unsubscribe.forEach((u) => {
            u.unsubscribe();
        });
    }
}