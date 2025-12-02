import { Component, OnInit } from '@angular/core';
import { IawareDashboardService } from '../../services/iaware-dashboard.service';
import { ICampaignChartModel } from '../../models/ICampaignChartModel';
import { Router } from '@angular/router';
import { ICampaignsForDashboardStatisticModel } from '../../models/ICampaignsForDashboardStatisticModel';
import { DropdownChangeEvent } from 'primeng/dropdown';
import { ITrainingCampaignUserModel } from 'src/app/modules/training-campaigns/models/ITrainingCampaignUserModel';
import { Table } from 'primeng/table';
import { CheckboxChangeEvent } from 'primeng/checkbox';
import { PdfService } from 'src/app/core/Services/pdf.service';
import { ExcelService } from 'src/app/core/Services/excel.service';

@Component({
    selector: 'app-training',
    templateUrl: './training.component.html',
    styleUrl: './training.component.scss',
})
export class TrainingComponent implements OnInit {
    data: any;
    options: any;
    campaignChartModel: ICampaignChartModel;
    campaigns: ICampaignsForDashboardStatisticModel[] = [];

    months: any[] = [];
    selectedMonth: number = 3;

    displayCompletedCampaignDialog: boolean = false;
    displayNotStartedCampaignDialog: boolean = false;
    displayFailedCampaignDialog: boolean = false;

    campaignUsers: ITrainingCampaignUserModel[] = [];
    campaignUsersSelected: ITrainingCampaignUserModel[] = [];
    checkboxStates: { [key: string]: boolean } = {};

    // Data to display in dialogs
    dialogData: { label: string; month: string; number: number } = { label: '', month: '', number: 0 };

    constructor(
        private apiService: IawareDashboardService,
        private router: Router,
        private pdfService: PdfService,
        private excelService: ExcelService
    ) {}

    ngOnInit(): void {
        this.initiateSecurityAwernessCampaignChart();
        this.initiateSecurityAwernessCampaignChartOptions();
        this.fetchGetCampaignsForDashboardStatistic();

        this.months = [
            { id: 1, name: '1' },
            { id: 3, name: '3' },
            { id: 6, name: '6' },
            { id: 9, name: '9' },
        ];
    }

    initiateSecurityAwernessCampaignChart() {
        this.apiService.getDataFromLastSixMonths(this.selectedMonth).subscribe((response) => {
            this.campaignChartModel = response.data;
            this.initiateSecurityAwernessCampaignChartData();
        });
    }

    initiateSecurityAwernessCampaignChartData() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor_gray = documentStyle.getPropertyValue('--gray-400');

