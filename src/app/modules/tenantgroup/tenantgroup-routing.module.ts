import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TenantgroupListingComponent } from './components/tenantgroup-listing/tenantgroup-listing.component';

const routes: Routes = [
    { path: '', component: TenantgroupListingComponent },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class TenantgroupRoutingModule {}
