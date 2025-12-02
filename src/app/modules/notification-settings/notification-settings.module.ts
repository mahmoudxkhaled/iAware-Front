import { NgModule } from '@angular/core';

import { NotificationSettingsRoutingModule } from './notification-settings-routing.module';
import { SharedModule } from 'src/app/Shared/shared/shared.module';
import { NotificationTypeListComponent } from './component/notification-type-list/notification-type-list.component';
import { NotificationTypeLanguageComponent } from './component/notification-type-language/notification-type-language.component';

@NgModule({
    declarations: [NotificationTypeListComponent, NotificationTypeLanguageComponent],
    imports: [SharedModule, NotificationSettingsRoutingModule],
})
export class NotificationSettingsModule {}
