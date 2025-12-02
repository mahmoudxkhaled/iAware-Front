import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { IUserModel } from '../../models/IUserModel';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription, finalize } from 'rxjs';
import { UserService } from '../../services/user.service';
import { MenuItem, MessageService } from 'primeng/api';
import { ILanguageModel } from 'src/app/modules/language/models/ILanguageModel';
import { TrainingLessonService } from 'src/app/modules/security-training/services/training-lesson.service';
import { LanguageDIRService } from 'src/app/core/Services/LanguageDIR.service';
import { LocalStorageService } from 'src/app/core/Services/local-storage.service';
import { TranslationService } from 'src/app/core/Services/translation.service';
import { IAspNetPageItemModel } from 'src/app/modules/page-management/models/IAspNetPageItemModel';
import { constants } from 'src/app/core/constatnts/constatnts';
import { PermessionsService } from 'src/app/core/Services/permessions.service';
import { UserProfilePhotoService } from '../../services/UserProfilePhoto.service';
import { SubscriptionService } from 'src/app/modules/subscription/services/subscription.service';
import { SearchCountryField, CountryISO, PhoneNumberFormat } from '@justin-s/ngx-intl-tel-input';
import { Table } from 'primeng/table';
import { IRoleModel } from 'src/app/modules/role/models/IRoleModel';
import { RoleService } from 'src/app/modules/role/services/role.service';
import { IAdministraorUserModel } from '../../models/IAdministraorUserModel';
import { ActivatedRoute } from '@angular/router';
import { PaymentTypeEnum } from 'src/app/modules/auth/components/get-quote/get-quote.component';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { ISubscriptionPlanModel } from 'src/app/modules/subscription/models/ISubscriptionPlanModel';
import { IPointsModel } from 'src/app/modules/dashboards/models/IPointsModel';
import { LayoutService } from 'src/app/layout/app-services/app.layout.service';
import { ITenantUnitModel } from 'src/app/modules/tenant-unit/models/ITenantUnitModel';
import { ITimeZone } from 'src/app/modules/account/models/ITimeZone';
import { AccountSettingService } from 'src/app/modules/account/services/account-setting.service';
import { TableLoadingService } from 'src/app/core/Services/table-loading.service';
import { IBadgeModel } from 'src/app/modules/account/models/IBadgeModel';
import { DropdownChangeEvent } from 'primeng/dropdown';
import { DropdownListDataSourceService } from 'src/app/core/Services/dropdown-list-data-source.service';
interface User {
    id: string;
    firstName: string;
    lastName: string;
    languageId: string;
    email: string;
    theme: string;
    photoUrl: string;
    timeZoneId: string;
    phone: string;
    countryISO: string;
    isDefaultTenantUser?: boolean;
}
export interface TenantSubscriptionDto {
    id: string;
    subscriptionPlanId: string;
    subscriptionPlanName: string;
    tenantName: string;
    isActive: boolean;
    startDate: Date;
    endDate: Date;
    durationByDays: number;
    usersCount: number;
    tenantId: string;
}

@Component({
    selector: 'app-user-tenant-profile',
    templateUrl: './user-tenant-profile.component.html',
    styleUrl: './user-tenant-profile.component.scss',
})

export class UserTenantProfileComponent implements OnInit, OnDestroy {
    tableLoadingSpinner: boolean = true;
    timeZonesList: ITimeZone[] = [];
    activeTabIndex: number = 0;
    separateDialCode = false;
    SearchCountryField = SearchCountryField;
    CountryISO = CountryISO;
    PhoneNumberFormat = PhoneNumberFormat;
    preferredCountries: CountryISO[] = [CountryISO.UnitedStates, CountryISO.UnitedKingdom];
    unSubscription: Subscription[] = [];
    userForm!: FormGroup;
    userEditForm!: FormGroup;
    UserModel!: IUserModel;
    administratorRoles: IRoleModel[] = [];
    tenantUsers: IUserModel[] = [];
    tenantAdministrators: IUserModel[] = [];
    groups: any[] = [];
    currentAdministratorSelected: IUserModel;
    user: User;
    selectedFile: File | null = null;
    imageUrl: string = '../../../../../assets/media/avatar.png';
    invoiceImageURL: string = '../../../../../assets/media/upload-photo.jpg';
    isRtl: boolean = false;
    addNewAdministratorDialog: boolean = false;
    isFormSubmitted: boolean = false;
    returnAdminDialog: boolean = false;
    editDialog: boolean = false;
    userLanguageCode: string;
    UserImageUrl: string;
    UserTheme: string;
    data: any;
    remainingDays: number | null = null;
    languages: ILanguageModel[] = [];
    tenantSubscription: TenantSubscriptionDto;
    pagePermessions: IAspNetPageItemModel[] = [];
    actions = constants.pageActions;
    selectedCountryISO: any = CountryISO.UnitedStates;
    fileError: string | null = null;

