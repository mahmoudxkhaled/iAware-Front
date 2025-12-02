import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { CampaignManagementService } from 'src/app/modules/campaign-management/services/campaign-management.service';
import { SubscriptionService } from 'src/app/modules/subscription/services/subscription.service';
import { PaymentTypeEnum } from 'src/app/modules/auth/components/get-quote/get-quote.component';
import { Observable, Subscription } from 'rxjs';
import { InvoiceService } from 'src/app/modules/invoice/services/invoice.service';
import {
    IRemainingAmountOfSubscriptionTenantInvoiceDto,
    ITenantSubscriptionInvoicePayment,
} from 'src/app/modules/invoice/models/invoice-models';

@Component({
    selector: 'app-invoice-payment-request',
    templateUrl: './invoice-payment-request.component.html',
    styleUrl: './invoice-payment-request.component.scss',
})
export class InvoicePaymentRequestComponent implements OnInit, OnDestroy {
    selectedPaymentMethod: PaymentTypeEnum | null = null;
    imageUrl: string = '../../../../../assets/media/upload-photo.jpg';
    PaymentTypeEnum = PaymentTypeEnum;
    addInvoicePaymentRequestForm: FormGroup;
    selectedPaymentReuqestImage: File | null = null;
    subs: Subscription = new Subscription();
    currentInvoice: string;
    isLoading$: Observable<boolean>;
    submitted: boolean = false;
    generatedInvoice: IRemainingAmountOfSubscriptionTenantInvoiceDto[] = [];
    currentPage: string = ''; // Default page

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private messageService: MessageService,
        private router: Router,
        private apiService: CampaignManagementService,
        private subServ: SubscriptionService,
        private invoiceServ: InvoiceService,
        private ref: ChangeDetectorRef,
        private route: ActivatedRoute
    ) {
        this.generatedInvoice = [{} as IRemainingAmountOfSubscriptionTenantInvoiceDto];

        this.route.params.subscribe((params) => {
            const id = params['id'];
            this.generatedInvoice[0].id = id;
            
        });
        this.isLoading$ = this.authService.isLoadingSubject;
    }

    ngOnInit(): void {
        this.initAddInvoicePaymentRequestForm();
        this.SubscriptionTenantInvoice();
    }

    SubscriptionTenantInvoice() {
        this.subs.add(
            this.authService
                .getRemainingAmountOfSubscriptionTenantInvoiceById(this.generatedInvoice[0].id)
                .subscribe((data) => {
                    
                    this.generatedInvoice[0] = data.data;
                    
                })
        );
    }

    selectPaymentMethod(method: PaymentTypeEnum) {
        this.selectedPaymentMethod = method;
    }

    saveAddInvoicePaymentRequest() {
        this.submitted = true;
        if (this.addInvoicePaymentRequestForm.valid) {
            const formData = new FormData();

            formData.append('RequestAmount', this.addInvoicePaymentRequestForm.value.RequestAmount);
            formData.append('RequestReferenceKey', this.addInvoicePaymentRequestForm.value.RequestReferenceKey);
            formData.append('RequestPaymentNote', this.addInvoicePaymentRequestForm.value.RequestPaymentNote);
            formData.append('SubscriptionTenantInvoiceId', this.generatedInvoice[0].id);

            const PaymentReuqestImageFile = this.selectedPaymentReuqestImage;
            if (PaymentReuqestImageFile) {
                formData.append('RequestReferenceImageUrl', PaymentReuqestImageFile, PaymentReuqestImageFile.name);
            }

            // this.addInvoicePaymentRequestDialog = true;

            this.subs.add(
                this.authService.createTenantSubscriptionInvoicePaymentRequest(formData).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Payment Request Sent',
                            life: 3000,
                        });
                        this.ref.detectChanges();
                        this.initAddInvoicePaymentRequestForm();
                        this.navigateTo('finalStep');
                    },
                })
            );
        } else {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Fill all fields please',
                life: 3000,
            });
            
        }
    }

    initAddInvoicePaymentRequestForm() {
        this.addInvoicePaymentRequestForm = this.fb.group({
            RequestAmount: [0, Validators.required],
            RequestReferenceKey: ['', Validators.required],
            RequestPaymentNote: ['', Validators.required],
            RequestReferenceImageUrl: [''],
            SubscriptionTenantInvoiceId: [0, Validators.required],
        });
    }

    onUploadPaymentReuqestImageClick() {
        const fileInput = document.getElementById('PaymentReuqestImage') as HTMLInputElement;
        fileInput.click();
    }
    onPaymentReuqestImageSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length) {
            this.selectedPaymentReuqestImage = input.files[0];

            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.imageUrl = e.target.result;
                this.ref.detectChanges();
            };
            reader.readAsDataURL(this.selectedPaymentReuqestImage);
        }
    }

    declineAddPaymentReuqestDialog() {
        this.initAddInvoicePaymentRequestForm();
        // this.addInvoicePaymentRequestDialog = false;
        this.selectedPaymentMethod = null; // Reset the selection
    }
    // Navigate to a different page
    navigateTo(page: string): void {
        this.currentPage = page;
    }

    ngOnDestroy(): void {
        throw new Error('Method not implemented.');
    }
}
