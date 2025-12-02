import { NgModule } from '@angular/core';
import { SubscriptionRoutingModule } from './subscription-routing.module';
import { SubscriptionListComponent } from './components/subscription-list/subscription-list.component';
import { SharedModule } from 'src/app/Shared/shared/shared.module';
import { PaymentReminderListComponent } from './components/payment-reminder-list/payment-reminder-list.component';

@NgModule({
    declarations: [SubscriptionListComponent, PaymentReminderListComponent],
    imports: [SharedModule, SubscriptionRoutingModule],
})
export class SubscriptionModule {}
