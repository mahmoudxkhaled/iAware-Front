import { NgModule } from '@angular/core';
import { PhishingCampaignsRoutingModule } from './phishing-campaigns-routing.module';
import { SharedModule } from 'src/app/Shared/shared/shared.module';
import { PhishingcampaignComponent } from './components/phishingcampaign/phishingcampaign.component';
import { PhishingCampaignStatisticsTemplateDetailsComponent } from './components/phishing-campaign-template-statistics/phishing-campaign-template-statistics.component';
import { PhishingCampaignStatisticsComponent } from './components/phishing-campaign-statistics/phishing-campaign-statistics.component';

@NgModule({
    declarations: [
        PhishingcampaignComponent,
        PhishingCampaignStatisticsTemplateDetailsComponent,
        PhishingCampaignStatisticsComponent,
    ],
    imports: [SharedModule, PhishingCampaignsRoutingModule],
})
export class PhishingCampaignsModule {}
