import { Component, OnInit } from '@angular/core';
import { IawareDashboardService } from '../../services/iaware-dashboard.service';
import { IIndustryModel } from 'src/app/modules/industry/models/IIndustryModel';
import { DropdownChangeEvent } from 'primeng/dropdown';
import { IPhishingTestsChartModel } from '../../models/IPhishingTestsChartModel';
import { TableLoadingService } from 'src/app/core/Services/table-loading.service';
import { DropdownListDataSourceService } from 'src/app/core/Services/dropdown-list-data-source.service';

@Component({
    selector: 'app-phishing',
    templateUrl: './phishing.component.html',
    styleUrl: './phishing.component.scss',
})
export class PhishingComponent implements OnInit {
    tableLoadingSpinner: boolean = true;
    data: any;
    options: any;
    showIndustryBenchmark: boolean;
    tenantPhishingPercentage: number = 0;
    industries: IIndustryModel[] = [];
    selectedIndustryValue: number = 0;
    phishingTestsChartData: IPhishingTestsChartModel;
    months: any[] = [];
    selectedMonth: number = 3;

    constructor(
        private apiService: IawareDashboardService,
        private dropdownListDataSourceService: DropdownListDataSourceService,
        private tableLoadingService: TableLoadingService
    ) {}

    ngOnInit(): void {
        this.tableLoadingService.loading$.subscribe((isLoading) => {
            this.tableLoadingSpinner = isLoading;
        });

        this.initiatePhishingChartOptions();
        this.fetchPhishingTestsChartData();
        this.fetchIndustries();
        this.fetchTenantRisk();
        this.months = [
            { id: 1, name: '1' },
            { id: 3, name: '3' },
            { id: 6, name: '6' },
            { id: 9, name: '9' },
        ];
    }

    fetchPhishingTestsChartData() {
        this.tableLoadingService.show();

        this.apiService.getPhishingTestsChartData(this.selectedMonth).subscribe({
            next: (response) => {
                this.phishingTestsChartData = response.data;
                this.updatePhishingChartData();
                this.tableLoadingService.hide();
            },
            error: (error) => {},
        });
    }

    fetchIndustries() {
        this.dropdownListDataSourceService.getIndustries().subscribe({
            next: (res) => {
                this.industries = res.data;
            },
            error: (err) => {
                console.error(err);
            },
        });
    }

    fetchTenantRisk() {
        this.apiService.getTenantRisk().subscribe({
            next: (response) => {
                this.tenantPhishingPercentage = response.data;
            },
            error: (error) => {
                console.error(error);
            },
        });
    }

    updatePhishingChartData() {
        this.tableLoadingService.show();

        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');
        this.data = {
            labels: this.phishingTestsChartData.labels, // Data from the API
            datasets: [
                {
                    type: 'line',
                    label: 'Clicks',
                    backgroundColor: documentStyle.getPropertyValue('--primary-800'),
                    data: this.phishingTestsChartData.clicks,
                },
                {
                    type: 'line',
                    label: 'Data Entered',
                    backgroundColor: documentStyle.getPropertyValue('--orange-500'),
                    data: this.phishingTestsChartData.dataEntered,
                },
                // {
                //   type: 'line',
                //   label: 'Replies',
                //   backgroundColor: documentStyle.getPropertyValue('--green-800'),
                //   data: response.replies,
                // },
                {
                    type: 'line',
                    label: 'QR Code Scanned',
                    backgroundColor: documentStyle.getPropertyValue('--blue-500'),
                    data: this.phishingTestsChartData.qrCodeScanned,
                },
                // {
                //   type: 'line',
                //   label: 'Attachment Opened',
                //   backgroundColor: documentStyle.getPropertyValue('--pink-700'),
                //   data: response.attachmentOpened,
                // },
                {
                    type: 'line',
                    label: 'Reported',
                    backgroundColor: documentStyle.getPropertyValue('--green-400'),
                    data: this.phishingTestsChartData.reported,
                },
            ],
        };
        this.tableLoadingService.hide();
    }

    initiatePhishingChartOptions() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--primary-color');
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');
        this.options = {
            maintainAspectRatio: false,
            aspectRatio: 0.8,
            plugins: {
                tooltip: {
                    mode: 'index',
                    intersect: false,
                },
                datalabels: {
                    display: false,
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

    onIndustryChange(event: DropdownChangeEvent) {
        this.selectedIndustryValue = event.value;
    }

    onMonthsDropdownChange(event: DropdownChangeEvent) {
        this.selectedMonth = event.value;
        this.fetchPhishingTestsChartData();
    }

    toggleIndustryBenchmark() {
        this.showIndustryBenchmark = !this.showIndustryBenchmark; // Toggle visibility
    }
}