import { NgModule } from '@angular/core';
import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './components/login/login.component';
import { MessageService } from 'primeng/api';
import { EmailVerifiedComponent } from './components/email-verified/email-verified.component';
import { VerificationEmailComponent } from './components/verification-email/verification-email.component';
import { SharedModule } from 'src/app/Shared/shared/shared.module';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { GetQuoteComponent } from './components/get-quote/get-quote.component';
import { InvoicePaymentRequestComponent } from './components/invoice-payment-request/invoice-payment-request.component';
import { ForgetPasswordComponent } from './components/forget-password/forget-password.component';
import { VerifyCodeComponent } from './components/verify-code/verify-code.component';

@NgModule({
    declarations: [
        LoginComponent,
        EmailVerifiedComponent,
        VerificationEmailComponent,
        ResetPasswordComponent,
        GetQuoteComponent,
        InvoicePaymentRequestComponent,
        ForgetPasswordComponent,
        VerifyCodeComponent
    ],
    imports: [AuthRoutingModule, SharedModule],
    providers: [MessageService],
})
export class AuthModule {}