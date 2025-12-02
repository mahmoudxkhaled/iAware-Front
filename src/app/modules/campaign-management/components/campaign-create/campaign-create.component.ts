import { AfterViewInit, Renderer2, Component, OnDestroy, OnInit, ElementRef } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { LocalStorageService } from 'src/app/core/Services/local-storage.service';
import { TranslationService } from 'src/app/core/Services/translation.service';

@Component({
    selector: 'app-campaign-create',
    templateUrl: './campaign-create.component.html',
    styleUrl: './campaign-create.component.scss',
})
export class CampaignCreateComponent implements OnInit, AfterViewInit, OnDestroy {
    routeItems: MenuItem[] = [];
    completed = 0;

    constructor(private localstorageService: LocalStorageService
        , private elRef: ElementRef
        , private renderer: Renderer2
        , private translate: TranslationService) { }

    ngOnInit(): void {
        this.routeItems = [
            {
                label: this.translate.getInstant('campaign-management.campaign-create.steps.settings'),
                routerLink: 'type',
                id:"step1"
            },
            {
                label: this.translate.getInstant('campaign-management.campaign-create.steps.build'),
                routerLink: 'campaign-build',
                id:"step2"

            },
            {
                label: this.translate.getInstant('campaign-management.campaign-create.steps.schedual'),
                routerLink: 'schedule',
                id:"step3"
            },
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
        const data = ['campaignType', 'lessons', 'type', 'campaignUsers', 'phishingTemplates', 'selectUsersValue', 'lessonLanguageId'];
        data.forEach(c => {
            this.localstorageService.removeItem(c);
        })
    }
}