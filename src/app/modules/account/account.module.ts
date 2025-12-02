import { NgModule } from '@angular/core';
import { AccountRoutingModule } from './account-routing.module';
import { SharedModule } from 'src/app/Shared/shared/shared.module';

import { AccountIntegrationSettingsComponent } from './components/settings/account-integration-settings/account-integration-settings.component';
import { SettingsComponent } from './components/settings/settings.component';
import { ProfileDetailsComponent } from './components/settings/profile-details/profile-details.component';
import { BrandingComponent } from './components/settings/branding/branding.component';
import { UserProvisioningComponent } from './components/settings/user-provisioning/user-provisioning.component';
import { UserProvisioningNotificationsComponent } from './components/settings/user-provisioning-notifications/user-provisioning-notifications.component';
import { UserSettingsComponent } from './components/settings/user-settings/user-settings.component';
import { PhishingSettingsComponent } from './components/settings/phishing-settings/phishing-settings.component';
import { TrainingSettingsComponent } from './components/settings/training-settings/training-settings.component';
import { LearnerExperienceComponent } from './components/settings/learner-experience/learner-experience.component';
import { OrganizationInformationComponent } from './components/settings/organization-information/organization-information.component';
import { ADSettingsComponent } from './components/settings/ad-settings/ad-settings.component';
import { CommonModule } from '@angular/common';

@NgModule({
    declarations: [
        SettingsComponent,
        ProfileDetailsComponent,
        BrandingComponent,
        UserProvisioningComponent,
        UserProvisioningNotificationsComponent,
        UserSettingsComponent,
        PhishingSettingsComponent,
        TrainingSettingsComponent,
        LearnerExperienceComponent,
        AccountIntegrationSettingsComponent,
        ADSettingsComponent,
        OrganizationInformationComponent,
    ],
    imports: [SharedModule, AccountRoutingModule, CommonModule],
    exports: [SettingsComponent, ADSettingsComponent],
})
export class AccountModule {}
