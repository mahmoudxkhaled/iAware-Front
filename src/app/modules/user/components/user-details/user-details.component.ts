import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { initializeUserModel } from '../../models/IUserModel';
import { Subscription } from 'rxjs';
import { IUserTrainingResultsModel } from '../../models/IUserTrainingResultsModel';
import { IUserPhishingResults } from '../../models/IUserPhishingResults';
import { IUserPhishingResultsDetails } from '../../models/IUserPhishingResultsDetails';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Chart, registerables } from 'chart.js';
import { IUserTrainingResultsDetails } from '../../models/IUserTrainingResultsDetails';
import { IUserCampaignsDashboard } from '../../models/IUserCampaignsDashboard';
import { ExcelService } from 'src/app/core/Services/excel.service';
import { IUserPhishingCampaignsTemplates } from '../../models/IUserPhishingCampaignsTemplates';
import { IPointsModel } from 'src/app/modules/dashboards/models/IPointsModel';
import { IUserRiskHistroyModel } from '../../models/IUserRiskHistroyModel';
import { PdfService } from 'src/app/core/Services/pdf.service';
import { IUserTrainingCampaignsPieChartModel } from '../../models/IUserTrainingCampaignsPieChartModel';
import { DropdownChangeEvent } from 'primeng/dropdown';
import { TableLoadingService } from 'src/app/core/Services/table-loading.service';
import { IBadgeModel } from 'src/app/modules/account/models/IBadgeModel';
import { TranslationService } from 'src/app/core/Services/translation.service';

@Component({
    selector: 'app-user-details',
    templateUrl: './user-details.component.html',
    styleUrl: './user-details.component.scss',
})
export class UserDetailsComponent implements OnInit, OnDestroy {
    tableLoadingSpinner: boolean = true;

    userId: string;
    user = initializeUserModel();
    headerTitle: string;
    unsubscribe: Subscription[] = [];
    userTrainingResultsDetails: IUserTrainingResultsDetails[] = [];
    campaignsUserDashboard: IUserCampaignsDashboard[] = [];
    campaignsUserDashboardTemp: IUserCampaignsDashboard[] = [];
    userPhishingCampaignsTemplates: IUserPhishingCampaignsTemplates[] = [];
    userPhishingCampaignsTemplatesTemp: IUserPhishingCampaignsTemplates[] = [];
    showGaugeChart: boolean = false;
    usertTrainingResultsPercentage: number = 0;
    userPoints: IPointsModel = {
        negativePoints: 0,
        positivePoints: 0,
        totalSumPoints: 0,
    };

    userRiskHistroy: IUserRiskHistroyModel;

    userTrainingResults: IUserTrainingResultsModel = {
        percentage: 0,
        completed: 0,
        inProgress: 0,
        notStarted: 0,
    };

    userPhishingResults: IUserPhishingResults = {
        percentage: 0,
        emailsDelivered: 0,
        failures: 0,
        emailsReported: 0,
        noActions: 0,
    };

    userPhishingCampaignDetails: IUserPhishingResultsDetails = {
        clickedPercentage: 0,
        enabledMacroPercentage: 0,
        repliedPercentage: 0,
        openedAttachmentPercentage: 0,
        enteredDataPercentage: 0,
    };

    userPhishingResultsDetails: IUserPhishingResultsDetails = {
        clickedPercentage: 0,
        enabledMacroPercentage: 0,
        repliedPercentage: 0,
        openedAttachmentPercentage: 0,
        enteredDataPercentage: 0,
    };

    trainingChartData: any;
    trainingCampaignLessonsChartData: any;
    trainingCampaignLessonsChartOptions: any;
    trainingChartOptions: any;

    phishingChartOptions: any;
    phishingChartData: any;
    phishingCampaignDetailChartData: any;
    phishingCampaignDetailChartOptions: any;

    gaugeChart: any;
    radarData: any;
    radarOptions: any;
    lineData: any;
    lineOptions: any;
    trainingPieChartOptions: any;
    trainingPiehartData: any;

    riskChartData: any;
    riskChartOptions: any;
    showTrainingDetail: boolean = false;
    showPhishingDetail: boolean = false;
    showCampaignLessonsDetails: boolean = false;
    showPhishingCampaignDetailsBtn: boolean = false;
    showPhishingCampaignDetails: boolean = false;

