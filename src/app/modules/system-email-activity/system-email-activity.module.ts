import { NgModule } from '@angular/core';
import { SystemEmailActivityRoutingModule } from './system-email-activity-routing.module';
import { SharedModule } from 'src/app/Shared/shared/shared.module';
import { SystemEmailActivityListingComponent } from './components/system-email-activity-listing/system-email-activity-listing.component';


@NgModule({
  declarations: [SystemEmailActivityListingComponent],
  imports: [
    SharedModule,
    SystemEmailActivityRoutingModule
  ]
})
export class SystemEmailActivityModule { }