        this.data = {
            labels: this.campaignChartModel.labels,
            datasets: [
                {
                    type: 'bar',
                    label: 'Completed',
                    backgroundColor: documentStyle.getPropertyValue('--green-400'),
                    data: this.campaignChartModel.completed,
                },
                {
                    type: 'bar',
                    label: 'Failed',
                    backgroundColor: documentStyle.getPropertyValue('--red-500'),
                    data: this.campaignChartModel.failed,
                },
                {
                    type: 'bar',
                    label: 'Not Started',
                    backgroundColor: textColor_gray,
                    data: this.campaignChartModel.notStarted,
                },
            ],
        };
    }

    initiateSecurityAwernessCampaignChartOptions() {
        const documentStyle = getComputedStyle(document.documentElement);
        const primaryColor = documentStyle.getPropertyValue('--primary-color');
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

        this.options = {
            maintainAspectRatio: false,
            aspectRatio: 0.8,
            onHover: (event: any, chartElement: any) => {
                event.native.target.style.cursor = chartElement[0] ? 'pointer' : 'default';
            },
            onClick: (event: any, activeElements: any) => {
                if (activeElements.length > 0) {
                    const datasetIndex = activeElements[0].datasetIndex;
                    const dataIndex = activeElements[0].index;
                    const label = this.data.datasets[datasetIndex].label;
                    const number = this.data.datasets[datasetIndex].data[dataIndex];
                    const month = this.data.labels[dataIndex];
                    this.dialogData = { label, month, number };

                    switch (label) {
                        case 'Completed':
                            this.displayCompletedCampaignDialog = true;
                            this.fetchUserOnClickOnTrainingCampaifnsChart(month, 'completed');
                            break;
                        case 'Not Started':
                            this.displayNotStartedCampaignDialog = true;
                            this.fetchUserOnClickOnTrainingCampaifnsChart(month, 'notstarted');
                            break;
                        case 'Failed':
                            this.displayFailedCampaignDialog = true;
                            this.fetchUserOnClickOnTrainingCampaifnsChart(month, 'failed');
                            break;
                        default:
                            break;
                    }
                }
            },
            plugins: {
                tooltip: {
                    mode: 'index',
                    intersect: false,
                },
                datalabels: {
                    formatter: (value: any, context: { dataIndex: number; chart: any }) => {
                        const label = context.chart.data.labels[context.dataIndex];
                        const numericValue = Number(value);
                        if (label === 'No data available') {
                            return 'No data available';
                        }
                        if (!isNaN(numericValue) && numericValue !== 0) {
                            return `${numericValue}`;
                        }
                        return '';
                    },
                    color: primaryColor,
                    font: {
                        size: 14,
                        weight: 'bold',
                        padding: '5px',
                    },
                    usePointStyle: true,
                    anchor: 'center',
                    align: 'center',
                    padding: {
                        left: 10,
                    },
                },
                legend: {
                    position: 'top', // Keeps legend at the top,
                    usePointStyle: true,
                    align: 'center',  // Ensures all items start at the same point (use 'end' for right alignment)
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
            },
            scales: {
                x: {
                    stacked: true,
                    ticks: {
                        color: textColorSecondary,
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false,
                    },
                },
                y: {
                    stacked: true,
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

    fetchGetCampaignsForDashboardStatistic() {
        this.apiService.getCampaignsForDashboardStatistic().subscribe({
            next: (data) => {
                this.campaigns = data;
            },
            error: (error) => {
                console.error(error);
            },
        });
    }

    fetchUserOnClickOnTrainingCampaifnsChart(month: string, action: string) {
        this.apiService.getCampaignsUsersInThisMonth(month, action).subscribe({
            next: (users) => {
                this.campaignUsers = [];
                this.campaignUsersSelected = [];
                this.campaignUsers = users.data;
            },
            error: (error) => {
                console.error(error);
            },
        });
    }

    navigateToAllCampaigns() {
        this.router.navigate(['/campaign-management']);
    }

    navigateToNewCampaign() {
        this.router.navigate(['/campaign-management/create']);
    }

    navigateToCampaignDetails(campaignId: string) {
        this.router.navigate([`training-campaign/campaign-statistics/${campaignId}`]);
    }

    onMonthsDropdownChange(event: DropdownChangeEvent) {
        this.selectedMonth = event.value;
        this.initiateSecurityAwernessCampaignChart();
    }

    addToSelected(user: ITrainingCampaignUserModel) {
        this.checkboxStates[user.userId] = true;
        this.campaignUsersSelected.push(user);
    }

    removeFromSelected(user: ITrainingCampaignUserModel) {
        this.checkboxStates[user.userId] = false;
        this.campaignUsersSelected = this.campaignUsersSelected.filter((w) => w.userId !== user.userId);
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
            this.campaignUsers.forEach((w) => {
                this.checkboxStates[w.userId] = true;
                this.campaignUsersSelected.push(w);
            });
        } else {
            this.campaignUsers.forEach((w) => {
                this.checkboxStates[w.userId] = false;
                this.campaignUsersSelected = this.campaignUsersSelected.filter((c) => c.userId !== w.userId);
            });
        }
    }

    downloadSelectedUsersReportAsPDF(action: string) {
        const data = this.campaignUsersSelected.map((w) => ({
            User: `${w.userName}\n${w.userEmail}`,
            TenantUnit: w.unitName || '',
            Campaign: `${w.name}\n\n${this.formatDate(w.startDate)} - ${this.formatDate(w.endDate)}` || '',
            Lesson: w.lessonName || '',
            ...(action !== 'Not Started' && { Score: `${w.score ?? 0}%` }),
        }));

        const headers = [
            { header: 'User', dataKey: 'User' },
            { header: 'Department', dataKey: 'TenantUnit' },
            { header: 'Campaign', dataKey: 'Campaign' },
            { header: 'Lesson', dataKey: 'Lesson' },
            ...(action !== 'Not Started' ? [{ header: 'Quiz Score', dataKey: 'Score' }] : []),
        ];
        this.pdfService.exportDataToPdfVI(data, `${action} Users`, headers);
    }

    async downloadSelectedUsersReportAsCSV(action: string) {
        const data = this.campaignUsersSelected.map((w) => {
            return {
                User: w.userName,
                UserEmail: w.userEmail,
                TenantUnit: w.unitName,
                Campaign: w.name,
                CampaignStartDate: this.formatDate(w.startDate),
                CampaignEndDate: this.formatDate(w.endDate),
                Lesson: w.lessonName,
                ...(action !== 'Not Started' && { Score: `${w.score ?? 0}%` }),
            };
        });
        const headers = [
            { header: 'User Name', dataKey: 'User' },
            { header: 'User Email', dataKey: 'UserEmail' },
            { header: 'Department', dataKey: 'TenantUnit' },
            { header: 'Campaign', dataKey: 'Campaign' },
            { header: 'Campaign StartDate', dataKey: 'CampaignStartDate' },
            { header: 'Campaign EndDate', dataKey: 'CampaignEndDate' },
            { header: 'Lesson', dataKey: 'Lesson' },
            ...(action !== 'Not Started' ? [{ header: 'Quiz Score', dataKey: 'Score' }] : []),
        ];
        await this.excelService.exportExcelVI(data, `${action} Report`, headers);
    }

    formatDate(date: Date): string {
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
        return new Intl.DateTimeFormat('en-US', options).format(new Date(date));
    }

    getTrainingCampaignUsers(): ITrainingCampaignUserModel[] {
        const uniqueUserIds = new Set<string>();
        return this.campaignUsers.filter((user) => {
            if (!uniqueUserIds.has(user.userId)) {
                uniqueUserIds.add(user.userId);
                return true;
            }
            return false;
        });
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }
}