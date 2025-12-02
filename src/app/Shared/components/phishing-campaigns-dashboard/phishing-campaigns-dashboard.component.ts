import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ExcelService } from 'src/app/core/Services/excel.service';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Chart, registerables } from 'chart.js';
import { PdfService } from 'src/app/core/Services/pdf.service';
import { IAwarenessPhishingCampaignDashboardModel } from 'src/app/modules/phishing-campaigns/models/IAwarenessCampaignPhishingDashboardModel';
import { PhishingcampaignsService } from 'src/app/modules/phishing-campaigns/services/phishingcampaigns.service';
import { IAwarenessPhishingCampaignModel } from 'src/app/modules/phishing-campaigns/models/IAwarenessPhishingCampaignModel';
import { DropdownChangeEvent } from 'primeng/dropdown';
import { IPhishingCampaignUserModel } from 'src/app/modules/phishing-campaigns/models/IPhishingCampaignUserModel';
import { CheckboxChangeEvent } from 'primeng/checkbox';
import { Table } from 'primeng/table';
import { ILeaderboardStatisticsModel } from 'src/app/modules/leaderboard/models/ILeaderboardStatisticsModel';
import { IAwarenessPhishingCampaignsTrendAnalysisModel } from 'src/app/modules/phishing-campaigns/models/IAwarenessPhishingCampaignsTrendAnalysisModel';
import { MessageService } from 'primeng/api';
import { TableLoadingService } from 'src/app/core/Services/table-loading.service';
import { TranslationService } from 'src/app/core/Services/translation.service';

@Component({
    selector: 'app-phishing-campaigns-dashboard',
    templateUrl: './phishing-campaigns-dashboard.component.html',
    styleUrl: './phishing-campaigns-dashboard.component.scss',
})
export class PhishingCampaignsDashboardComponent implements OnInit, OnDestroy {
    unsubscribe: Subscription[] = [];
    currentCampaignNameForReport: string = 'All [R] Phishing Campaigns';
    completedCampaignNameForReport: string = 'All [C] Phishing Campaigns';

    currentPhishingAwarenessCampaigns: IAwarenessPhishingCampaignModel[] = [];
    currentPhishingAwarenessCampaignsForDashboardDropDown: IAwarenessPhishingCampaignModel[] = [];
    historyPhishingCampaignsData: IAwarenessPhishingCampaignModel[] = [];
    historyPhishingCampaignsDataForDashboardDropDown: IAwarenessPhishingCampaignModel[] = [];

    phishingCampaignUsers: IPhishingCampaignUserModel[] = [];
    phishingCampaignUsersSelected: IPhishingCampaignUserModel[] = [];
    checkboxStates: { [key: string]: boolean } = {};

    displayCurrentPhishingCampaignReportedDialog: boolean = false;
    displayCurrentPhishingCampaignNoActionDialog: boolean = false;
    displayCurrentPhishingCampaignFailedDialog: boolean = false;
    currentPhishingCampaignDashboardId: string = 'all';
    currentPhishingCampaignsDashboard: IAwarenessPhishingCampaignDashboardModel = {
        reported: 0,
        noAction: 0,
        failed: 0,
    };
    currentPhishingCampaignsDashboardPieChartOptions: any;
    currentPhishingCampaignsDashboardPiehartData: any;

    displayCompletedPhishingCampaignReportedDialog: boolean = false;
    displayCompletedPhishingCampaignFailedDialog: boolean = false;
    displayCompletedPhishingCampaignNoActionDialog: boolean = false;
    completedPhishingCampaignDashboardId: string = 'all';
    completedPhishingCampaignsDashboard: IAwarenessPhishingCampaignDashboardModel = {
        reported: 0,
        noAction: 0,
        failed: 0,
    };
    completedPhishingCampaignsDashboardPieChartOptions: any;
    completedPhishingCampaignsDashboardPiehartData: any;

    campaignsDashboardTrendAnalysisChartOptions: any;
    campaignsDashboardTrendAnalysisChartData: any;
    campaignsDashboardTrendAnalysisData: IAwarenessPhishingCampaignsTrendAnalysisModel = {
        failedData: [],
        labels: [],
        noActionData: [],
        reportedData: [],
    };

    months: any[] = [];
    selectedMonth: number = 0;

    leaderboardDataForUsers: ILeaderboardStatisticsModel = {
        rankedUsers: [],
        topThreeRankedUsers: [],
    };
    tableLoadingSpinner: boolean = true;

    constructor(
        private apiService: PhishingcampaignsService,
        private pdfService: PdfService,
        private excelService: ExcelService,
        private messageService: MessageService,
        private tableLoadingService: TableLoadingService,
        private translate: TranslationService
    ) {
        Chart.register(...registerables, ChartDataLabels);
    }