    themes: { name: string; id: string }[] = [
        { name: 'Dark', id: 'dark' },
        { name: 'Light', id: 'light' },
    ];

    newAdministrator: IAdministraorUserModel = {
        rolesIds: [],
        userId: '',
    };

    userPoints: IPointsModel = {
        negativePoints: 0,
        positivePoints: 0,
        totalSumPoints: 0,
    };

    currentPage: string = 'SubscriptionOverview';
    generatedInvoice: any[];
    public PaymentTypeEnum = PaymentTypeEnum;
    subscriptionsList: ISubscriptionPlanModel[] = [];
    choosenSubscription: ISubscriptionPlanModel;
    quoteName: string;
    tenantUnits: ITenantUnitModel[] = [];
    userBadges: IBadgeModel[] = [];
    menuItems: MenuItem[] = [];

    get firstName() {
        return this.userForm.get('firstName');
    }

    get lastName() {
        return this.userForm.get('lastName');
    }

    constructor(
        private userServ: UserService,
        private ref: ChangeDetectorRef,
        private messageService: MessageService,
        private trainingServ: TrainingLessonService,
        private fb: FormBuilder,
        private localStorage: LocalStorageService,
        private permessionService: PermessionsService,
        private userProfilePhotoService: UserProfilePhotoService,
        private translate: TranslationService,
        private subscriptionServ: SubscriptionService,
        private roleService: RoleService,
        private route: ActivatedRoute,
        private authService: AuthService,
        public layoutService: LayoutService,
        private timeZoneService: AccountSettingService,
        private tableLoadingService: TableLoadingService,
        private dropdownListDataSourceService: DropdownListDataSourceService
    ) {
        this.pagePermessions = this.permessionService.getPagePermessions(constants.pages.appMenueProfile);
        const userData = this.localStorage.getItem('userData');
        if (userData && userData.userImageUrl) {
            this.imageUrl = userData.userImageUrl;
        }
    }

    ngOnInit() {
        this.tableLoadingService.loading$.subscribe((isLoading) => {
            this.tableLoadingSpinner = isLoading;
        });

        // Subscribe to query parameters to get the tapIndex
        this.route.queryParams.subscribe((params) => {
            const index = params['tapIndex'];
            if (index !== undefined) {
                this.activeTabIndex = +index; // Convert to number
            }
        });

        this.fetchAllTimeZones();
        this.initUser();
        this.initAddInvoicePaymentRequestForm();
        this.initTenantSubscriptionDto();
        this.initiateUserForm();
        this.loadUser();
        this.fetchTenantAdministrators();
        this.fetchActiveLanguages();
        this.getAllSubscriptions();
        this.initializeThemes();
        this.loadSubDetails();
        this.initiateUserEditForm();
        this.fetchUserBadgs();

        const editAdminInfoBtn = {
            label: this.translate.getInstant('user.user-listing.actions.editUser'),
            icon: 'pi pi-fw pi-user-edit',
            command: () => this.openEditDialog(this.currentAdministratorSelected),
        };
        const editAdminRolesBtn = {
            label: this.translate.getInstant('user.user-listing.actions.editUserRoles'),
            icon: 'pi pi-fw pi-key',
            command: () => this.openEditUserRolesDialog(this.currentAdministratorSelected),
        };
        this.menuItems.push(editAdminInfoBtn);
        this.menuItems.push(editAdminRolesBtn);
    }

