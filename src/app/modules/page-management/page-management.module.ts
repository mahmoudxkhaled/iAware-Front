import { NgModule } from '@angular/core';
import { PageManagementRoutingModule } from './page-management-routing.module';
import { SharedModule } from 'src/app/Shared/shared/shared.module';
import { PageListingComponent } from './components/page-listing/page-listing.component';
import { PageCreateComponent } from './components/page-create/page-create.component';
import { PageDetailsComponent } from './components/page-details/page-details.component';

@NgModule({
    declarations: [
        PageListingComponent,
        PageCreateComponent,
        PageDetailsComponent,
    ],
    imports: [SharedModule, PageManagementRoutingModule],
})
export class PageManagementModule {}