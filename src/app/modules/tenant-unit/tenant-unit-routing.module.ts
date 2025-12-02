import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TenantUnitListingComponent } from './components/tenant-unit-listing/tenant-unit-listing.component';

const routes: Routes = [
  { path: '', component: TenantUnitListingComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TenantUnitRoutingModule { }
