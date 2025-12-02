import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/Shared/shared/shared.module';
import { CampaignListingComponent } from './components/campaign-listing/campaign-listing.component';
import { CampaignCreateComponent } from './components/campaign-create/campaign-create.component';
import { ScheduleComponent } from './components/forms/schedule/schedule.component';
import { LessonsComponent } from './components/forms/lessons/lessons.component';
import { CampaignTypeComponent } from './components/forms/campaign-type/campaign-type.component';
import { CampaignManagementRoutingModule } from './campaign-management-routing.module';
import { CampaignBuildComponent } from './components/forms/campaign-build/campaign-build.component';
import { PhishingEmailTemplatesComponent } from './components/forms/phishing-email-templates/phishing-email-templates.component';

@NgModule({
    declarations: [
        CampaignListingComponent, 
        CampaignCreateComponent, 
        ScheduleComponent, 
        LessonsComponent, 
        CampaignTypeComponent,
        CampaignBuildComponent, 
        PhishingEmailTemplatesComponent],
    imports: [SharedModule, CampaignManagementRoutingModule],
})
export class CampaignManagementModule {}
