import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ISubscriptionPlanModel } from '../../models/ISubscriptionPlanModel';
import { SubscriptionService } from '../../services/subscription.service';
import { PaymentReminderSettingsService } from '../../services/payment-reminder.service';
import { RoleService } from 'src/app/modules/role/services/role.service';
import { IRoleModel } from 'src/app/modules/role/models/IRoleModel';
import { MessageService, ConfirmationService, TreeNode, MenuItem } from 'primeng/api';
import { IPaymentReminderSettingModel } from '../../models/IPaymentReminderSettingModel';
import { Table } from 'primeng/table';
import { Subscription, finalize } from 'rxjs';
import { DropdownChangeEvent } from 'primeng/dropdown';
import { TrainingLessonService } from 'src/app/modules/security-training/services/training-lesson.service';
import { ITrainingLesson } from 'src/app/modules/security-training/models/ISecurityTrainingModel';
import { PhishingCategoryService } from 'src/app/modules/phishing-category/services/phishing-category.service';
import { IAspNetPageItemModel } from 'src/app/modules/page-management/models/IAspNetPageItemModel';
import { PermessionsService } from 'src/app/core/Services/permessions.service';
import { constants } from 'src/app/core/constatnts/constatnts';
import { TranslationService } from 'src/app/core/Services/translation.service';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { ILanguageModel } from 'src/app/modules/language/models/ILanguageModel';
import { languages } from 'monaco-editor';
import { TableLoadingService } from 'src/app/core/Services/table-loading.service';
import { DropdownListDataSourceService } from 'src/app/core/Services/dropdown-list-data-source.service';

enum DurationTypeEnum {
    Day = 1,
    Month = 2,
    Year = 3,
}

@Component({
    selector: 'app-subscription-list',
    templateUrl: './subscription-list.component.html',
    styleUrls: ['./subscription-list.component.scss'],
    providers: [MessageService, ConfirmationService],
})
export class SubscriptionListComponent implements OnInit, OnDestroy {
    pagePermessions: IAspNetPageItemModel[] = [];
    actions = constants.pageActions;
    submitted: boolean = false;
    subscriptionDialog: boolean = false;
    deleteSubscriptionDialog: boolean = false;
    freeSubscriptionDialog: boolean = false;
    iAwareSubscriptionDialog: boolean = false;
    selectedSubscription: ISubscriptionPlanModel | null;
    deleteSubscriptionsDialog: boolean = false;
    switchActivationSubscriptionDialog: boolean = false;
    featuresDetailsDialog: boolean = false;
    activeLanguages: any[] = [];

    selectedSubscriptions: ISubscriptionPlanModel[] = [];
    trainingLessons: ITrainingLesson[] = [];
    subscriptions: ISubscriptionPlanModel[] = [];
    subscription: ISubscriptionPlanModel = {} as ISubscriptionPlanModel;
    reminders: IPaymentReminderSettingModel[] = [];
    roles: IRoleModel[] = [];
    selectedRoles: IRoleModel[] = [];
    selectedLanguages: string[] = [];
    selectedTrainingLessons: ITrainingLesson[] = [];
    subscriptionForm: FormGroup;
    activationUserDialog: boolean = false;
    isMobileView: boolean = false;
    durationTypes: { id: number; name: string }[] = [];

    lessonsToSend: any[];
    data: TreeNode[] = [];
    data2: TreeNode[] = [];
    selectedLessons: TreeNode[] = [];
    selectedTemplates: TreeNode[] = [];
    childerens: TreeNode[] = [];
    menuItems: MenuItem[] = [];
    tableLoadingSpinner: boolean = true;

    subs: Subscription = new Subscription();

