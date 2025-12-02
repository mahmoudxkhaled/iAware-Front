import { Component, OnInit, OnDestroy } from '@angular/core';
import { Table } from 'primeng/table';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { IAspNetPageModel } from '../../models/IAspNetPageModel';
import { PageService } from '../../services/page.service';
import { InputSwitchChangeEvent } from 'primeng/inputswitch';
import { IAspNetPageItemModel } from '../../models/IAspNetPageItemModel';
import { PermessionsService } from 'src/app/core/Services/permessions.service';
import { MessageService } from 'primeng/api';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { constants } from 'src/app/core/constatnts/constatnts';
import { DropdownChangeEvent } from 'primeng/dropdown';
import { TableLoadingService } from 'src/app/core/Services/table-loading.service';
import { IPaginationModel } from 'src/app/core/Dtos/IPaginationModel';

@Component({
    selector: 'app-page-listing',
    templateUrl: './page-listing.component.html',
    styleUrl: './page-listing.component.scss',
})
export class PageListingComponent implements OnInit, OnDestroy {
    tableLoadingSpinner: boolean = true;

    pageForm: FormGroup;
    pages: IAspNetPageModel[] = [];
    englishPageNames = constants.iAwareEnglishPagesNames;
    arabicPageNames = constants.iAwareArabicPagesNames;
    currentSelected: IAspNetPageModel = {
        id: '',
        applicationUrl: '',
        displayInMenu: '',
        orderNo: 0,
        pageNameAr: '',
        pageNameEn: '',
        pageUrl: '',
        helpTextAr: '',
        helpTextEn: '',
        isHeading: false,
        isActive: false,
        fontIconCode: '',
        pageItems: [],
    };
    pagePermessions: IAspNetPageItemModel[] = [];
    actions = constants.pageActions;
    unsubscribe: Subscription[] = [];
    deleteDialog: boolean = false;
    addDialog: boolean = false;
    editeDialog: boolean = false;
    activationDialog: boolean = false;
    roleDialog: boolean = false;
    totalRecords: number = 0;
    pagination: IPaginationModel = {
        page: 0,
        size: 10,
        searchQuery: '',
    }
    constructor(
        private apiService: PageService,
        private router: Router,
        private fb: FormBuilder,
        private permessionService: PermessionsService,
        private messageService: MessageService,
        private tableLoadingService: TableLoadingService
    ) {
        this.pagePermessions = this.permessionService.getPagePermessions(constants.pages.pageManagement);
    }

    ngOnInit(): void {
        this.tableLoadingService.loading$.subscribe((isLoading) => {
            this.tableLoadingSpinner = isLoading;
        });

        this.initiatePageForm();
    }

    onLazyLoad(event: any) {
        this.pagination.page = event.first / event.rows;
        this.pagination.size = event.rows;
        this.pagination.searchQuery = event.globalFilter || '';
        this.fetchPages();
    }

    fetchPages() {
        this.tableLoadingService.show();
        const sub = this.apiService.getPages(this.pagination).subscribe({
            next: (res) => {
                this.pages = res.data;
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
        // this.router.navigate(['pages-managment/page-create']);
        this.addDialog = true;
    }

    openEditDialog(role: IAspNetPageModel) {
        this.editeDialog = true;
        this.currentSelected = role;
    }

    openDeleteDialog(role: IAspNetPageModel) {
        this.deleteDialog = true;
        this.currentSelected = role;
    }

    openActivationDialog(role: IAspNetPageModel, e: InputSwitchChangeEvent) {
        this.activationDialog = true;
        this.currentSelected = role;
    }

    hideDialog() {
        this.editeDialog = false;
        this.addDialog = false;
    }

    initiatePageForm() {
        this.pageForm = this.fb.group({
            pageNameEn: ['', Validators.required],
            pageNameAr: ['', Validators.required],
            applicationUrl: ['', Validators.required],
            pageUrl: ['', Validators.required],
            displayInMenu: ['', Validators.required],
            orderNo: [''],
            helpTextAr: [''],
            helpTextEn: [''],
            fontIconCode: [''],
            isHeading: [false],
        });
    }

    edit() {
        const sub = this.apiService.updateAspNetPage(this.currentSelected).subscribe({
            next: (res) => {
                this.fetchPages();
                this.hideDialog();
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Page updated successfully',
                });
            },
        });
        this.unsubscribe.push(sub);
    }

    add() {
        const sub = this.apiService.createAspNetPage(this.pageForm.value).subscribe({
            next: (res) => {
                this.fetchPages();
                this.hideDialog();
                this.initiatePageForm();
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Page Created Successfully',
                });
            },
        });
        this.unsubscribe.push(sub);
    }

    delete() {
        const sub = this.apiService.deleteAspNetPage(this.currentSelected.id!).subscribe({
            next: (res) => {
                this.fetchPages();
                this.deleteDialog = false;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Page Deleted Successfully',
                    life: 3000,
                });
            },
            error: (error) => {},
        });
        this.unsubscribe.push(sub);
    }

    activation(value: boolean) {
        if (value) {
            // TO Do For Activate User
            const sub = this.apiService.activeAspNetPage(this.currentSelected.id!).subscribe({
                next: (res) => {
                    this.fetchPages();
                    this.activationDialog = false;
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Page Activated Successfully',
                        life: 3000,
                    });
                },
                error: (error) => {},
            });
            this.unsubscribe.push(sub);
        } else {
            // TO Do For Deactivate User
            const sub = this.apiService.deActiveAspNetPage(this.currentSelected.id!).subscribe({
                next: (res) => {
                    this.fetchPages();
                    this.activationDialog = false;
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Page Deactivated Successfully',
                        life: 3000,
                    });
                },
                error: (error) => {},
            });
            this.unsubscribe.push(sub);
        }
    }

    onPageENNameChange(event: DropdownChangeEvent) {
        const page = this.arabicPageNames.find((c) => c.id == event.value);
        this.pageForm.patchValue({
            pageNameAr: page?.id,
        });
    }

    onPageENNameEditChange(event: DropdownChangeEvent) {
        const page = this.arabicPageNames.find((c) => c.id == event.value);
        this.currentSelected.pageNameAr = page?.id ? page?.id : '';
    }

    getPageAreabicName(id: string): string {
        const page = this.arabicPageNames.find((c) => c.id == id);
        return page?.name ? page?.name : '';
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