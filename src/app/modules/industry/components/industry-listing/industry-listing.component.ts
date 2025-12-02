import { Component, OnDestroy, OnInit } from '@angular/core';
import { InduetryService } from '../../services/induetry.service';
import { IIndustryModel } from '../../models/IIndustryModel';
import { IAspNetPageItemModel } from 'src/app/modules/page-management/models/IAspNetPageItemModel';
import { constants } from 'src/app/core/constatnts/constatnts';
import { PermessionsService } from 'src/app/core/Services/permessions.service';
import { Table } from 'primeng/table';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MessageService } from 'primeng/api';
import { TableLoadingService } from 'src/app/core/Services/table-loading.service';
import { IPaginationModel } from 'src/app/core/Dtos/IPaginationModel';

@Component({
    selector: 'app-industry-listing',
    templateUrl: './industry-listing.component.html',
    styleUrl: './industry-listing.component.scss',
})
export class IndustryListingComponent implements OnInit, OnDestroy {
    tableLoadingSpinner: boolean = true;

    pagePermessions: IAspNetPageItemModel[] = [];
    actions = constants.pageActions;
    industries: IIndustryModel[] = [];
    currentSelected: IIndustryModel;
    deleteDialog: boolean = false;
    editeDialog: boolean = false;
    activationDialog: boolean = false;
    addDialog: boolean = false;
    addForm: FormGroup;
    editForm: FormGroup;
    unsubscribe: Subscription[] = [];
    totalRecords: number = 0;
    pagibation: IPaginationModel = {
        page: 0,
        size: 10,
        searchQuery: '',
    };
    constructor(
        private apiService: InduetryService,
        private permessionService: PermessionsService,
        private messageService: MessageService,
        private tableLoadingService: TableLoadingService
    ) {
        this.pagePermessions = this.permessionService.getPagePermessions(constants.pages.industry);
    }

    ngOnInit(): void {
        this.tableLoadingService.loading$.subscribe((isLoading) => {
            this.tableLoadingSpinner = isLoading;
        });

        this.fetchIndustries();
    }

    onLazyLoad(event: any) {
        this.pagibation.page = event.first / event.rows;
        this.pagibation.size = event.rows;
        this.pagibation.searchQuery = event.globalFilter || '';
        this.fetchIndustries();
    }

    fetchIndustries() {
        this.tableLoadingService.show();
        this.apiService.getIndustries(this.pagibation).subscribe({
            next: (res) => {
                this.industries = res.data;
                this.totalRecords = res.totalRecords;
                this.tableLoadingService.hide();
            },
            error: (err) => {
                console.error(err);
            },
        });
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    navigateToCreate() {
        this.initiateAddForm();
        this.addDialog = true;
    }

    openEditDialog(industry: IIndustryModel) {
        this.initiateEditForm();
        this.editeDialog = true;
        this.currentSelected = industry;
        this.editForm.patchValue({
            id: industry.id,
            name: industry.name,
            value: industry.value,
        });
    }

    openDeleteDialog(industry: IIndustryModel) {
        this.deleteDialog = true;
        this.currentSelected = industry;
    }

    hideDialog() {
        this.deleteDialog = false;
        this.editeDialog = false;
        this.activationDialog = false;
        this.addDialog = false;
    }

    initiateAddForm() {
        this.addForm = new FormGroup({
            name: new FormControl<string>('', [Validators.required]),
            value: new FormControl<number>(0, [Validators.required]),
        });
    }

    initiateEditForm() {
        this.editForm = new FormGroup({
            id: new FormControl<string>(''),
            name: new FormControl<string>(''),
            value: new FormControl<number>(0),
        });
    }

    addIndustry() {
        const x = this.apiService.addIndustry(this.addForm.value).subscribe({
            next: (res) => {
                this.fetchIndustries();
                this.hideDialog();
                this.initiateAddForm();
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'industry added successfully',
                });
            },
            error: (error) => {},
        });
        this.unsubscribe.push(x);
    }

    editIndustry() {
        const x = this.apiService.editIndustry(this.editForm.value).subscribe({
            next: (res) => {
                this.fetchIndustries();
                this.hideDialog();
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'industry updated successfully',
                });
            },
        });
        this.unsubscribe.push(x);
    }

    deleteIndustry() {
        const x = this.apiService.deleteIndustry(this.currentSelected.id).subscribe({
            next: (res) => {
                this.fetchIndustries();
                this.deleteDialog = false;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'industry deleted successfully',
                    life: 3000,
                });
            },
            error: (error) => {},
        });
        this.unsubscribe.push(x);
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
