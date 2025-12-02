import { Component, OnDestroy, OnInit } from '@angular/core';
import { IRoleModel } from 'src/app/modules/role/models/IRoleModel';
import { RoleService } from '../../services/role.service';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { IAspNetPageModel } from 'src/app/modules/page-management/models/IAspNetPageModel';
import { IUserModel } from 'src/app/modules/user/models/IUserModel';
import { MenuItem, MessageService } from 'primeng/api';
import { IAspNetPageItemModel } from 'src/app/modules/page-management/models/IAspNetPageItemModel';
import { PermessionsService } from 'src/app/core/Services/permessions.service';
import { constants } from 'src/app/core/constatnts/constatnts';
import { TranslationService } from 'src/app/core/Services/translation.service';
import { TableLoadingService } from 'src/app/core/Services/table-loading.service';
import { IPaginationModel } from 'src/app/core/Dtos/IPaginationModel';

@Component({
    selector: 'app-role-listing',
    templateUrl: './role-listing.component.html',
    styleUrl: './role-listing.component.scss',
})
export class RoleListingComponent implements OnInit, OnDestroy {
    tableLoadingSpinner: boolean = true;

    pagePermessions: IAspNetPageItemModel[] = [];
    actions = constants.pageActions;
    roles: IRoleModel[] = [];
    users: IUserModel[] = [];
    permessions: IAspNetPageModel[] = [];
    currentSelected: IRoleModel = {
        id: '',
        isActive: false,
        isTenantRole: false,
        isTenantAdministratorRole: false,
        name: '',
        permessions: [],
        permissionsCount: 0,
        users: [],
        usersCount: 0,
        created_at: '',
        updated_at: '',
    };
    unsubscribe: Subscription[] = [];
    deleteDialog: boolean = false;
    editeDialog: boolean = false;
    addDialog: boolean = false;
    activationDialog: boolean = false;
    usersWithinRoleDialog: boolean = false;
    roleDialog: boolean = false;
    hederText: string = '';
    permessionsForAdd: IAspNetPageModel[] = [];
    roleModel: IRoleModel = {
        name: '',
        permissionsCount: 0,
        users: [],
        usersCount: 0,
        permessions: [],
        id: '',
        isActive: false,
        isTenantRole: false,
        isTenantAdministratorRole: false,
    };
    menuItems: MenuItem[] = [];
    totalRecords: number = 0;
    pagination : IPaginationModel = {
        page:0,
        size:10,
        searchQuery:''
    }

    get isAddFormValid(): boolean {
        return this.roleModel.name.trim() !== '' && this.roleModel.permessions.length > 0;
    }

    get isEditFormValid(): boolean {
        return this.currentSelected.name.trim() !== '' && this.currentSelected.permessions.length > 0;
    }

    constructor(
        private apiService: RoleService,
        private permessionService: PermessionsService,
        private messageService: MessageService,
        private translate: TranslationService,
        private tableLoadingService: TableLoadingService
    ) {
        this.pagePermessions = this.permessionService.getPagePermessions(constants.pages.role);
    }

    ngOnInit(): void {
        this.tableLoadingService.loading$.subscribe((isLoading) => {
            this.tableLoadingSpinner = isLoading;
        });

        this.assigneMenuItems();
        this.fetchPages();
    }