    assigneCurrentSelect(user: IUserModel) {
        this.currentAdministratorSelected = user;
        this.fetchTenantUsers();
        this.fetchAdministratorRoles();
    }

    openEditDialog(user: IUserModel) {
        this.editDialog = true;
        this.userEditForm.patchValue({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            languageId: user.languageId,
            tenantUnitId: user.tenantUnitId,
        });
        this.fetchGroups();
        this.fetchTenantUnits();
    }

    openEditUserRolesDialog(user: IUserModel) {
        this.addNewAdministratorDialog = true;
        this.newAdministrator.userId = user.id ?? '';
        const userRoles = this.tenantAdministrators?.find(c => c.id === user.id)?.roles;
        if (userRoles) {
            this.newAdministrator.rolesIds = this.administratorRoles.filter(c => userRoles.includes(c.name)).map(c => c.id);
        } else {
            this.newAdministrator.rolesIds = [];
        }
    }

    initiateUserEditForm() {
        this.userEditForm = new FormGroup({
            id: new FormControl<string>(''),
            timeZoneId: new FormControl<string>('', [Validators.required]),
            firstName: new FormControl<string>('', Validators.required),
            lastName: new FormControl<string>('', Validators.required),
            languageId: new FormControl<string>('', [Validators.required]),
            tenantUnitId: new FormControl<string>(''),
        });
    }

    initializeThemes(): void {
        this.themes = [
            { name: this.translate.getInstant('user.user-tenant-profile.themes.dark'), id: 'dark' },
            { name: this.translate.getInstant('user.user-tenant-profile.themes.light'), id: 'light' },
        ];
    }

    fetchGroups() {
        const sub = this.dropdownListDataSourceService.getTenantGroups().subscribe({
            next: (response) => {
                this.groups = response.data;
            },
            error: (error) => { },
        });
        this.unSubscription.push(sub);
    }

    fetchTenantUnits() {
        const sub = this.dropdownListDataSourceService.getTenantUnits().subscribe({
            next: (res) => {
                this.tenantUnits = res.data;
            },
            error: (err) => { },
        });
        this.unSubscription.push(sub);
    }

    fetchUserBadgs() {
        const sub = this.userServ.getUserBadgesVI().subscribe({
            next: (response) => {
                this.userBadges = response.data;
            },
            error: (error) => {
                console.error('Error fetching user points:', error);
            },
        });
        this.unSubscription.push(sub);
    }

    fetchAllTimeZones() {
        const sub = this.dropdownListDataSourceService.getAllTimeZones().subscribe((res) => {
            this.timeZonesList = res.data;
        });
        this.unSubscription.push(sub);
    }

    fetchActiveLanguages() {
        const sub = this.dropdownListDataSourceService.getActiveLanguages().subscribe((res) => {
            this.languages = res.data as ILanguageModel[];
        });
        this.unSubscription.push(sub);
    }

