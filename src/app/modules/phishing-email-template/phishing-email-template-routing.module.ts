import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PhishingEmailTemplateListingComponent } from './components/phishing-email-template-listing/phishing-email-template-listing.component';
import { PhishingEmailTemplateCreateComponent } from './components/phishing-email-template-create/phishing-email-template-create.component';
import { PhishingEmailTemplateDetailsComponent } from './components/phishing-email-template-details/phishing-email-template-details.component';
import { DynamicHtmlComponent } from './components/dynamic-html/dynamic-html.component';

const routes: Routes = [
    { path: '', component: PhishingEmailTemplateListingComponent },
    { path: 'dynamicHtml', component: DynamicHtmlComponent },
    { path: 'create', component: PhishingEmailTemplateCreateComponent },
    { path: ':id/:where', component: PhishingEmailTemplateDetailsComponent },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class PhishingEmailTemplateRoutingModule {}