    ngOnInit(): void {
        this.tableLoadingService.loading$.subscribe((isLoading) => {
            this.tableLoadingSpinner = isLoading;
        });

        this.fetchPhishingCampaignsAdminDashboard();
        this.initCompletedPhishingCampaignsDashboardPieChartOptions();
        this.initCurrentPhishingCampaignsDashboardPieChartOptions();
        this.initCompletedCampaignsDashboardTrendAnalysisChartOptions();
        this.fetchCurrentPhishingCampaignsDashboard();
        this.fetchCompletedPhishingCampaignsDashboard();
        this.fetchCompletedCampaignsTrendAnalysisDashboard();
        this.fetchPhishingCampaignsLeaderboardData();
        
        this.months = [
            { id: 1, name: '1' },
            { id: 3, name: '3' },
            { id: 6, name: '6' },
            { id: 9, name: '9' },
        ];
    }

    fetchPhishingCampaignsAdminDashboard() {
        const sub = this.apiService.getPhishingAwarenessCampaignAdminDashboard().subscribe({
            next: (res) => {
                this.currentPhishingAwarenessCampaigns = res.data.currentCampaigns;
                this.currentPhishingAwarenessCampaignsForDashboardDropDown = [
                    { campaignName: 'All', campaignId: 'all' } as IAwarenessPhishingCampaignModel,
                    ...new Map(this.currentPhishingAwarenessCampaigns.map((item) => [item.campaignId, item])).values(),
                ];

                this.historyPhishingCampaignsData = res.data.completedCampaigns;
                this.historyPhishingCampaignsDataForDashboardDropDown = [
                    { campaignName: 'All', campaignId: 'all' } as IAwarenessPhishingCampaignModel,
                    ...new Map(this.historyPhishingCampaignsData.map((item) => [item.campaignId, item])).values(),
                ];
            },
            error: (err) => {},
        });
        this.unsubscribe.push(sub);
    }

    fetchCurrentPhishingCampaignsDashboard() {
        this.apiService.getCurrentPhishingCampaignsDashboard(this.currentPhishingCampaignDashboardId).subscribe({
            next: (res) => {
                this.currentPhishingCampaignsDashboard = res.data;
                this.updateCurrentPhishingCampaignsDashboardPieChartData();
            },
            error: (err) => {},
        });
    }

    fetchCompletedPhishingCampaignsDashboard() {
        this.apiService.getCompletedPhishingCampaignsDashboard(this.completedPhishingCampaignDashboardId).subscribe({
            next: (res) => {
                this.completedPhishingCampaignsDashboard = res.data;
                this.updateCompletedPhishingCampaignsDashboardPieChartData();
            },
            error: (err) => {},
        });
    }

    fetchCompletedCampaignsTrendAnalysisDashboard() {
        this.apiService.getPhishingTrandAnalysis(this.selectedMonth).subscribe({
            next: (res) => {
                this.campaignsDashboardTrendAnalysisData = res.data;
                this.updateCompletedCampaignsDashboardTrendAnalysisChartData();
            },
            error: (err) => {},
        });
    }

    fetchPhishingCampaignsLeaderboardData() {
        this.apiService.getPhishingLeaderboard(this.currentPhishingCampaignDashboardId).subscribe({
            next: (res) => {
                this.leaderboardDataForUsers = res.data;
            },
            error: (err) => {},
        });
    }

    updateCurrentPhishingCampaignsDashboardPieChartData() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');

