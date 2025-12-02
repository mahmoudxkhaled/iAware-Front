import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleListingComponent } from './components/role-listing/role-listing.component';
import { RoleCreateComponent } from './components/role-create/role-create.component';

const routes: Routes = [
    { path: '', component: RoleListingComponent },
    { path: 'role-create', component: RoleCreateComponent },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class RoleRoutingModule {}
