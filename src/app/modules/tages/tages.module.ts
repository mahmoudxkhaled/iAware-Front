import { NgModule } from '@angular/core';
import { TagesRoutingModule } from './tages-routing.module';
import { TageListingComponent } from './components/tage-listing/tage-listing.component';
import { SharedModule } from 'src/app/Shared/shared/shared.module';


@NgModule({
  declarations: [TageListingComponent],
  imports: [
    SharedModule,
    TagesRoutingModule
  ]
})
export class TagesModule { }