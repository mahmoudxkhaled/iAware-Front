import { AfterContentInit, AfterViewChecked, AfterViewInit, Component } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { PhishingEmailTemplateService } from '../../services/phishing-email-template.service';
import { IPhishingEmailTemplateLanguage } from '../../models/IPhishingEmailTemplateLanguage';
import { IPhishingEmailTemplate } from '../../models/IPhishingEmailTemplate';
import { IPhishingEmailTemplateLanguageLandingKey } from '../../models/IPhishingEmailTemplateLanguageLandingKey';
export interface AwarenessCampaignSimulationPhishingScheduleUserActivityDto {
    awarenessCampaignSimulationPhishingScheduleUserId: string;
    phishingEmailTemplateLanguageLandingKeyId: string;
    keys: AddPhishingEmailTemplateLanguageLandingKeyDto[];
    emailViewingTime?: Date;
    emailLandingPageViewingTime?: Date;
}

export interface AddPhishingEmailTemplateLanguageLandingKeyDto {
    phishingLandingPageInputKey?: string;
    phishingLandingPageInputType?: string;
    phishingLandingPageInputTitle?: string;
    phishingLandingPageInputEvent?: string;
    phishingEmailTemplateLanguageId: string;
}
@Component({
    selector: 'app-dynamic-html',
    templateUrl: './dynamic-html.component.html',
    styleUrl: './dynamic-html.component.scss',
})
export class DynamicHtmlComponent implements AfterViewChecked {
    htmlContent: SafeHtml = '';
    selectedTemplateId: string;
    selectedTemplateLanguageId: string;

    templateList: IPhishingEmailTemplate[] = [];
    templateLanguagesList: IPhishingEmailTemplateLanguage[] = [];
    phishingEmailTemplateLanguageLandingKeys: IPhishingEmailTemplateLanguageLandingKey[];
    selectedLanguage: IPhishingEmailTemplateLanguage;
    constructor(private phishServ: PhishingEmailTemplateService, private sanitizer: DomSanitizer) {
        this.selectedTemplateLanguageId = 'ae29d573-e34b-42ed-bfe2-a31a47e83eb4';
    }
    ngAfterViewChecked(): void {
        // this.attachEventListeners();
    }

    ngOnInit(): void {
        this.phishServ.getPhishingEmailTemplateLanguageById(this.selectedTemplateLanguageId).subscribe((data) => {
            this.selectedLanguage = data;
            this.htmlContent = this.sanitizer.bypassSecurityTrustHtml(
                this.selectedLanguage.phishingLandingPageContentHtml!
            );

            this.phishingEmailTemplateLanguageLandingKeys =
                this.selectedLanguage?.phishingEmailTemplateLanguageLandingKeys!;
        });
    }
    ShowContent() {
        this.attachEventListeners();
    }
    private attachEventListeners(): void {
        this.phishingEmailTemplateLanguageLandingKeys.forEach((key) => {
            const element = document.getElementById(key.phishingLandingPageInputKey) as HTMLElement;
            

            if (element) {
                switch (key.phishingLandingPageInputEvent) {
                    case 'keydown':
                        element.addEventListener('keydown', this.onKeyDown.bind(this));
                        element.addEventListener('blur', this.onBlur.bind(this));

                        break;
                    case 'click':
                        element.addEventListener('click', this.onClick.bind(this));
                        break;
                    case 'select':
                        element.addEventListener('select', this.onSelect.bind(this));
                        break;

                    case 'blur':
                        element.addEventListener('blur', this.onBlur.bind(this));
                        break;
                    default:
                        console.warn(`Unhandled event type: ${key.phishingLandingPageInputEvent}`);
                        break;
                }
            } else {
                console.error(` "${key.phishingLandingPageInputKey}" not found.`);
            }
        });
    }

    private onBlur(event: FocusEvent): void {
        
        const inputValue = (event.target as HTMLInputElement).value;
        

        this.triggerUserActivity('onkeydown');
    }

    private onKeyDown(event: KeyboardEvent): void {
        
        this.triggerUserActivity('onkeydown');
    }

    private onClick(event: MouseEvent): void {
        
        this.triggerUserActivity('click');
    }

    private onSelect(event: Event): void {
        
        this.triggerUserActivity('select');
    }

    private triggerUserActivity(eventType: string): void {
        const activityDto: AwarenessCampaignSimulationPhishingScheduleUserActivityDto = {
            awarenessCampaignSimulationPhishingScheduleUserId: '',
            phishingEmailTemplateLanguageLandingKeyId: '',
            keys: [],
            emailViewingTime: new Date(),
            emailLandingPageViewingTime: new Date(),
        };

        // this.phishServ.triggerUserActivity(activityDto).subscribe(
        //     (response) => {
        //         
        //     },
        //     (error) => {
        //         console.error('Error triggering user activity:', error);
        //     }
        // );
    }
}
