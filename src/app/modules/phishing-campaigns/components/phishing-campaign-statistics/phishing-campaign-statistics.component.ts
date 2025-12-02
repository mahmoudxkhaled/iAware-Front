import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { IAwarenessPhishingCampaignStatisticsModel } from '../../models/IAwarenessPhishingCampaignStatisticsModel';
import { IAwarenessCampaignSimulationPhishingTemplateModel } from '../../models/IAwarenessCampaignSimulationPhishingTemplateModel';
import { ExcelService } from 'src/app/core/Services/excel.service';
import { MessageService } from 'primeng/api';
import { SharedDataService } from '../../../../core/Services/shared-data.service'
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Chart, registerables } from 'chart.js';
import { PhishingcampaignsService } from '../../services/phishingcampaigns.service';
import { PdfService } from 'src/app/core/Services/pdf.service';
import { TableLoadingService } from 'src/app/core/Services/table-loading.service';
import { ILeaderboardStatisticsModel } from 'src/app/modules/leaderboard/models/ILeaderboardStatisticsModel';
import { TranslationService } from 'src/app/core/Services/translation.service';

export enum CampaignStatus {
  Completed = 1,
  InProgress,
  NotStarted,
  Closed,
}

@Component({
  selector: 'app-phishing-campaign-statistics',
  templateUrl: './phishing-campaign-statistics.component.html',
  styleUrl: './phishing-campaign-statistics.component.scss',
})
export class PhishingCampaignStatisticsComponent implements OnInit {
  campaignId: string;
  unsubscribe: Subscription[] = [];
  templateDialog: boolean = false;
  currentTemplateSelectedtemplate: IAwarenessCampaignSimulationPhishingTemplateModel;
  campaignStatisticsData: IAwarenessPhishingCampaignStatisticsModel = {
    campaignName: '',
    campaignStatus: '',
    compelationPercentage: 0,
    startDate: '',
    endDate: '',
    failures: 0,
    recipients: 0,
    usersCount: 0,
    awarenessCampaignSimulationPhishingTemplates: [],
    awarenessCampaignSimulationPhishingTopClickers: [],
    awarenessPhishingCampaignStatisticsChartData: {
      labels: [],
      percentages: [],
    }
  };

  tableLoadingSpinner: boolean = true;

  phishLineChartOptions: any;
  phishLineChartData: any;

  leaderboardDataForUsers: ILeaderboardStatisticsModel = {
    rankedUsers: [],
    topThreeRankedUsers: [],
  };

  constructor(
    private route: ActivatedRoute,
    private apiService: PhishingcampaignsService,
    private excelService: ExcelService,
    private pdfService: PdfService,
    private messageService: MessageService,
    private sharingDataService: SharedDataService,
    private router: Router,
    private tableLoadingService: TableLoadingService,
    private translate: TranslationService,
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
    this.initPhishLineChartOptions();
    this.fetchPhishingCampaignStatistics();
    this.fetchPhishingCampaignsLeaderboardData();
  }

  fetchPhishingCampaignStatistics() {
    this.tableLoadingService.show();
    this.apiService.getGetAwarenessPhishingCampaignStatistics(this.campaignId).subscribe({
      next: (res) => {
        this.campaignStatisticsData = res.data;
        this.initPhishLineChartData();
        this.tableLoadingService.hide();
      },
      error: (err) => {

      },
    });
  }

  fetchPhishingCampaignsLeaderboardData() {
    this.apiService.getPhishingLeaderboard(this.campaignId).subscribe({
      next: (res) => {
        this.leaderboardDataForUsers = res.data;
      },
      error: (err) => { },
    });
  }

  getStatus(campaignStatus: string): string {
    switch (campaignStatus) {
      case CampaignStatus.Completed.toString():
        return 'Completed';
      case CampaignStatus.InProgress.toString():
        return 'In Progress';
      case CampaignStatus.NotStarted.toString():
        return 'Not Started';
      case CampaignStatus.Closed.toString():
        return 'Closed';
      default:
        return 'Unknown';
    }
  }