    trainingCampaignsPieChartData: IUserTrainingCampaignsPieChartModel;
    allTrainingCampaignsWithoutAllOption: any[] = [];
    allTrainingCampaigns: any[] = [];
    trainingCampaignSelected: any;
    selectedTrainingCampaignId: string;
    allPhishingCampaigns: any[] = [];
    allPhishingCampaignsWithoutAllOption: any[] = [];
    selectedPhishingCampaignId: string;
    userBadges: IBadgeModel[] = [];

    constructor(
        private route: ActivatedRoute,
        private apiService: UserService,
        private excelService: ExcelService,
        private pdfService: PdfService,
        private cdr: ChangeDetectorRef,
        private tableLoadingService: TableLoadingService,
        private translate : TranslationService,
        private router: Router
    ) {
        Chart.register(...registerables, ChartDataLabels);
        const x = this.route.params.subscribe((params) => {
            this.userId = params['id'];
        });
        this.unsubscribe.push(x);
    }

    ngOnInit(): void {
        this.tableLoadingService.loading$.subscribe((isLoading) => {
            this.tableLoadingSpinner = isLoading;
        });

        this.fetchUser();
        this.fetchUserRiskHistory();
        this.initiateRiskFactorChart();
        this.fetchCampaigns();
        this.fetchUserTrainingResults();
        this.fetchCampaignsUserDashboard();
        this.fetchUserPoints();
        this.fetchUserTrainingResultsDetails();
        this.fetchUserPhishingResults();
        this.fetchUserPhishingCampaignsTemplates();
        this.fetchUserBadgs();
        // this.fetchUserPhishingResultsDetails();
    }

    fetchUser() {
        const x = this.apiService.getUser(this.userId).subscribe({
            next: (res) => {
                this.user = res.data;
            },
        });
        this.unsubscribe.push(x);
    }

    fetchCampaigns() {
        const x = this.apiService.getAllCampaign().subscribe({
            next: (res) => {
                this.allTrainingCampaignsWithoutAllOption = res.data.filter((c: any) => c.campaignType == 1);
                this.allTrainingCampaigns = [
                    { id: null, name: 'All' },
                    ...res.data.filter((c: any) => c.campaignType == 1),
                ];
                this.allPhishingCampaignsWithoutAllOption = res.data.filter((c: any) => c.campaignType == 2);
                this.allPhishingCampaigns = [
                    { id: null, name: 'All' },
                    ...res.data.filter((c: any) => c.campaignType == 2),
                ];
            },
        });
        this.unsubscribe.push(x);
    }

    fetchUserPhishingResults() {
        const x = this.apiService.getUserPhishingResults(this.userId).subscribe({
            next: (res) => {
                this.userPhishingResults = res.data;
                this.initPhishingChartOptions();
                this.updatePhishChartData();
            },
        });
        this.unsubscribe.push(x);
    }

    fetchUserPhishingResultsDetails() {
        const x = this.apiService.getUserPhishingResultsDetails(this.userId).subscribe({
            next: (res) => {
                this.userPhishingResultsDetails = res.data;
                this.initPhishingChartOptions();
                this.updatePhishChartData();
                this.cdr.detectChanges();
            },
        });
        this.unsubscribe.push(x);
    }

    fetchUserTrainingResults() {
        this.initTrainingPieChartOptions();
        const x = this.apiService.getUserTrainingResults(this.userId).subscribe({
            next: (res) => {
                this.userTrainingResults = res.data;
                this.updateTrainingPieChartData();
            },
        });
        this.unsubscribe.push(x);
    }

    fetchUserTrainingResultsDetails() {
        const x = this.apiService.getUserTrainingResultsDetails(this.userId).subscribe({
            next: (res) => {
                this.userTrainingResultsDetails = res.data;
                this.initTrainingChartOptions();
                this.updateTrainingData();
            },
        });
        this.unsubscribe.push(x);
    }

    fetchUserTrainingCampaignPieChartData() {
        this.apiService.getUserTrainingCampaignPieChartData(this.userId, this.selectedTrainingCampaignId).subscribe({
            next: (res) => {
                this.userTrainingResults = res.data;
                this.updateTrainingPieChartData();
            },
            error: (e) => {},
        });
    }

    fetchUserPhishingCampaignPieChartData() {
        this.apiService.getUserPhishingCampaignPieChartData(this.userId, this.selectedPhishingCampaignId).subscribe({
            next: (res) => {
                this.userPhishingResults = res.data;
                this.updatePhishChartData();
            },
            error: (e) => {},
        });
    }

