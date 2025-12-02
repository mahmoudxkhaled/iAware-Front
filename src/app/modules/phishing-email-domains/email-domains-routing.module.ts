import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EmailDomainsListingComponent } from './components/email-domains-listing/email-domains-listing.component';
import { EmailDomainsDetailsComponent } from './components/email-domains-details/email-domains-details.component';

const routes: Routes = [
  { path: '', component: EmailDomainsListingComponent },
  { path: ':id', component: EmailDomainsDetailsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmailDomainsRoutingModule { }