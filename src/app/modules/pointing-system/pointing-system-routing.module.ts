import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PointingTypeListingComponent } from './components/pointing-type-listing/pointing-type-listing.component';

const routes: Routes = [
  { path: '', component:PointingTypeListingComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PointingSystemRoutingModule { }
