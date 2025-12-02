import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PhishingcampaignComponent } from './components/phishingcampaign/phishingcampaign.component';
import { PhishingCampaignStatisticsComponent } from './components/phishing-campaign-statistics/phishing-campaign-statistics.component';
import { PhishingCampaignStatisticsTemplateDetailsComponent } from './components/phishing-campaign-template-statistics/phishing-campaign-template-statistics.component';

const routes: Routes = [
    { path: '', component: PhishingcampaignComponent },
    {
        path: 'p-campaign-statistics/:id',
        data: { breadcrumb: 'statistics' },
        component: PhishingCampaignStatisticsComponent,
    },
    {
        path: 'campaign-statistics-template-details',
        data: { breadcrumb: 'statistics' },
        component: PhishingCampaignStatisticsTemplateDetailsComponent,
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class PhishingCampaignsRoutingModule {}
