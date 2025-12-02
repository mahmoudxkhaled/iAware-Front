import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { CampaignService } from '../../services/campaign.service';
import { IAwarenessCampaignStatisticsModel } from '../../models/IAwarenessCampaignStatisticsModel';
import { ITrainingCampaignScedualUsersProgressModel } from '../../models/ITrainingCampaignScedualUsersProgressModel';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { TableLoadingService } from 'src/app/core/Services/table-loading.service';
import { ILeaderboardStatisticsModel } from 'src/app/modules/leaderboard/models/ILeaderboardStatisticsModel';
import { PdfService } from 'src/app/core/Services/pdf.service';
import { ExcelService } from 'src/app/core/Services/excel.service';
import { TranslationService } from 'src/app/core/Services/translation.service';

@Component({
    selector: 'app-training-campaign-statistics',
    templateUrl: './training-campaign-statistics.component.html',
    styleUrl: './training-campaign-statistics.component.scss',
})

export class TrainingCampaignStatisticsComponent implements OnInit {
    tableLoadingSpinner: boolean = true;

    displayDialog: boolean = false;
    clickedSliceData: any[] = [];
    dounghtChartHeader: string = '';

    lineChartData: any;
    lineChartOptions: any;

    doughnutChartData: any;
    doughnutChartOptions: any;

    campaignId: string;
    unsubscribe: Subscription[] = [];
    viewUsersProgressDialog: boolean = false;
    campaignStatistcsData: IAwarenessCampaignStatisticsModel = {
        awarenessCampaignStatisticsLessons: [],
        compelationPercentage: 0,
        endDate: new Date(),
        numberOfDays: 0,
        durationString:'',
        startDate: new Date(),
        usersCount: 0,
        campaignName: '',
        campaignStatus: '',
    };

    leaderboardDataForUsers: ILeaderboardStatisticsModel = {
        rankedUsers: [],
        topThreeRankedUsers: [],
    };
    usersProgress: ITrainingCampaignScedualUsersProgressModel[] = [];

    constructor(
        private route: ActivatedRoute,
        private apiService: CampaignService,
        private pdfService: PdfService,
        private excelService: ExcelService,
        private tableLoadingService: TableLoadingService,
        private translate : TranslationService
    ) {
        Chart.register(...registerables, ChartDataLabels);
        const x = this.route.params.subscribe((params) => {
            this.campaignId = params['id'];
        });
        this.unsubscribe.push(x);
    }

    ngOnInit(): void {
        this.tableLoadingService.loading$.subscribe((isLoading) => {
            this.tableLoadingSpinner = isLoading;
        });
        this.initiateDoughnutChartOptions();
        this.initiateLineChartOptions();
        this.fetchCampaignStatisticsData();
        this.fetchTrainingCampaignsLeaderboardData();
    }

    fetchCampaignStatisticsData() {
        this.tableLoadingService.show();
        const x = this.apiService.getGetAwarenessTrainingCampaignStatistics(this.campaignId).subscribe({
            next: (res) => {
                if (res.data) {
                    this.campaignStatistcsData = res.data;
                    this.initiateLineChartData();
                    this.initDoughnutChartData();
                    this.tableLoadingService.hide();
                }
            },
            error: (e) => { },
        });
    }

    fetchTrainingCampaignsLeaderboardData() {
        this.apiService.getTrainingLeaderboard(this.campaignId).subscribe({
            next: (res) => {
                this.leaderboardDataForUsers = res.data;
            },
            error: (err) => { },
        });
    }

    initiateLineChartOptions() {
        this.lineChartOptions = {
            plugins: {
                datalabels: {
                    display: false,
                },
                legend: {
                    display: true,
                    labels: {
                        usePointStyle: true,
                        color: '#FF6384',
                    },
                },
            },
            scales: {
                x: {
                    ticks: {
                        color: '#9E9E9E',
                    },
                    grid: {
                        color: '#E0E0E0',
                        display: false,
                    },
                },
                y: {
                    suggestedMax: this.campaignStatistcsData.usersCount,
                    ticks: {
                        color: '#9E9E9E',
                        stepSize: 1,
                        precision: 0,
                    },
                    grid: {
                        color: '#E0E0E0',
                    },
                },
            },
        };
    }

    initiateLineChartData() {
        this.lineChartData = {
            labels: this.campaignStatistcsData.awarenessTrainingCampaignUserCompletionActivity?.awarenessTrainingCampaignDayes,
            datasets: [
                {
                    label: this.translate.getInstant('training-campaigns.training-campaign-statistics.numberofUserswhohavenotcompletedtheirassignments'),
                    data: this.campaignStatistcsData.awarenessTrainingCampaignUserCompletionActivity?.userCompletionActivity,
                    fill: false,
                    borderColor: '#42A5F5',
                    tension: 0.4,
                },
            ],
        };
    }