    assigneMenuItems() {
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

    assigneCurrentSelect(role: IRoleModel) {
        this.currentSelected = role;
    }

    onLazyLoad(event: any) {
        this.pagination.page = event.first / event.rows;
        this.pagination.size = event.rows;
        this.pagination.searchQuery = event.globalFilter || '';
        this.fetchRoles();
    }

    fetchRoles() {
        this.tableLoadingService.show();
        const sub = this.apiService.getAllRoles(this.pagination).subscribe({
            next: (res) => {
                this.roles = res.data;
                this.totalRecords = res.totalRecords;
                this.tableLoadingService.hide();
            },
            error: (err) => { },
        });
        this.unsubscribe.push(sub);
    }

    fetchPages() {
        this.tableLoadingService.show();
        const sub = this.apiService.getAllPagesWithItems().subscribe({
            next: (res) => {
                this.permessions = res;
                this.permessionsForAdd = res;
                this.tableLoadingService.hide();
            },
            error: (err) => { },
        });
        this.unsubscribe.push(sub);
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    navigateToCreateUser() {
        this.addDialog = true;
    }

    openEditDialog(role: IRoleModel) {
        this.editeDialog = true;
        const sub = this.apiService.getRoleByIdWithPermession(role.id).subscribe((role) => {
            this.currentSelected = role;
        });
        this.unsubscribe.push(sub);
    }

    openUsersDialog(role: IRoleModel) {
        this.tableLoadingService.show();

        this.usersWithinRoleDialog = true;
        this.currentSelected = role;
        const sub = this.apiService.getUsers(role.id).subscribe({
            next: (res) => {
                this.users = res.data;
                this.hederText = `Users Assigned (${this.users.length})`;
                this.tableLoadingService.hide();
            },
            error: (err) => { },
        });
        this.unsubscribe.push(sub);
    }

    openDeleteDialog(role: IRoleModel) {
        this.deleteDialog = true;
        this.currentSelected = role;
    }

    openActivationDialog(role: IRoleModel) {
        this.activationDialog = true;
        this.currentSelected = role;
    }

    hideDialog() {
        this.editeDialog = false;
    }

    edit() {
        if (this.isEditFormValid) {
            this.currentSelected.isTenantAdministratorRole =
                this.currentSelected.isTenantAdministratorRole === null
                    ? false
                    : this.currentSelected.isTenantAdministratorRole;
            const sub = this.apiService.updateRole(this.currentSelected).subscribe({
                next: (res) => {
                    this.fetchRoles();
                    this.hideDialog();
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'role updated successfully',
                    });
                },
            });
            this.unsubscribe.push(sub);
        }
    }

    delete() {
        const sub = this.apiService.deleteRoleById(this.currentSelected.id!).subscribe({
            next: (res) => {
                this.deleteDialog = false;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'role deleted successfully',
                    life: 3000,
                });
                this.fetchRoles();
            },
            error: (error) => { },
        });
        this.unsubscribe.push(sub);
    }

    activation(value: boolean) {
        if (value) {
            const sub = this.apiService.activeRoleById(this.currentSelected.id!).subscribe({
                next: (res) => {
                    this.fetchRoles();
                    this.activationDialog = false;
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'role activated successfully',
                        life: 3000,
                    });
                },
                error: (error) => { },
            });
            this.unsubscribe.push(sub);
        } else {
            const sub = this.apiService.deActiveRoleById(this.currentSelected.id!).subscribe({
                next: (res) => {
                    this.fetchRoles();
                    this.activationDialog = false;
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'role deactivated successfully',
                        life: 3000,
                    });
                },
                error: (error) => { },
            });
            this.unsubscribe.push(sub);
        }
    }

    onSubmit() {
        if (this.isAddFormValid) {
            const sub = this.apiService.createRole(this.roleModel).subscribe({
                next: (res) => {
                    this.fetchRoles();
                    this.addDialog = false;
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'role added successfully',
                        life: 3000,
                    });
                },
                error: (error) => { },
            });
            this.unsubscribe.push(sub);
        }
    }

    updatePermissionsForAddRole(event: any, itemId: any): void {
        if (event.checked) {
            this.roleModel.permessions.push(itemId);
        } else {
            const index = this.roleModel.permessions.indexOf(itemId);
            if (index !== -1) {
                this.roleModel.permessions.splice(index, 1);
            }
        }
    }

    updatePermissionsForEditRole(event: any, permissionId: string): void {
        if (event.checked) {
            if (!this.currentSelected.permessions.includes(permissionId)) {
                this.currentSelected.permessions.push(permissionId);
            }
        } else {
            const index = this.currentSelected.permessions.indexOf(permissionId);
            if (index > -1) {
                this.currentSelected.permessions.splice(index, 1);
            }
        }
    }

    isPermissionSelected(permissionId: string): boolean {
        return this.currentSelected.permessions.includes(permissionId);
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