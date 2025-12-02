import { Component, OnInit } from '@angular/core';
import { IAwarenessCampaignSimulationPhishingTemplateModel } from '../../models/IAwarenessCampaignSimulationPhishingTemplateModel';
import { SharedDataService } from '../../../../core/Services/shared-data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ExcelService } from 'src/app/core/Services/excel.service';
import { MessageService } from 'primeng/api';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Chart, registerables } from 'chart.js';
import { PhishingcampaignsService } from '../../services/phishingcampaigns.service';
import { PdfService } from 'src/app/core/Services/pdf.service';
import { TableLoadingService } from 'src/app/core/Services/table-loading.service';
import { IAwarenessCampaignSimulationPhishingScheduleUserModel } from '../../models/IAwarenessCampaignSimulationPhishingScheduleUserModel';
import { TranslationService } from 'src/app/core/Services/translation.service';

@Component({
    selector: 'app-phishing-campaign-template-statistics',
    templateUrl: './phishing-campaign-template-statistics.component.html',
    styleUrl: './phishing-campaign-template-statistics.component.scss',
})
export class PhishingCampaignStatisticsTemplateDetailsComponent implements OnInit {
    tableLoadingSpinner: boolean = true;
    filteredUsers: IAwarenessCampaignSimulationPhishingScheduleUserModel[] = [];
    currentTemplateSelectedtemplate: IAwarenessCampaignSimulationPhishingTemplateModel;
    campaignId: string;
    chartData: any;
    chartOptions: any;
    constructor(
        private sharingDataService: SharedDataService,
        private router: Router,
        private route: ActivatedRoute,
        private excelService: ExcelService,
        private pdfService: PdfService,
        private apiService: PhishingcampaignsService,
        private messageService: MessageService,
        private tableLoadingService: TableLoadingService,
        private translate : TranslationService
    ) {
        this.route.queryParams.subscribe((params) => {
            this.campaignId = params['campaignId'];
        });
        Chart.register(...registerables, ChartDataLabels);
    }

    ngOnInit(): void {
        this.tableLoadingService.loading$.subscribe((isLoading) => {
            this.tableLoadingSpinner = isLoading;
        });
        this.tableLoadingService.show();

        const data  = this.sharingDataService.getData();
        if (!data) {
            this.router.navigate([`phishing-campaigns/p-campaign-statistics/${this.campaignId}`]);
            this.tableLoadingService.hide();
        } else {
            this.tableLoadingService.hide();
            this.currentTemplateSelectedtemplate = this.sharingDataService.getData();
            this.filteredUsers = this.currentTemplateSelectedtemplate.awarenessCampaignSimulationPhishingScheduleUsers;
            this.initializeChart();
        }
    }

    async downloadPhishingReportAsCSV(awarenessCampaignSimulationPhishingScheduleUsersData: any) {
        const filteredData = awarenessCampaignSimulationPhishingScheduleUsersData.map((c: any) => {
            return {
                User: c.userName,
                Delivered: c.isDelivered ? '✔️' : '',
                Opened: c.isOpened ? '✔️' : '',
                LinkClicked: c.isLinkClicked ? '✔️' : '',
                QRCodeScanned: c.isQRCodeScanned ? '✔️' : '',
                DataEntered: c.isDataEntered ? '✔️' : '',
                Reported: c.isReported ? '✔️' : ''
            };            
        });
        const headers = [
            { header: 'User', dataKey: 'User' },
            { header: 'Delivered', dataKey: 'Delivered' },
            { header: 'Opened', dataKey: 'Opened' },
            { header: 'Link Clicked', dataKey: 'LinkClicked' },
            { header: 'QR Code Scanned', dataKey: 'QRCodeScanned' },
            { header: 'Data Entered', dataKey: 'DataEntered' },
            { header: 'Reported', dataKey: 'Reported' },
        ];
        await this.excelService.exportExcelVI( filteredData, `${this.currentTemplateSelectedtemplate.phishingEmailTemplateName} Report`, headers);
    }