    editeUser() {
        const x = this.userServ.updateUser(this.userEditForm.value).subscribe({
            next: (res) => {
                this.fetchAdministratorRoles();
                this.fetchTenantAdministrators();
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'User updated successfully',
                });
                this.editDialog = false;
            },
        });
    }

    //#region Users && Admin

    loadUser() {
        const sub = this.userServ.getUserDetails().subscribe((res) => {
            this.user = res.data;
            this.fetchUserPoints();
            this.selectedCountryISO = this.user.countryISO;
            this.userForm.patchValue({
                id: this.user.id,
                firstName: this.user.firstName,
                lastName: this.user.lastName,
                languageId: this.user.languageId,
                email: this.user.email,
                timeZoneId: this.user.timeZoneId,
                theme: this.user.theme,
                phone: {
                    number: this.user.phone?.split('-')[1],
                    dialCode: this.user.phone?.split('-')[0],
                },
            });
            this.imageUrl = res.data.userPhoto ?? this.imageUrl;
        })
        this.unSubscription.push(sub);
    }

    fetchUserPoints() {
        const sub = this.userServ.getUserPoints(this.user.id).subscribe({
            next: (response) => {
                this.userPoints = response.data;
            },
            error: (error) => {
                console.error('Error fetching user points:', error);
            },
        });
        this.unSubscription.push(sub);
    }

    fetchTenantAdministrators() {
        this.tableLoadingService.show();

        const sub = this.userServ.getTenantAdministrators().subscribe({
            next: (res) => {
                this.tenantAdministrators = res.data;
                this.tableLoadingService.hide();
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: err.error.message });
            },
        });
        this.unSubscription.push(sub);
    }

    fetchTenantUsers() {
        const sub = this.userServ.getAllUsersVII().subscribe({
            next: (res) => {
                this.tenantUsers = res.data;
            },
            error: (err) => { },
        });
        this.unSubscription.push(sub);
    }

    fetchAdministratorRoles() {
        const sub = this.roleService.getAdministratorRoles().subscribe({
            next: (res) => {
                this.administratorRoles = res;
            },
            error: (err) => { },
        });
        this.unSubscription.push(sub);
    }

    openReturnAdminDialog(user: IUserModel) {
        this.returnAdminDialog = true;
        this.currentAdministratorSelected = user;
    }

    backSpecificAdminToUser() {
        const sub = this.userServ.backUserToUserRole(this.currentAdministratorSelected.id).subscribe({
            next: (res) => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Successfull',
                    detail: 'User returned to his original role.',
                });
                this.fetchTenantAdministrators();
                this.returnAdminDialog = false;
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: err.error.message });
            },
        });
        this.unSubscription.push(sub);
    }

    onSubmit() {
        const formData = new FormData();
        formData.append('Id', this.userForm.value.id);
        formData.append('FirstName', this.userForm.value.firstName);
        formData.append('LastName', this.userForm.value.lastName);
        formData.append('TimeZoneId', this.userForm.value.timeZoneId);
        // formData.append('Phone', `${this.userForm.value.phone?.dialCode}-${this.userForm.value.phone?.number}`);
        formData.append('CountryISO', this.userForm.value.phone?.countryCode?.toLowerCase());
        if (this.selectedFile) {
            formData.append('UserPhoto', this.selectedFile);
        }

        const sub = this.userServ
            .editProfileUser(formData)
            .pipe(
                finalize(() => {
                    if (this.selectedFile) {
                        const reader = new FileReader();
                        reader.onload = (event: any) => {
                            const newPhotoUrl = this.UserImageUrl;
                            this.userProfilePhotoService.setUserPhoto(newPhotoUrl);
                            const userData = this.localStorage.getItem('userData');
                            if (userData) {
                                userData.userImageUrl = newPhotoUrl;
                                this.localStorage.setItem('userData', userData);
                            }
                        };
                        reader.readAsDataURL(this.selectedFile);
                    }

                    this.loadUser();
                    const userData = this.localStorage.getItem('userData');
                    if (userData) {
                        userData.userFullName = `${this.userForm.value.firstName} ${this.userForm.value.lastName}`;
                        this.userProfilePhotoService.setUserName(userData.userFullName);
                        this.localStorage.setItem('userData', userData);
                    }
                    this.ref.detectChanges();
                })
            )
            .subscribe((result) => {
                (this.UserImageUrl = result.data.userImageUrl),
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Profile Updated successfully',
                        life: 3000,
                    });
            })
        this.unSubscription.push(sub);
    }

    onUploadClick() {
        const fileInput = document.getElementById('myFile') as HTMLInputElement;
        fileInput.click();
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;

        if (input.files && input.files.length) {
            const file = input.files[0];

            // Allowed image MIME types
            const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

            // Validate file type
            if (!allowedTypes.includes(file.type)) {
                this.fileError = this.translate.getInstant('user.user-tenant-profile.profileImagevalidation.allowedTypes');
                input.value = ""; // Reset file input
                return;
            }

            // Validate file size (limit to 5MB)
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (file.size > maxSize) {
                this.fileError = this.translate.getInstant('user.user-tenant-profile.profileImagevalidation.allowedSize');;
                input.value = "";
                return;
            }

            // File is valid, proceed with processing
            this.fileError = null;
            this.selectedFile = file;

            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.imageUrl = e.target.result;
            };
            reader.readAsDataURL(this.selectedFile);
        }
    }

    initiateUserForm() {
        this.userForm = this.fb.group({
            id: [this.user.id],
            firstName: [this.user.firstName, [
                Validators.required,
                Validators.minLength(2),
                Validators.maxLength(50),
                Validators.pattern(/^[A-Za-z\u0600-\u06FF]+(?: [A-Za-z\u0600-\u06FF]+)*$/) // Prevents multiple spaces
            ]],
            lastName: [this.user.lastName,
            [
                Validators.required,
                Validators.minLength(2),
                Validators.maxLength(50),
                Validators.pattern(/^[A-Za-z\u0600-\u06FF]+(?: [A-Za-z\u0600-\u06FF]+)*$/)
            ]],
            // phone: [this.user.phone],
            email: [this.user.email],
            timeZoneId: [this.user.timeZoneId],
            countryISO: [this.user.countryISO],
            imagesArray: this.fb.array([]),
        });
    }

    trimAndUpdateField(fieldName: string): void {
        const control = this.userForm.get(fieldName);
        if (control) {
            // Remove extra spaces and trim leading/trailing spaces
            let cleanedValue = control.value.replace(/\s+/g, ' ').trim();

            // Remove any non-letter characters except spaces
            cleanedValue = cleanedValue.replace(/[^A-Za-z\u0600-\u06FF ]/g, '');

            // Limit length to 50 characters dynamically
            if (cleanedValue.length > 51) {
                cleanedValue = cleanedValue.substring(0, 50);
            }

            control.setValue(cleanedValue, { emitEvent: false });
        }
    }

    initUser() {
        this.user = {
            id: '',
            timeZoneId: '',
            firstName: '',
            lastName: '',
            languageId: '',
            email: '',
            phone: '',
            theme: '',
            photoUrl: '',
            countryISO: '',
        };
    }

    navigateToCreateNewAdministrator() {
        this.addNewAdministratorDialog = true;
        this.fetchTenantUsers();
        this.fetchAdministratorRoles();
    }

    addNewAdministrator() {
        this.isFormSubmitted = true;
        if (this.isFormValid()) {
            const sub = this.userServ.addNewAdministrator(this.newAdministrator).subscribe({
                next: (res) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'New administrator added successfully',
                        life: 3000,
                    });
                    this.hideAdministatorsDialog();
                    this.fetchTenantAdministrators();
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: err.error.message });
                },
            });
            this.unSubscription.push(sub);
        }
    }

    isFormValid(): boolean {
        return this.newAdministrator.userId && this.newAdministrator.rolesIds.length > 0 ? true : false;
    }

    initiateAdministratorObject() {
        this.newAdministrator = {
            userId: '',
            rolesIds: [],
        };
    }

    hideAdministatorsDialog() {
        this.addNewAdministratorDialog = false;
        this.newAdministrator = {
            rolesIds: [],
            userId: ''
        }
    }

    onSelectUserToAddAdministator(event: DropdownChangeEvent) {
        const userRoles = this.tenantAdministrators?.find(c => c.id === event.value)?.roles;
        if (userRoles) {
            this.newAdministrator.rolesIds = this.administratorRoles.filter(c => userRoles.includes(c.name)).map(c => c.id);
        } else {
            this.newAdministrator.rolesIds = [];
        }
    }

    //#endregion

    //#region subscription

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

    selectPaymentMethod(method: PaymentTypeEnum) {
        this.selectedPaymentMethod = method;
    }

    navigateToRenewInvoice() {
        this.quoteName = 'Renew';
        this.currentPage = 'invoice';
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
                this.invoiceImageURL = e.target.result;
                this.ref.detectChanges();
            };
            reader.readAsDataURL(this.selectedPaymentReuqestImage);
        }
    }

    navigateTo(page: string, name?: string) {
        this.currentPage = page;
        this.quoteName = name ?? '';
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

    openGetAQuoteDialog(sub: ISubscriptionPlanModel) {
        this.choosenSubscription = { ...sub };
        this.quoteName = `${sub.title} Plan`;
        this.currentPage = 'invoice';
    }

    //#endregion

    //#endregion

    hasPermission(controlKey: string): boolean {
        return this.pagePermessions.some((p) => p.controlKey === controlKey);
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    ngOnDestroy(): void {
        this.unSubscription.forEach((u) => {
            u.unsubscribe();
        });
    }
}