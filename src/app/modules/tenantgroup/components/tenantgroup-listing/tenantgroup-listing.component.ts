import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { TenantGroupService } from '../../services/tenant-group.service';
import { ITenantGroupModel } from '../../models/ITenantGroupModel';
import { Table } from 'primeng/table';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IUserModel } from 'src/app/modules/user/models/IUserModel';
import { MessageService } from 'primeng/api';
import { IAspNetPageItemModel } from 'src/app/modules/page-management/models/IAspNetPageItemModel';
import { PermessionsService } from 'src/app/core/Services/permessions.service';
import { constants } from 'src/app/core/constatnts/constatnts';
import { AdSyncService } from 'src/app/core/Services/ad-sync.service';
import { Router } from '@angular/router';
import { TableLoadingService } from 'src/app/core/Services/table-loading.service';
import { IPaginationModel } from 'src/app/core/Dtos/IPaginationModel';
import { DropdownListDataSourceService } from 'src/app/core/Services/dropdown-list-data-source.service';

@Component({
    selector: 'app-tenantgroup-listing',
    templateUrl: './tenantgroup-listing.component.html',
    styleUrl: './tenantgroup-listing.component.scss',
})
export class TenantgroupListingComponent implements OnInit, OnDestroy {
    tableLoadingSpinner: boolean = true;

    pagePermessions: IAspNetPageItemModel[] = [];
    actions = constants.pageActions;
    unsubscribe: Subscription[] = [];
    deleteDialog: boolean = false;
    editeDialog: boolean = false;
    activationDialog: boolean = false;
    adSyncBtn: boolean = false;
    addDialog: boolean = false;
    users: IUserModel[] = [];
    toggleControls: { [key: string]: FormControl } = {};
    currentSelected: ITenantGroupModel = {
        id: '',
        members: [],
        isActive: false,
        name: '',
    };
    groups: ITenantGroupModel[] = [];
    groupAddForm!: FormGroup;
    groupEditForm!: FormGroup;
    filteredData: any[] = [];
    totalRecords: number = 0;
    pagination: IPaginationModel = {
        page: 0,
        size: 10,
        searchQuery: '',
    };
    constructor(
        private apiService: TenantGroupService,
        private messageService: MessageService,
        private permessionService: PermessionsService,
        private tableLoadingService: TableLoadingService,
        private router: Router,
        private adSyncService: AdSyncService,
        private dropdownListDataSourceService: DropdownListDataSourceService
    ) {
        this.pagePermessions = this.permessionService.getPagePermessions(constants.pages.tenantGroup);
    }

    ngOnInit(): void {
        this.tableLoadingService.loading$.subscribe((isLoading) => {
            this.tableLoadingSpinner = isLoading;
        });

        this.initiateAddForm();
        this.initiateEditeForm();
        this.fetchUsersForGroups();
        this.isADDataCompleted();
    }

    onLazyLoad(event: any) {
        this.pagination.page = event.first / event.rows;
        this.pagination.size = event.rows;
        this.pagination.searchQuery = event.globalFilter || '';
        this.fetchGroups();
    }

    fetchGroups() {
        this.tableLoadingService.show();

        const sub = this.apiService.getTenantGroups(this.pagination).subscribe({
            next: (response) => {
                this.groups = response.data;
                this.totalRecords = response.totalRecords;
                this.groups?.forEach((group) => {
                    this.toggleControls[group.id!] = new FormControl(group.isActive);
                });
                this.tableLoadingService.hide();
            },
            error: (error) => {},
        });
        this.unsubscribe.push(sub);
    }

