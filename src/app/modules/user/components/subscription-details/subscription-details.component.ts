import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Observable, Subscription } from 'rxjs';
import { PaymentTypeEnum } from 'src/app/modules/auth/components/get-quote/get-quote.component';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { ILanguageModel } from 'src/app/modules/language/models/ILanguageModel';
import { ISubscriptionPlanModel } from 'src/app/modules/subscription/models/ISubscriptionPlanModel';
import { SubscriptionService } from 'src/app/modules/subscription/services/subscription.service';
import { TenantSubscriptionDto } from '../user-tenant-profile/user-tenant-profile.component';
@Component({
    selector: 'app-subscription-details',
    templateUrl: './subscription-details.component.html',
    styleUrl: './subscription-details.component.scss',
})
export class SubscriptionDetailsComponent implements OnInit, OnDestroy {
    
    currentPage: string = 'SubscriptionOverview';
    generatedInvoice: any[];
    PaymentTypeEnum = PaymentTypeEnum;
    subscriptionsList: ISubscriptionPlanModel[] = [];
    choosenSubscription: ISubscriptionPlanModel;
    quoteName: string;
    unSubscription: Subscription[] = [];
    remainingDays: number | null = null;
    invoiceImageURL: string = '../../../../../assets/media/upload-photo.jpg';
    previewRenewInvoice: any[] = [];
    previewPurchaseUsersInvoice: any[] = [];
    previewUpgradeInvoice: any[] = [];
    languages: ILanguageModel[] = [];
    usersCountRequest: number = 0;
    tenantSubscription: TenantSubscriptionDto;

    constructor(
        private ref: ChangeDetectorRef,
        private messageService: MessageService,
        private fb: FormBuilder,
        private subscriptionServ: SubscriptionService,
        private authService: AuthService,
    ) { }

    ngOnInit() {
        this.initAddInvoicePaymentRequestForm();
        this.initTenantSubscriptionDto();
        this.getAllSubscriptions();
        this.loadSubDetails();
    }

    //#region Overview

    initTenantSubscriptionDto() {
        this.tenantSubscription = {
            id: '',
            subscriptionPlanId: '',
            subscriptionPlanName: '',
            tenantName: '',
            isActive: true,
            startDate: new Date(),
            endDate: new Date(),
            durationByDays: 0,
            usersCount: 0,
            tenantId: '',
        };
    }

    loadSubDetails() {
        const sub = this.subscriptionServ.getTenantSubscription().subscribe((res) => {
            this.tenantSubscription = res.data;
            this.calculateRemainingDays();
        });
        this.unSubscription.push(sub);
    }

