import { AfterViewChecked, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CampaignService } from '../../services/campaign.service';
import { Table } from 'primeng/table';
import { finalize, Subscription } from 'rxjs';
import { IAspNetPageItemModel } from 'src/app/modules/page-management/models/IAspNetPageItemModel';
import { PermessionsService } from 'src/app/core/Services/permessions.service';
import { constants } from 'src/app/core/constatnts/constatnts';
import { ExcelService } from 'src/app/core/Services/excel.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LocalStorageService } from 'src/app/core/Services/local-storage.service';
import { IAwarenessCampaignTrainingModel } from '../../models/IAwarenessCampaignTrainingModel';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Chart, registerables } from 'chart.js';
import { TableLoadingService } from 'src/app/core/Services/table-loading.service';
import { FileDownloadService } from 'src/app/core/Services/file-download.service';
import { IPaginationModel } from 'src/app/core/Dtos/IPaginationModel';

@Component({
    selector: 'app-current-campaign',
    templateUrl: './current-campaign.component.html',
    styleUrl: './current-campaign.component.scss',
})
export class CurrentCampaignComponent implements OnInit, AfterViewChecked, OnDestroy {
    tableLoadingSpinner: boolean = true;
    activeTabIndex: number = 0;
    selectedTab: any = null; // The current selected tab
    trainingAwarenessCampaigns: IAwarenessCampaignTrainingModel[] = [];
    trainingAwarenessCampaignsForDashboardDropDown: IAwarenessCampaignTrainingModel[] = [];
    historyCampaignsData: IAwarenessCampaignTrainingModel[] = [];
    historyCampaignsDataForDashboardDropDown: IAwarenessCampaignTrainingModel[] = [];
    unsubscribe: Subscription[] = [];
    isExpanded: boolean = false;
    pagePermessions: IAspNetPageItemModel[] = [];
    actions = constants.pageActions;
    currentCampaignId: string;
    certificateDialog: boolean = false;
    generatedCertificate: string;
    videoToken: any
    
    currentCampaignsTotalRecords: number = 0;
    histroyCampaignsTotalRecords: number = 0;
    currentPagination: IPaginationModel = {
        page:0,
        size:5,
        searchQuery:''
    }

    historyPagination: IPaginationModel = {
        page:0,
        size:5,
        searchQuery:''
    }
    constructor(
        private apiService: CampaignService,
        private permessionService: PermessionsService,
        private excelService: ExcelService,
        private router: Router,
        private route: ActivatedRoute,
        private localStorageSevice: LocalStorageService,
        private tableLoadingService: TableLoadingService,
        private downloadService: FileDownloadService,
        private cdr: ChangeDetectorRef
    ) {
        Chart.register(...registerables, ChartDataLabels);
        this.pagePermessions = this.permessionService.getPagePermessions(constants.pages.trainingCampaigns);
    }
    ngAfterViewChecked(): void {
        this.cdr.detectChanges();
    }

    ngOnInit(): void {
        this.route.queryParams.subscribe((params) => {
            const index = params['tapIndex'];
            if (index !== undefined) {
                this.activeTabIndex = this.hasPermission(this.actions.dashboard) &&  +index != 0 ?  +index : +index -1;
            }
        });

        this.tableLoadingService.loading$.subscribe((isLoading) => {
            this.tableLoadingSpinner = isLoading;
        });
    }

    isSelectedTab(item: any): boolean {
        return this.selectedTab === item;
    }

    onLazyLoadCurrentCampaigns(event: any){
        this.currentPagination.page = event.first / event.rows; 
        this.currentPagination.size = event.rows;
        this.currentPagination.searchQuery = event.globalFilter || '';
        this.fetchUserCurrentTrainingCampaigns();
    }

    onLazyLoadHistoryCampaigns(event: any){
        this.historyPagination.page = event.first / event.rows;
        this.historyPagination.size = event.rows;
        this.historyPagination.searchQuery = event.globalFilter || '';
        this.fetchUserHistoryTrainingCampaigns();
    }


    fetchUserCurrentTrainingCampaigns(){
        this.tableLoadingService.show();
        const sub = this.apiService.getUserCurrentTrainingCampaigns(this.currentPagination).subscribe({
            next: (res) => {
                this.trainingAwarenessCampaigns = res.data;
                this.trainingAwarenessCampaignsForDashboardDropDown = [
                    { campaignName: 'All', campaignId: 'all' } as IAwarenessCampaignTrainingModel,
                    ...new Map(this.trainingAwarenessCampaigns.map((item) => [item.campaignId, item])).values(),
                ];

                this.currentCampaignsTotalRecords = res.totalRecords;
                this.tableLoadingService.hide();
            },
            error: (err) => {
                console.log(err)
             },
        });
        this.unsubscribe.push(sub);
    }


