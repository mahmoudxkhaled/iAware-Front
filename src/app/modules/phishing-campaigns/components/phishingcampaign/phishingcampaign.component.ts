import { AfterViewChecked, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { PhishingcampaignsService } from '../../services/phishingcampaigns.service';
import { Table } from 'primeng/table';
import { Router } from '@angular/router';
import { IAwarenessPhishingCampaignModel } from '../../models/IAwarenessPhishingCampaignModel';
import { TableLoadingService } from 'src/app/core/Services/table-loading.service';
import { PermessionsService } from 'src/app/core/Services/permessions.service';
import { IAspNetPageItemModel } from 'src/app/modules/page-management/models/IAspNetPageItemModel';
import { constants } from 'src/app/core/constatnts/constatnts';
import { IPaginationModel } from 'src/app/core/Dtos/IPaginationModel';
import { LazyLoadEvent } from 'primeng/api';

@Component({
    selector: 'app-phishingcampaign',
    templateUrl: './phishingcampaign.component.html',
    styleUrl: './phishingcampaign.component.scss',
})
export class PhishingcampaignComponent implements OnInit,AfterViewChecked, OnDestroy {
    pagePermessions: IAspNetPageItemModel[] = [];
    actions = constants.pageActions;

    tableLoadingSpinner: boolean = true;
    unsubscribe: Subscription[] = [];
    currentPhishingDataSource: IAwarenessPhishingCampaignModel[] = [];
    historyPhishingDataSource: IAwarenessPhishingCampaignModel[] = [];

    currentTotalRecords: number = 0;
    historyTotalRecords: number = 0;
    currentPagination: IPaginationModel = {
        page: 0,
        size: 5,
        searchQuery: '',
    };
    historyPagination: IPaginationModel = {
        page: 0,
        size: 5,
        searchQuery: '',
    };

    constructor(
        private apiService: PhishingcampaignsService,
        private router: Router,
        private tableLoadingService: TableLoadingService,
        private permessionService: PermessionsService,
        private cdr: ChangeDetectorRef
    ) {
        this.pagePermessions = this.permessionService.getPagePermessions(constants.pages.phishingCampaigns);
    }

    ngAfterViewChecked(): void {
        this.cdr.detectChanges();
    }

    ngOnInit(): void {
        this.tableLoadingService.loading$.subscribe((isLoading) => {
            this.tableLoadingSpinner = isLoading;
        });
    }

    onLazyLoadCurrentPhishingCampaigns(event: any) {
        this.currentPagination.page = event.first / event.rows;
        this.currentPagination.size = event.rows;
        this.currentPagination.searchQuery = event.globalFilter || '';
        this.fetchCurrentPhishingCampaigns();
    }

    onLazyLoadHistoryPhishingCampaigns(event: any) {
        this.historyPagination.page = event.first / event.rows;
        this.historyPagination.size = event.rows;
        this.historyPagination.searchQuery = event.globalFilter || '';
        this.fetchHistoryPhishingCampaigns();
    }

    fetchCurrentPhishingCampaigns() {
        this.tableLoadingService.show();
        const sub = this.apiService.getCurrentPhishingCampaigns(this.currentPagination).subscribe({
            next: (res) => {
                this.currentPhishingDataSource = res.data;
                this.currentTotalRecords = res.totalRecords;
                this.tableLoadingService.hide();
            },
            error: (err) => {},
        });
        this.unsubscribe.push(sub);
    }

    fetchHistoryPhishingCampaigns() {
        this.tableLoadingService.show();
        const sub = this.apiService.getHistoryPhishingCampaigns(this.historyPagination).subscribe({
            next: (res) => {
                this.historyPhishingDataSource = res.data;
                this.historyTotalRecords = res.totalRecords;
                this.tableLoadingService.hide();
            },
            error: (err) => {},
        });
        this.unsubscribe.push(sub);
    }

    calculateCurrentTotalNumberOfTemplates(name: string) {
        let total = 0;

        if (this.currentPhishingDataSource) {
            for (let customer of this.currentPhishingDataSource) {
                if (customer?.campaignName === name) {
                    total++;
                }
            }
        }
        return total;
    }

    calculateHistoryTotalNumberOfTemplates(name: string) {
        let total = 0;

        if (this.historyPhishingDataSource) {
            for (let customer of this.historyPhishingDataSource) {
                if (customer?.campaignName === name) {
                    total++;
                }
            }
        }
        return total;
    }

    onGlobalPhishingFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    navigaetToPhishingCampaignStatistics(campaign: IAwarenessPhishingCampaignModel) {
        this.router.navigate([`phishing-campaigns/p-campaign-statistics/${campaign.campaignId}`]);
    }

    hasPermission(controlKey: string): boolean {
        return this.pagePermessions.some((p) => p.controlKey === controlKey);
    }

    ngOnDestroy(): void {
        this.unsubscribe.forEach((sub) => sub.unsubscribe());
    }
}