    fetchUsersForGroups() {
        const sub = this.dropdownListDataSourceService.getTenantUsers().subscribe((result) => {
            this.users = result.data;
        });
        this.unsubscribe.push(sub);
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    navigateToCreate() {
        this.addDialog = true;
        this.initiateAddForm();
    }

    openEditDialog(group: ITenantGroupModel) {
        this.editeDialog = true;
        this.currentSelected = group;
        const sub = this.apiService.getTenantGroupMembers(group.id).subscribe((resp) => {
            this.groupEditForm.patchValue({
                nameGroupToEdit: group.name,
                membersToEdit: resp.data.map((r: any) => {
                    return r.id;
                }),
            });
        });
        this.unsubscribe.push(sub);
    }

    onCancelActivationDialog() {
        this.activationDialog = false;
        this.toggleControls[this.currentSelected.id!].setValue(this.currentSelected.isActive);
    }

    openDeleteDialog(group: ITenantGroupModel) {
        this.deleteDialog = true;
        this.currentSelected = group;
    }

    openActivationDialog(group: ITenantGroupModel) {
        this.activationDialog = true;
        this.currentSelected = group;
    }

    hideDialog() {
        this.editeDialog = false;
    }

    onSubmit() {
        if (this.groupAddForm.valid) {
            const newGroup: ITenantGroupModel = {
                id: '',
                name: this.groupAddForm.value.nameGroupToAdd,
                isActive: true,
                members: this.groupAddForm.value.membersToAdd,
            };

            const sub = this.apiService.createTenantGroup(newGroup).subscribe({
                next: (res) => {
                    this.fetchGroups();
                    this.addDialog = false;
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'group added successfully',
                    });
                },
                error: (error) => {},
            });
            this.unsubscribe.push(sub);
        }
    }

    edit() {
        if (this.groupEditForm.valid) {
            const newGroup: ITenantGroupModel = {
                id: this.currentSelected.id,
                name: this.groupEditForm.value.nameGroupToEdit,
                isActive: true,
                members: this.groupEditForm.value.membersToEdit,
            };
            const sub = this.apiService.updateTenantGroup(newGroup).subscribe({
                next: (res) => {
                    this.fetchGroups();
                    this.hideDialog();
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'group updated successfully',
                    });
                },
                error: (error) => {},
            });
            this.unsubscribe.push(sub);
        }
    }

    activation(value: boolean) {
        if (value) {
            const sub = this.apiService.activeTenantGroupById(this.currentSelected.id!).subscribe({
                next: (res) => {
                    this.fetchGroups();
                    this.activationDialog = false;
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'group activated successfully',
                        life: 3000,
                    });
                },
                error: (error) => {},
            });
            this.unsubscribe.push(sub);
        } else {
            const sub = this.apiService.deActiveTenantGroupById(this.currentSelected.id!).subscribe({
                next: (res) => {
                    this.fetchGroups();
                    this.activationDialog = false;
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'group deactivated successfully',
                        life: 3000,
                    });
                },
                error: (error) => {},
            });
            this.unsubscribe.push(sub);
        }
    }

    delete() {
        const sub = this.apiService.deleteTenantGroup(this.currentSelected.id!).subscribe({
            next: (res) => {
                this.ngOnInit();
                this.deleteDialog = false;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'group deleted successfully',
                    life: 3000,
                });
            },
            error: (error) => {},
        });
        this.unsubscribe.push(sub);
    }

    initiateAddForm() {
        this.groupAddForm = new FormGroup({
            nameGroupToAdd: new FormControl<string>('', [Validators.required]),
            membersToAdd: new FormControl<string[]>([]),
        });
    }

    initiateEditeForm() {
        this.groupEditForm = new FormGroup({
            nameGroupToEdit: new FormControl<string>('', [Validators.required]),
            membersToEdit: new FormControl<string[]>([]),
        });
    }

    hasPermission(controlKey: string): boolean {
        return this.pagePermessions.some((p) => p.controlKey === controlKey);
    }

    syncADGroups() {
        if (!this.adSyncBtn) {
            this.messageService.add({
                severity: 'info',
                summary: 'Info',
                detail: 'please fill data in AD tap',
                life: 3000,
            });

            setTimeout(() => {
                this.router.navigate(['/users/profile']);
            }, 1000);
            return;
        }

        this.adSyncService.syncADOUs().subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Groups(OUs) synchronized successfully',
                    life: 3000,
                });
                this.fetchGroups();
            },
            error: (e) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error occurred while synchronizing groups',
                    life: 3000,
                });
            },
        });
    }

    isADDataCompleted() {
        const sub = this.apiService.isADDataCompleted().subscribe({
            next: (re) => {
                this.adSyncBtn = re.isSuccess ? true : false;
            },
        });
        this.unsubscribe.push(sub);
    }

    ngOnDestroy(): void {
        this.unsubscribe.forEach((u) => {
            u.unsubscribe();
        });
    }
}