    fetchUserHistoryTrainingCampaigns(){
        this.tableLoadingService.show();
        const sub = this.apiService.getUserHistoryTrainingCampaigns(this.historyPagination).subscribe({
            next: (res) => {
                this.historyCampaignsData = res.data;
                this.historyCampaignsDataForDashboardDropDown = [
                    { campaignName: 'All', campaignId: 'all' } as IAwarenessCampaignTrainingModel,
                    ...new Map(this.historyCampaignsData.map((item) => [item.campaignId, item])).values(),
                ];
                this.histroyCampaignsTotalRecords = res.totalRecords;
                this.tableLoadingService.hide();
            },
            error: (err) => {
                console.log(err)
             },
        });
        this.unsubscribe.push(sub);
    }

    navigateToLesson(lesson: any, where?: string) {
        if (lesson) {
            this.localStorageSevice.setItem('videoURL', lesson.lessonVideoUrl);
            this.localStorageSevice.setItem('bookURL', lesson.lessonBookUrl);
            this.localStorageSevice.setItem('quizzes', lesson.trainingLessonQuizzes);
            this.localStorageSevice.setItem('lessonId', lesson.trainingLessonId);
            this.localStorageSevice.setItem('lessonLanguageId', lesson.id);
            this.localStorageSevice.setItem('campaignId', lesson.campaignId);
            this.router.navigate([
                `/training-campaign/${lesson.scedualUserId}/${lesson.campaignId}/${where === 'b' ? 'book' : 'video'}`,
            ]);
        }
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    onGlobalTrinaingFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    onGlobalPhishingFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    onGlobalPhishingScedualFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    onGlobalPhishingScedualUserFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    hasPermission(controlKey: string): boolean {
        return this.pagePermessions.some((p) => p.controlKey === controlKey);
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

    calculateTotalNumberOfLessons(name: string) {
        let total = 0;

        if (this.trainingAwarenessCampaigns) {
            for (let customer of this.trainingAwarenessCampaigns) {
                if (customer?.campaignName === name) {
                    total++;
                }
            }
        }
        return total;
    }

    calculateTotalNumberOfLessonsVII(name: string) {
        let total = 0;

        if (this.trainingAwarenessCampaigns) {
            for (let customer of this.historyCampaignsData) {
                if (customer?.campaignName === name) {
                    total++;
                }
            }
        }
        return total;
    }

    closeCertificateDialog() {
        this.certificateDialog = false;
    }

    shareOnFacebook() {
        const url = this.generatedCertificate; // The URL of the certificate image
        const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        window.open(facebookShareUrl, '_blank');
    }

    shareOnTwitter() {
        const url = this.generatedCertificate;
        const twitterShareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=Check out my certificate!`;
        window.open(twitterShareUrl, '_blank');
    }

    shareOnLinkedIn() {
        const url = this.generatedCertificate;
        const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        window.open(linkedInShareUrl, '_blank');
    }

    shareOnSnapchat() {
        const url = this.generatedCertificate; // Ensure this is the full, publicly accessible URL
        const snapchatShareUrl = `https://snapchat.com/share?text=Check out my certificate! ${encodeURIComponent(url)}`;
        window.open(snapchatShareUrl, '_blank');
    }

    shareViaGmail() {
        const url = this.generatedCertificate;
        const subject = 'Check out my certificate!';
        const body = `I wanted to share my certificate with you: ${url}`;
        const gmailShareUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(gmailShareUrl, '_blank');
    }

    shareOnWhatsApp() {
        const certificateUrl = this.generatedCertificate;
        const message = `Check out my certificate: ${certificateUrl}`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    }

    getCertificate(campaign: IAwarenessCampaignTrainingModel) {
        this.certificateDialog = true;
        this.generatedCertificate = campaign.certificateImageUrl ?? '';
    }

    downloadCertificate() {
        if (this.generatedCertificate) {
            this.downloadService.downloadFile(this.generatedCertificate).subscribe();
        }
    }

    ngOnDestroy(): void {
        this.unsubscribe.forEach((u) => {
            u.unsubscribe();
        });
    }
}