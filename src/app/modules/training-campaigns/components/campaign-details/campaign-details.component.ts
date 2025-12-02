import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LocalStorageService } from 'src/app/core/Services/local-storage.service';
import { CampaignService } from '../../services/campaign.service';
import { MenuItem } from 'primeng/api';
import { TranslationService } from 'src/app/core/Services/translation.service';

@Component({
    selector: 'app-campaign-details',
    templateUrl: './campaign-details.component.html',
    styleUrl: './campaign-details.component.scss',
})
export class CampaignDetailsComponent implements OnInit, AfterViewInit, OnDestroy {
    
    scedualUserId: string;
    campaignId: string;
    lessonLanguageId: string;
    lesson: any;
    routeItems: MenuItem[] = [];

    constructor(
        private route: ActivatedRoute,
        private localStorageSevice: LocalStorageService,
        private apiService: CampaignService,
        private translate: TranslationService, 
        private elRef: ElementRef, 
        private renderer: Renderer2
    ) { }

    ngOnInit(): void {
        const x = this.route.params.subscribe((params) => {
            this.scedualUserId = params['id'];
            this.campaignId = params['campaignId'];
        });

        const data = this.localStorageSevice.getCurrentUserData();
        if (data !== null) {
            this.lessonLanguageId = data?.language;
        }

        this.apiService.updateScedualUserUpdateLessonViewingTime(this.scedualUserId).subscribe({
            next: () => { },
            error: (err) => {
                console.log(err);
            },
        });

        this.localStorageSevice.setItem('scedualUserId', this.scedualUserId)
        this.routeItems = [
            { label: this.translate.getInstant('campaign.campaignDetails.steps.video'), routerLink: 'video' },
            { label: this.translate.getInstant('campaign.campaignDetails.steps.book'), routerLink: 'book' },
            { label: this.translate.getInstant('campaign.campaignDetails.steps.quiz'), routerLink: 'quiz', disabled: true },
            { label: this.translate.getInstant('campaign.campaignDetails.steps.results'), routerLink: 'score', disabled: true },
        ];
    }

    ngAfterViewInit(): void {
        const elements = this.elRef.nativeElement.querySelectorAll('.p-steps-number');
        elements.forEach((element: HTMLElement) => {
            this.renderer.setProperty(element, 'innerHTML', '');
            this.renderer.setStyle(element, 'visibility', 'visible');
        });
    }

    ngOnDestroy(): void {
        this.localStorageSevice.removeItem('bookURL');
        this.localStorageSevice.removeItem('videoURL');
        this.localStorageSevice.removeItem('scedualUserId');
        this.localStorageSevice.removeItem('quizzes');
        this.localStorageSevice.removeItem('lessonId');
        this.localStorageSevice.removeItem('campaignId');
        this.localStorageSevice.removeItem('isVideoCompleted');
        this.localStorageSevice.removeItem('selectedAnswers');
        this.localStorageSevice.removeItem('isBookViewed');
        this.localStorageSevice.removeItem('isVideoCompleted');
    }
}