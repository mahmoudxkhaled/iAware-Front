import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { CountryISO, PhoneNumberFormat, SearchCountryField } from '@justin-s/ngx-intl-tel-input';
import { MessageService } from 'primeng/api';
import { Observable, Subscription } from 'rxjs';
import { LoadingService } from 'src/app/core/Services/Loading.service';
import { TableLoadingService } from 'src/app/core/Services/table-loading.service';
import { ICurrency } from 'src/app/modules/account/models/Currency';
import { ICountryModel } from 'src/app/modules/account/models/ICountryModel';
import { ITimeZone } from 'src/app/modules/account/models/ITimeZone';
import { ISubscriptionPlanModel } from 'src/app/modules/subscription/models/ISubscriptionPlanModel';
import { ISendEmailRequest } from '../../models/ISendEmailRequest';
import { TenantModel } from '../../models/TenantModel';
import { AuthService } from '../../services/auth.service';
import { DropdownListDataSourceService } from 'src/app/core/Services/dropdown-list-data-source.service';

export enum PaymentTypeEnum {
    CreditCard = 1,
    PayPal = 2,
    Transfer = 3,
    BitCoin = 4,
}

@Component({
    selector: 'app-get-quote',
    templateUrl: './get-quote.component.html',
    styleUrl: './get-quote.component.scss',
})
export class GetQuoteComponent implements OnInit, OnDestroy {
    tableLoadingSpinner: boolean = true;

    timeZonesList: ITimeZone[] = [];

    registerForm!: FormGroup;
    private unsubscribe: Subscription[] = [];
    hasError: boolean = false;
    numOfUsers: number = 0;
    choosenSubscription: ISubscriptionPlanModel;
    isLoading$: Observable<boolean>;
    addInvoicePaymentRequestDialog: boolean = false;
    addInvoicePaymentRequestForm: FormGroup;
    subs: Subscription = new Subscription();
    imageUrl: string = '../../../../../assets/media/upload-photo.jpg';
    selectedPaymentMethod: PaymentTypeEnum | null = null;
    public PaymentTypeEnum = PaymentTypeEnum;
    generatedInvoice: any[];
    currentInvoice: string;
    currencies: ICurrency[] = [
        { code: 'USD', name: 'USD - USA dollar' },
    ];

