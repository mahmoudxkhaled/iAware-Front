import { Component, OnInit } from '@angular/core';
import { IPointsModel } from '../../models/IPointsModel';
import { IawareDashboardService } from '../../services/iaware-dashboard.service';
import { ITenantRiskHistroyModel } from '../../models/ITenantRiskHistroyModel';
import { Chart } from 'chart.js';

@Component({
    selector: 'app-organization',
    templateUrl: './organization.component.html',
    styleUrl: './organization.component.scss',
})
export class OrganizationComponent implements OnInit {
    userPoints: IPointsModel = {
        negativePoints: 0,
        positivePoints: 0,
        totalSumPoints: 0,
    };

    organizationPoints: IPointsModel = {
        negativePoints: 0,
        positivePoints: 0,
        totalSumPoints: 0,
    };

    tenantPhishingPercentage: number = 0;
    tenantRiskHistroy: ITenantRiskHistroyModel = {
        months: [],
        percentages: [],
    };
    lineData: any;
    lineOptions: any;
    initialized = false;

    months: any[] = [];
    selectedMonth: number = 3;

    constructor(private apiService: IawareDashboardService) {
        Chart.register({
            id: 'noDataPlugin',
            beforeDraw: (chart: any) => {
                const ctx = chart.ctx;
                const datasets = chart.data.datasets;
                const noData = datasets.every((dataset: any) => dataset.data.length === 0);

                if (noData) {
                    const width = chart.width;
                    const height = chart.height;
                    ctx.save();
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.font = '16px sans-serif';
                    ctx.fillStyle = '#666';
                    ctx.fillText('No data available', width / 2, height / 2);
                    ctx.restore();
                }
            },
        });
    }

    ngOnInit(): void {
        this.initiateRiskHistoryChartOptions();
        this.fetchOrganizationPoints();
        this.fetchTenantRisk();
        this.fetchTenantRiskHistory();
        this.months = [
            { id: 1, name: '1' },
            { id: 3, name: '3' },
            { id: 6, name: '6' },
            { id: 9, name: '9' },
        ];
    }

    fetchUserPoints() {
        this.apiService.getUserPoints().subscribe({
            next: (response) => {
                this.userPoints = response.data;
            },
            error: (error) => {
                console.error('Error fetching user points:', error);
            },
        });
    }

    fetchOrganizationPoints() {
        this.apiService.getOrganizationPoints().subscribe({
            next: (response) => {
                this.organizationPoints = response.data;
            },
            error: (error) => {
                console.error('Error fetching organization points:', error);
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

    fetchTenantRiskHistory() {
        this.apiService.getTenantRiskHistory().subscribe({
            next: (response) => {
                this.tenantRiskHistroy = response.data;
                this.initiateRiskHistoryChartData();
            },
            error: (error) => {
                console.error('Error fetching user points:', error);
            },
        });
    }

    initiateRiskHistoryChartData() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');
        this.lineData = {
            labels: this.tenantRiskHistroy.months,
            datasets: [
                {
                    data: this.tenantRiskHistroy.percentages,
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
                legend: {
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
        return +this.tenantPhishingPercentage;
    }

    initializeComponent() {
        if (!this.initialized) {
            console.log('Organization Component Initialized');
            // Add your initialization logic here
            this.initialized = true;
        }
    }
}