        if (
            this.currentPhishingCampaignsDashboard.reported === 0 &&
            this.currentPhishingCampaignsDashboard.noAction === 0 &&
            this.currentPhishingCampaignsDashboard.failed === 0
        ) {
            this.currentPhishingCampaignsDashboardPiehartData = {
                labels: [this.translate.getInstant('shared.messages.noDataAvailable')],
                datasets: [
                    {
                        data: [100],
                        backgroundColor: [textColorSecondary],
                        hoverBackgroundColor: [textColorSecondary],
                    },
                ],
            };
        } else {
            this.currentPhishingCampaignsDashboardPiehartData = {
                labels: [
                    this.translate.getInstant('phishingCampaignsDashboard.reported'),
                    this.translate.getInstant('phishingCampaignsDashboard.noAction'),
                    this.translate.getInstant('phishingCampaignsDashboard.failed'),
                ],
                datasets: [
                    {
                        data: [
                            this.currentPhishingCampaignsDashboard.reported,
                            this.currentPhishingCampaignsDashboard.noAction,
                            this.currentPhishingCampaignsDashboard.failed,
                        ],
                        backgroundColor: ['#28a745', '#6c757d', '#dc3545'],
                        hoverBackgroundColor: ['#218838', '#5a6268', '#c82333'],
                    },
                ],
            };
        }
    }

    initCurrentPhishingCampaignsDashboardPieChartOptions() {
        const documentStyle = getComputedStyle(document.documentElement);

        this.currentPhishingCampaignsDashboardPieChartOptions = {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top', // Keeps legend at the top,
                    usePointStyle: true,
                    align: 'start', // Ensures all items start at the same point (use 'end' for right alignment)
                    labels: {
                        usePointStyle: true, // Uses circular bullets instead of rectangles
                        boxWidth: 14, // Ensures uniform icon size
                        boxHeight: 14, // Ensures proper aspect ratio
                        padding: 10, // Adds spacing between legend items
                        textAlign: 'left', // Forces text alignment to start at the same point
                        fullSize: false, // Prevents stretching across the chart width
                        font: {
                            size: 14,
                            weight: 'bold', // Makes text clearer
                        },
                    },
                },
                tooltip: {
                    callbacks: {
                        label: (context: any) => {
                            const label = context.label;
                            if (label === this.translate.getInstant('shared.messages.noDataAvailable')) {
                                return '';
                            }
                            return `${label}: ${context.raw}`;
                        },
                    },
                },
                datalabels: {
                    formatter: (value: any, context: { dataIndex: number; chart: any }) => {
                        const label = context.chart.data.labels[context.dataIndex];
                        const numericValue = Number(value);
                        if (label === this.translate.getInstant('shared.messages.noDataAvailable')) {
                            return this.translate.getInstant('shared.messages.noDataAvailable');
                        }
                        if (!isNaN(numericValue) && numericValue !== 0) {
                            return `${numericValue}`;
                        }
                        return '';
                    },
                    color: '#fff',
                    font: {
                        size: 14,
                        weight: 'bold',
                    },
                    usePointStyle: true,
                    anchor: 'center',
                    align: 'center',
                    padding: {
                        left: 10,
                    },
                },
            },
            onClick: this.onCurrentPhishingCampaignSliceClick.bind(this),
            onHover: (event: any, chartElement: any) => {
                event.native.target.style.cursor = chartElement[0] ? 'pointer' : 'default';
            },
        };
    }

    onCurrentPhishingCampaignSliceClick(event: any) {
        const activePoints = event.chart.getElementsAtEventForMode(event.native, 'nearest', { intersect: true }, false);
        this.currentCampaignNameForReport =
            this.currentPhishingAwarenessCampaignsForDashboardDropDown.find(
                (c) => c.campaignId == this.currentPhishingCampaignDashboardId
            )?.campaignName ?? '';

        if (activePoints.length) {
            const chartElement = activePoints[0];
            const datasetIndex = chartElement.datasetIndex;
            const dataIndex = chartElement.index;
            const label = event.chart.data.labels[dataIndex];

            switch (label) {
                case this.translate.getInstant('phishingCampaignsDashboard.reported'):
                    this.displayCurrentPhishingCampaignReportedDialog = true;
                    this.getCurrentUsersCurrentPhishingAwarenessCampaignsForDashboard('reported');
                    break;
                case this.translate.getInstant('phishingCampaignsDashboard.noAction'):
                    this.displayCurrentPhishingCampaignNoActionDialog = true;
                    this.getCurrentUsersCurrentPhishingAwarenessCampaignsForDashboard('noaction');
                    break;
                case this.translate.getInstant('phishingCampaignsDashboard.failed'):
                    this.displayCurrentPhishingCampaignFailedDialog = true;
                    this.getCurrentUsersCurrentPhishingAwarenessCampaignsForDashboard('failed');
                    break;
                default:
                    break;
            }
        }
    }

    updateCompletedPhishingCampaignsDashboardPieChartData() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');

        if (
            this.completedPhishingCampaignsDashboard.reported === 0 &&
            this.completedPhishingCampaignsDashboard.noAction === 0 &&
            this.completedPhishingCampaignsDashboard.failed === 0
        ) {
            this.completedPhishingCampaignsDashboardPiehartData = {
                labels: [this.translate.getInstant('shared.messages.noDataAvailable')],
                datasets: [
                    {
                        data: [100],
                        backgroundColor: [textColorSecondary],
                        hoverBackgroundColor: [textColorSecondary],
                    },
                ],
            };
        } else {
            this.completedPhishingCampaignsDashboardPiehartData = {
                labels: [
                    this.translate.getInstant('phishingCampaignsDashboard.reported'),
                    this.translate.getInstant('phishingCampaignsDashboard.noAction'),
                    this.translate.getInstant('phishingCampaignsDashboard.failed'),
                ],
                datasets: [
                    {
                        data: [
                            this.completedPhishingCampaignsDashboard.reported,
                            this.completedPhishingCampaignsDashboard.noAction,
                            this.completedPhishingCampaignsDashboard.failed,
                        ],
                        backgroundColor: ['#28a745', '#6c757d', '#dc3545'],
                        hoverBackgroundColor: ['#218838', '#5a6268', '#c82333'],
                    },
                ],
            };
        }
    }

    initCompletedPhishingCampaignsDashboardPieChartOptions() {
        const documentStyle = getComputedStyle(document.documentElement);

        this.completedPhishingCampaignsDashboardPieChartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: 10,
            },
            plugins: {
                legend: {
                    position: 'top', // Keeps legend at the top,
                    usePointStyle: true,
                    align: 'start', // Ensures all items start at the same point (use 'end' for right alignment)
                    labels: {
                        usePointStyle: true, // Uses circular bullets instead of rectangles
                        boxWidth: 14, // Ensures uniform icon size
                        boxHeight: 14, // Ensures proper aspect ratio
                        padding: 10, // Adds spacing between legend items
                        textAlign: 'left', // Forces text alignment to start at the same point
                        fullSize: false, // Prevents stretching across the chart width
                        font: {
                            size: 14,
                            weight: 'bold', // Makes text clearer
                        },
                    },
                },
                tooltip: {
                    callbacks: {
                        label: (context: any) => {
                            const label = context.label;
                            if (label === this.translate.getInstant('shared.messages.noDataAvailable')) {
                                return '';
                            }
                            return `${label}: ${context.raw}`;
                        },
                    },
                },
                datalabels: {
                    formatter: (value: any, context: { dataIndex: number; chart: any }) => {
                        const label = context.chart.data.labels[context.dataIndex];
                        const numericValue = Number(value);
                        if (label === this.translate.getInstant('shared.messages.noDataAvailable')) {
                            return this.translate.getInstant('shared.messages.noDataAvailable');
                        }
                        if (!isNaN(numericValue) && numericValue !== 0) {
                            return `${numericValue}`;
                        }
                        return '';
                    },
                    color: '#fff',
                    font: {
                        size: 14,
                        weight: 'bold',
                    },
                    usePointStyle: true,
                    anchor: 'end',
                    align: 'start',
                    padding: 5,
                },
            },
            onClick: this.onCompletedPhishingCampaignSliceClick.bind(this),
            onHover: (event: any, chartElement: any) => {
                event.native.target.style.cursor = chartElement[0] ? 'pointer' : 'default';
            },
        };
    }

    onCompletedPhishingCampaignSliceClick(event: any) {
        const activePoints = event.chart.getElementsAtEventForMode(event.native, 'nearest', { intersect: true }, false);
        this.completedCampaignNameForReport =
            this.historyPhishingCampaignsDataForDashboardDropDown.find(
                (c) => c.campaignId == this.completedPhishingCampaignDashboardId
            )?.campaignName ?? '';

        if (activePoints.length) {
            const chartElement = activePoints[0];
            const dataIndex = chartElement.index;
            const label = event.chart.data.labels[dataIndex];

            switch (label) {
                case this.translate.getInstant('phishingCampaignsDashboard.reported'):
                    this.displayCompletedPhishingCampaignReportedDialog = true;
                    this.getCompletedUsersCompletedAwarenessCampaignsForDashboard('reported');
                    break;
                case this.translate.getInstant('phishingCampaignsDashboard.noAction'):
                    this.displayCompletedPhishingCampaignNoActionDialog = true;
                    this.getCompletedUsersCompletedAwarenessCampaignsForDashboard('noaction');
                    break;
                case this.translate.getInstant('phishingCampaignsDashboard.failed'):
                    this.displayCompletedPhishingCampaignFailedDialog = true;
                    this.getCompletedUsersCompletedAwarenessCampaignsForDashboard('failed');
                    break;
                default:
                    break;
            }
        }
    }

    getCurrentUsersCurrentPhishingAwarenessCampaignsForDashboard(action: string) {
        this.tableLoadingService.show();
        this.apiService
            .getUsersByActionCurrentPhishingCampaignsDashboard(this.currentPhishingCampaignDashboardId, action)
            .subscribe({
                next: (users) => {
                    this.phishingCampaignUsers = [];
                    this.phishingCampaignUsersSelected = [];
                    this.phishingCampaignUsers = users.data;
                    this.tableLoadingService.hide();
                },
                error: (error) => {
                    console.error('Error fetching users by action:', error);
                },
            });
    }

    getCompletedUsersCompletedAwarenessCampaignsForDashboard(action: string) {
        this.tableLoadingService.show();
        this.apiService
            .getUsersByActionCompletedPhishingCampaignsDashboard(this.completedPhishingCampaignDashboardId, action)
            .subscribe({
                next: (users) => {
                    this.phishingCampaignUsers = [];
                    this.phishingCampaignUsersSelected = [];
                    this.phishingCampaignUsers = users.data;
                    this.tableLoadingService.hide();
                },
                error: (error) => {
                    console.error('Error fetching users by action:', error);
                },
            });
    }

    onCurrentPhishingCampaignsDashboardDropdownChanged(event: DropdownChangeEvent) {
        if (event.value === 'all') {
            this.currentPhishingCampaignDashboardId = 'all';
            this.currentCampaignNameForReport = 'All Runining Phishing Campaigns';
        } else {
            this.currentPhishingCampaignDashboardId = event.value;
            this.currentCampaignNameForReport =
                this.currentPhishingAwarenessCampaignsForDashboardDropDown.find((c) => c.campaignId === event.value)
                    ?.campaignName ?? ' ';
        }
        this.fetchCurrentPhishingCampaignsDashboard();
        this.fetchPhishingCampaignsLeaderboardData();
    }

    onCompletedPhishingCampaignsDashboardDropdownChanged(event: DropdownChangeEvent) {
        if (event.value === 'all') {
            this.completedPhishingCampaignDashboardId = 'all';
            this.completedCampaignNameForReport = 'All Completed Phishing Campaigns';
        } else {
            this.completedPhishingCampaignDashboardId = event.value;
            this.completedCampaignNameForReport =
                this.historyPhishingCampaignsDataForDashboardDropDown.find((c) => c.campaignId === event.value)
                    ?.campaignName ?? ' ';
        }
        this.fetchCompletedPhishingCampaignsDashboard();
    }

    addToSelected(user: IPhishingCampaignUserModel) {
        this.checkboxStates[user.userId] = true;
        this.phishingCampaignUsersSelected.push(user);
    }

    removeFromSelected(user: IPhishingCampaignUserModel) {
        this.checkboxStates[user.userId] = false;
        this.phishingCampaignUsersSelected = this.phishingCampaignUsersSelected.filter((w) => w.userId !== user.userId);
    }

    toggleSelection(wall: any) {
        if (this.checkboxStates[wall.id]) {
            this.removeFromSelected(wall);
        } else {
            this.addToSelected(wall);
        }
    }

    addToselected(event: any, wall: any) {
        if (event.checked) {
            this.addToSelected(wall);
        } else {
            this.removeFromSelected(wall);
        }
    }

    addAllSelected(event: CheckboxChangeEvent) {
        if (event.checked) {
            this.phishingCampaignUsers.forEach((w) => {
                this.checkboxStates[w.userId] = true;
                this.phishingCampaignUsersSelected.push(w);
            });
        } else {
            this.phishingCampaignUsers.forEach((w) => {
                this.checkboxStates[w.userId] = false;
                this.phishingCampaignUsersSelected = this.phishingCampaignUsersSelected.filter(
                    (c) => c.userId !== w.userId
                );
            });
        }
    }

    downloadCurrentSelectedUsersReportAsPDF(action: string) {
        const data = this.phishingCampaignUsersSelected.map((w) => {
            return {
                User: `${w.userName}\n${w.userEmail}`,
                TenantUnit: w.unitName,
                Campaign: `${w.name}\n${this.formatDate(w.startDate)} - ${this.formatDate(w.endDate)}` || '',
                Template: w.templateName,
                Delivered: w.isDelivered,
                ...(action === 'Failed' && { Opened: w.isOpened }),
                ...(action === 'Failed' && { QRScanned: w.isQRCodeScanned }),
                ...(action === 'Failed' && { Clicked: w.isLinkClicked }),
                ...(action === 'Failed' && { DataEntered: w.isDataEntered }),
                ...(action === 'Reported' && { Reported: w.isReported }),
            };
        });

        const headers = [
            { header: 'User', dataKey: 'User' },
            { header: 'Department', dataKey: 'TenantUnit' },
            { header: 'Campaign', dataKey: 'Campaign' },
            { header: 'Template', dataKey: 'Template' },
            { header: 'Delivered', dataKey: 'Delivered' },
            ...(action === 'Failed'
                ? [
                      { header: 'Opened', dataKey: 'Opened' },
                      { header: 'QR Scanned', dataKey: 'QRScanned' },
                      { header: 'Clicked', dataKey: 'Clicked' },
                      { header: 'Data Entered', dataKey: 'DataEntered' },
                  ]
                : []),
            ...(action === 'Reported' ? [{ header: 'Reported', dataKey: 'Reported' }] : []),
        ];

        this.pdfService.exportDataToPdfVI(data, `${this.currentCampaignNameForReport} ${action} Users`, headers);
    }

    async downloadCurrentSelectedUsersReportAsCSV(action: string) {
        const data = this.phishingCampaignUsersSelected.map((w) => {
            return {
                User: w.userName,
                UserEmail: w.userEmail,
                TenantUnit: w.unitName,
                Campaign: w.name,
                CampaignStartDate: this.formatDate(w.startDate),
                CampaignEndDate: this.formatDate(w.endDate),
                Template: w.templateName,
                Delivered: w.isDelivered,
                ...(action === 'Failed' && { Opened: w.isOpened ? '✔️' : '' }),
                ...(action === 'Failed' && { QRScanned: w.isQRCodeScanned ? '✔️' : '' }),
                ...(action === 'Failed' && { Clicked: w.isLinkClicked ? '✔️' : '' }),
                ...(action === 'Failed' && { DataEntered: w.isDataEntered ? '✔️' : '' }),
                ...(action === 'Reported' && { Reported: w.isReported ? '✔️' : '' }),
            };
        });

        const headers = [
            { header: 'User', dataKey: 'User' },
            { header: 'Department', dataKey: 'TenantUnit' },
            { header: 'Campaign', dataKey: 'Campaign' },
            { header: 'Template', dataKey: 'Template' },
            { header: 'Delivered', dataKey: 'Delivered' },
            ...(action === 'Failed'
                ? [
                      { header: 'Opened', dataKey: 'Opened' },
                      { header: 'QR Scanned', dataKey: 'QRScanned' },
                      { header: 'Clicked', dataKey: 'Clicked' },
                      { header: 'Data Entered', dataKey: 'DataEntered' },
                  ]
                : []),
            ...(action === 'Reported' ? [{ header: 'Reported', dataKey: 'Reported' }] : []),
        ];

        await this.excelService.exportExcelVI(data, `${this.currentCampaignNameForReport} ${action} Users`, headers);
    }

    downloadCompletedSelectedUsersReportAsPDF(action: string) {
        const data = this.phishingCampaignUsersSelected.map((w) => {
            return {
                User: `${w.userName}\n${w.userEmail}`,
                TenantUnit: w.unitName,
                Campaign: `${w.name}\n${this.formatDate(w.startDate)} - ${this.formatDate(w.endDate)}` || '',
                Template: w.templateName,
                Delivered: w.isDelivered,
                ...(action === 'Failed' && { Opened: w.isOpened }),
                ...(action === 'Failed' && { QRScanned: w.isQRCodeScanned }),
                ...(action === 'Failed' && { Clicked: w.isLinkClicked }),
                ...(action === 'Failed' && { DataEntered: w.isDataEntered }),
                ...(action === 'Reported' && { Reported: w.isReported }),
            };
        });

        const headers = [
            { header: 'User', dataKey: 'User' },
            { header: 'Department', dataKey: 'TenantUnit' },
            { header: 'Campaign', dataKey: 'Campaign' },
            { header: 'Template', dataKey: 'Template' },
            { header: 'Delivered', dataKey: 'Delivered' },
            ...(action === 'Failed'
                ? [
                      { header: 'Opened', dataKey: 'Opened' },
                      { header: 'QR Scanned', dataKey: 'QRScanned' },
                      { header: 'Clicked', dataKey: 'Clicked' },
                      { header: 'Data Entered', dataKey: 'DataEntered' },
                  ]
                : []),
            ...(action === 'Reported' ? [{ header: 'Reported', dataKey: 'Reported' }] : []),
        ];

        this.pdfService.exportDataToPdfVI(data, `${this.completedCampaignNameForReport} ${action} Users`, headers);
    }

    async downloadCompletedSelectedUsersReportAsCSV(action: string) {
        const data = this.phishingCampaignUsersSelected.map((w) => {
            return {
                User: w.userName,
                UserEmail: w.userEmail,
                TenantUnit: w.unitName,
                Campaign: w.name,
                CampaignStartDate: this.formatDate(w.startDate),
                CampaignEndDate: this.formatDate(w.endDate),
                Template: w.templateName,
                Delivered: w.isDelivered,
                ...(action === 'Failed' && { Opened: w.isOpened ? '✔️' : '' }),
                ...(action === 'Failed' && { QRScanned: w.isQRCodeScanned ? '✔️' : '' }),
                ...(action === 'Failed' && { Clicked: w.isLinkClicked ? '✔️' : '' }),
                ...(action === 'Failed' && { DataEntered: w.isDataEntered }),
                ...(action === 'Reported' && { Reported: w.isReported ? '✔️' : '' }),
            };
        });

        const headers = [
            { header: 'User', dataKey: 'User' },
            { header: 'Department', dataKey: 'TenantUnit' },
            { header: 'Campaign', dataKey: 'Campaign' },
            { header: 'Template', dataKey: 'Template' },
            { header: 'Delivered', dataKey: 'Delivered' },
            ...(action === 'Failed'
                ? [
                      { header: 'Opened', dataKey: 'Opened' },
                      { header: 'QR Scanned', dataKey: 'QRScanned' },
                      { header: 'Clicked', dataKey: 'Clicked' },
                      { header: 'Data Entered', dataKey: 'DataEntered' },
                  ]
                : []),
            ...(action === 'Reported' ? [{ header: 'Reported', dataKey: 'Reported' }] : []),
        ];

        await this.excelService.exportExcelVI(data, `${this.currentCampaignNameForReport} ${action} Users`, headers);
    }

    downloadAllCurrentPhishingCampaignUsersReportAsPDF() {
        this.apiService
            .getUsersByActionCurrentPhishingCampaignsDashboard(this.currentPhishingCampaignDashboardId, 'all')
            .subscribe({
                next: (users) => {
                    this.phishingCampaignUsers = users.data;
                    if (this.phishingCampaignUsers && this.phishingCampaignUsers.length > 0) {
                        const data = this.phishingCampaignUsers.map((w) => {
                            return {
                                User: `${w.userName}\n${w.userEmail}`,
                                TenantUnit: w.unitName,
                                Campaign:
                                    `${w.name}\n${this.formatDate(w.startDate)} - ${this.formatDate(w.endDate)}` || '',
                                Template: w.templateName,
                                Delivered: w.isDelivered,
                                Opened: w.isOpened,
                                QRScanned: w.isQRCodeScanned,
                                Clicked: w.isLinkClicked,
                                DataEntered: w.isDataEntered,
                                Reported: w.isReported,
                            };
                        });
                        console.log(data);

                        const headers = [
                            { header: 'User', dataKey: 'User' },
                            { header: 'Department', dataKey: 'TenantUnit' },
                            { header: 'Campaign', dataKey: 'Campaign' },
                            { header: 'Template', dataKey: 'Template' },
                            { header: 'Delivered', dataKey: 'Delivered' },
                            { header: 'Opened', dataKey: 'Opened' },
                            { header: 'QR Scanned', dataKey: 'QRScanned' },
                            { header: 'Clicked', dataKey: 'Clicked' },
                            { header: 'Data Entered', dataKey: 'DataEntered' },
                            { header: 'Reported', dataKey: 'Reported' },
                        ];
                        this.pdfService.exportDataToPdfVI(
                            data,
                            this.currentCampaignNameForReport?.replace('[R]', 'Running'),
                            headers
                        );
                    } else {
                        this.messageService.add({
                            severity: 'info',
                            summary: 'No Data',
                            detail: 'No data found for generate report.',
                        });
                    }
                },
                error: (error) => {
                    console.error('Error fetching users by action:', error);
                },
            });
    }
    downloadAllCurrentPhishingCampaignUsersReportAsCSV() {
        this.apiService
            .getUsersByActionCurrentPhishingCampaignsDashboard(this.currentPhishingCampaignDashboardId, 'all')
            .subscribe({
                next: async (users) => {
                    this.phishingCampaignUsers = users.data;
                    if (this.phishingCampaignUsers && this.phishingCampaignUsers.length > 0) {
                        const data = this.phishingCampaignUsers.map((w) => {
                            return {
                                User: w.userName,
                                UserEmail: w.userEmail,
                                TenantUnit: w.unitName,
                                Campaign: w.name,
                                CampaignStartDate: this.formatDate(w.startDate),
                                CampaignEndDate: this.formatDate(w.endDate),
                                Template: w.templateName,
                                Delivered: w.isDelivered ? '✔️' : '',
                                Opened: w.isOpened ? '✔️' : '',
                                QRScanned: w.isQRCodeScanned ? '✔️' : '',
                                Clicked: w.isLinkClicked ? '✔️' : '',
                                DataEntered: w.isDataEntered ? '✔️' : '',
                                Reported: w.isReported ? '✔️' : '',
                            };
                        });

                        const headers = [
                            { header: 'User', dataKey: 'User' },
                            { header: 'Department', dataKey: 'TenantUnit' },
                            { header: 'Campaign', dataKey: 'Campaign' },
                            { header: 'Template', dataKey: 'Template' },
                            { header: 'Delivered', dataKey: 'Delivered' },
                            { header: 'Opened', dataKey: 'Opened' },
                            { header: 'QR Scanned', dataKey: 'QRScanned' },
                            { header: 'Clicked', dataKey: 'Clicked' },
                            { header: 'Data Entered', dataKey: 'DataEntered' },
                            { header: 'Reported', dataKey: 'Reported' },
                        ];

                        await this.excelService.exportExcelVI(
                            data,
                            this.currentCampaignNameForReport?.replace('[R]', 'Running'),
                            headers
                        );
                    } else {
                        this.messageService.add({
                            severity: 'info',
                            summary: 'No Data',
                            detail: 'No data found for generate report.',
                        });
                    }
                },
                error: (error) => {
                    console.error('Error fetching users by action:', error);
                },
            });
    }

    downloadAllCompletedPhishingCampaignUsersReportAsPDF() {
        this.apiService
            .getUsersByActionCompletedPhishingCampaignsDashboard(this.completedPhishingCampaignDashboardId, 'all')
            .subscribe({
                next: (users) => {
                    this.phishingCampaignUsers = users.data;
                    if (this.phishingCampaignUsers && this.phishingCampaignUsers.length > 0) {
                        const data = this.phishingCampaignUsers.map((w) => {
                            return {
                                User: `${w.userName}\n${w.userEmail}`,
                                TenantUnit: w.unitName,
                                Campaign:
                                    `${w.name}\n${this.formatDate(w.startDate)} - ${this.formatDate(w.endDate)}` || '',
                                Template: w.templateName,
                                Delivered: w.isDelivered,
                                Opened: w.isOpened,
                                QRScanned: w.isQRCodeScanned,
                                Clicked: w.isLinkClicked,
                                DataEntered: w.isDataEntered,
                                Reported: w.isReported,
                            };
                        });

                        const headers = [
                            { header: 'User', dataKey: 'User' },
                            { header: 'Department', dataKey: 'TenantUnit' },
                            { header: 'Campaign', dataKey: 'Campaign' },
                            { header: 'Template', dataKey: 'Template' },
                            { header: 'Delivered', dataKey: 'Delivered' },
                            { header: 'Opened', dataKey: 'Opened' },
                            { header: 'Clicked', dataKey: 'Clicked' },
                            { header: 'QR Scanned', dataKey: 'QRScanned' },
                            { header: 'Data Entered', dataKey: 'DataEntered' },
                            { header: 'Reported', dataKey: 'Reported' },
                        ];
                        this.pdfService.exportDataToPdfVI(
                            data,
                            this.completedCampaignNameForReport?.replace('[C]', 'Completed'),
                            headers
                        );
                    } else {
                        this.messageService.add({
                            severity: 'info',
                            summary: 'No Data',
                            detail: 'No data found for generate report.',
                        });
                    }
                },
                error: (error) => {
                    console.error('Error fetching users by action:', error);
                },
            });
    }

    downloadAllCompletedPhishingCampaignUsersReportAsCSV() {
        this.apiService
            .getUsersByActionCompletedPhishingCampaignsDashboard(this.completedPhishingCampaignDashboardId, 'all')
            .subscribe({
                next: async (users) => {
                    this.phishingCampaignUsers = users.data;
                    if (this.phishingCampaignUsers && this.phishingCampaignUsers.length > 0) {
                        const data = this.phishingCampaignUsers.map((w) => {
                            return {
                                User: w.userName,
                                UserEmail: w.userEmail,
                                TenantUnit: w.unitName,
                                Campaign: w.name,
                                CampaignStartDate: this.formatDate(w.startDate),
                                CampaignEndDate: this.formatDate(w.endDate),
                                Template: w.templateName,
                                Delivered: w.isDelivered ? '✔️' : '',
                                Opened: w.isOpened ? '✔️' : '',
                                QRScanned: w.isQRCodeScanned ? '✔️' : '',
                                Clicked: w.isLinkClicked ? '✔️' : '',
                                DataEntered: w.isDataEntered ? '✔️' : '',
                                Reported: w.isReported ? '✔️' : '',
                            };
                        });

                        const headers = [
                            { header: 'User', dataKey: 'User' },
                            { header: 'Department', dataKey: 'TenantUnit' },
                            { header: 'Campaign', dataKey: 'Campaign' },
                            { header: 'Template', dataKey: 'Template' },
                            { header: 'Delivered', dataKey: 'Delivered' },
                            { header: 'Opened', dataKey: 'Opened' },
                            { header: 'Clicked', dataKey: 'Clicked' },
                            { header: 'QR Scanned', dataKey: 'QRScanned' },
                            { header: 'Data Entered', dataKey: 'DataEntered' },
                            { header: 'Reported', dataKey: 'Reported' },
                        ];

                        await this.excelService.exportExcelVI(
                            data,
                            this.completedCampaignNameForReport?.replace('[C]', 'Completed'),
                            headers
                        );
                    } else {
                        this.messageService.add({
                            severity: 'info',
                            summary: 'No Data',
                            detail: 'No data found for generate report.',
                        });
                    }
                },
                error: (error) => {
                    console.error('Error fetching users by action:', error);
                },
            });
    }

    formatDate(date: Date): string {
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
        return new Intl.DateTimeFormat('en-US', options).format(new Date(date));
    }

    updateCompletedCampaignsDashboardTrendAnalysisChartData() {
        const documentStyle = getComputedStyle(document.documentElement);
        const { failedData, labels, noActionData, reportedData } = this.campaignsDashboardTrendAnalysisData;
        this.campaignsDashboardTrendAnalysisChartData = {
            labels: labels,
            datasets: [
                {
                    label: this.translate.getInstant('phishingCampaignsDashboard.reported'),
                    data: reportedData,
                    fill: false,
                    borderColor: documentStyle.getPropertyValue('--green-500'),
                    tension: 0.4,
                },
                {
                    label: this.translate.getInstant('phishingCampaignsDashboard.failed'),
                    data: failedData,
                    fill: false,
                    borderColor: documentStyle.getPropertyValue('--red-500'),
                    tension: 0.4,
                },
                {
                    label: this.translate.getInstant('phishingCampaignsDashboard.noAction'),
                    data: noActionData,
                    fill: false,
                    borderColor: documentStyle.getPropertyValue('--gray-500'),
                    tension: 0.4,
                },
            ],
        };
    }

    initCompletedCampaignsDashboardTrendAnalysisChartOptions() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');
        this.campaignsDashboardTrendAnalysisChartOptions = {
            maintainAspectRatio: false,
            aspectRatio: 0.6,
            plugins: {
                legend: {
                    position: 'top', // Keeps legend at the top,
                    usePointStyle: true,
                    align: 'center', // Ensures all items start at the same point (use 'end' for right alignment)
                    labels: {
                        usePointStyle: true, // Uses circular bullets instead of rectangles
                        boxWidth: 14, // Ensures uniform icon size
                        boxHeight: 14, // Ensures proper aspect ratio
                        padding: 10, // Adds spacing between legend items
                        textAlign: 'left', // Forces text alignment to start at the same point
                        fullSize: false, // Prevents stretching across the chart width
                        font: {
                            size: 14,
                            weight: 'bold', // Makes text clearer
                        },
                    },
                },
                datalabels: {
                    display: false,
                },
            },
            scales: {
                x: {
                    ticks: {
                        color: textColorSecondary,
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false,
                    },
                },
                y: {
                    ticks: {
                        color: textColorSecondary,
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false,
                    },
                },
            },
        };
    }

    onCompletedTrendAnalysisDashboardDropdownChanged(event: DropdownChangeEvent) {
        this.selectedMonth = event.value;
        this.fetchCompletedCampaignsTrendAnalysisDashboard();
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    getPhishingCampaignUsers(): IPhishingCampaignUserModel[] {
        const uniqueUserIds = new Set<string>();
        return this.phishingCampaignUsers.filter((user) => {
            if (!uniqueUserIds.has(user.userId)) {
                uniqueUserIds.add(user.userId);
                return true;
            }
            return false;
        });
    }

    ngOnDestroy(): void {
        this.unsubscribe.forEach((sub) => sub.unsubscribe());
    }
}