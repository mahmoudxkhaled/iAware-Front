import { NgModule } from '@angular/core';
import { CampaignRoutingModule } from './campaign-routing.module';
import { SharedModule } from 'src/app/Shared/shared/shared.module';
import { CurrentCampaignComponent } from './components/current-campaign/current-campaign.component';
import { CampaignDetailsComponent } from './components/campaign-details/campaign-details.component';
import { CampaignBookComponent } from './components/campaign-details/steps/campaign-book/campaign-book.component';
import { CampaignVideoComponent } from './components/campaign-details/steps/campaign-video/campaign-video.component';
import { CampaignQuizComponent } from './components/campaign-details/steps/campaign-quiz/campaign-quiz.component';
import { CampaignScoreComponent } from './components/campaign-details/steps/campaign-score/campaign-score.component';
import { TrainingCampaignStatisticsComponent } from './components/training-campaign-statistics/training-campaign-statistics.component';
import { VdoPlayerComponent } from 'src/app/Shared/components/vdo-player/vdo-player.component';
import { VideoPlayerComponent } from 'src/app/Shared/components/video-player/video-player.component';

@NgModule({
    declarations: [
        CurrentCampaignComponent,
        CampaignDetailsComponent,
        CampaignBookComponent,
        CampaignVideoComponent,
        CampaignQuizComponent,
        CampaignScoreComponent,
        TrainingCampaignStatisticsComponent,

    ],
    imports: [SharedModule, CampaignRoutingModule, VdoPlayerComponent, VideoPlayerComponent],
})
export class CampaignModule { }