    downloadPhishingReportAsPDF(awarenessCampaignSimulationPhishingScheduleUsersData: any) {
        const filteredData = awarenessCampaignSimulationPhishingScheduleUsersData.map((c: any) => {
            return {
                User: `${c.userName}\n${c.userEmail}`,
                Delivered: c.isDelivered ,
                Opened: c.isOpened,
                LinkClicked: c.isLinkClicked ,
                QRCodeScanned: c.isQRCodeScanned ,
                DataEntered: c.isDataEntered ,
                Reported: c.isReported 
            };
        });
        const headers = [
            { header: 'User', dataKey: 'User' },
            { header: 'Delivered', dataKey: 'Delivered' },
            { header: 'Opened', dataKey: 'Opened' },
            { header: 'Link Clicked', dataKey: 'LinkClicked' },
            { header: 'QR Code Scanned', dataKey: 'QRCodeScanned' },
            { header: 'Data Entered', dataKey: 'DataEntered' },
            { header: 'Reported', dataKey: 'Reported' },
        ];
        this.pdfService.exportDataToPdfVI(filteredData, `${this.currentTemplateSelectedtemplate.phishingEmailTemplateName} Report`, headers);
    }

    updatePhishingReport() {
        this.apiService.fetchAwarenessCampaignSimulationPhishingsForThisCampaign(this.campaignId).subscribe({
            next: (res) => {
                this.currentTemplateSelectedtemplate = res.data.find(
                    (c: any) => this.currentTemplateSelectedtemplate.id == c.id
                );

                if (!this.currentTemplateSelectedtemplate) {
                    this.router.navigate([`campaign/p-campaign-statistics/${this.campaignId}`]);
                }
                this.messageService.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Report Data Updated',
                    life: 3000,
                });
            },
            error: (err) => {},
        });
    }

    initializeChart() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--primary-color');
        const dayes = this.currentTemplateSelectedtemplate.awarenessCampaignSimulationPhishingFailuresByDay.days;
        const usersCount =
            this.currentTemplateSelectedtemplate.awarenessCampaignSimulationPhishingFailuresByDay.usersCount;
        this.chartData = {
            labels: dayes,
            datasets: [
                {
                    label: this.translate.getInstant('phishing-campaigns.phishing-campaign-template-statistics.failuress'),
                    backgroundColor: '#42A5F5',
                    data: usersCount,
                },
            ],
        };
        const maxUsersCount = Math.max(...usersCount);
        const yAxisMax = maxUsersCount + 2;

        this.chartOptions = {
            plugins: {
                legend: {
                    labels: {
                        usePointStyle: true,
                    },
                },
                datalabels: {
                    display: true,
                    color: textColor,
                    anchor: 'end',
                    align: 'end',
                    formatter: (value: number) => this.translate.getInstant('phishing-campaigns.phishing-campaign-template-statistics.failuress').replace('[value]', `${value}`),
                    font: {
                        weight: 'bold',
                    },
                    padding: 6,
                },
            },
            scales: {
                x: {
                    title: {
                        display: true,
                    },
                    grid: {
                        display: false,
                    },
                },
                y: {
                    suggestedMax: yAxisMax,
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        precision: 0,
                    },
                    title: {
                        display: true,
                        text: this.translate.getInstant('phishing-campaigns.phishing-campaign-template-statistics.failuress'),
                    },
                },
            },
        };
    }

    onSectionClick(sectionName: string): void {
        switch (sectionName) {
            case 'Recipients':
                this.filteredUsers = this.currentTemplateSelectedtemplate.awarenessCampaignSimulationPhishingScheduleUsers;
                break;
            case 'Delivered':
                this.filteredUsers = this.currentTemplateSelectedtemplate.awarenessCampaignSimulationPhishingScheduleUsers.filter(user => user.isDelivered);
                break;
            case 'Opened':
                this.filteredUsers = this.currentTemplateSelectedtemplate.awarenessCampaignSimulationPhishingScheduleUsers.filter(user => user.isOpened);
                break;
            case 'QR Code Scanned':
                this.filteredUsers = this.currentTemplateSelectedtemplate.awarenessCampaignSimulationPhishingScheduleUsers.filter(user => user.isQRCodeScanned);
                break;
            case 'Data Entered':
                this.filteredUsers = this.currentTemplateSelectedtemplate.awarenessCampaignSimulationPhishingScheduleUsers.filter(user => user.isDataEntered);
                break;
            case 'Reported':
                this.filteredUsers = this.currentTemplateSelectedtemplate.awarenessCampaignSimulationPhishingScheduleUsers.filter(user => user.isReported);
                break;
            default:
                this.filteredUsers = this.currentTemplateSelectedtemplate.awarenessCampaignSimulationPhishingScheduleUsers;
                break;
        }
    }    

    back(){
        this.router.navigate([`phishing-campaigns/p-campaign-statistics/${this.campaignId}`]);
      }
}