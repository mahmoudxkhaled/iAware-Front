import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from 'src/app/Shared/shared/shared.module';
import { SystemEmailListingComponent } from './components/system-emails-listing/system-emails-listing.component';
import { SystemEmailRoutingModule } from './system-email-routing.module';

@NgModule({
    declarations: [SystemEmailListingComponent],
    imports: [SharedModule,SystemEmailRoutingModule ],
})
export class SystemEmailModule {}
