import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { UserListingComponent } from './components/user-listing/user-listing.component';
import { UserTenantProfileComponent } from './components/user-tenant-profile/user-tenant-profile.component';
import { UserDetailsComponent } from './components/user-details/user-details.component';
import { SubscriptionDetailsComponent } from './components/subscription-details/subscription-details.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            { path: '', component: UserListingComponent },
            { path: 'userDetail/:id', component: UserDetailsComponent },
            { path: 'profile', component: UserTenantProfileComponent },
            { path: 'subscription-details', component: SubscriptionDetailsComponent },
            { path: '**', redirectTo: '/notfound' },
        ]),
    ],
    exports: [RouterModule],
})
export class UserRoutingModule {}
