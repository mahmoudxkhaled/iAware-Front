import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SubscriptionListComponent } from './components/subscription-list/subscription-list.component';
import { PaymentReminderListComponent } from './components/payment-reminder-list/payment-reminder-list.component';

const routes: Routes = [
    {
        path: 'SubscriptionList',
        component: SubscriptionListComponent,
    },
    {
        path: 'Payment-Reminder',
        component: PaymentReminderListComponent,
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class SubscriptionRoutingModule {}
