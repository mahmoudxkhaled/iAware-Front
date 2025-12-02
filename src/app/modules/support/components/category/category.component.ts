import { Component, OnDestroy, OnInit } from '@angular/core';
import { SupportCategoryService } from '../../services/support-category.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { MenuItem, MessageService } from 'primeng/api';
import { IAspNetPageItemModel } from 'src/app/modules/page-management/models/IAspNetPageItemModel';
import { PermessionsService } from 'src/app/core/Services/permessions.service';
import { constants } from 'src/app/core/constatnts/constatnts';
import { TranslationService } from 'src/app/core/Services/translation.service';
import { TableLoadingService } from 'src/app/core/Services/table-loading.service';

@Component({
    selector: 'app-category',
    templateUrl: './category.component.html',
    styleUrl: './category.component.scss',
})
export class CategoryComponent implements OnInit, OnDestroy {
    tableLoadingSpinner: boolean = true;

    pagePermessions: IAspNetPageItemModel[] = [];
    actions = constants.pageActions;
    unsubscribe: Subscription[] = [];
    categories: any[] = [];
    usersTenant: any[] = [];
    users: any[] = [];
    menuItems: MenuItem[] = [];
    currentSelected: any;
    deleteDialog: boolean = false;
    editeDialog: boolean = false;
    activationDialog: boolean = false;
    addDialog: boolean = false;
    usersWithinDeptDialog: boolean = false;
    addForm: FormGroup;
    editForm: FormGroup;

    constructor(
        private apiService: SupportCategoryService,
        private messageService: MessageService,
        private permessionService: PermessionsService,
        private translate: TranslationService,
        private tableLoadingService: TableLoadingService
    ) {
        this.pagePermessions = this.permessionService.getPagePermessions(constants.pages.supportCategory);
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
        this.fetchcategories();
        this.fetchMembers();
    }

    assigneCurrentSelect(dept: any) {
        this.currentSelected = dept;
    }

    fetchcategories() {
        this.tableLoadingService.show();

        const x = this.apiService.getAllCategoriesWithMembers().subscribe({
            next: (data) => {
                this.categories = data.data;
                this.tableLoadingService.hide();
            },
            error: (err) => console.error(err),
        });
    }

    fetchMembers() {
        this.tableLoadingService.show();

        const x = this.apiService.getTenantUsers().subscribe({
            next: (data) => {
                this.usersTenant = data.data;
                this.tableLoadingService.hide();
            },
            error: (err) => console.error(err),
        });
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
            description: new FormControl<string>('', [Validators.required]),
            helpCategoryMembers: new FormControl<string[]>([], [Validators.required]),
        });
    }

    initiateEditForm() {
        this.editForm = new FormGroup({
            title: new FormControl<string>('', [Validators.required]),
            description: new FormControl<string>('', [Validators.required]),
            helpCategoryMembers: new FormControl<string[]>([], [Validators.required]),
        });
    }

    openEditDialog(dept: any) {
        this.editeDialog = true;
        this.currentSelected = dept;
        this.editForm.patchValue({
            title: dept.title,
            description: dept.description,
            helpCategoryMembers: dept.helpCategoryMembers,
        });
    }

    openDeleteDialog(dept: any) {
        this.deleteDialog = true;
        this.currentSelected = dept;
    }

    openActivationDialog(dept: any) {
        this.activationDialog = true;
        this.currentSelected = dept;
    }

    openUsersDialog(dept: any) {
        this.usersWithinDeptDialog = true;
        this.currentSelected = dept;
        this.users = this.usersTenant.filter((c) => {
            return dept.helpCategoryMembers?.includes(c.id);
        });
    }

    hideDialog() {
        this.deleteDialog = false;
        this.editeDialog = false;
        this.activationDialog = false;
        this.addDialog = false;
        this.usersWithinDeptDialog = false;
    }

    edit() {
        const data = {
            id: this.currentSelected.id,
            title: this.editForm.value.title,
            description: this.editForm.value.description,
            helpCategoryMembers: this.editForm.value.helpCategoryMembers,
        };
        const x = this.apiService.editCategory(data).subscribe({
            next: (res) => {
                this.fetchcategories();
                this.hideDialog();
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'category updated successfully',
                });
            },
        });
        this.unsubscribe.push(x);
    }

    add() {
        const x = this.apiService.addCategory(this.addForm.value).subscribe({
            next: (res) => {
                this.fetchcategories();
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
        const x = this.apiService.deleteCategory(this.currentSelected.id).subscribe({
            next: (res) => {
                this.fetchcategories();
                this.deleteDialog = false;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'category deleted',
                    life: 3000,
                });
            },
            error: (error) => {},
        });
        this.unsubscribe.push(x);
    }

    activate(value: boolean) {
        if (value) {
            const x = this.apiService.activateCategory(this.currentSelected.id!).subscribe({
                next: (res) => {
                    this.fetchcategories();
                    this.activationDialog = false;
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'category activated',
                        life: 3000,
                    });
                },
                error: (error) => {},
            });
            this.unsubscribe.push(x);
        } else {
            const x = this.apiService.deactivateCategory(this.currentSelected.id!).subscribe({
                next: (res) => {
                    this.fetchcategories();
                    this.activationDialog = false;
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'category deactivated',
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
