import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SystemEmailListingComponent } from './components/system-emails-listing/system-emails-listing.component';

const routes: Routes = [
    { path: '', component: SystemEmailListingComponent },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class SystemEmailRoutingModule {}
