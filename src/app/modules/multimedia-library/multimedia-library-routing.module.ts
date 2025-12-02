import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TrainingCategoryVideosComponent } from './component/training-category-library/training-category-library.component';
import { TrainingCategoryLessonsComponent } from './component/training-category-lessons/training-category-lessons.component';

const routes: Routes = [
    {
        path: '',
        component: TrainingCategoryLessonsComponent,
    },
    {
        path: 'Categories',
        component: TrainingCategoryVideosComponent,
    },
    {
        path: 'Lessons/:id',
        component: TrainingCategoryLessonsComponent,
    },
    {
        path: 'Lessons',
        component: TrainingCategoryLessonsComponent,
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class MultimediaLibraryRoutingModule {}