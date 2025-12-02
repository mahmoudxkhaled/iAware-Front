import { NgModule } from '@angular/core';
import { PointingSystemRoutingModule } from './pointing-system-routing.module';
import { PointingTypeListingComponent } from './components/pointing-type-listing/pointing-type-listing.component';
import { SharedModule } from 'src/app/Shared/shared/shared.module';


@NgModule({
  declarations: [PointingTypeListingComponent],
  imports: [
    PointingSystemRoutingModule,
    SharedModule
  ]
})
export class PointingSystemModule { }