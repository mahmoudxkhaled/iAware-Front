import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InduetryRoutingModule } from './induetry-routing.module';
import { SharedModule } from 'src/app/Shared/shared/shared.module';
import { IndustryListingComponent } from './components/industry-listing/industry-listing.component';


@NgModule({
  declarations: [IndustryListingComponent],
  imports: [
    SharedModule,
    InduetryRoutingModule
  ]
})
export class InduetryModule { }
