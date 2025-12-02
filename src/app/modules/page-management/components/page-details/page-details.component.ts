import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IAspNetPageModel } from '../../models/IAspNetPageModel';
import { Subscription } from 'rxjs';
import { Table } from 'primeng/table';
import { PageService } from '../../services/page.service';
import { InputSwitchChangeEvent } from 'primeng/inputswitch';
import { IAspNetPageItemModel } from '../../models/IAspNetPageItemModel';
import { NgForm, Validators } from '@angular/forms';
import { constants } from 'src/app/core/constatnts/constatnts';
import { TableLoadingService } from 'src/app/core/Services/table-loading.service';
import { IPaginationModel } from 'src/app/core/Dtos/IPaginationModel';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-page-details',
    templateUrl: './page-details.component.html',
    styleUrl: './page-details.component.scss',
})
export class PageDetailsComponent implements OnInit {
    tableLoadingSpinner: boolean = true;

    actions = constants.iAwarePageActions;
    permessions: IAspNetPageItemModel[] = [];
    currentSelected: IAspNetPageItemModel = {
        id: '',
        functionName: '',
        controlKey: '',
        controlEventKey: '',
        functionDescription: '',
        aspNetPageId: '',
        isPageLoadingFunction: false,
    };

    unsubscribe: Subscription[] = [];
    deleteDialog: boolean = false;
    editeDialog: boolean = false;
    addDialog: boolean = false;
    activationDialog: boolean = false;

    aspNetPageId: string = '';
    page?: IAspNetPageModel;

    @ViewChild('addFrom') addFrom!: NgForm;
    @ViewChild('editForm') editForm!: NgForm;

    totalRecords: number = 0;
    pagination: IPaginationModel = {
        page: 0,
        size: 10,
        searchQuery: '',
    }
    constructor(
        private apiService: PageService,
        private route: ActivatedRoute,
        private tableLoadingService: TableLoadingService,
        private messageService: MessageService
    ) {
        const sub = this.route.params.subscribe((params) => {
            const id = params['id'];
            this.aspNetPageId = id;
        });
        this.unsubscribe.push(sub);
    }

    ngOnInit(): void {
        this.tableLoadingService.loading$.subscribe((isLoading) => {
            this.tableLoadingSpinner = isLoading;
        });
        this.tableLoadingService.show();
    }

    onLazyLoad(event: any) {
        this.pagination.page = event.first / event.rows;
        this.pagination.size = event.rows;
        this.pagination.searchQuery = event.globalFilter || '';
        this.fetchPages();
    }

    fetchPages() {
        const sub = this.apiService.getPageItems(this.aspNetPageId, this.pagination).subscribe({
            next: (res) => {
                this.permessions = res.data;
                this.totalRecords = res.totalRecords;
                this.tableLoadingService.hide();
            },
            error: (error) => {
                this.tableLoadingService.hide();
            },
        });
        this.unsubscribe.push(sub);
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    openEditDialog(pageItemModel: IAspNetPageItemModel) {
        this.editeDialog = true;
        this.currentSelected = pageItemModel;
    }

    openDeleteDialog(pageItemModel: IAspNetPageItemModel) {
        this.deleteDialog = true;
        this.currentSelected = pageItemModel;
    }

    hideAddDialog() {
        this.addDialog = false;
    }

    hideEditDialog() {
        this.editeDialog = false;
    }

    delete() {
        const sub = this.apiService.deleteItemFromPage(this.currentSelected.id!).subscribe({
            next: (res) => {
                this.fetchPages();
                this.deleteDialog = false;
                this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'User Deleted', life: 3000 })
            },
            error: (error) => {},
        });
        this.unsubscribe.push(sub);
    }

    add() {
        const sub = this.apiService.createAspNetPageItem(this.currentSelected).subscribe({
            next: () => {
                this.addDialog = false;
                this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'User Added', life: 3000 })
                this.fetchPages();
            },
            error: (error) => {},
        });
        this.unsubscribe.push(sub);
    }

    edit() {
        const sub = this.apiService.updateAspNetPageItem(this.currentSelected).subscribe({
            next: () => {
                this.editeDialog = false;
                this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'User Updated', life: 3000 })
                this.fetchPages();
            },
            error: (error) => {},
        });
        this.unsubscribe.push(sub);
    }

    openAddDialog() {
        this.addDialog = true;
        this.initiaiteModel();
    }

    initiaiteModel() {
        this.currentSelected = {
            id: '',
            functionName: '',
            controlKey: '',
            controlEventKey: '',
            functionDescription: '',
            aspNetPageId: this.aspNetPageId,
            isPageLoadingFunction: false,
        };
    }

    getControleKeyName(id: string) {
        const item = this.actions.find((c) => c.id == id);
        return item?.name ? item?.name : '';
    }

    ngOnDestroy(): void {
        this.unsubscribe.forEach((u) => {
            u.unsubscribe();
        });
    }
}