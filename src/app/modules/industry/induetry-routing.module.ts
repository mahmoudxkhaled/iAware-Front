import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IndustryListingComponent } from './components/industry-listing/industry-listing.component';

const routes: Routes = [{path: '', component: IndustryListingComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InduetryRoutingModule { }