    constructor(
        private fb: FormBuilder,
        private subscriptionService: SubscriptionService,
        private reminderService: PaymentReminderSettingsService,
        private roleService: RoleService,
        private messageService: MessageService,
        private trainingServ: TrainingLessonService,
        private phisCateServ: PhishingCategoryService,
        private ref: ChangeDetectorRef,
        private formBuilder: FormBuilder,
        private permessionService: PermessionsService,
        private translate: TranslationService,
        private authService: AuthService,
        private dropdownListDataSourceService : DropdownListDataSourceService,
        private loadingService: TableLoadingService
    ) {
        this.pagePermessions = this.permessionService.getPagePermessions(constants.pages.subscription);
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    ngOnInit(): void {
        this.fetchActiveLanguages();

        this.durationTypes = Object.keys(DurationTypeEnum)
            .filter((key) => isNaN(Number(key))) // Ensure the key is a string (not numeric)
            .map((key) => {
                return { id: (DurationTypeEnum as any)[key], name: key }; // Access enum value safely
            });

        this.menuItems = [];
        const editBtn = {
            label: this.translate.getInstant('shared.actions.edit'),
            icon: 'pi pi-fw pi-pencil',
            command: () => this.editSubscription(this.subscription),
        };
        const deleteBtn = {
            label: this.translate.getInstant('shared.actions.delete'),
            icon: 'pi pi-fw pi-trash',
            command: () => this.deleteSubscription(this.subscription),
        };

        if (this.hasPermission(this.actions.edit)) {
            this.menuItems.push(editBtn);
        }
        if (this.hasPermission(this.actions.delete)) {
            this.menuItems.push(deleteBtn);
        }

        this.initSubscriptionModel();
        this.loadRoles();
        this.loadReminders();
        this.loadSubscriptions();
        this.isMobileView = window.innerWidth < 768;
        this.initFormModels();
        this.loadTrainingLessons();
        this.loadPhishingTemplates();

        this.loadingService.loading$.subscribe((isLoading) => {
            this.tableLoadingSpinner = isLoading;
        });
    }

    assigneCurrentSelect(sup: ISubscriptionPlanModel) {
        this.subscription = sup;
    }

    fetchActiveLanguages() {
        this.dropdownListDataSourceService.getActiveLanguages().subscribe({
            next: (result) => {
                this.activeLanguages = result.data;
            },
            error: (error) => { },
        });
    }

    loadSubscriptions() {
        this.loadingService.show();

        this.subs.add(
            this.subscriptionService.getAllsusbcriptions().subscribe((data) => {
                this.subscriptions = data;
                this.loadingService.hide();
            })
        );


    }

    loadRoles() {
        this.subs.add(this.roleService.getTenantRoles().subscribe((result) => (this.roles = result)));
    }

    loadReminders() {
        this.subs.add(
            this.reminderService.getAllPaymentReminderSettings().subscribe((result) => (this.reminders = result))
        );
    }

    loadTrainingLessons() {
        this.subs.add(
            this.trainingServ.getAllTrainigLessonCategorisWithLessons().subscribe((result) => (this.data = result.data))
        );
    }

    loadPhishingTemplates() {
        this.subs.add(
            this.phisCateServ.getAllPhishingCategoriesWithTemplates().subscribe({
                next: (r) => {
                    this.data2 = r.data;
                },
                error: (err) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to load data',
                        life: 3000,
                    });
                    console.error(err);
                },
            })
        );
    }

    openNew() {
        this.initSubscriptionModel();
        this.initFormModels();
        this.selectedLessons = [];
        this.selectedTemplates = [];
        this.submitted = false;
        this.subscriptionDialog = true;
    }

    editSubscription(subscription: ISubscriptionPlanModel) {
        this.subscription = { ...subscription };
        this.initFormModels();

        this.selectedLessons = [];
        this.selectedTemplates = [];
        this.selectedLanguages = [];
        this.selectedLessons = this.subscription.trainingLessons.map((id) => ({
            key: id,
            data: id,
        }));

        this.selectedTemplates = this.subscription.phishingEmailTemplates.map((id) => ({
            key: id,
            data: id,
        }));

        const roleIds = this.subscription.roles
            ? this.subscription.roles.map((roleName) => this.getRoleIdByName(roleName))
            : [];

        this.selectedRoles = this.roles.filter((x) => roleIds.includes(x.id));

        const reminderIds = this.subscription.reminders
            ? this.subscription.reminders.map((reminderName) => this.getReminderIdByName(reminderName))
            : [];

        this.subscriptionForm.patchValue({
            id: this.subscription.id,
            title: this.subscription.title,
            description: this.subscription.description,
            userPrice: this.subscription.userPrice,

            durationNumber: this.subscription.durationNumber,
            durationType: this.subscription.durationType,

            activeDate: this.subscription.activeDate,

            roles: roleIds,
            languages: this.subscription.languages,
            defaultRole: this.getRoleIdByName(this.subscription.defaultRole),

            reminders: reminderIds,
            trainingLessons: this.selectedLessons.map((x) => x.key),
            phishingTemplates: this.selectedTemplates.map((x) => x.key),

            unlimitedPhishingSimulation: this.subscription.unlimitedPhishingSimulation,
            awarenessVideos: this.subscription.awarenessVideos,
            comicBooks: this.subscription.comicBooks,
            knowledgeQuiz: this.subscription.knowledgeQuiz,
            securityQuotesAndTips: this.subscription.securityQuotesAndTips,
            advancedReporting: this.subscription.advancedReporting,
            awarenessEmails: this.subscription.awarenessEmails,
            wallpapers: this.subscription.wallpapers,
            screenSavers: this.subscription.screenSavers,
            games: this.subscription.games,
            vrGamesAndTraining: this.subscription.vrGamesAndTraining,
            localization: this.subscription.localization,
            onSiteDeployment: this.subscription.onSiteDeployment,
            iawareMobileApp: this.subscription.iawareMobileApp,
            automatedTrainingCampaigns: this.subscription.automatedTrainingCampaigns,
            brandableContent: this.subscription.brandableContent,
            phishAlertButton: this.subscription.phishAlertButton,
            userProvisioningViaActiveDirectory: this.subscription.userProvisioningViaActiveDirectory,
            technicalSupport: this.subscription.technicalSupport,
            smartGroups: this.subscription.smartGroups,
            customizedPhishingExperience: this.subscription.customizedPhishingExperience,
        });

        this.subscriptionDialog = true;
    }

    getRoleIdByName(roleName: string): string | undefined {
        const role = this.roles.find((role) => role.name === roleName);
        return role ? role.id : undefined;
    }

    getLessonIdByName(lessonName: string): string | undefined {
        const lesson = this.trainingLessons.find((lesson) => lesson.name === lessonName);
        return lesson ? lesson.id : undefined;
    }

    getReminderIdByName(reminderName: string): string | undefined {
        const reminder = this.reminders.find((reminder) => reminder.title === reminderName);
        return reminder ? reminder.id : undefined;
    }

    deleteSelectedSubscriptions() {
        this.deleteSubscriptionsDialog = true;
    }

    deleteSubscription(subscription: ISubscriptionPlanModel) {
        this.deleteSubscriptionDialog = true;
        this.subscription = { ...subscription };
    }

    confirmDelete() {
        this.deleteSubscriptionDialog = false;
        // this.subscriptions = this.subscriptions.filter((val) => val.id !== this.subscription.id);
        this.subs.add(
            this.subscriptionService
                .deleteSubscriptionPlan(this.subscription.id)
                .pipe(
                    finalize(() => {
                        this.loadSubscriptions();
                        this.initSubscriptionModel();
                        this.initFormModels();
                        this.ref.detectChanges();
                    })
                )
                .subscribe(() => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Subscription deleted',
                        life: 3000,
                    });
                })
        );

        this.subscription = {} as ISubscriptionPlanModel;
    }

    declineDeletion() {
        this.deleteSubscriptionDialog = false;
        this.subscription = {} as ISubscriptionPlanModel;
        this.loadSubscriptions();
    }




    openActivationDialog(subscription: ISubscriptionPlanModel) {
        this.activationUserDialog = true;
        this.subscription = subscription;
    }

    openFeatures(subscription: ISubscriptionPlanModel) {
        this.subscription = subscription;
        this.featuresDetailsDialog = true;
    }

    declineFreePlan() {
        this.freeSubscriptionDialog = false;
        this.loadSubscriptions();
        this.ref.detectChanges();
        this.selectedSubscription = null;
    }
    confirmFreePlan() {
        if (this.selectedSubscription) {
            if (!this.selectedSubscription.isFreePlan) {
                this.subscriptionService
                    .activateFreeSubscriptionPlan(this.selectedSubscription.id)
                    .pipe(
                        finalize(() => {
                            this.ref.detectChanges();
                            this.freeSubscriptionDialog = false;
                            this.selectedSubscription = null;
                            this.loadSubscriptions();
                        })
                    )
                    .subscribe(() => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Subscription Plan is Free Now',
                            life: 3000,
                        });
                        this.freeSubscriptionDialog = false;
                    });
            } else {
                this.subscriptionService.deActivateFreeSubscriptionPlan(this.selectedSubscription.id).subscribe(() => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Subscription Plan is Not Free Now',
                        life: 3000,
                    });
                    this.freeSubscriptionDialog = false;
                });
            }
        }
        this.freeSubscriptionDialog = false;
    }

    checkFreePlan(subscription: ISubscriptionPlanModel) {
        this.selectedSubscription = subscription;
        this.freeSubscriptionDialog = true;
    }

    //#region Activation

    //#region Iaware Plan


    declineIAwarePlan() {
        this.iAwareSubscriptionDialog = false;
        this.loadSubscriptions();
        this.ref.detectChanges();
        this.selectedSubscription = null;
    }
    confirmIAwarePlan() {
        if (this.selectedSubscription) {
            if (!this.selectedSubscription.isIAwarePlan) {
                this.subscriptionService
                    .activateIAwareSubscriptionPlan(this.selectedSubscription.id)
                    .pipe(
                        finalize(() => {
                            this.ref.detectChanges();
                            this.iAwareSubscriptionDialog = false;
                            this.selectedSubscription = null;
                            this.loadSubscriptions();
                        })
                    )
                    .subscribe(() => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Subscription Plan is IAware Plan Now',
                            life: 3000,
                        });
                        this.iAwareSubscriptionDialog = false;
                    });
            } else {
                this.subscriptionService.deActivateIAwareSubscriptionPlan(this.selectedSubscription.id).subscribe(() => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Subscription Plan is Not IAware Plan Now',
                        life: 3000,
                    });
                    this.iAwareSubscriptionDialog = false;
                });
            }
        }
        this.iAwareSubscriptionDialog = false;
    }

    checkIAwarePlan(subscription: ISubscriptionPlanModel) {
        this.selectedSubscription = subscription;
        this.iAwareSubscriptionDialog = true;
    }



    //#endregion

    switchActivation(subscription: ISubscriptionPlanModel) {
        this.switchActivationSubscriptionDialog = true;
        this.subscription = { ...subscription };
    }

    declineActivation() {
        this.loadSubscriptions();
        this.initSubscriptionModel();
        this.initFormModels();
        this.ref.detectChanges();
        this.switchActivationSubscriptionDialog = false;
    }

    confirmtActivation() {
        this.toggleActivation();
    }

    toggleActivation() {
        if (this.subscription.isActive) {
            this.subs.add(
                this.subscriptionService
                    .dectivateSubscriptionPlan(this.subscription.id)
                    .pipe(
                        finalize(() => {
                            this.loadSubscriptions();
                            this.initSubscriptionModel();
                            this.initFormModels();
                            this.ref.detectChanges();
                            this.switchActivationSubscriptionDialog = false;
                        })
                    )

                    .subscribe(() => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Subscription Deactivated',
                            life: 3000,
                        });
                    })
            );
        } else {
            this.subs.add(
                this.subscriptionService
                    .activateSubscriptionPlan(this.subscription.id)

                    .pipe(
                        finalize(() => {
                            this.loadSubscriptions();
                            this.initSubscriptionModel();
                            this.initFormModels();
                            this.ref.detectChanges();
                            this.switchActivationSubscriptionDialog = false;
                        })
                    )
                    .subscribe(() => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Subscription Activated',
                            life: 3000,
                        });
                    })
            );
        }
    }

    //#endregion

    hideDialog() {
        this.subscriptionDialog = false;
        this.submitted = false;
    }

    saveSubscription() {
        this.submitted = true;

        this.subscriptionForm.value.trainingLessons = this.selectedLessons
            .filter((x) => {
                return x.children == null;
            })
            .map((x) => x.key);

        this.subscriptionForm.value.phishingTemplates = this.selectedTemplates
            .filter((x) => {
                return x.children == null;
            })
            .map((x) => x.key);

        if (this.subscriptionForm.valid) {
            if (this.subscriptionForm.value.id) {
                this.subscriptionService
                    .EditSubscriptionPlan(this.subscriptionForm.value)
                    .pipe(
                        finalize(() => {
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Successful',
                                detail: 'Subscription Updated',
                                life: 3000,
                            });

                            this.ref.detectChanges();
                            this.loadSubscriptions();
                        })
                    )
                    .subscribe({
                        next: (response) => {
                            this.selectedLessons = [];
                            this.selectedTemplates = [];
                            this.ref.detectChanges();
                            this.initSubscriptionModel();
                            this.subscriptionDialog = false;
                        },
                        error: (error) => {
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Error',
                                detail: 'Failed to update subscription',
                                life: 3000,
                            });
                        },
                    });
            } else {
                this.subscriptionService.createSubscriptionPlan(this.subscriptionForm.value).subscribe({
                    next: (response) => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Subscription Created',
                            life: 3000,
                        });

                        this.loadSubscriptions();
                        this.selectedLessons = [];
                        this.selectedTemplates = [];

                        this.ref.detectChanges();
                        this.initSubscriptionModel();
                        this.subscriptionDialog = false;
                    },
                    error: (error) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Failed to create subscription',
                            life: 3000,
                        });
                    },
                });
            }
        } else {
        }
    }

    updateSubscriptionInList(updatedSubscription: ISubscriptionPlanModel) {
        const index = this.subscriptions.findIndex((sub) => sub.id === updatedSubscription.id);
        if (index !== -1) {
            this.subscriptions[index] = updatedSubscription;
        }
    }

    initFormModels() {
        this.subscriptionForm = this.formBuilder.group({
            id: [''],
            title: ['', [Validators.required]],
            description: [''],
            durationType: [''],
            durationNumber: [''],
            userPrice: [0],
            numOfUsers: [0],
            activeDate: [new Date()],
            roles: [[]],
            phishingEmailTemplates: [[]],
            defaultRole: ['', Validators.required],
            reminders: [[]],
            languages: [[]],
            durationByDays: [365],
            trainingLessons: [[]],
            isActive: [true],
            isDeleted: [false],
            isFreePlan: [false],
            unlimitedPhishingSimulation: [false],
            awarenessVideos: [false],
            comicBooks: [false],
            knowledgeQuiz: [false],
            securityQuotesAndTips: [false],
            advancedReporting: [false],
            awarenessEmails: [false],
            wallpapers: [false],
            screenSavers: [false],
            games: [false],
            vrGamesAndTraining: [false],
            localization: [false],
            onSiteDeployment: [false],
            iawareMobileApp: [false],
            automatedTrainingCampaigns: [false],
            brandableContent: [false],
            phishAlertButton: [false],
            userProvisioningViaActiveDirectory: [false],
            technicalSupport: [false],
            smartGroups: [false],
            customizedPhishingExperience: [false],
        });
    }

    getSelectedRoles(event: DropdownChangeEvent) {
        this.selectedRoles = this.roles.filter((x) => {
            return event.value.includes(x.id);
        });
    }

    getSelectedTrainingLessons(event: DropdownChangeEvent) {
        this.selectedTrainingLessons = this.trainingLessons.filter((x) => {
            return event.value.includes(x.id);
        });
    }

    initSubscriptionModel() {
        this.subscription = {
            id: '',
            title: '',
            description: '',
            userPrice: 0,
            durationNumber: 0,
            durationType: 0,
            activeDate: new Date(),
            roles: [],
            phishingEmailTemplates: [],
            defaultRole: '',
            reminders: [],
            languages: [],
            trainingLessons: [],
            isActive: true,
            isFreePlan: false,
            unlimitedPhishingSimulation: false,
            awarenessVideos: false,
            comicBooks: false,
            knowledgeQuiz: false,
            securityQuotesAndTips: false,
            advancedReporting: false,
            awarenessEmails: false,
            wallpapers: false,
            screenSavers: false,
            games: false,
            vrGamesAndTraining: false,
            localization: false,
            onSiteDeployment: false,
            iawareMobileApp: false,
            automatedTrainingCampaigns: false,
            brandableContent: false,
            phishAlertButton: false,
            userProvisioningViaActiveDirectory: false,
            technicalSupport: false,
            smartGroups: false,
            customizedPhishingExperience: false,
        };
    }
    getDurationTypeName(durationTypeValue: number): string {
        return DurationTypeEnum[durationTypeValue]; // This will return 'Day', 'Month', or 'Year'
    }

    onActivetDateChange(event: any) {
        const now = new Date();
        const selectedStartDate = new Date(event.target.value);

        if (selectedStartDate < now) {
            // Update start date to be at least the current date
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');

            const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}`;

            this.subscriptionForm.patchValue({
                activeDate: formattedDate,
            });
        }
    }

    hasPermission(controlKey: string): boolean {
        return this.pagePermessions.some((p) => p.controlKey === controlKey);
    }

    ngOnDestroy(): void {
        this.subs.unsubscribe();
    }
}
