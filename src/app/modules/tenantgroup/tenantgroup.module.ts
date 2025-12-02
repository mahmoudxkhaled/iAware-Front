import { NgModule } from '@angular/core';
import { TenantgroupRoutingModule } from './tenantgroup-routing.module';
import { SharedModule } from 'src/app/Shared/shared/shared.module';
import { TenantgroupListingComponent } from './components/tenantgroup-listing/tenantgroup-listing.component';

@NgModule({
    declarations: [TenantgroupListingComponent],
    imports: [SharedModule, TenantgroupRoutingModule],
})
export class TenantgroupModule {}
