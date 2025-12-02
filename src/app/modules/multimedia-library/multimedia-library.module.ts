import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/Shared/shared/shared.module';
import { TrainingCategoryVideosComponent } from './component/training-category-library/training-category-library.component';
import { MultimediaLibraryRoutingModule } from './multimedia-library-routing.module';
import { ShakaPlayerComponent } from 'src/app/Shared/components/shaka-player/shaka-player.component';
import { PlyrComponent } from 'src/app/Shared/components/plyr/plyr.component';
import { SecurityTrainingModule } from '../security-training/security-training.module';
import { VdoPlayerComponent } from 'src/app/Shared/components/vdo-player/vdo-player.component';
import { VideoPlayerComponent } from 'src/app/Shared/components/video-player/video-player.component';
import { LessonsComponent } from './component/lessons/lessons.component';
import { TrainingCategoryLessonsComponent } from './component/training-category-lessons/training-category-lessons.component';

@NgModule({
    declarations: [
        TrainingCategoryLessonsComponent,
        TrainingCategoryVideosComponent,
        ShakaPlayerComponent,
        PlyrComponent,
        LessonsComponent
    ],
    imports: [
        MultimediaLibraryRoutingModule,
        SharedModule,
        SecurityTrainingModule,
        VdoPlayerComponent,
        VideoPlayerComponent
    ],
})
export class MultimediaLibraryModule { }