  navigateToTemplateReport(template: IAwarenessCampaignSimulationPhishingTemplateModel) {
    this.currentTemplateSelectedtemplate = template;
    this.sharingDataService.setData<IAwarenessCampaignSimulationPhishingTemplateModel>(template);
    this.router.navigate(['phishing-campaigns/campaign-statistics-template-details'], { queryParams: { campaignId: this.campaignId } });
  }

  async downloadPhishingReportAsCSV(awarenessCampaignSimulationPhishingScheduleUsersData: any) {
    const filteredData = awarenessCampaignSimulationPhishingScheduleUsersData.map((c: any) => {
      return {
        UserEmail: c.userEmail,
        UserName: c.userName,
        IsAttachmentOpened: c.isAttachmentOpened,
        IsDataEntered: c.isDataEntered,
        IsDelivered: c.isDelivered,
        IsLinkClicked: c.isLinkClicked,
        IsMacroEnabled: c.isMacroEnabled,
        IsOpened: c.isOpened,
        IsQRCodeScanned: c.isQRCodeScanned,
        IsReplied: c.isReplied,
        IsReported: c.isReported,
      };
    });
    await this.excelService.exportExcel(filteredData, 'Phishing Report');
  }

  async downloadPhishingClickersReportAsCSV() {
    const headers = [
      { header: 'User Name', dataKey: 'userName' },
      { header: 'User Email', dataKey: 'userEmail' },
      { header: 'Number Of Clicks', dataKey: 'numberOfClicks' },
    ]
    await this.excelService.exportExcelVI(this.campaignStatisticsData.awarenessCampaignSimulationPhishingTopClickers, 'Top (100) Clickers Phishing Report', headers);
  }

  downloadPhishingClickersReportAsPDF() {
    const headers = [
      { header: 'User Name', dataKey: 'userName' },
      { header: 'User Email', dataKey: 'userEmail' },
      { header: 'Number Of Clicks', dataKey: 'numberOfClicks' },
    ];
    this.pdfService.exportDataToPdfVI(this.campaignStatisticsData.awarenessCampaignSimulationPhishingTopClickers, 'Top (100) Clickers Phishing Report', headers);
  }

  updatePhishingReport() {
    this.ngOnInit();
    this.messageService.add({
      severity: 'success',
      summary: 'Phishing Report Updated',
      detail: 'The phishing report has been updated successfully.',
    });
  }

  initPhishLineChartData() {
    this.phishLineChartData = {
      labels: this.campaignStatisticsData.awarenessPhishingCampaignStatisticsChartData.labels,
      datasets: [
        {
          label: this.translate.getInstant('phishing-campaigns.phishing-campaign-statistics.vulnerability'),
          data: this.campaignStatisticsData.awarenessPhishingCampaignStatisticsChartData.percentages,
          fill: false,
          borderColor: '#42A5F5',
          tension: 0.4,
        }
      ]
    };
  }

  initPhishLineChartOptions() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--primary-color');
    const maxPercentage = Math.max(...this.campaignStatisticsData.awarenessPhishingCampaignStatisticsChartData.percentages);
    const suggestedMax = maxPercentage + (maxPercentage * 0.10);

    this.phishLineChartOptions = {
      plugins: {
        legend: {
          display: true,
          labels: {
            usePointStyle: true,
            color: '#FF6384'
          }
        },
        datalabels: {
          anchor: 'end',
          align: 'end',
          formatter: (value: number) => {
            return value + '%';
          },
          color: textColor,
          font: {
            weight: 'bold'
          }
        },
        tooltip: {
          callbacks: {
            label: (tooltipItem: any) => {
              return this.translate.getInstant('phishing-campaigns.phishing-campaign-statistics.vulnerabilityPercentage')
                .replace('[tooltipItem]', `${tooltipItem.raw}`);
            }
          }
        }
        
      },
      scales: {
        x: {
          ticks: {
            color: '#9E9E9E'
          },
          grid: {
            color: '#E0E0E0',
            display: false
          }
        },
        y: {
          suggestedMax: suggestedMax,
          label: this.translate.getInstant('phishing-campaigns.phishing-campaign-statistics.vulnerabilityPercentagee'),
          ticks: {
            color: '#9E9E9E',
            stepSize: 1,
            precision: 0
          },
          grid: {
            color: '#E0E0E0',
          },
        },
      }
    };
  }

  back(){
    this.router.navigate(['phishing-campaigns']);
  }
}