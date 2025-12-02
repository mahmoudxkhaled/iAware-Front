import { Component, OnInit } from '@angular/core';
import { PointingTypeService } from '../../services/pointing-type.service';
import { IPoinitngTypeModel } from '../../models/IPoinitngTypeModel';
import { MessageService } from 'primeng/api';
import { TableLoadingService } from 'src/app/core/Services/table-loading.service';
import { IAspNetPageItemModel } from 'src/app/modules/page-management/models/IAspNetPageItemModel';
import { constants } from 'src/app/core/constatnts/constatnts';
import { PermessionsService } from 'src/app/core/Services/permessions.service';
import { Subscription } from 'rxjs';
import { IPaginationModel } from 'src/app/core/Dtos/IPaginationModel';

@Component({
    selector: 'app-pointing-type-listing',
    templateUrl: './pointing-type-listing.component.html',
    styleUrl: './pointing-type-listing.component.scss',
})
export class PointingTypeListingComponent implements OnInit {
    tableLoadingSpinner: boolean = true;
    pagePermessions: IAspNetPageItemModel[] = [];
    actions = constants.pageActions;
    pointingTypes: IPoinitngTypeModel[] = [];
    editDialog: boolean = false;
    currentPointType: IPoinitngTypeModel = {
        id: '',
        pointingTitle: '',
        pointingValue: 0,
    };
        
    unsubscribe: Subscription[] = [];
    totalRecords: number = 0;
    pagination: IPaginationModel = {
        page: 0,
        size: 10,
        searchQuery: '',
    }

    constructor(
        private apiService: PointingTypeService,
        private messageService: MessageService,
        private permessionService: PermessionsService,
        private tableLoadingService: TableLoadingService
    ) {
        this.pagePermessions = this.permessionService.getPagePermessions(constants.pages.pointingSystem);
    }

    ngOnInit(): void {
        this.tableLoadingService.loading$.subscribe((isLoading) => {
            this.tableLoadingSpinner = isLoading;
        });
    }

    onLazyLoad(event: any) {
        this.pagination.page = event.first / event.rows;
        this.pagination.size = event.rows;
        this.pagination.searchQuery = event.globalFilter || '';
        this.fetchPointingTyps();
    }

    fetchPointingTyps() {
        this.tableLoadingService.show();

        this.apiService.getPoinitngTypes(this.pagination).subscribe({
            next: (res) => {
                this.pointingTypes = res.data;
                this.totalRecords = res.totalRecords;
                this.tableLoadingService.hide();
            },
            error: (err) => {},
        });
    }

    openEditDialog(pointType: IPoinitngTypeModel) {
        this.currentPointType = pointType;
        this.editDialog = true;
    }

    editPointingType() {
        const sub =this.apiService.editPointingType(this.currentPointType).subscribe({
            next: (res) => {
                this.fetchPointingTyps();
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Point Updated Successfully',
                });
                this.editDialog = false;
            },
            error: (err) => {},
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