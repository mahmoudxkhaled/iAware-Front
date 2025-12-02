import { Component, OnDestroy, OnInit } from '@angular/core';
import { SupportCategoryService } from '../../services/support-category.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { SupportStatusService } from '../../services/support-status.service';
import { MenuItem, MessageService } from 'primeng/api';
import { PermessionsService } from 'src/app/core/Services/permessions.service';
import { IAspNetPageItemModel } from 'src/app/modules/page-management/models/IAspNetPageItemModel';
import { constants } from 'src/app/core/constatnts/constatnts';
import { TranslationService } from 'src/app/core/Services/translation.service';
import { TableLoadingService } from 'src/app/core/Services/table-loading.service';

@Component({
    selector: 'app-status',
    templateUrl: './status.component.html',
    styleUrl: './status.component.scss',
})
export class StatusComponent implements OnInit, OnDestroy {
    tableLoadingSpinner: boolean = true;

    pagePermessions: IAspNetPageItemModel[] = [];
    actions = constants.pageActions;
    unsubscribe: Subscription[] = [];
    status: any[] = [];
    categories: any[] = [];
    menuItems: MenuItem[] = [];
    currentSelected: any;
    deleteDialog: boolean = false;
    editeDialog: boolean = false;
    activationDialog: boolean = false;
    addDialog: boolean = false;
    addForm: FormGroup;
    editForm: FormGroup;

    constructor(
        private apiService: SupportStatusService,
        private deptService: SupportCategoryService,
        private permessionService: PermessionsService,
        private messageService: MessageService,
        private translate: TranslationService,
        private tableLoadingService: TableLoadingService
    ) {
        this.pagePermessions = this.permessionService.getPagePermessions(constants.pages.supportStatus);
    }

    ngOnInit(): void {
        this.tableLoadingService.loading$.subscribe((isLoading) => {
            this.tableLoadingSpinner = isLoading;
        });

        const editBtn = {
            label: this.translate.getInstant('shared.actions.edit'),
            icon: 'pi pi-fw pi-pencil',
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

        this.initiateAddForm();
        this.initiateEditForm();
        this.fetchStatus();
        this.fetchCategories();
    }

    assigneCurrentSelect(status: any) {
        this.currentSelected = status;
    }

    fetchStatus() {
        const x = this.apiService.getAllStatus().subscribe({
            next: (data) => {
                this.status = data.data;
            },
            error: (err) => console.error(err),
        });
        this.unsubscribe.push(x);
    }

    fetchCategories() {
        this.tableLoadingService.show();

        const x = this.deptService.getAllCategories().subscribe({
            next: (data) => {
                this.categories = data.data;
                this.tableLoadingService.hide();
            },
            error: (err) => console.error(err),
        });
        this.unsubscribe.push(x);
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    navigateToCreate() {
        this.addDialog = true;
    }

    initiateAddForm() {
        this.addForm = new FormGroup({
            title: new FormControl<string>('', [Validators.required]),
            helpCategoryId: new FormControl<string>('', [Validators.required]),
            colorCode: new FormControl<string>('', [Validators.required]),
            orderNo: new FormControl<number>(0),
            isClosedCase: new FormControl<boolean>(false),
        });
    }

    initiateEditForm() {
        this.editForm = new FormGroup({
            title: new FormControl<string>('', [Validators.required]),
            helpCategoryId: new FormControl<string>('', [Validators.required]),
            colorCode: new FormControl<string>('', [Validators.required]),
            orderNo: new FormControl<number>(0),
            isClosedCase: new FormControl<boolean>(false),
        });
    }

    openEditDialog(status: any) {
        this.editeDialog = true;
        this.currentSelected = status;
        this.editForm.patchValue({
            title: status.title,
            helpCategoryId: status.helpCategoryId,
            colorCode: status.colorCode,
            orderNo: status.orderNo,
            isClosedCase: status.isClosedCase,
        });
    }

    openDeleteDialog(status: any) {
        this.deleteDialog = true;
        this.currentSelected = status;
    }

    openActivationDialog(status: any) {
        this.activationDialog = true;
        this.currentSelected = status;
    }

    hideDialog() {
        this.deleteDialog = false;
        this.editeDialog = false;
        this.activationDialog = false;
        this.addDialog = false;
    }

    edit() {
        const data = {
            id: this.currentSelected.id,
            title: this.editForm.value.title,
            helpCategoryId: this.editForm.value.helpCategoryId,
            colorCode: this.editForm.value.colorCode,
            orderNo: this.editForm.value.orderNo,
            isClosedCase: this.editForm.value.isClosedCase,
        };
        const x = this.apiService.editStatus(data).subscribe({
            next: (res) => {
                this.fetchStatus();
                this.hideDialog();
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'status updated successfully',
                });
            },
        });
        this.unsubscribe.push(x);
    }

    add() {
        const x = this.apiService.addStatus(this.addForm.value).subscribe({
            next: (res) => {
                this.fetchStatus();
                this.hideDialog();
                this.initiateAddForm();
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'status added successfully',
                });
            },
            error: (error) => {},
        });
        this.unsubscribe.push(x);
    }

    delete() {
        const x = this.apiService.deleteStatus(this.currentSelected.id).subscribe({
            next: (res) => {
                this.fetchStatus();
                this.deleteDialog = false;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'status deleted',
                    life: 3000,
                });
            },
            error: (error) => {},
        });
        this.unsubscribe.push(x);
    }

    activate(value: boolean) {
        if (value) {
            const x = this.apiService.activateStatus(this.currentSelected.id).subscribe({
                next: (res) => {
                    this.fetchStatus();
                    this.activationDialog = false;
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'status activated',
                        life: 3000,
                    });
                },
                error: (error) => {},
            });
            this.unsubscribe.push(x);
        } else {
            const x = this.apiService.deactivateStatus(this.currentSelected.id!).subscribe({
                next: (res) => {
                    this.fetchStatus();
                    this.activationDialog = false;
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'status deactivated',
                        life: 3000,
                    });
                },
                error: (error) => {},
            });
            this.unsubscribe.push(x);
        }
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
