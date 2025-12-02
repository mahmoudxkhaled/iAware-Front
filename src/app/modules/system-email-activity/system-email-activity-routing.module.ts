import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SystemEmailActivityListingComponent } from './components/system-email-activity-listing/system-email-activity-listing.component';

const routes: Routes = [
  { path: '', component: SystemEmailActivityListingComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SystemEmailActivityRoutingModule { }