import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoleRoutingModule } from './role-routing.module';
import { RoleListingComponent } from './components/role-listing/role-listing.component';
import { SharedModule } from 'src/app/Shared/shared/shared.module';
import { RoleCreateComponent } from './components/role-create/role-create.component';
import { AppTranslateModule } from 'src/app/Shared/shared/app-translate.module';

@NgModule({
    declarations: [RoleListingComponent, RoleCreateComponent],
    imports: [SharedModule, RoleRoutingModule],
})
export class RoleModule {}
