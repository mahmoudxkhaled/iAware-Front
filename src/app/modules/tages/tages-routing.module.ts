import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TageListingComponent } from './components/tage-listing/tage-listing.component';

const routes: Routes = [{path: '', component:TageListingComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TagesRoutingModule { }