    initiateDoughnutChartOptions() {
        this.doughnutChartOptions = {
            cutout: '60%',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    enabled: true,
                },
                datalabels: {
                    doughnutlabel: {
                        display: true,
                        color: 'red',
                        labels: [
                            {
                                text: '550',
                                font: {
                                    size: 20,
                                    weight: 'bold',
                                },
                            },
                            {
                                text: 'total',
                            },
                        ],
                    },
                    formatter: (value: any, context: { dataIndex: number }) => {
                        const numericValue = Number(value);
                        if (!isNaN(numericValue) && numericValue !== 0) {
                            return `${numericValue}%`;
                        }
                        return '';
                    },
                    display: true,
                    color: '#fff',
                    font: {
                        size: 15,
                    },
                },
                legend: {
                    usePointStyle: true,
                    display: true,
                },
            },
            onClick: (event: any, elements: any[]) => {
                if (elements && elements.length > 0) {
                    const elementIndex = elements[0].index;
                    const labelName = this.doughnutChartData.labels[elementIndex];
                    this.showDialogForSlice(labelName);
                }
            },
            onHover: (event: any, chartElement: any) => {
                event.native.target.style.cursor = chartElement[0] ? 'pointer' : 'default';
            },
        };
    }

    initDoughnutChartData() {
        const documentStyle = getComputedStyle(document.documentElement);
        this.doughnutChartData = {
            labels: [this.translate.getInstant('training-campaigns.training-campaign-statistics.completed'), this.translate.getInstant('training-campaigns.training-campaign-statistics.remaining')],
            datasets: [
                {
                    data: [this.campaignStatistcsData.compelationPercentage, 100 - this.campaignStatistcsData.compelationPercentage,
                    ],
                    backgroundColor: ['green', 'red'],
                    hoverBackgroundColor: ['green', 'red'],
                    borderWidth: 1,
                    borderColor: documentStyle.getPropertyValue('--surface-border'),
                },
            ],
        };
    }

    showDialogForSlice(label: string) {
        switch (label) {
            case this.translate.getInstant('training-campaigns.training-campaign-statistics.completed'):
                this.dounghtChartHeader = this.translate.getInstant('training-campaigns.training-campaign-statistics.completedUsers');
                this.fetchUsersCompletedAllLessonsInThisCampaign();
                break;
            case this.translate.getInstant('training-campaigns.training-campaign-statistics.remaining'):
                this.dounghtChartHeader = this.translate.getInstant('training-campaigns.training-campaign-statistics.remainingUsers');
                this.fetchUsersNotCompletedAllLessonsInThisCampaign();
                break;
            default:
                this.clickedSliceData = [];
                break;
        }
        this.displayDialog = true;
    }

    fetchUsersCompletedAllLessonsInThisCampaign() {
        this.tableLoadingService.show();
        this.apiService.getGetUsersCompletedAllLessonsInThisCampaign(this.campaignId).subscribe({
            next: (res) => {
                this.clickedSliceData = res.data;
                this.tableLoadingService.hide();
            },
            error: (err) => { },
        });
    }

    fetchUsersNotCompletedAllLessonsInThisCampaign() {
        this.tableLoadingService.show();
        this.apiService.getGetUsersNotCompletedAllLessonsInThisCampaign(this.campaignId).subscribe({
            next: (res) => {
                this.clickedSliceData = res.data;
                this.tableLoadingService.hide();
            },
            error: (err) => { },
        });
    }

    downloadSelectedUsersReportAsPDF() {
        const data = this.clickedSliceData.map((w) => ({
            UserName: w.userName,
            UserEmail: w.email,
            TenantUnit: w.unitName || '',
            Campaign: `${this.campaignStatistcsData.campaignName}\n\n${this.formatDate(this.campaignStatistcsData.startDate)} - ${this.formatDate(this.campaignStatistcsData.endDate)}` || '',
        }));

        const headers = [
            { header: 'User Name', dataKey: 'UserName' },
            { header: 'User Email', dataKey: 'UserEmail' },
            { header: 'Department', dataKey: 'TenantUnit' },
            { header: 'Campaign', dataKey: 'Campaign' },
        ];
        this.pdfService.exportDataToPdfVI(data, `${this.campaignStatistcsData.campaignName}\n${this.dounghtChartHeader} Report`, headers);
    }

    async downloadSelectedUsersReportAsCSV() {
        const data = this.clickedSliceData.map((w) => ({
            UserName: w.userName,
            UserEmail: w.email,
            TenantUnit: w.unitName || '',
            Campaign: this.campaignStatistcsData.campaignName,
            CampaignStartDate: this.formatDate(w.startDate),
            CampaignEndDate: this.formatDate(w.endDate),
        }));

        const headers = [
            { header: 'User Name', dataKey: 'UserName' },
            { header: 'User Email', dataKey: 'UserEmail' },
            { header: 'Department', dataKey: 'TenantUnit' },
            { header: 'Campaign', dataKey: 'Campaign' },
            { header: 'Campaign StartDate', dataKey: 'CampaignStartDate' },
            { header: 'Campaign EndDate', dataKey: 'CampaignEndDate' },
        ];
        await this.excelService.exportExcelVI(data, `${this.campaignStatistcsData.campaignName} ${this.dounghtChartHeader} Report`, headers);
    }

    formatDate(date: Date): string {
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
        return new Intl.DateTimeFormat('en-US', options).format(new Date(date));
    }

    viewUsersProgress(awarenessCampaignScheduleId: string) {
        this.tableLoadingService.show();
        this.viewUsersProgressDialog = true;
        this.apiService.getTrainingCampaignScedualDetails(awarenessCampaignScheduleId).subscribe({
            next: (res) => {
                this.usersProgress = res.data;
                this.tableLoadingService.hide();
            },
            error: (e) => { },
        });
    }
}