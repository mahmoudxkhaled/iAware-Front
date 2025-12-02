import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CategoryComponent } from './components/category/category.component';
import { StatusComponent } from './components/status/status.component';
import { SubjectComponent } from './components/subject/subject.component';

const routes: Routes = [
    { path: 'category', component: CategoryComponent },
    { path: 'subjects', component: SubjectComponent },
    { path: 'status', component: StatusComponent },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class SupportRoutingModule {}
