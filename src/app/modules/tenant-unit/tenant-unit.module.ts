import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TenantUnitRoutingModule } from './tenant-unit-routing.module';
import { SharedModule } from 'src/app/Shared/shared/shared.module';
import { TenantUnitListingComponent } from './components/tenant-unit-listing/tenant-unit-listing.component';


@NgModule({
  declarations: [TenantUnitListingComponent],
  imports: [
    SharedModule,
    TenantUnitRoutingModule
  ]
})
export class TenantUnitModule { }