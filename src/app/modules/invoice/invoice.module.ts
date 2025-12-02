import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/Shared/shared/shared.module';
import { InvoiceRoutingModule } from './invoice-routing.module';
import { InvoiceListComponent } from './components/invoice-list/invoice-list.component';

@NgModule({
    declarations: [InvoiceListComponent],
    imports: [InvoiceRoutingModule, SharedModule],
})
export class InvoiceModule {}
