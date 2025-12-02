import { NgModule } from '@angular/core';
import { PhishingEmailTemplateRoutingModule } from './phishing-email-template-routing.module';
import { SharedModule } from 'src/app/Shared/shared/shared.module';
import { PhishingEmailTemplateCreateComponent } from './components/phishing-email-template-create/phishing-email-template-create.component';
import { PhishingEmailTemplateListingComponent } from './components/phishing-email-template-listing/phishing-email-template-listing.component';
import { DynamicHtmlComponent } from './components/dynamic-html/dynamic-html.component';
import { PhishingEmailTemplateDetailsComponent } from './components/phishing-email-template-details/phishing-email-template-details.component';

@NgModule({
    declarations: [
        PhishingEmailTemplateListingComponent,
        PhishingEmailTemplateCreateComponent,
        PhishingEmailTemplateDetailsComponent,
        DynamicHtmlComponent,
    ],
    imports: [SharedModule, PhishingEmailTemplateRoutingModule],
})
export class PhishingEmailTemplateModule { }
