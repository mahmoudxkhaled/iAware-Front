import { NgModule } from '@angular/core';
import { PhishingCategoryRoutingModule } from './phishing-category-routing.module';
import { PhishingCategoryListComponent } from './components/phishing-category-list/phishing-category-list.component';
import { PhishingCategoryLanguageListComponent } from './components/phishing-category-language-list/phishing-category-language-list.component';
import { SharedModule } from 'src/app/Shared/shared/shared.module';

@NgModule({
    declarations: [PhishingCategoryListComponent, PhishingCategoryLanguageListComponent],
    imports: [SharedModule, PhishingCategoryRoutingModule],
})
export class PhishingCategoryModule {}
