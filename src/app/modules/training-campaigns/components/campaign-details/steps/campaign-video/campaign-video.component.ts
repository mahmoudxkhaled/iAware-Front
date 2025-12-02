import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IawareSharedService } from 'src/app/core/Services/iaware-shared.service';
import { LocalStorageService } from 'src/app/core/Services/local-storage.service';
import { TableLoadingService } from 'src/app/core/Services/table-loading.service';
import { TranslationService } from 'src/app/core/Services/translation.service';
import { CampaignService } from 'src/app/modules/training-campaigns/services/campaign.service';

@Component({
    selector: 'app-campaign-video',
    templateUrl: './campaign-video.component.html',
    styleUrl: './campaign-video.component.scss',
})
export class CampaignVideoComponent implements OnInit, AfterViewInit {
    videoUrl: string;
    lessonId: string;
    scedualUserId: string;
    campaignId: string;
    isVideoCompleted: boolean = false;
    tableLoadingSpinner: boolean = true;
    pageTitle : string;
    constructor(
        private router: Router,
        private localStorageService: LocalStorageService,
        private apiService: CampaignService,
        private pointService: IawareSharedService,
        private tableLoadingService: TableLoadingService,
            private translate : TranslationService
    ) { }

    ngAfterViewInit(): void {
        this.getVideoLogoUrl();
    }

    ngOnInit(): void {
        this.tableLoadingService.loading$.subscribe((isLoading) => { this.tableLoadingSpinner = isLoading; });
        this.tableLoadingService.show();
        setTimeout(() => {
            this.videoUrl = this.localStorageService.getItem('videoURL');
            this.tableLoadingService.hide();
        }, 2000);
        this.lessonId = this.localStorageService.getItem('lessonId');
        this.campaignId = this.localStorageService.getItem('campaignId');
        this.scedualUserId = this.localStorageService.getItem('scedualUserId');
        this.isVideoCompleted = JSON.parse(localStorage.getItem('isVideoCompleted')!) || false;
        window.scrollTo({
            top: 275,
            behavior: 'smooth',
        });

        const videoTitle = this.translate.getInstant('campaign.campaignDetails.steps.videoTitle');
        this.pageTitle = videoTitle.replace('[scedualUserId]', this.scedualUserId).replace('[campaignId]', this.campaignId);
    
    }

    nextPage() {
        if (this.isVideoCompleted && this.lessonId) {
            this.apiService.updateScedualUserUpdateVideoViewingTime(this.scedualUserId).subscribe({
                next: () => {
                    localStorage.setItem('isVideoCompleted', JSON.stringify(this.isVideoCompleted));
                    this.router.navigate([`training-campaign/${this.scedualUserId}/${this.campaignId}/quiz`]);
                },
                error: (e) => {
                    console.log(e);
                },
            });
        }
    }


    getViedoURl() {

    }

    navigateToBook() {
        this.router.navigate([`training-campaign/${this.scedualUserId}/${this.campaignId}/book`]);
    }

    onVideoEnded(t: any) {
        this.isVideoCompleted = true;
        // const point: IPointSystemTransactionModel = {
        //     pointTypeId: PointingTypeEnum.CompletingAwarenessVideoORComicBook,
        //     referenceId: this.lessonId,
        //     campaignId: this.campaignId,
        // };
        // this.pointService.addPointingTransaction(point).subscribe();
    }

    getVideoLogoUrl() {
        const element = document.getElementById('resize-listener');
        if (element) {
            console.log(element);
        }
    }

    getLogoUrl(): any {
        this.apiService.getCompanyLogo().subscribe({
            next: (response) => {
                return response.data;
            },
            error: (error) => {
                console.error(error);
            }
        })
    }

    videoStalledBegin() {
        console.log('Video Stalled Begin');
    }
}