    fetchPhishingCampaignDetails() {
        this.initPhishingCampaignChartOptions();
        this.apiService.getPhishingCampaignDetails(this.userId, this.selectedPhishingCampaignId).subscribe({
            next: (res) => {
                this.userPhishingCampaignDetails = res.data;
                this.updatePhishCampaignChartData();
            },
            error: (e) => {},
        });
    }

    fetchUserRiskResults() {
        const x = this.apiService.getUserRiskResults(this.userId).subscribe({
            next: (res) => {},
        });
        this.unsubscribe.push(x);
    }

    fetchCampaignsUserDashboard() {
        this.tableLoadingService.show();

        this.apiService.getCampaignsUserDashboard(this.userId).subscribe({
            next: (res) => {
                this.campaignsUserDashboard = res.data;
                this.campaignsUserDashboardTemp = res.data;
                this.tableLoadingService.hide();
            },
            error: (e) => {},
        });
    }

    fetchUserPhishingCampaignsTemplates() {
        this.tableLoadingService.show();

        this.apiService.getUserPhishingCampaignsTemplates(this.userId).subscribe({
            next: (res) => {
                this.userPhishingCampaignsTemplates = res.data;
                this.userPhishingCampaignsTemplatesTemp = res.data;
                this.tableLoadingService.hide();
            },
            error: (e) => {},
        });
    }

    fetchUserPoints() {
        this.apiService.getUserPoints(this.userId).subscribe({
            next: (response) => {
                this.userPoints = response.data;
            },
            error: (error) => {
                console.error('Error fetching user points:', error);
            },
        });
    }

    fetchUserBadgs() {
        this.apiService.getUserBadges(this.userId).subscribe({
            next: (response) => {
                this.userBadges = response.data;
            },
            error: (error) => {
                console.error('Error fetching user points:', error);
            },
        });
    }

    fetchUserRiskHistory() {
        this.apiService.getUserRiskHistory(this.userId).subscribe({
            next: (response) => {
                this.userRiskHistroy = response.data;
                this.initiateRiskHistoryChartOptions();
                this.initiateRiskHistoryChartData();
            },
            error: (error) => {
                console.error('Error fetching user points:', error);
            },
        });
    }

    calculateTotalNumberOfLessons(name: string) {
        let total = 0;

        if (this.campaignsUserDashboard) {
            for (let customer of this.campaignsUserDashboard) {
                if (customer?.campaignName === name) {
                    total++;
                }
            }
        }

        return total;
    }

    calculateTotalNumberOfTemplates(name: string) {
        let total = 0;

        if (this.userPhishingCampaignsTemplates) {
            for (let customer of this.userPhishingCampaignsTemplates) {
                if (customer?.campaignName === name) {
                    total++;
                }
            }
        }

        return total;
    }

    async downloadTrainingUserDashboardReportAsCSV() {
        if (this.campaignsUserDashboard) {
            const columns = this.campaignsUserDashboard.map((c) => {
                return {
                    CampaignName: c.campaignName,
                    LessaonName: c.contentName,
                    LessonJoiningDate: c.joiningDate ? this.formatDate(c.joiningDate) : '',
                    Lessonstatus: c.status,
                    Lessonscore: `${c.score ?? 0}%`,
                };
            });

            const headers = [
                { header: 'Campaign', dataKey: 'CampaignName' },
                { header: 'Lesson', dataKey: 'LessaonName' },
                { header: 'Lesson Joining Date', dataKey: 'LessonJoiningDate' },
                { header: 'Lesson Status', dataKey: 'Lessonstatus' },
                { header: 'Quiz Score', dataKey: 'Lessonscore' },
            ];
            await this.excelService.exportExcelVI(columns, `${this.user.name} Training Campaigns Report`, headers);
        }
    }

    downloadTrainingUserDashboardReportAsPDF() {
        if (this.userPhishingCampaignsTemplates.length > 0) {
            const columns = this.campaignsUserDashboard.map((c) => {
                return {
                    CampaignName: c.campaignName,
                    LessaonName: c.contentName,
                    LessonJoiningDate: c.joiningDate ? this.formatDate(c.joiningDate) : '',
                    Lessonstatus: c.status,
                    Lessonscore: `${c.score ?? 0}%`,
                };
            });

            const headers = [
                { header: 'Campaign', dataKey: 'CampaignName' },
                { header: 'Lesson', dataKey: 'LessaonName' },
                { header: 'Lesson Joining Date', dataKey: 'LessonJoiningDate' },
                { header: 'Lesson Status', dataKey: 'Lessonstatus' },
                { header: 'Quiz Score', dataKey: 'Lessonscore' },
            ];
            this.pdfService.exportDataToPdfVI(columns, `${this.user.name}\n Training Campaigns Report`, headers);
        }
    }

