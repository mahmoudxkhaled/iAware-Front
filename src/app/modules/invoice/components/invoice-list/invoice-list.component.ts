import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { Subscription, finalize } from 'rxjs';
import { ILanguageModel } from 'src/app/modules/language/models/ILanguageModel';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Editor, Validators } from 'ngx-editor';
import { constants } from 'src/app/core/constatnts/constatnts';
import { PermessionsService } from 'src/app/core/Services/permessions.service';
import { IAspNetPageItemModel } from 'src/app/modules/page-management/models/IAspNetPageItemModel';
import { ITenantSubscriptionInvoice, ITenantSubscriptionInvoicePaymentRequest } from '../../models/invoice-models';
import { InvoiceService } from '../../services/invoice.service';
import { ISendEmailRequest } from '../../../auth/models/ISendEmailRequest';
import { IUserModel } from '../../../user/models/IUserModel';
import { AuthService } from '../../../auth/services/auth.service';
import { TableLoadingService } from 'src/app/core/Services/table-loading.service';
import { EcncryptionService } from 'src/app/core/Services/ecncryption.service';

interface expandedRows {
    [key: string]: boolean;
}
export enum PaymentType {
    Cash = 1,
    Visa = 2,
    Transfer = 3,
}
@Component({
    selector: 'app-invoice-list',
    templateUrl: './invoice-list.component.html',
    styleUrl: './invoice-list.component.scss',
})
export class InvoiceListComponent implements OnInit, OnDestroy {
    tableLoadingSpinner: boolean = true;
    expandedRowsInProgress: any = {};
    expandedRowsCompleted: any = {};
    isExpandedInProgress: boolean = false;
    isExpandedCompleted: boolean = false;
    statuses: any[] = [];
    openPaymentNotelDialog: boolean = false;
    activeTabIndex: number = 0;
    addInvoiceDialog: boolean = false;
    addInvoicePaymentRequestDialog: boolean = false;
    editInvoiceDialog: boolean = false;
    deletionInvoiceDialog: boolean = false;
    editInvoicePaymentRequestDialog: boolean = false;
    submitted: boolean = false;
    pagePermessions: IAspNetPageItemModel[] = [];
    actions = constants.pageActions;
    imageUrl: string = '../../../../../assets/media/upload-photo.jpg';
    selectedPaymentReuqestImage: File | null = null;
    editor: Editor;
    activeLanguages: ILanguageModel[] = [];
    invoice: ITenantSubscriptionInvoice;
    switchInvoiceActivationDialog: boolean = false;
    subs: Subscription[] = [];
    ownerMenuItems: MenuItem[] = [];
    normalMenuItems: MenuItem[] = [];
    invoices: ITenantSubscriptionInvoice[] = [];
    inProgressInvoices: ITenantSubscriptionInvoice[] = [];
    completedInvoices: ITenantSubscriptionInvoice[] = [];
    addInvoicePaymentRequestForm: FormGroup;
    editInvoicePaymentRequestForm: FormGroup;
    paymentTypes = [
        { label: 'Cash', value: 1 },
        { label: 'Visa', value: 2 },
        { label: 'Transfer', value: 3 },
    ];

    expandedRows: expandedRows = {};
    isExpanded: boolean = false;
    showPaymentRequest: boolean = false;

    constructor(
        private messageService: MessageService,
        private ref: ChangeDetectorRef,
        private permessionService: PermessionsService,
        private invoiceServ: InvoiceService,
        private formBuilder: FormBuilder,
        private authService: AuthService,
        private tableLoadingService: TableLoadingService,
        private EcncrypServ: EcncryptionService
    ) {
        this.pagePermessions = this.permessionService.getPagePermessions(constants.pages.invoice);
    }

    ngOnInit(): void {
        this.tableLoadingService.loading$.subscribe((isLoading) => {
            this.tableLoadingSpinner = isLoading;
        });

        this.statuses = [
            { label: 'Unqualified', value: 'unqualified' },
            { label: 'Qualified', value: 'qualified' },
            { label: 'New', value: 'new' },
            { label: 'Negotiation', value: 'negotiation' },
            { label: 'Renewal', value: 'renewal' },
            { label: 'Proposal', value: 'proposal' },
        ];

        this.initAddInvoicePaymentRequestForm();
        const editBtn = {
            label: 'Edit',
            icon: 'pi pi-fw pi-pencil',
            command: () => this.editInvoice(this.invoice),
        };

        const deleteBtn = {
            label: 'Delete',
            icon: 'pi pi-fw pi-trash',
            command: () => this.deleteInvoice(this.invoice),
        };

        const deafultBtn = {
            label: 'Default in System',
            icon: 'pi pi-fw pi-minus-circle',
            command: () => '',
        };

        this.ownerMenuItems = [];

        if (this.hasPermission(this.actions.edit)) {
            this.ownerMenuItems.push(editBtn);
        }
        if (this.hasPermission(this.actions.delete)) {
            this.ownerMenuItems.push(deleteBtn);
        }

        this.normalMenuItems = [];
        this.normalMenuItems.push(deafultBtn);
        this.loadInvoiceList();
    }

