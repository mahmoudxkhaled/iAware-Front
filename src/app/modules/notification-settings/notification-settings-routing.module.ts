import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotificationTypeListComponent } from './component/notification-type-list/notification-type-list.component';
import { NotificationTypeLanguageComponent } from './component/notification-type-language/notification-type-language.component';

const routes: Routes = [
    {
        path: 'NotificationList',
        component: NotificationTypeListComponent,
    },

    {
        path: ':id',
        component: NotificationTypeLanguageComponent,
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class NotificationSettingsRoutingModule {}
