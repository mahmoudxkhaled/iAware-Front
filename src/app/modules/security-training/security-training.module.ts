import { NgModule } from '@angular/core';
import { SecurityTrainingRoutingModule } from './security-training-routing.module';
import { SharedModule } from 'src/app/Shared/shared/shared.module';
import { SecurityTrainingListComponent } from './component/security-training-list/security-training-list.component';
import { SecurityTrainingDetailsComponent } from './component/security-training-details/security-training-details.component';
import { SecurityTrainingCreateComponent } from './component/security-training-create/security-training-create.component';
import { TrainingLessonLanguageCreateComponent } from './component/training-lesson-language-create/training-lesson-language-create.component';
import { PdfViewerDialogComponent } from './component/pdf-viewer-dialog/pdf-viewer-dialog.component';
import { VideoViewerDialogComponent } from './component/video-viewer-dialog/video-viewer-dialog.component';
import { SafePipe } from 'src/app/core/pipes/safe.pipe';
import { TrainingLessonCategoryListComponent } from './component/training-lesson-category-list/training-lesson-category-list.component';
import { WallpaperWizardModule } from '../wallpaper-wizard/wallpaper-wizard.module';
import { TrainingCategoryLangsComponent } from './component/training-category-langs/training-category-langs.component';

@NgModule({
    declarations: [
        SecurityTrainingListComponent,
        SecurityTrainingDetailsComponent,
        SecurityTrainingCreateComponent,
        TrainingLessonLanguageCreateComponent,
        PdfViewerDialogComponent,
        VideoViewerDialogComponent,
        TrainingLessonCategoryListComponent,
        TrainingCategoryLangsComponent

    ],
    imports: [SharedModule, SecurityTrainingRoutingModule, WallpaperWizardModule],
})
export class SecurityTrainingModule { }