    assignCurrentSelect(invoice: ITenantSubscriptionInvoice) {
        this.invoice = invoice;
    }

    private formatDate(isoDate: string): string {
        const date = new Date(isoDate);
        return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date
            .getDate()
            .toString()
            .padStart(2, '0')}/${date.getFullYear()}`;
    }

    loadInvoiceList() {
        this.tableLoadingService.show();
        const sub = this.invoiceServ.getAllSubscriptionTenantInvoices().subscribe((data) => {
            // Load all invoices into the invoices array and add formattedIssueDate
            this.invoices = data.data.map((invoice: any) => ({
                ...invoice,
                formattedIssueDate: this.formatDate(invoice.issueDate), // Add formatted date
            }));

            // Filter invoices based on isPaid status
            this.inProgressInvoices = this.invoices.filter((invoice) => !invoice.isPaid);
            this.completedInvoices = this.invoices.filter((invoice) => invoice.isPaid);

            // Show payment request if any invoice cannot be edited
            this.showPaymentRequest = this.invoices.some((invoice) => !invoice.canEdit);
            this.tableLoadingService.hide();
        });
        this.subs.push(sub);
    }

    loadInProgressInvoiceList() {
        const sub = this.invoiceServ.getInProgressTenantSubscriptionInvoices().subscribe((data) => {
            // Add formattedIssueDate to in-progress invoices
            this.inProgressInvoices = data.data.map((invoice: any) => ({
                ...invoice,
                formattedIssueDate: this.formatDate(invoice.issueDate), // Add formatted date
            }));
            this.showPaymentRequest = this.inProgressInvoices.some((invoice) => !invoice.canEdit);
        });
        this.subs.push(sub);
    }

    addNewInvoice() {
        this.addInvoiceDialog = true;
    }

    saveNewInvoice() {
        this.submitted = true;
        const addLibraryLanguageQuoteDto = {
            // LanguageId: this.selectedLanguageId,
            // QuoteText: this.quoteText,
        };

        const sub = this.invoiceServ
            .createSubscriptionTenantInvoice(addLibraryLanguageQuoteDto)
            .pipe(
                finalize(() => {
                    this.initInvoice();
                    this.ref.detectChanges();
                    this.loadInvoiceList();
                    this.addInvoiceDialog = false;
                    this.submitted = false;
                })
            )
            .subscribe(() => {
                this.addInvoiceDialog = false;
                this.loadInvoiceList();
                this.messageService.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Quote added successfully',
                    life: 3000,
                });
            });
        this.subs.push(sub);
    }

    hideNewInvoiceDialog() {
        this.addInvoiceDialog = false;
        this.submitted = false;
        this.initInvoice();
        this.ref.detectChanges();
    }

    saveEditInvoice() {
        this.submitted = true;
        const sub = this.invoiceServ
            .editSubscriptionTenantInvoice(this.invoice)
            .pipe(
                finalize(() => {
                    this.initInvoice();
                    this.editInvoiceDialog = false;
                    this.submitted = false;
                    this.ref.detectChanges();
                })
            )
            .subscribe(() => {
                this.editInvoiceDialog = false;
                this.loadInvoiceList();
                this.messageService.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Invoice updated successfully',
                    life: 3000,
                });
            });
        this.subs.push(sub);
    }

    hideEditInvoiceDialog() {
        this.editInvoiceDialog = false;
        this.submitted = false;
        this.initInvoice();
        this.ref.detectChanges();
    }

    switchInvoiceActivation(invoice: ITenantSubscriptionInvoice) {
        this.switchInvoiceActivationDialog = true;
        this.invoice = { ...invoice };
    }

    declineInvoiceActivation() {
        this.switchInvoiceActivationDialog = false;
        this.loadInvoiceList();
        this.ref.detectChanges();
        this.initInvoice();
    }

    confirmtInvoiceActivation() {
        this.toggleInvoiceActivation(this.invoice);
    }

    toggleInvoiceActivation(invoice: ITenantSubscriptionInvoice) {
        if (invoice.isActive) {
            const sub = this.invoiceServ
                .deactivateTenantSubscriptionInvoice(invoice.id)
                .pipe(
                    finalize(() => {
                        this.initInvoice();
                        this.ref.detectChanges();
                        this.switchInvoiceActivationDialog = false;
                    })
                )
                .subscribe(() => {
                    this.switchInvoiceActivationDialog = false;
                    this.loadInvoiceList();
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Invoice Deactivated',
                        life: 3000,
                    });
                });
            this.subs.push(sub);
        } else {
            const sub = this.invoiceServ
                .activateTenantSubscriptionInvoice(invoice.id)
                .pipe(
                    finalize(() => {
                        this.initInvoice();
                        this.ref.detectChanges();
                        this.switchInvoiceActivationDialog = false;
                    })
                )
                .subscribe(() => {
                    this.switchInvoiceActivationDialog = false;
                    this.loadInvoiceList();
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Invoice Activated',
                        life: 3000,
                    });
                });
            this.subs.push(sub);
        }
    }

    deleteInvoice(Invoice: ITenantSubscriptionInvoice) {
        this.deletionInvoiceDialog = true;
        this.invoice = { ...Invoice };
    }

    confirmInvoiceDeletion() {
        // const sub = this.wallServ
        //         .deleteLibraryLanguageQuoteById(this.invoice.id)
        //         .pipe(
        //             finalize(() => {
        //                 this.initInvoice();
        //                 this.ref.detectChanges();
        //                 this.deletionQuoteDialog = false;
        //             })
        //         )
        //         .subscribe({
        //             next: () => {
        //                 this.deletionQuoteDialog = false;
        //                 this.loadLibraryQuotes();
        //                 this.ref.detectChanges();
        //                 this.messageService.add({
        //                     severity: 'success',
        //                     summary: 'Info',
        //                     detail: 'Quote Deleted Successfully',
        //                     life: 3000,
        //                 });
        //             },
        //         })
        // this.subs.push(sub);
    }

    declineInvoiceDeletion() {
        this.deletionInvoiceDialog = false;
        this.ref.detectChanges();
        this.loadInvoiceList();
        this.initInvoice();
    }

    editInvoice(invoice: ITenantSubscriptionInvoice) {
        this.editInvoiceDialog = true;
    }

    initInvoice() {
        this.invoice = {
            id: '',
            userCount: 0,
            endDate: new Date(),
            totalAmount: 0,
            remainingAmount: 0,
            isAccountingConfirmation: false,
            startDate: new Date(),
            subscriptionPlanPriceId: '',
            TransferReferenceKey: '',
            TransferPaymentNote: '',
            tenantSubscriptionRequestId: '',
            subscriptionPlanId: '',
            tenantId: '',
            isPaid: false,
            isActive: true,
            canEdit: true,
        };
    }

    //#region Add Payment Request

    openAddPaymentRequestDialog(invoice: ITenantSubscriptionInvoice) {
        this.invoice = { ...invoice };
        this.initAddInvoicePaymentRequestForm();
        this.addInvoicePaymentRequestDialog = true;
        this.imageUrl = '../../../../../assets/media/upload-photo.jpg';
        this.addInvoicePaymentRequestForm.patchValue({
            SubscriptionTenantInvoiceId: this.invoice.id,
        });
    }

    saveAddInvoicePaymentRequest() {
        this.submitted = true;
        if (this.addInvoicePaymentRequestForm.valid) {
            const formData = new FormData();

            formData.append('RequestAmount', this.addInvoicePaymentRequestForm.value.RequestAmount);
            formData.append('RequestReferenceKey', this.addInvoicePaymentRequestForm.value.RequestReferenceKey);
            formData.append('RequestPaymentNote', this.addInvoicePaymentRequestForm.value.RequestPaymentNote);
            formData.append(
                'SubscriptionTenantInvoiceId',
                this.addInvoicePaymentRequestForm.value.SubscriptionTenantInvoiceId
            );

            const PaymentReuqestImageFile = this.selectedPaymentReuqestImage;
            if (PaymentReuqestImageFile) {
                formData.append('RequestReferenceImageUrl', PaymentReuqestImageFile, PaymentReuqestImageFile.name);
            }

            const sub = this.invoiceServ.createTenantSubscriptionInvoicePaymentRequest(formData).subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Payment Request Sent',
                        life: 3000,
                    });

                    this.loadInvoiceList();
                    this.ref.detectChanges();
                    this.initAddInvoicePaymentRequestForm();
                    this.addInvoicePaymentRequestDialog = false;
                },
            });
            this.subs.push(sub);
        } else {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Fill all fields please',
                life: 3000,
            });
        }
    }

    declineAddPaymentReuqestDialog() {
        this.addInvoicePaymentRequestDialog = false;
        this.initAddInvoicePaymentRequestForm();
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

    initAddInvoicePaymentRequestForm() {
        this.addInvoicePaymentRequestForm = this.formBuilder.group({
            RequestAmount: [0, Validators.required],
            RequestReferenceKey: ['', Validators.required],
            RequestPaymentNote: ['', Validators.required],
            RequestReferenceImageUrl: [''],
            SubscriptionTenantInvoiceId: [0, Validators.required],
        });
    }

    //#endregion

    //#region  Edit Payment Request Dialog

    invoicePaymentRequest: ITenantSubscriptionInvoicePaymentRequest;

    isPaymentRequest() {}

    initEditInvoicePaymentRequestForm() {
        this.editInvoicePaymentRequestForm = this.formBuilder.group({
            id: [null],
            requestTime: [null],
            requestPaymentNote: ['', Validators.required],
            requestAmount: [null, [Validators.required]],
            requestReferenceKey: ['', Validators.required],
            requestReferenceImageUrl: [null],
            confirmationTime: [null],
            isConfirmed: [false, Validators.required],
            subscriptionTenantInvoiceId: [null, Validators.required],
            paymentReferenceKey: ['', Validators.required],
            paymentType: ['', Validators.required],
            paidAmount: [null, [Validators.required]],
        });
    }

    openEditPaymentRequestDialog(invoicePaymentRequest: ITenantSubscriptionInvoicePaymentRequest) {
        this.initEditInvoicePaymentRequestForm();

        this.imageUrl = '../../../../../assets/media/upload-photo.jpg';
        this.invoicePaymentRequest = { ...invoicePaymentRequest };

        this.editInvoicePaymentRequestDialog = true;
        this.editInvoicePaymentRequestForm.patchValue({
            id: this.invoicePaymentRequest.id,
            requestTime: this.invoicePaymentRequest.requestTime,
            requestPaymentNote: this.invoicePaymentRequest.requestPaymentNote,
            requestAmount: this.invoicePaymentRequest.requestAmount,
            requestReferenceKey: this.invoicePaymentRequest.requestReferenceKey,
            requestReferenceImageUrl: this.invoicePaymentRequest.requestReferenceImageUrl,
            confirmationTime: this.invoicePaymentRequest.confirmationTime,
            isConfirmed: this.invoicePaymentRequest.isConfirmed,
            subscriptionTenantInvoiceId: this.invoicePaymentRequest.subscriptionTenantInvoiceId,
        });
        this.imageUrl = this.invoicePaymentRequest.requestReferenceImageUrl;
    }

    saveEditInvoicePaymentRequest() {
        this.submitted = true;
        if (this.editInvoicePaymentRequestForm.valid) {
            const formData = new FormData();

            formData.append('Id', this.editInvoicePaymentRequestForm.value.id);
            formData.append('RequestAmount', this.editInvoicePaymentRequestForm.value.requestAmount);
            formData.append('RequestReferenceKey', this.editInvoicePaymentRequestForm.value.requestReferenceKey);
            formData.append('RequestPaymentNote', this.editInvoicePaymentRequestForm.value.requestPaymentNote);
            formData.append('IsConfirmed', this.editInvoicePaymentRequestForm.value.isConfirmed);
            formData.append(
                'SubscriptionTenantInvoiceId',
                this.editInvoicePaymentRequestForm.value.subscriptionTenantInvoiceId
            );
            formData.append('PaymentReferenceKey', this.editInvoicePaymentRequestForm.value.paymentReferenceKey);

            const paymentType = this.editInvoicePaymentRequestForm.value.paymentType;
            formData.append('PaymentType', paymentType.toString());
            formData.append('PaidAmount', this.editInvoicePaymentRequestForm.value.paidAmount);

            const sub = this.invoiceServ.editTenantSubscriptionInvoicePaymentRequest(formData).subscribe({
                next: (res) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Payment Request Sent',
                        life: 3000,
                    });

                    this.loadInvoiceList();
                    this.ref.detectChanges();
                    this.initEditInvoicePaymentRequestForm();
                    this.editInvoicePaymentRequestDialog = false;
                },
                error: (err) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to submit payment request.',
                        life: 3000,
                    });
                },
            });
            this.subs.push(sub);
        } else {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Please fill in all required fields.',
                life: 3000,
            });
        }
    }

    declineEditPaymentReuqestDialog() {
        this.initEditInvoicePaymentRequestForm();
        this.editInvoicePaymentRequestDialog = false;
    }

    sendRemainingBillEmailToUsers(data: any) {
        const sendEmailRequest: ISendEmailRequest = {
            body: '',
            subject: '',
            to: '',
            callbackURL: '',
        };

        sendEmailRequest.to = data.email;
        sendEmailRequest.subject = 'Remaining Bill';

        const tableRows = `
        <tr>
            <td>${data.subscriptionPlanName}</td>
            <td class="text-center">${data.userPrice.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
            })}</td>
            <td class="text-center">${data.userCount}</td>
            <td class="text-center">${data.totalAmount.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
            })}</td>
            <td class="text-center">${data.paidAmount.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
            })}</td>
            <td class="text-center">${data.remainingAmount.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
            })}</td>
        </tr>
    `;

        sendEmailRequest.body = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Complete Your Payment</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f9f9f9;
                    margin: 0;
                    padding: 0;
                }
                .email-container {
                    width: 80%;
                    margin: 20px auto;
                    background-color: #ffffff;
                    border-radius: 8px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                    border: 1px solid #ddd;
                }
                .header {
                    background-color: rgb(111, 66, 193);
                    color: #ffffff;
                    padding: 20px;
                    text-align: center;
                }
                .header h1 {
                    margin: 0;
                    font-size: 24px;
                }
              img {
                    height: 40px;
                }
                .content {
                    padding: 20px;
                    line-height: 1.6;
                    color: #333333;
                    text-align: center;
                }
                .content p {
                    margin: 15px 0;
                }
                .table-container {
                    margin: 20px 0;
                    width: 100%;
                    overflow-x: auto;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 0 auto;
                }
                table th, table td {
                    border: 1px solid #ddd;
                    padding: 8px;
                    text-align: center;
                }
                table th {
                    background-color: rgb(111, 66, 193);
                    color: white;
                }
                .button-container {
                    margin: 20px 0;
                }
                .button {
                    display: inline-block;
                    background-color: rgb(111, 66, 193);
                    color: #ffffff;
                    padding: 15px 30px;
                    text-decoration: none;
                    font-size: 16px;
                    border-radius: 5px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    transition: background-color 0.3s ease;
                }
                .button:hover {
                    background-color: rgb(111, 66, 193);
                }
                .footer {
                    background-color: #f1f1f1;
                    color: #555555;
                    padding: 15px;
                    text-align: center;
                    border-top: 1px solid #ddd;
                }
                .footer p {
                    margin: 5px 0;
                }
            </style>
        </head>
        <body>

        <div class="email-container">
            <div class="header">

                <h1>Complete Your Payment</h1>
            </div>

            <div class="content">
            
                <p>Dear ${data.firstName} ${data.lastName},</p>

                <p>Thank you for your recent payment towards your subscription. We noticed that the payment was partial and there is still a remaining balance to be settled.</p>
                
                <p>Below are the details of your subscription and amount due:</p>

                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Subscription Plan</th>
                                <th class="text-center">Price/User</th>
                                <th class="text-center">User Count</th>
                                <th class="text-center">Total</th>
                                <th class="text-center">Payments</th>
                                <th class="text-center">Amount Due</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tableRows}
                        </tbody>
                    </table>
                </div>

                <p>Please click the button below to complete the remaining payment and continue enjoying uninterrupted access to your subscription benefits.</p>

                <div class="button-container">
                    <a href="${window.location.origin}/#/auth/invoicePaymentRequest/${data.tenantSubscriptionInvoiceId}" class="button">Complete Your Payment</a>
                </div>

                <p>If you have any questions or need assistance, feel free to reach out to our support team.</p>

                <p>Thank you for choosing iAware!</p>
            </div>

            <div class="footer">
                <p>Best regards,</p>
                <p><strong>iAware Support Team</strong></p>
                <p><a href="mailto:iexpertsmarketing@iexpertsmail.com">iexpertsmarketing@iexpertsmail.com</a></p>
                <img src="${window.location.origin}/assets/media/iaware-high-resolution-logo-transparent.png" alt="Company Logo">

            </div>
        </div>

        </body>
        </html>
    `;
        //this.authService.sendVerificationEmail(sendEmailRequest).subscribe();
    }

    sendVerificationAndResetPasswordForGetDemoEmail(user: IUserModel) {
        const sendEmailRequest: ISendEmailRequest = {
            body: '',
            subject: 'Welcome to iAware - Get Started with Your Demo',
            to: user.email,
            callbackURL: '',
        };

        sendEmailRequest.body = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Get Started</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 0;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #ffffff;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                        border-radius: 8px;
                        overflow: hidden;
                    }
                    p{
                        line-height: 1.5;
                    }
                    .header {
                        background-color: #6f42c1;
                        color: #ffffff;
                        padding: 20px;
                        text-align: center;
                        font-size: 24px;
                    }
                    .content {
                        padding: 20px;
                        text-align: center;
                        font-size: 16px;
                        color: #333333;
                    }
                    .button {
                        display: inline-block;
                        margin-top: 20px;
                        padding: 15px 30px;
                        background-color: #6f42c1;
                        color: #ffffff !important;
                        text-decoration: none;
                        border-radius: 5px;
                        font-size: 18px;
                    }
                    .footer {
                        background-color: #f4f4f4;
                        color: #888888;
                        padding: 10px;
                        text-align: center;
                        font-size: 14px;
                    }
                     img {
                    height: 40px;
                     margin-top: 11px;
                }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        Get Started with Your iAware Demo
                    </div>
                    <div class="content">
                        <p>Dear ${user.firstName} ${user.lastName},</p>
                        <p>Thank you for your interest in the iAware demo! To get started, please click the button below to create your password and begin exploring our features.</p>
                        <a href="${window.location.origin}/#/auth/resetPassword/${this.EcncrypServ.encryptText(
            user.email
        )}" class="button">Set Up Demo Access</a>
                    </div>
                    <div class="footer">
                        &copy; ${new Date().getFullYear()} iAware. All rights reserved.
                        <br>
                        <img src="${
                            window.location.origin
                        }/assets/media/iaware-high-resolution-logo-transparent.png" alt="Company Logo">
                    </div>
                </div>
            </body>
            </html>
        `;
        // this.authService.sendVerificationEmail(sendEmailRequest).subscribe();
    }

    sendVerificationAndResetPasswordForRegisterEmail(user: IUserModel) {
        const sendEmailRequest: ISendEmailRequest = {
            body: '',
            subject: 'iAware Password Creation',
            to: user.email,
            callbackURL: '',
        };

        sendEmailRequest.body = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Password Reset</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 0;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #ffffff;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                        border-radius: 8px;
                        overflow: hidden;
                    }
                    p{
                        line-height: 1.5;
                    }
                    .header {
                        background-color: #6f42c1;
                        color: #ffffff;
                        padding: 20px;
                        text-align: center;
                        font-size: 24px;
                    }
                    .content {
                        padding: 20px;
                        text-align: center;
                        font-size: 16px;
                        color: #333333;
                    }
                    .button {
                        display: inline-block;
                        margin-top: 20px;
                        padding: 15px 30px;
                        background-color: #6f42c1;
                        color: #ffffff !important;
                        text-decoration: none;
                        border-radius: 5px;
                        font-size: 18px;
                    }
                    .footer {
                        background-color: #f4f4f4;
                        color: #888888;
                        padding: 10px;
                        text-align: center;
                        font-size: 14px;
                    }
                     img {
                    height: 40px;
                     margin-top: 11px;
                }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        Welcome to iAware
                    </div>
                    <div class="content">
                        <p>Dear ${user.firstName} ${user.lastName},</p>
                        <p>We're excited to have you on board! Please click the button below to create your account password and start using iAware.</p>
                        <a href="${window.location.origin}/#/auth/resetPassword/${this.EcncrypServ.encryptText(
            user.email
        )}" class="button">Reset Password</a>
                    </div>
                    <div class="footer">
                        &copy; ${new Date().getFullYear()} iAware. All rights reserved.
                        <br>
                        <img src="${
                            window.location.origin
                        }/assets/media/iaware-high-resolution-logo-transparent.png" alt="Company Logo">
                    </div>
                </div>
            </body>
            </html>
        `;
        // this.authService.sendVerificationEmail(sendEmailRequest).subscribe();
    }

    sendRenewConfirmationEmail(user: IUserModel) {
        const sendEmailRequest: ISendEmailRequest = {
            body: '',
            subject: 'Subscription Renewal Confirmation',
            to: user.email,
            callbackURL: '',
        };

        sendEmailRequest.body = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Subscription Renewal</title>
           <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 0;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #ffffff;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                        border-radius: 8px;
                        overflow: hidden;
                    }
                    p{
                        line-height: 1.5;
                    }
                    .header {
                        background-color: #6f42c1;
                        color: #ffffff;
                        padding: 20px;
                        text-align: center;
                        font-size: 24px;
                    }
                    .content {
                        padding: 20px;
                        text-align: center;
                        font-size: 16px;
                        color: #333333;
                    }
                    .button {
                        display: inline-block;
                        margin-top: 20px;
                        padding: 15px 30px;
                        background-color: #6f42c1;
                        color: #ffffff !important;
                        text-decoration: none;
                        border-radius: 5px;
                        font-size: 18px;
                    }
                    .footer {
                        background-color: #f4f4f4;
                        color: #888888;
                        padding: 10px;
                        text-align: center;
                        font-size: 14px;
                    }
                     img {
                    height: 40px;
                     margin-top: 11px;
                }
                </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    Subscription Renewal Confirmation
                </div>
                <div class="content">
                    <p>Dear ${user.firstName} ${user.lastName},</p>
                    <p>Your subscription has been successfully renewed. Thank you for continuing to use iAware.</p>
                    <p>If you would like to manage your account, please click the button below to log in.</p>
                    <a href="${window.location.origin}/#/auth" class="button">Login</a>
                </div>
                <div class="footer">
                    &copy; ${new Date().getFullYear()} iAware. All rights reserved.
                    <br>
                    <img src="${
                        window.location.origin
                    }/assets/media/iaware-high-resolution-logo-transparent.png" alt="Company Logo">
                </div>
            </div>
        </body>
        </html>
    `;

        // this.authService.sendVerificationEmail(sendEmailRequest).subscribe();
    }

    sendUpgradePlanConfirmationEmail(user: IUserModel) {
        const sendEmailRequest: ISendEmailRequest = {
            to: user.email,
            subject: 'Your Plan Has Been Upgraded!',
            body: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Upgrade Confirmation</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 0;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #ffffff;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                        border-radius: 8px;
                        overflow: hidden;
                    }
                    p{
                        line-height: 1.5;
                    }
                    .header {
                        background-color: #6f42c1;
                        color: #ffffff;
                        padding: 20px;
                        text-align: center;
                        font-size: 24px;
                    }
                    .content {
                        padding: 20px;
                        text-align: center;
                        font-size: 16px;
                        color: #333333;
                    }
                    .button {
                        display: inline-block;
                        margin-top: 20px;
                        padding: 15px 30px;
                        background-color: #6f42c1;
                        color: #ffffff !important;
                        text-decoration: none;
                        border-radius: 5px;
                        font-size: 18px;
                    }
                    .footer {
                        background-color: #f4f4f4;
                        color: #888888;
                        padding: 10px;
                        text-align: center;
                        font-size: 14px;
                    }
                     img {
                    height: 40px;
                     margin-top: 11px;
                }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">Plan Upgrade Confirmation</div>
                    <div class="content">
                        <p>Dear ${user.firstName} ${user.lastName},</p>
                        <p>Thank you for upgrading your plan! We’re excited to bring you new features and improvements.</p>
                        <a href="${window.location.origin}/#/auth" class="button">Go to Login</a>
                    </div>
                    <div class="footer">
                        &copy; ${new Date().getFullYear()} iAware. All rights reserved.
                        <br>
                        <img src="${
                            window.location.origin
                        }/assets/media/iaware-high-resolution-logo-transparent.png" alt="Company Logo">
                    </div>
                </div>
            </body>
            </html>
        `,
        };
        // this.authService.sendVerificationEmail(sendEmailRequest).subscribe();
    }

    sendDowngradePlanConfirmationEmail(user: IUserModel) {
        const sendEmailRequest: ISendEmailRequest = {
            to: user.email,
            subject: 'Your Plan Has Been Downgraded',
            body: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Downgrade Confirmation</title>
                      <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 0;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #ffffff;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                        border-radius: 8px;
                        overflow: hidden;
                    }
                    p{
                        line-height: 1.5;
                    }
                    .header {
                        background-color: #6f42c1;
                        color: #ffffff;
                        padding: 20px;
                        text-align: center;
                        font-size: 24px;
                    }
                    .content {
                        padding: 20px;
                        text-align: center;
                        font-size: 16px;
                        color: #333333;
                    }
                    .button {
                        display: inline-block;
                        margin-top: 20px;
                        padding: 15px 30px;
                        background-color: #6f42c1;
                        color: #ffffff !important;
                        text-decoration: none;
                        border-radius: 5px;
                        font-size: 18px;
                    }
                    .footer {
                        background-color: #f4f4f4;
                        color: #888888;
                        padding: 10px;
                        text-align: center;
                        font-size: 14px;
                    }
                     img {
                    height: 40px;
                     margin-top: 11px;
                }
                </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">Plan Downgrade Confirmation</div>
                        <div class="content">
                            <p>Dear ${user.firstName} ${user.lastName},</p>
                            <p>Your plan has been downgraded successfully. You can still enjoy iAware with limited features.</p>
                            <a href="${window.location.origin}/#/auth" class="button">Go to Login</a>
                        </div>
                        <div class="footer">
                            &copy; ${new Date().getFullYear()} iAware. All rights reserved.
                            <br>
                            <img src="${
                                window.location.origin
                            }/assets/media/iaware-high-resolution-logo-transparent.png" alt="Company Logo">
                        </div>
                    </div>
                </body>
                </html>
            `,
        };
        // this.authService.sendVerificationEmail(sendEmailRequest).subscribe();
    }

    sendIncreaseUsersConfirmationEmail(user: IUserModel) {
        const sendEmailRequest: ISendEmailRequest = {
            to: user.email,
            subject: 'User Limit Increased',
            body: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Increase Users Confirmation</title>
                     <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 0;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #ffffff;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                        border-radius: 8px;
                        overflow: hidden;
                    }
                    p{
                        line-height: 1.5;
                    }
                    .header {
                        background-color: #6f42c1;
                        color: #ffffff;
                        padding: 20px;
                        text-align: center;
                        font-size: 24px;
                    }
                    .content {
                        padding: 20px;
                        text-align: center;
                        font-size: 16px;
                        color: #333333;
                    }
                    .button {
                        display: inline-block;
                        margin-top: 20px;
                        padding: 15px 30px;
                        background-color: #6f42c1;
                        color: #ffffff !important;
                        text-decoration: none;
                        border-radius: 5px;
                        font-size: 18px;
                    }
                    .footer {
                        background-color: #f4f4f4;
                        color: #888888;
                        padding: 10px;
                        text-align: center;
                        font-size: 14px;
                    }
                     img {
                    height: 40px;
                     margin-top: 11px;
                }
                </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">User Limit Increase Confirmation</div>
                        <div class="content">
                            <p>Dear ${user.firstName} ${user.lastName},</p>
                            <p>Your user limit has been increased successfully. Now you can add more users to iAware.</p>
                            <a href="${window.location.origin}/#/auth" class="button">Go to Login</a>
                        </div>
                        <div class="footer">
                            &copy; ${new Date().getFullYear()} iAware. All rights reserved.
                            <br>
                            <img src="${
                                window.location.origin
                            }/assets/media/iaware-high-resolution-logo-transparent.png" alt="Company Logo">
                        </div>
                    </div>
                </body>
                </html>
            `,
        };
        // this.authService.sendVerificationEmail(sendEmailRequest).subscribe();
    }

    sendDecreaseUsersConfirmationEmail(user: IUserModel) {
        const sendEmailRequest: ISendEmailRequest = {
            to: user.email,
            subject: 'User Limit Decreased',
            body: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Decrease Users Confirmation</title>
                      <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 0;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #ffffff;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                        border-radius: 8px;
                        overflow: hidden;
                    }
                    p{
                        line-height: 1.5;
                    }
                    .header {
                        background-color: #6f42c1;
                        color: #ffffff;
                        padding: 20px;
                        text-align: center;
                        font-size: 24px;
                    }
                    .content {
                        padding: 20px;
                        text-align: center;
                        font-size: 16px;
                        color: #333333;
                    }
                    .button {
                        display: inline-block;
                        margin-top: 20px;
                        padding: 15px 30px;
                        background-color: #6f42c1;
                        color: #ffffff !important;
                        text-decoration: none;
                        border-radius: 5px;
                        font-size: 18px;
                    }
                    .footer {
                        background-color: #f4f4f4;
                        color: #888888;
                        padding: 10px;
                        text-align: center;
                        font-size: 14px;
                    }
                     img {
                    height: 40px;
                     margin-top: 11px;
                }
                </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">User Limit Decrease Confirmation</div>
                        <div class="content">
                            <p>Dear ${user.firstName} ${user.lastName},</p>
                            <p>Your user limit has been decreased. Please review your team settings.</p>
                            <a href="${window.location.origin}/#/auth" class="button">Go to Login</a>
                        </div>
                        <div class="footer">
                            &copy; ${new Date().getFullYear()} iAware. All rights reserved.
                            <br>
                            <img src="${
                                window.location.origin
                            }/assets/media/iaware-high-resolution-logo-transparent.png" alt="Company Logo">
                        </div>
                    </div>
                </body>
                </html>
            `,
        };
        // this.authService.sendVerificationEmail(sendEmailRequest).subscribe();
    }

    sendRefundConfirmationEmail(user: IUserModel) {
        const sendEmailRequest: ISendEmailRequest = {
            to: user.email,
            subject: 'Refund Processed',
            body: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Refund Confirmation</title>
                      <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 0;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #ffffff;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                        border-radius: 8px;
                        overflow: hidden;
                    }
                    p{
                        line-height: 1.5;
                    }
                    .header {
                        background-color: #6f42c1;
                        color: #ffffff;
                        padding: 20px;
                        text-align: center;
                        font-size: 24px;
                    }
                    .content {
                        padding: 20px;
                        text-align: center;
                        font-size: 16px;
                        color: #333333;
                    }
                    .button {
                        display: inline-block;
                        margin-top: 20px;
                        padding: 15px 30px;
                        background-color: #6f42c1;
                        color: #ffffff !important;
                        text-decoration: none;
                        border-radius: 5px;
                        font-size: 18px;
                    }
                    .footer {
                        background-color: #f4f4f4;
                        color: #888888;
                        padding: 10px;
                        text-align: center;
                        font-size: 14px;
                    }
                     img {
                    height: 40px;
                     margin-top: 11px;
                }
                </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">Refund Confirmation</div>
                        <div class="content">
                            <p>Dear ${user.firstName} ${user.lastName},</p>
                            <p>Your refund has been processed successfully. If you have any questions, feel free to contact support.</p>
                            <a href="${window.location.origin}/#/auth" class="button">Go to Login</a>
                        </div>
                        <div class="footer">
                            &copy; ${new Date().getFullYear()} iAware. All rights reserved.
                            <br>
                            <img src="${
                                window.location.origin
                            }/assets/media/iaware-high-resolution-logo-transparent.png" alt="Company Logo">
                        </div>
                    </div>
                </body>
                </html>
            `,
        };
        // this.authService.sendVerificationEmail(sendEmailRequest).subscribe();
    }

    //#endregion

    expandAllInProgress() {
        this.isExpandedInProgress = !this.isExpandedInProgress;
        if (this.isExpandedInProgress) {
            this.inProgressInvoices.forEach((invoice) => {
                this.expandedRowsInProgress[invoice.id] = true;
            });
        } else {
            this.expandedRowsInProgress = {};
        }
    }

    expandAllCompleted() {
        this.isExpandedCompleted = !this.isExpandedCompleted;
        if (this.isExpandedCompleted) {
            this.completedInvoices.forEach((invoice) => {
                this.expandedRowsCompleted[invoice.id] = true;
            });
        } else {
            this.expandedRowsCompleted = {};
        }
    }

    openContent(NotificationTypeLanguage: ITenantSubscriptionInvoicePaymentRequest) {
        this.invoicePaymentRequest = { ...NotificationTypeLanguage };
        this.openPaymentNotelDialog = true;
    }

    hideRedirectPageUrlDialog() {
        this.openPaymentNotelDialog = false;
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    hasPermission(controlKey: string): boolean {
        return this.pagePermessions.some((p) => p.controlKey === controlKey);
    }

    hasNonEditableInvoices(): boolean {
        return this.invoices.some((invoice) => !invoice.canEdit);
    }

    ngOnDestroy() {
        this.subs.forEach((sub) => sub.unsubscribe());
    }
}