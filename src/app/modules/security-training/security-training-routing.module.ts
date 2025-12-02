import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SecurityTrainingListComponent } from './component/security-training-list/security-training-list.component';
import { SecurityTrainingDetailsComponent } from './component/security-training-details/security-training-details.component';
import { SecurityTrainingCreateComponent } from './component/security-training-create/security-training-create.component';
import { TrainingLessonLanguageCreateComponent } from './component/training-lesson-language-create/training-lesson-language-create.component';
import { TrainingLessonCategoryListComponent } from './component/training-lesson-category-list/training-lesson-category-list.component';
import { TrainingCategoryLangsComponent } from './component/training-category-langs/training-category-langs.component';

const routes: Routes = [
    {
        path: 'Security-Training-List',
        component: SecurityTrainingListComponent,
    },
    {
        path: 'Security-Training-Create',
        component: SecurityTrainingCreateComponent,
    },
    {
        path: 'Training-Lesson-Category',
        component: TrainingLessonCategoryListComponent,
    },
    {
        path: 'Training-LessonLanguage-Create/:lessonId',
        component: TrainingLessonLanguageCreateComponent,
    },
    {
        path: ':id',
        component: SecurityTrainingDetailsComponent,
    },
    {
        path: 'catLangs/:id',
        component: TrainingCategoryLangsComponent,
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class SecurityTrainingRoutingModule {}
