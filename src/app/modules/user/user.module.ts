import { NgModule } from '@angular/core';
import { UserRoutingModule } from './user-routing.module';
import { UserListingComponent } from './components/user-listing/user-listing.component';
import { SharedModule } from 'src/app/Shared/shared/shared.module';
import { UserTenantProfileComponent } from './components/user-tenant-profile/user-tenant-profile.component';
import { SettingsComponent } from '../account/components/settings/settings.component';
import { AccountModule } from '../account/account.module';
import { AppConfigModule } from 'src/app/layout/config/app.config.module';
import { UserDetailsComponent } from './components/user-details/user-details.component';
import { SubscriptionDetailsComponent } from './components/subscription-details/subscription-details.component';
@NgModule({
    declarations: [
        UserListingComponent,
        UserTenantProfileComponent,
        UserDetailsComponent,
        SubscriptionDetailsComponent,
    ],
    imports: [UserRoutingModule, SharedModule, AccountModule, AppConfigModule],
})
export class UserModule {}
