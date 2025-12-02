import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PhishingCategoryListComponent } from './components/phishing-category-list/phishing-category-list.component';
import { PhishingCategoryLanguageListComponent } from './components/phishing-category-language-list/phishing-category-language-list.component';
import { SharedModule } from 'src/app/Shared/shared/shared.module';

const routes: Routes = [
    { path: '', component: PhishingCategoryListComponent },
    { path: ':id/:where', component: PhishingCategoryLanguageListComponent },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class PhishingCategoryRoutingModule {}
