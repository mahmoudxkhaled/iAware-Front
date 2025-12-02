import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CampaignListingComponent } from './components/campaign-listing/campaign-listing.component';
import { CampaignCreateComponent } from './components/campaign-create/campaign-create.component';
import { CampaignTypeComponent } from './components/forms/campaign-type/campaign-type.component';
import { LessonsComponent } from './components/forms/lessons/lessons.component';
import { ScheduleComponent } from './components/forms/schedule/schedule.component';
import { CampaignBuildComponent } from './components/forms/campaign-build/campaign-build.component';

const routes: Routes = [
    { path: '', component: CampaignListingComponent },
    {
        path: 'create', component: CampaignCreateComponent,
         children: [
            {
                path: '',
                redirectTo: 'type',
                pathMatch: 'full',
            },
            {
                path: 'type',
                component: CampaignTypeComponent,
            },
            {
                path: 'campaign-build',
                component: CampaignBuildComponent,
            },
            {
                path: 'schedule',
                component: ScheduleComponent,
            }
        ]
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class CampaignManagementRoutingModule { }