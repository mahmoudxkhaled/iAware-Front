import { Component, OnDestroy, OnInit } from '@angular/core';
import { TenantUnitService } from '../../services/tenant-unit.service';
import { ITenantUnitModel } from '../../models/ITenantUnitModel';
import { IAspNetPageItemModel } from 'src/app/modules/page-management/models/IAspNetPageItemModel';
import { constants } from 'src/app/core/constatnts/constatnts';
import { Subscription } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Table } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { AdSyncService } from 'src/app/core/Services/ad-sync.service';
import { TableLoadingService } from 'src/app/core/Services/table-loading.service';
import { PermessionsService } from 'src/app/core/Services/permessions.service';
import { IPaginationModel } from 'src/app/core/Dtos/IPaginationModel';

@Component({
    selector: 'app-tenant-unit-listing',
    templateUrl: './tenant-unit-listing.component.html',
    styleUrl: './tenant-unit-listing.component.scss',
})
export class TenantUnitListingComponent implements OnInit, OnDestroy {
    tableLoadingSpinner: boolean = true;
    tenantUnits: ITenantUnitModel[] = [];
    pagePermessions: IAspNetPageItemModel[] = [];
    actions = constants.pageActions;
    unsubscribe: Subscription[] = [];
    currentSelected: ITenantUnitModel = {
        id: '',
        unitName: '',
        isActive: false,
        showInLeaderboard: false,
        users: [],
    };
    deleteDialog: boolean = false;
    editeDialog: boolean = false;
    activationDialog: boolean = false;
    adSyncBtn: boolean = false;
    isADBtnEnabled: boolean = false;
    addDialog: boolean = false;
    showCompleteADDataDialog: boolean = false;
    tenantUnitAddForm: FormGroup;
    tenantUnitEditForm: FormGroup;
    totalRecords: number = 0;
    pagination: IPaginationModel = {
        page: 0,
        size: 5,
        searchQuery: '',
    };
    constructor(
        private apiService: TenantUnitService,
        private messageService: MessageService,
        private tableLoadingService: TableLoadingService,
        private permessionService: PermessionsService,
        private adSyncService: AdSyncService) {
        this.pagePermessions = this.permessionService.getPagePermessions(constants.pages.tenantUnit);
    }

    ngOnInit(): void {
        this.tableLoadingService.loading$.subscribe((isLoading) => {
            this.tableLoadingSpinner = isLoading;
        });

        this.isADDataCompleted();
    }

    onLazyLoad(event: any) {
        this.pagination.page = event.first / event.rows;
        this.pagination.size = event.rows;
        this.pagination.searchQuery = event.globalFilter || '';
        this.fetchTenantUnits();
    }

    fetchTenantUnits() {
        this.tableLoadingService.show();
        const sub = this.apiService.getTenantUnites(this.pagination).subscribe({
            next: (res) => {
                this.tenantUnits = res.data;
                this.totalRecords = res.totalRecords;
                this.tableLoadingService.hide();
            },
            error: (err) => {},
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

    openEditDialog(tenantUnit: ITenantUnitModel) {
        this.initiateEditeForm();
        this.editeDialog = true;
        this.currentSelected = tenantUnit;
        this.tenantUnitEditForm.patchValue({
            unitName: tenantUnit.unitName,
            showInLeaderboard: tenantUnit.showInLeaderboard,
        });
    }

    openDeleteDialog(tenantUnit: ITenantUnitModel) {
        this.deleteDialog = true;
        this.currentSelected = tenantUnit;
    }

    openActivationDialog(tenantUnit: ITenantUnitModel) {
        this.activationDialog = true;
        this.currentSelected = tenantUnit;
    }

    hideDialog() {
        this.editeDialog = false;
    }

    onSubmit() {
        if (this.tenantUnitAddForm.valid) {
            const newtenantUnit: ITenantUnitModel = {
                id: '',
                unitName: this.tenantUnitAddForm.value.unitName,
                showInLeaderboard: this.tenantUnitAddForm.value.showInLeaderboard,
            };

            this.apiService.addTenantUnite(newtenantUnit).subscribe({
                next: (res) => {
                    this.fetchTenantUnits();
                    this.addDialog = false;
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'tenantUnit added successfully',
                    });
                },
                error: (error) => {},
            });
        }
    }

    edit() {
        if (this.tenantUnitEditForm.valid) {
            const newtenantUnit: ITenantUnitModel = {
                id: this.currentSelected.id,
                unitName: this.tenantUnitEditForm.value.unitName,
                showInLeaderboard: this.tenantUnitEditForm.value.showInLeaderboard,
            };
            const sub = this.apiService.editTenantUnite(newtenantUnit).subscribe({
                next: (res) => {
                    this.fetchTenantUnits();
                    this.hideDialog();
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'tenantUnit updated successfully',
                    });
                },
                error: (error) => {},
            });
            this.unsubscribe.push(sub);
        }
    }

    activation(value: boolean) {
        if (value) {
            const sub = this.apiService.activeTenantUnite(this.currentSelected.id!).subscribe({
                next: (res) => {
                    this.fetchTenantUnits();
                    this.activationDialog = false;
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'tenantUnit activated successfully',
                        life: 3000,
                    });
                },
                error: (error) => {},
            });
            this.unsubscribe.push(sub);
        } else {
            const sub = this.apiService.deactiveTenantUnite(this.currentSelected.id!).subscribe({
                next: (res) => {
                    this.fetchTenantUnits();
                    this.activationDialog = false;
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'tenantUnit deactivated successfully',
                        life: 3000,
                    });
                },
                error: (error) => {},
            });
            this.unsubscribe.push(sub);
        }
    }

    delete() {
        const sub = this.apiService.deleteTenantUnite(this.currentSelected.id!).subscribe({
            next: (res) => {
                this.ngOnInit();
                this.deleteDialog = false;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'tenantUnit deleted successfully',
                    life: 3000,
                });
            },
            error: (error) => {},
        });
        this.unsubscribe.push(sub);
    }

    initiateAddForm() {
        this.tenantUnitAddForm = new FormGroup({
            unitName: new FormControl<string>('', [Validators.required]),
            showInLeaderboard: new FormControl<boolean>(true),
        });
    }

    initiateEditeForm() {
        this.tenantUnitEditForm = new FormGroup({
            unitName: new FormControl<string>('', [Validators.required]),
            showInLeaderboard: new FormControl<boolean>(false),
        });
    }

    isADDataCompleted() {
        const sub = this.apiService.isADDataCompleted().subscribe({
            next: (re) => {
                this.isADBtnEnabled = re.isSuccess ? true : false;
            },
        });
        this.unsubscribe.push(sub);
    }

    syncADOUs() {
        if (!this.isADBtnEnabled) {
            this.showCompleteADDataDialog = true;
            return;
        }

        const sub = this.adSyncService.syncADOUs().subscribe({
            next: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Tenant(OUs) synchronized successfully',
                    life: 3000,
                });
                this.fetchTenantUnits();
            },
            error: (e) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error occurred while synchronizing OUs',
                    life: 3000,
                });
            },
        });
        this.unsubscribe.push(sub);
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