import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EmailDomainsRoutingModule } from './email-domains-routing.module';
import { SharedModule } from 'src/app/Shared/shared/shared.module';
import { EmailDomainsListingComponent } from './components/email-domains-listing/email-domains-listing.component';
import { EmailDomainsDetailsComponent } from './components/email-domains-details/email-domains-details.component';


@NgModule({
  declarations: [EmailDomainsListingComponent, EmailDomainsDetailsComponent],
  imports: [
    SharedModule,
    EmailDomainsRoutingModule
  ]
})
export class EmailDomainsModule { }