    calculateRemainingDays(): void {
        if (this.tenantSubscription && this.tenantSubscription.endDate) {
            const endDate = new Date(this.tenantSubscription.endDate);
            const today = new Date();
            const timeDiff = endDate.getTime() - today.getTime();
            this.remainingDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); // Convert milliseconds to days
        } else {
            this.remainingDays = null;
        }
    }

    //#endregion

    //#region Renew

    selectedPaymentMethod: PaymentTypeEnum | null = null;
    addInvoicePaymentRequestForm: FormGroup;
    submitted: boolean = false;
    selectedPaymentReuqestImage: File | null = null;
    currentInvoice: string;
    isLoading$: Observable<boolean>;

    previewRenewSubscription() {
        const sub = this.subscriptionServ.previewRenewTenantSubscription().subscribe((res) => {
            this.previewRenewInvoice[0] = res.data;
        });
        this.unSubscription.push(sub);
    }

    selectPaymentMethod(method: PaymentTypeEnum) {
        this.selectedPaymentMethod = method;
    }

    SubmitRenewSubscriptionInvoicePaymentRequest() {
        this.submitted = true;
        if (this.addInvoicePaymentRequestForm.valid) {
            const sub = this.subscriptionServ.confirmRenewTenantSubscription().subscribe({
                next: (res) => {
                    this.saveAddInvoicePaymentRequest(res.data);
                },
            });
            this.unSubscription.push(sub);
        } else {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Fill all fields please',
                life: 3000,
            });
        }
    }

    saveAddInvoicePaymentRequest(invoiceId: string) {
        this.submitted = true;
        if (this.addInvoicePaymentRequestForm.valid) {
            const formData = new FormData();

            formData.append('RequestAmount', this.addInvoicePaymentRequestForm.value.RequestAmount);
            formData.append('RequestReferenceKey', this.addInvoicePaymentRequestForm.value.RequestReferenceKey);
            formData.append('RequestPaymentNote', this.addInvoicePaymentRequestForm.value.RequestPaymentNote);
            formData.append('SubscriptionTenantInvoiceId', invoiceId);

            const PaymentReuqestImageFile = this.selectedPaymentReuqestImage;
            if (PaymentReuqestImageFile) {
                formData.append('RequestReferenceImageUrl', PaymentReuqestImageFile, PaymentReuqestImageFile.name);
            }
            const formDataObject: { [key: string]: any } = {};
            formData.forEach((value, key) => {
                formDataObject[key] = value;
            });

            const sub = this.authService.createTenantSubscriptionInvoicePaymentRequest(formData).subscribe({
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
            });
            this.unSubscription.push(sub);
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
            RequestReferenceImageUrl: ['', Validators.required],
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
                this.invoiceImageURL = e.target.result;
                this.addInvoicePaymentRequestForm.patchValue({
                    RequestReferenceImageUrl: this.selectedPaymentReuqestImage!.name // Or use a custom identifier
                });
                this.ref.detectChanges();
            };
            reader.readAsDataURL(this.selectedPaymentReuqestImage);
        }
    }

    navigateTo(page: string, name?: string) {
        this.currentPage = page;
        this.quoteName = name ?? '';

        if (
            page === 'RenewSubscriptionInvoice' ||
            page === 'UpgradeSubscriptionInvoice' ||
            page === 'PurchaseUsersInvoice'
        ) {
            this.initAddInvoicePaymentRequestForm(); 
            this.selectedPaymentMethod = null; 
            this.invoiceImageURL = '../../../../../assets/media/upload-photo.jpg';
            this.selectedPaymentReuqestImage = null;
            this.submitted = false;

            if (page === 'RenewSubscriptionInvoice') {
                this.previewRenewSubscription();
            } else if (page === 'PurchaseUsersInvoice') {
                this.showPurchaseUsersInvoiceDetails = false;
                this.showPurchasingUsersError = false;
                this.usersCountRequest = 0;
            } else if (page === 'UpgradeSubscriptionInvoice') {
            }
        }
    }

    //#endregion

    //#region Upgrade

    getAllSubscriptions() {
        const sub = this.authService.getAllsusbcriptions().subscribe((res) => {
            this.subscriptionsList = res.data;
            this.subscriptionsList.sort((a, b) => this.getPlanOrder(a.title) - this.getPlanOrder(b.title));
        });
        this.unSubscription.push(sub);
    }

    getPlanOrder(planTitle: string): number {
        const order: { [key: string]: number } = {
            Diamond: 1,
            Platinum: 2,
            Gold: 3,
            Silver: 4,
            'Free Plan': 5,
        };

        return order[planTitle] !== undefined ? order[planTitle] : 1000;
    }

    previewUpgradeSubscription(id: string) {
        const sub = this.subscriptionServ.previewUpgradeTenantSubscription(id).subscribe((res) => {
            this.previewUpgradeInvoice[0] = res.data;
        });
        this.unSubscription.push(sub);
    }

    openGetAQuoteDialog(sub: ISubscriptionPlanModel) {
        this.choosenSubscription = { ...sub };
        this.quoteName = `Upgrade To ${sub.title} Plan`;
        this.currentPage = 'UpgradeSubscriptionInvoice';
        this.previewUpgradeSubscription(sub.id);
    }

    SubmitUpgradeSubscriptionInvoicePaymentRequest() {
        this.submitted = true;
        if (this.addInvoicePaymentRequestForm.valid) {
            const sub = this.subscriptionServ.confirmUpgradeTenantSubscription(this.choosenSubscription.id).subscribe({
                next: (res) => {
                    this.saveAddInvoicePaymentRequest(res.data);
                },
            })
            this.unSubscription.push(sub);

        } else {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Fill all fields please',
                life: 3000,
            });
        }
    }

    //#endregion

    //#region Purchase Users

    showPurchaseUsersInvoiceDetails = false;
    showPurchasingUsersError = false;

    previewPurchaseUsers(numOfUsers: number) {
        const sub = this.subscriptionServ.previewPurchaseUsersTenantSubscription(numOfUsers).subscribe((res) => {
            this.previewPurchaseUsersInvoice[0] = res.data;
        });
        this.unSubscription.push(sub);
    }

    calculatePurchasingUsersInvoice() {
        if (this.usersCountRequest && this.usersCountRequest > 0) {
            this.previewPurchaseUsers(this.usersCountRequest);
            this.showPurchaseUsersInvoiceDetails = true;
            this.showPurchasingUsersError = false;
        } else {
            this.showPurchasingUsersError = true;
        }
    }

    SubmitPurchaseUsersSubscriptionInvoicePaymentRequest() {
        this.submitted = true;
        if (this.usersCountRequest && this.usersCountRequest > 0 && this.addInvoicePaymentRequestForm.valid) {
            this.previewPurchaseUsers(this.usersCountRequest);
            this.showPurchaseUsersInvoiceDetails = true;
            this.showPurchasingUsersError = false;
            const sub = this.subscriptionServ.confirmPurchaseUsersTenantSubscription(this.usersCountRequest).subscribe({
                next: (res) => {
                    this.saveAddInvoicePaymentRequest(res.data);
                },
            });
            this.unSubscription.push(sub);
        } else {
            this.showPurchasingUsersError = true;
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Fill all fields please',
                life: 3000,
            });
        }
    }

    //#endregion

    ngOnDestroy(): void {
        this.showPurchaseUsersInvoiceDetails = false;
        this.unSubscription.forEach((sub) => sub.unsubscribe());
    }
}