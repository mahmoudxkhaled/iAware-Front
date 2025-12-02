import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BadgeRoutingModule } from './badge-routing.module';
import { SharedModule } from 'src/app/Shared/shared/shared.module';
import { BadgeListingComponent } from './components/badge-listing/badge-listing.component';

@NgModule({
    declarations: [BadgeListingComponent],
    imports: [SharedModule, BadgeRoutingModule],
})
export class BadgeModule {}