    countriesList: ICountryModel[] = [];
    subscriptionsList: ISubscriptionPlanModel[] = [];
    activeLanguages: any[] = [];
    info: string = 'info@iaware.co';
    quoteName: string;
    sendEmailRequest: ISendEmailRequest = {
        body: '',
        subject: '',
        to: '',
        callbackURL: '',
    };
    SearchCountryField = SearchCountryField;
    CountryISO = CountryISO;
    PhoneNumberFormat = PhoneNumberFormat;
    isPressed = false;
    getAQuoteDialog: boolean;
    submitted: boolean = false;
    selectedPaymentReuqestImage: File | null = null;
    currentPage: string = 'pricing';

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private messageService: MessageService,
        private ref: ChangeDetectorRef,
        private loadingService: LoadingService,
        private tableLoadingService: TableLoadingService,
        private dropdownListDataSourceService : DropdownListDataSourceService
    ) {
        this.loadingService.isLoading$.subscribe((isLoading) => {
            this.isPressed = isLoading;
        });
        this.getFreeSubscriptionPlan();
        this.isLoading$ = this.authService.isLoadingSubject;
    }

    get f() {
        return this.registerForm.controls;
    }

    ngOnInit(): void {

        this.fetchCountries();
        this.fetchTimeZones();
        this.initForm();
        this.fetchActiveLanguages();
        this.getAllSubscriptions();
        this.initAddInvoicePaymentRequestForm();
        this.tableLoadingService.loading$.subscribe((isLoading) => {
            this.tableLoadingSpinner = isLoading;
        });
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

    getAllSubscriptions() {
        this.tableLoadingService.show();

        const sub = this.authService.getAllSubscriptionPlansForQuotes().subscribe((res) => {
            this.subscriptionsList = res.data;
            this.subscriptionsList.sort((a, b) => this.getPlanOrder(a.title) - this.getPlanOrder(b.title));
            this.tableLoadingService.hide();
        });
        this.unsubscribe.push(sub);
    }

    fetchActiveLanguages() {
        const sub = this.dropdownListDataSourceService.getActiveLanguages().subscribe({
            next: (result) => {
                this.activeLanguages = result.data;
            },
            error: (error) => { },
        });
        this.unsubscribe.push(sub);
    }

    fetchCountries() {
        const sub  = this.dropdownListDataSourceService.getCountries().subscribe((res) => {
            this.countriesList = res.data;
        });
        this.unsubscribe.push(sub);
    }

    fetchTimeZones() {
        const sub = this.dropdownListDataSourceService.getAllTimeZones().subscribe((res) => {
            this.timeZonesList = res.data;
        });
        this.unsubscribe.push(sub);
    }

    getFreeSubscriptionPlan() {
        const sub = this.authService.getFreeSubscriptionPlan().subscribe((res) => {
            this.numOfUsers = res.data.numOfUsers;
        });
        this.unsubscribe.push(sub);
    }

    submit() {
        if (this.registerForm.invalid) {
            this.hasError = true;
            return;
        }

        let _countryIso: string = '';
        const result: { [key: string]: string } = {};
        Object.keys(this.f).forEach((key) => {
            console.log(key);
            if (key == 'phone') {
                result[key] = `${this.f[key].value?.dialCode}-${this.f[key].value.number}`;
            } else {
                if (key == 'countryIso') {
                    _countryIso = this.f['phone'].value.countryCode?.toLowerCase();
                }
                result[key] = this.f[key].value;
            }
        });

        const newTenant = new TenantModel();
        newTenant.setTenat(result);
        newTenant.subscriptionPlanId = this.choosenSubscription.id;
        newTenant.countryIso = _countryIso;

        const sub = this.authService.register(newTenant).subscribe({
            next: (tenant) => {
                this.generatedInvoice = [tenant.data];
                this.currentPage = 'invoicePaymentRequest';
                this.currentInvoice = this.generatedInvoice[0].invoiceId;
            },
            error: (err) => {
                this.hasError = true;
                console.error('Registration failed:', err);
            },
        });
        this.unsubscribe.push(sub);
    }

    initForm() {
        const forbiddenDomains = ['gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com', 'zoho.com'];

        this.registerForm = this.fb.group({
            firstname: [
                '',
                Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(100)]),
            ],
            lastname: [
                '',
                Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(100)]),
            ],
            companyname: [
                '',
                Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(100)]),
            ],
            email: [
                '',
                Validators.compose([
                    Validators.required,
                    Validators.email,
                    Validators.minLength(3),
                    Validators.maxLength(320),
                    this.companyEmailValidator(forbiddenDomains),
                ]),
            ],
            language: ['', Validators.required],
            phone: ['', Validators.required],
            countryIso: [''],
            timeZoneId: ['', Validators.required],
            agree: [false, Validators.requiredTrue],
            requestUserCount: [null, Validators.compose([Validators.required, Validators.min(1)])],
        });
    }

    companyEmailValidator(forbiddenDomains: string[]): ValidatorFn {
        return (control: AbstractControl): { [key: string]: boolean } | null => {
            if (!control.value) {
                return null;
            }

            const emailDomain = control.value.split('@')[1];
            if (forbiddenDomains.includes(emailDomain)) {
                return { companyEmail: true };
            }

            return null;
        };
    }

    close() {
        this.getAQuoteDialog = false;
    }

    openGetAQuoteDialog(sub: ISubscriptionPlanModel) {
        this.choosenSubscription = { ...sub };
        this.quoteName = `${sub.title} Plan`;
        this.currentPage = 'getAQuote';
    }

    selectPaymentMethod(method: PaymentTypeEnum) {
        this.selectedPaymentMethod = method;
    }

    saveAddInvoicePaymentRequest() {
        this.navigateTo('finalStep');
        this.submitted = true;
        if (this.addInvoicePaymentRequestForm.valid) {
            const formData = new FormData();

            formData.append('RequestAmount', this.addInvoicePaymentRequestForm.value.RequestAmount);
            formData.append('RequestReferenceKey', this.addInvoicePaymentRequestForm.value.RequestReferenceKey);
            formData.append('RequestPaymentNote', this.addInvoicePaymentRequestForm.value.RequestPaymentNote);
            formData.append('SubscriptionTenantInvoiceId', this.generatedInvoice[0].invoiceId);

            const PaymentReuqestImageFile = this.selectedPaymentReuqestImage;
            if (PaymentReuqestImageFile) {
                formData.append('RequestReferenceImageUrl', PaymentReuqestImageFile, PaymentReuqestImageFile.name);
            }

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
        this.selectedPaymentMethod = null;
    }

    navigateTo(page: string): void {
        this.currentPage = page;
    }

    navigateBack(page: string): void {
        this.currentPage = page;
    }

    ngOnDestroy() {
        this.unsubscribe.forEach((sb) => sb.unsubscribe());
    }
}