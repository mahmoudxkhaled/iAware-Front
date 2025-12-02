import { Component, OnDestroy, OnInit } from '@angular/core';
import { SupportCategoryService } from '../../services/support-category.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { SupportSubjectService } from '../../services/support-subject.service';
import { MenuItem, MessageService } from 'primeng/api';
import { IAspNetPageItemModel } from 'src/app/modules/page-management/models/IAspNetPageItemModel';
import { PermessionsService } from 'src/app/core/Services/permessions.service';
import { constants } from 'src/app/core/constatnts/constatnts';
import { TranslationService } from 'src/app/core/Services/translation.service';
import { TableLoadingService } from 'src/app/core/Services/table-loading.service';

@Component({
    selector: 'app-subject',
    templateUrl: './subject.component.html',
    styleUrl: './subject.component.scss',
})
export class SubjectComponent implements OnInit, OnDestroy {
    tableLoadingSpinner: boolean = true;

    pagePermessions: IAspNetPageItemModel[] = [];
    actions = constants.pageActions;
    unsubscribe: Subscription[] = [];
    subjects: any[] = [];
    categories: any[] = [];
    currentSelected: any;
    deleteDialog: boolean = false;
    editeDialog: boolean = false;
    activationDialog: boolean = false;
    addDialog: boolean = false;
    addForm: FormGroup;
    editForm: FormGroup;
    menuItems: MenuItem[] = [];

    constructor(
        private apiService: SupportSubjectService,
        private deptService: SupportCategoryService,
        private permessionService: PermessionsService,
        private messageService: MessageService,
        private translate: TranslationService,
        private tableLoadingService: TableLoadingService
    ) {
        this.pagePermessions = this.permessionService.getPagePermessions(constants.pages.supportSubject);
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
        this.fetchSubjects();
        this.fetchCategories();
    }

    assigneCurrentSelect(subject: any) {
        this.currentSelected = subject;
    }

    fetchSubjects() {
        const x = this.apiService.getAllSubject().subscribe({
            next: (data) => {
                this.subjects = data.data;
            },
            error: (err) => console.error(err),
        });
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
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    navigateToCreate() {
        this.addDialog = true;
    }

    initiateAddForm() {
        this.addForm = new FormGroup({
            subjectTitle: new FormControl<string>('', [Validators.required]),
            helpCategoryId: new FormControl<string>('', [Validators.required]),
            isCustomSubject: new FormControl<boolean>(false),
        });
    }

    initiateEditForm() {
        this.editForm = new FormGroup({
            subjectTitle: new FormControl<string>('', [Validators.required]),
            helpCategoryId: new FormControl<string>('', [Validators.required]),
            isCustomSubject: new FormControl<boolean>(false),
        });
    }

    openEditDialog(subject: any) {
        this.editeDialog = true;
        this.currentSelected = subject;
        this.editForm.patchValue({
            subjectTitle: subject.subjectTitle,
            helpCategoryId: subject.helpCategoryId,
            isCustomSubject: subject.isCustomSubject,
        });
    }

    openDeleteDialog(subject: any) {
        this.deleteDialog = true;
        this.currentSelected = subject;
    }

    openActivationDialog(subject: any) {
        this.activationDialog = true;
        this.currentSelected = subject;
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
            subjectTitle: this.editForm.value.subjectTitle,
            helpCategoryId: this.editForm.value.helpCategoryId,
            isCustomSubject: this.editForm.value.isCustomSubject,
        };
        const x = this.apiService.editSubject(data).subscribe({
            next: (res) => {
                this.fetchSubjects();
                this.hideDialog();
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'subject updated successfully',
                });
            },
        });
        this.unsubscribe.push(x);
    }

    add() {
        const x = this.apiService.addSubject(this.addForm.value).subscribe({
            next: (res) => {
                this.fetchSubjects();
                this.hideDialog();
                this.initiateAddForm();
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'subject added successfully',
                });
            },
            error: (error) => {},
        });
        this.unsubscribe.push(x);
    }

    delete() {
        const x = this.apiService.deleteSubject(this.currentSelected.id).subscribe({
            next: (res) => {
                this.fetchSubjects();
                this.deleteDialog = false;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'subject deleted',
                    life: 3000,
                });
            },
            error: (error) => {},
        });
        this.unsubscribe.push(x);
    }

    activate(value: boolean) {
        if (value) {
            const x = this.apiService.activateSubject(this.currentSelected.id).subscribe({
                next: (res) => {
                    this.fetchSubjects();
                    this.activationDialog = false;
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'subject activated',
                        life: 3000,
                    });
                },
                error: (error) => {},
            });
            this.unsubscribe.push(x);
        } else {
            const x = this.apiService.deactivateSubject(this.currentSelected.id).subscribe({
                next: (res) => {
                    this.fetchSubjects();
                    this.activationDialog = false;
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'subject deactivated',
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
