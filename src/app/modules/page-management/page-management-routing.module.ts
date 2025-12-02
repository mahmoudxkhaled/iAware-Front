import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageListingComponent } from './components/page-listing/page-listing.component';
import { PageDetailsComponent } from './components/page-details/page-details.component';
import { PageCreateComponent } from './components/page-create/page-create.component';

const routes: Routes = [
    { path: '', component: PageListingComponent },
    { path: 'page-create', component: PageCreateComponent },
    { path: 'page-details/:id', component: PageDetailsComponent },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class PageManagementRoutingModule {}
