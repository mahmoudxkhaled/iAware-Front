import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BadgeListingComponent } from './components/badge-listing/badge-listing.component';

const routes: Routes = [{ path:'', component : BadgeListingComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BadgeRoutingModule { }