    async downloadPhishingUserDashboardReportAsCSV() {
        if (this.userPhishingCampaignsTemplates) {
            const columns = this.userPhishingCampaignsTemplates.map((c) => {
                return {
                    CampaignName: c.campaignName,
                    PhishingEmailTemplateName: c.phishingEmailTemplateName,
                    IsDelivered: c.isDelivered,
                    IsOpened: c.isOpened,
                    IsLinkClicked: c.isLinkClicked,
                    IsQRCodeScanned: c.isQRCodeScanned,
                    IsDataEntered: c.isDataEntered,
                    IsReported: c.isReported,
                };
            });
            const headers = [
                { header: 'Campaign', dataKey: 'CampaignName' },
                { header: 'TemplateName', dataKey: 'PhishingEmailTemplateName' },
                { header: 'Delivered', dataKey: 'IsDelivered' },
                { header: 'Opened', dataKey: 'IsOpened' },
                { header: 'Link Clicked', dataKey: 'IsLinkClicked' },
                { header: 'QRCode Scanned', dataKey: 'IsQRCodeScanned' },
                { header: 'Data Entered', dataKey: 'IsDataEntered' },
                { header: 'Reported', dataKey: 'IsReported' },
            ];
            await this.excelService.exportExcelVI(columns, `${this.user.name} Phishing Campaigns Report`, headers);
        }
    }

    downloadPhishingUserDashboardReportAsPDF() {
        if (this.userPhishingCampaignsTemplates.length > 0) {
            const columns = this.userPhishingCampaignsTemplates.map((c) => {
                return {
                    CampaignName: c.campaignName,
                    PhishingEmailTemplateName: c.phishingEmailTemplateName,
                    IsDelivered: c.isDelivered,
                    IsOpened: c.isOpened,
                    IsLinkClicked: c.isLinkClicked,
                    IsQRCodeScanned: c.isQRCodeScanned,
                    IsDataEntered: c.isDataEntered,
                    IsReported: c.isReported,
                };
            });
            const headers = [
                { header: 'Campaign', dataKey: 'CampaignName' },
                { header: 'TemplateName', dataKey: 'PhishingEmailTemplateName' },
                { header: 'Delivered', dataKey: 'IsDelivered' },
                { header: 'Opened', dataKey: 'IsOpened' },
                { header: 'Link Clicked', dataKey: 'IsLinkClicked' },
                { header: 'QRCode Scanned', dataKey: 'IsQRCodeScanned' },
                { header: 'Data Entered', dataKey: 'IsDataEntered' },
                { header: 'Reported', dataKey: 'IsReported' },
            ];
            this.pdfService.exportDataToPdfVI(columns, `${this.user.name}\n Phishing Campaigns Report`, headers);
        }
    }

    formatDate(date: Date): string {
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
        return new Intl.DateTimeFormat('en-US', options).format(new Date(date));
    }

    showTrainingDetails() {
        this.showTrainingDetail = true;
        this.fetchUserTrainingResultsDetails();
    }

    showPhishingDetails() {
        this.showPhishingDetail = !this.showPhishingDetail;
        this.fetchUserPhishingResultsDetails();
    }

    updateTrainingData() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--primary-color');

        this.trainingChartData = {
            labels: this.userTrainingResultsDetails.map((c) => c.campaignName),
            datasets: [
                {
                    labels:  this.translate.getInstant('user.user-details.charts.totalAssignments'),
                    backgroundColor: this.userTrainingResultsDetails.map((c) =>
                        this.getTheNameOfCampaignStatus(c.campaignStatus)
                    ),
                    data: this.userTrainingResultsDetails.map((c) => c.campaignLessons),
                },
            ],
        };

