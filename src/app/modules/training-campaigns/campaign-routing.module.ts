import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CurrentCampaignComponent } from './components/current-campaign/current-campaign.component';
import { CampaignDetailsComponent } from './components/campaign-details/campaign-details.component';
import { CampaignBookComponent } from './components/campaign-details/steps/campaign-book/campaign-book.component';
import { CampaignVideoComponent } from './components/campaign-details/steps/campaign-video/campaign-video.component';
import { CampaignQuizComponent } from './components/campaign-details/steps/campaign-quiz/campaign-quiz.component';
import { CampaignScoreComponent } from './components/campaign-details/steps/campaign-score/campaign-score.component';
import { TrainingCampaignStatisticsComponent } from './components/training-campaign-statistics/training-campaign-statistics.component';

const routes: Routes = [
    {
        path: '',
        component: CurrentCampaignComponent,
    },
    {
        path: 'campaign-statistics/:id',
        data: { breadcrumb: 'statistics' },
        component: TrainingCampaignStatisticsComponent,
    },
    {
        path: ':id/:campaignId',
        component: CampaignDetailsComponent,
        data: { breadcrumb: 'details' },
        children: [
            {
                path: '',
                redirectTo: 'video',
                pathMatch: 'full',
            },
            {
                path: 'book',
                component: CampaignBookComponent,
            },
            {
                path: 'video',
                component: CampaignVideoComponent,
            },
            {
                path: 'quiz',
                component: CampaignQuizComponent,
            },
            {
                path: 'score',
                component: CampaignScoreComponent,
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class CampaignRoutingModule {}