        const maxValue = Math.max(...this.trainingChartData.datasets[0].data);
        const yMax = maxValue % 2 === 0 ? maxValue + 2 : maxValue + 1;
        this.trainingChartOptions = {
            responsive: true,
            scales: {
                x: {
                    // X-axis configuration
                    title: {
                        display: true,
                        color: textColor,
                    },
                    color: textColor,
                },
                y: {
                    // Y-axis configuration
                    beginAtZero: true,
                    suggestedMax: yMax,
                    color: textColor,
                    title: {
                        display: true,
                        color: textColor,
                        text: this.translate.getInstant('user.user-details.charts.totalAssignmentsinCampaign'),
                    },
                    ticks: {
                        stepSize: 1,
                        precision: 0,
                    },
                },
            },
            plugins: {
                tooltip: {
                    enabled: false, // Disable tooltips
                },
                legend: {
                    display: false,
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        color: textColor,
                        font: {
                            size: 14,
                        },
                    },
                },
                datalabels: {
                    display: true,
                    color: textColor,
                    anchor: 'end',
                    align: 'end',
                    formatter: (value: number) =>   this.translate.getInstant('user.user-details.charts.lessons').replace('[value]', `${value}`), //  `Lessons: ${value}`,
                    font: {
                        weight: 'bold',
                    },
                    padding: 6,
                },
            },
        };
    }

    updateTrainingCampaignLessonDetailsData(campaignId: string) {
        this.tableLoadingService.show();

        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--primary-color');
        const textColor_gray = documentStyle.getPropertyValue('--gray-400');

        const lessonOftheCampaign = this.campaignsUserDashboard.filter(
            (campaign) => campaign.campaignId === campaignId
        );

        // Assuming the status values are something like 'Completed', 'InProgress', and 'NotStarted'
        const inProgressLessonsCount = lessonOftheCampaign.filter((lesson) => lesson.status === 'InProgress').length;
        const notStartedLessonsCount = lessonOftheCampaign.filter((lesson) => lesson.status === 'NotStarted').length;
        const completedLessonsCount = lessonOftheCampaign.filter((lesson) => lesson.status === 'Completed').length;

        this.trainingCampaignLessonsChartData = {
            labels: [ this.translate.getInstant('user.user-details.charts.inProgress')
                , this.translate.getInstant('user.user-details.charts.notStarted')
                , this.translate.getInstant('user.user-details.charts.completed')],
            datasets: [
                {
                    label: this.translate.getInstant('user.user-details.charts.lessonDetails'),
                    backgroundColor: ['#FFA726', textColor_gray, '#66BB6A'],
                    data: [inProgressLessonsCount, notStartedLessonsCount, completedLessonsCount],
                },
            ],
        };

        const maxValue = Math.max(...this.trainingChartData.datasets[0].data);
        const yMax = maxValue % 2 === 0 ? maxValue + 2 : maxValue + 1;
        this.trainingCampaignLessonsChartOptions = {
            responsive: true,
            scales: {
                x: {
                    // X-axis configuration
                    title: {
                        display: true,
                        color: textColor,
                    },
                    color: textColor,
                },
                y: {
                    // Y-axis configuration
                    beginAtZero: true,
                    suggestedMax: yMax,
                    color: textColor,
                    title: {
                        display: true,
                        color: textColor,
                        text:  this.translate.getInstant('user.user-details.charts.totalAssignmentsinCampaign'),
                    },
                    ticks: {
                        stepSize: 1,
                        precision: 0,
                    },
                },
            },
            plugins: {
                tooltip: {
                    enabled: false,
                },
                legend: {
                    display: false,
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        color: textColor,
                        font: {
                            size: 14,
                        },
                    },
                },
                datalabels: {
                    display: true,
                    color: textColor,
                    anchor: 'end',
                    align: 'end',
                    formatter: (value: number) =>this.translate.getInstant('user.user-details.charts.lessons').replace('[value]', `${value}`),
                    font: {
                        weight: 'bold',
                    },
                    padding: 6,
                },
            },
        };
        this.tableLoadingService.hide();
    }

    getTheNameOfCampaignStatus(status: string) {
        let color: string = '';
        switch (status) {
            case 'Completed':
                color = '#28a745';
                break;
            case 'InProgress':
                color = '#ffc107';
                break;
            case 'NotStarted':
                color = '#6c757d';
                break;
        }
        return color;
    }

    initTrainingChartOptions() {
        this.trainingChartOptions = {
            scales: {
                xAxes: [
                    {
                        stacked: true,
                    },
                ],
                yAxes: [
                    {
                        stacked: true,
                    },
                ],
            },
            legend: {
                display: true,
            },
            tooltips: {
                enabled: true,
            },
        };
    }

    updatePhishChartData() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const { failures, emailsReported, noActions } = this.userPhishingResults;
        if (failures === 0 && emailsReported === 0 && noActions === 0) {
            this.phishingChartData = {
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
            this.phishingChartData = {
                labels: [this.translate.getInstant('user.user-details.charts.failed'), this.translate.getInstant('user.user-details.charts.noActions'), this.translate.getInstant('user.user-details.charts.reported')],
                datasets: [
                    {
                        data: [failures, noActions, emailsReported],
                        backgroundColor: ['#FF5252', '#FFC107', '#4CAF50'],
                        hoverBackgroundColor: ['#FF867C', '#FFD54F', '#81C784'],
                    },
                ],
            };
        }
    }

    initPhishingChartOptions() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

        this.phishingChartOptions = {
            responsive: true,
            plugins: {
                tooltip: {
                    enabled: true,
                    callbacks: {
                        label: (tooltipItem: any) => {
                            const dataIndex = tooltipItem.dataIndex;
                            const label = tooltipItem.label;
                            if (label === this.translate.getInstant('shared.messages.noDataAvailable')) {
                                return '';
                            }
                            const value = this.phishingChartData.datasets[0].data[dataIndex];
                            return `${label}: ${value}`;
                        },
                    },
                },
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        color: textColor,
                        font: {
                            size: 14,
                        },
                    },
                },
                datalabels: {
                    formatter: (value: any, context: { dataIndex: number; chart: any }) => {
                        // Convert value to a number
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
                    color: textColorSecondary,
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
        };
    }

    updatePhishCampaignChartData() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const { clickedPercentage, enteredDataPercentage } = this.userPhishingCampaignDetails;
        console.log(clickedPercentage + enteredDataPercentage);
        if (clickedPercentage === 0 && enteredDataPercentage === 0) {
            this.phishingCampaignDetailChartData = {
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
            this.phishingChartData = {
                labels: [this.translate.getInstant('user.user-details.charts.clicked'), this.translate.getInstant('user.user-details.charts.dataEntered')],
                datasets: [
                    {
                        data: [clickedPercentage, enteredDataPercentage],
                        backgroundColor: ['#FF5252', '#FFC107'],
                        hoverBackgroundColor: ['#FF867C', '#FFD54F'],
                    },
                ],
            };
        }
    }

    initPhishingCampaignChartOptions() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

        this.phishingCampaignDetailChartOptions = {
            responsive: true,
            plugins: {
                tooltip: {
                    enabled: true,
                    callbacks: {
                        label: (tooltipItem: any) => {
                            const dataIndex = tooltipItem.dataIndex;
                            const label = tooltipItem.label;
                            if (label === this.translate.getInstant('shared.messages.noDataAvailable')) {
                                return '';
                            }
                            const value = this.phishingChartData.datasets[0].data[dataIndex];
                            return `${label}: ${value}`;
                        },
                    },
                },
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        color: textColor,
                        font: {
                            size: 14,
                        },
                    },
                },
                datalabels: {
                    formatter: (value: any, context: { dataIndex: number; chart: any }) => {
                        // Convert value to a number
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
                    color: textColorSecondary,
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
        };
    }

    updateTrainingPieChartData() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        if (
            this.userTrainingResults.completed === 0 &&
            this.userTrainingResults.inProgress === 0 &&
            this.userTrainingResults.notStarted === 0
        ) {
            this.trainingPiehartData = {
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
            this.trainingPiehartData = {
                labels: [this.translate.getInstant('user.user-details.charts.notStarted')
                    , this.translate.getInstant('user.user-details.charts.completed')
                    , this.translate.getInstant('user.user-details.charts.inProgress')],
                datasets: [
                    {
                        data: [
                            this.userTrainingResults.notStarted,
                            this.userTrainingResults.completed,
                            this.userTrainingResults.inProgress,
                        ],
                        backgroundColor: [textColorSecondary, '#66BB6A', '#FFCE56'],
                        hoverBackgroundColor: [textColorSecondary, '#81C784', '#FFD54F'],
                    },
                ],
            };
        }
    }

    initTrainingPieChartOptions() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--primary-color');
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');
        this.trainingPieChartOptions = {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        color: textColor,
                        font: {
                            size: 14,
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
        };
    }

    changeTrainingCampaignLessonDetails(event: DropdownChangeEvent) {
        this.trainingCampaignSelected = this.allTrainingCampaigns.find((c) => c.id === event.value);
        this.updateTrainingCampaignLessonDetailsData(event.value);
    }

    changeTrainingPieChartData(event: DropdownChangeEvent) {
        this.tableLoadingService.show();

        this.selectedTrainingCampaignId = event.value;
        this.trainingCampaignSelected = this.allTrainingCampaigns.find((c) => c.id === this.selectedTrainingCampaignId);
        this.campaignsUserDashboardTemp = this.campaignsUserDashboard.filter((c) => c.campaignId == event.value);
        if (event.value === null) {
            // Special logic for "All" option
            this.fetchUserTrainingResults();
            this.showCampaignLessonsDetails = false;
            this.campaignsUserDashboardTemp = this.campaignsUserDashboard;
        } else {
            this.fetchUserTrainingCampaignPieChartData();
            this.showCampaignLessonsDetails = true;
            this.updateTrainingCampaignLessonDetailsData(event.value);
        }
        this.tableLoadingService.hide();
    }

    changePhishingPieChartData(event: DropdownChangeEvent) {
        this.selectedPhishingCampaignId = event.value;
        this.userPhishingCampaignsTemplatesTemp = this.userPhishingCampaignsTemplates.filter(
            (c) => c.campaignId == event.value
        );
        if (event.value === null) {
            this.fetchUserPhishingResults();
            this.showPhishingCampaignDetailsBtn = false;
            this.showPhishingCampaignDetails = false;
            this.userPhishingCampaignsTemplatesTemp = this.userPhishingCampaignsTemplates;
        } else {
            this.showPhishingCampaignDetailsBtn = true;
            this.fetchUserPhishingCampaignPieChartData();
            this.fetchPhishingCampaignDetails();
        }
    }

    changePhishingCampaignPieChartData(event: DropdownChangeEvent) {
        this.selectedPhishingCampaignId = event.value;
        this.userPhishingCampaignsTemplatesTemp = this.userPhishingCampaignsTemplates.filter(
            (c) => c.campaignId == event.value
        );
        this.fetchPhishingCampaignDetails();
    }

    initiateRiskFactorChart() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

        this.radarData = {
            labels: ['Training', 'Phishing', 'Job Function', 'Other'],
            datasets: [
                {
                    label: 'Risk Factors',
                    borderColor: documentStyle.getPropertyValue('--indigo-400'),
                    pointBackgroundColor: documentStyle.getPropertyValue('--indigo-400'),
                    pointBorderColor: documentStyle.getPropertyValue('--indigo-400'),
                    pointHoverBackgroundColor: textColor,
                    pointHoverBorderColor: documentStyle.getPropertyValue('--indigo-400'),

                    data: [this.userTrainingResults.percentage, this.userPhishingResults.percentage, 0, 0],
                },
            ],
        };

        this.radarOptions = {
            plugins: {
                datalabels: {
                    display: false, // Disable data labels
                },
                legend: {
                    display: false,
                },
            },
            scales: {
                r: {
                    grid: {
                        color: textColorSecondary,
                    },
                },
            },
        };

        // Update the chart data and options in the PrimeNG component
        this.radarData = this.radarData; // Force update
        this.radarOptions = this.radarOptions; // Force update
    }

    initiateRiskHistoryChartData() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');
        this.lineData = {
            labels: this.userRiskHistroy.months,
            datasets: [
                {
                    data: this.userRiskHistroy.percentages,
                    fill: false,
                    backgroundColor: documentStyle.getPropertyValue('--primary-500'),
                    borderColor: documentStyle.getPropertyValue('--primary-500'),
                    tension: 0.4,
                },
            ],
        };
    }

    initiateRiskHistoryChartOptions() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

        this.lineOptions = {
            plugins: {
                datalabels: {
                    display: false,
                },
                tooltip: {
                    callbacks: {
                        label: function (tooltipItem: any) {
                            let value = tooltipItem.raw;
                            if (typeof value === 'number' && !isNaN(value)) {
                                value = value; // format to 2 decimal places
                            } else {
                                value = String(value);
                            }
                            return `${value} %`;
                        },
                    },
                },
                legend: {
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
                        display: false,
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

    getTheNeedleValue() {
        return +this.userPhishingResults.percentage;
    }

    navigateToTraining(){
        this.router.navigate(['/training-campaign']);
    }

    ngOnDestroy(): void {
        this.unsubscribe.forEach((u) => {
            u.unsubscribe();
        });
    }
}