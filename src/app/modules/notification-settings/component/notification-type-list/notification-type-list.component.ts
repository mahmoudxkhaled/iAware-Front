import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ILanguageModel } from 'src/app/modules/language/models/ILanguageModel';
import { finalize, Subscription, switchMap } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MenuItem, MessageService, SelectItem } from 'primeng/api';
import { TrainingLessonService } from 'src/app/modules/security-training/services/training-lesson.service';
import { NavigationEnd, Router } from '@angular/router';
import { INotificationType } from '../../models/notification-settings';
import { NotificationSettingsService } from '../../services/notification-settings.service';
import { Table } from 'primeng/table';
import { IAspNetPageItemModel } from 'src/app/modules/page-management/models/IAspNetPageItemModel';
import { PermessionsService } from 'src/app/core/Services/permessions.service';
import { constants } from 'src/app/core/constatnts/constatnts';
import { TranslationService } from 'src/app/core/Services/translation.service';
import { TableLoadingService } from 'src/app/core/Services/table-loading.service';
import { IPaginationModel } from 'src/app/core/Dtos/IPaginationModel';
@Component({
    selector: 'app-notification-type-list',
    templateUrl: './notification-type-list.component.html',
    styleUrl: './notification-type-list.component.scss',
})
export class NotificationTypeListComponent implements OnInit, OnDestroy {
    tableLoadingSpinner: boolean = true;

    pagePermessions: IAspNetPageItemModel[] = [];
    actions = constants.pageActions;
    editNotificationTypeDialog: boolean = false;
    addNotificationTypeDialog: boolean = false;
    deletionNotificationTypeDialog: boolean = false;
    switchActivationNotificationTypeDialog: boolean = false;
    submitted: boolean = false;
    defaultLanguage: ILanguageModel[] = [];
    notificationTypes: INotificationType[] = [];
    notificationType: INotificationType;
    selectedLanguage: ILanguageModel;
    subs: Subscription = new Subscription();
    countOfActiveLanguages: Number;
    editNotificationTypeForm: FormGroup;
    addNotificationTypeForm: FormGroup;
    defaultLanguageId: any;
    openRedirectPageUrlDialog: boolean = false;
    icons: { label: string; value: string }[] = [];

    selectedNotificationLogo: File | null = null;
    selectetCategoryImage: File | null = null;

    imageUrl: string = '../../../../../assets/media/upload-photo.jpg';
    menuItems: MenuItem[] = [];
    displayContentType: string = '';
    sortField: string = '';
    constructor(
        private trainingServ: TrainingLessonService,
        private notifServ: NotificationSettingsService,
        private messageService: MessageService,
        private formBuilder: FormBuilder,
        private router: Router,
        private ref: ChangeDetectorRef,
        private permessionService: PermessionsService,
        private translate: TranslationService,
        private tableLoadingService: TableLoadingService
    ) {
        this.icons = [
            'pi-align-center',
            'pi-align-justify',
            'pi-align-left',
            'pi-align-right',
            'pi-amazon',
            'pi-android',
            'pi-angle-double-down',
            'pi-angle-double-left',
            'pi-angle-double-right',
            'pi-angle-double-up',
            'pi-angle-down',
            'pi-angle-left',
            'pi-angle-right',
            'pi-angle-up',
            'pi-apple',
            'pi-arrow-circle-down',
            'pi-arrow-circle-left',
            'pi-arrow-circle-right',
            'pi-arrow-circle-up',
            'pi-arrow-down',
            'pi-arrow-left',
            'pi-arrow-right',
            'pi-arrow-up',
            'pi-backward',
            'pi-ban',
            'pi-bars',
            'pi-bell',
            'pi-book',
            'pi-bookmark',
            'pi-briefcase',
            'pi-building',
            'pi-calendar-minus',
            'pi-calendar-plus',
            'pi-calendar-times',
            'pi-calendar',
            'pi-camera',
            'pi-caret-down',
            'pi-caret-left',
            'pi-caret-right',
            'pi-caret-up',
            'pi-chart-bar',
            'pi-chart-line',
            'pi-chart-pie',
            'pi-check-circle',
            'pi-check',
            'pi-chevron-circle-down',
            'pi-chevron-circle-left',
            'pi-chevron-circle-right',
            'pi-chevron-circle-up',
            'pi-chevron-down',
            'pi-chevron-left',
            'pi-chevron-right',
            'pi-chevron-up',
            'pi-clock',
            'pi-clone',
            'pi-cloud-download',
            'pi-cloud-upload',
            'pi-cloud',
            'pi-cog',
            'pi-comment',
            'pi-comments',
            'pi-compass',
            'pi-copy',
            'pi-credit-card',
            'pi-desktop',
            'pi-directions',
            'pi-dollar',
            'pi-download',
            'pi-eject',
            'pi-ellipsis-h',
            'pi-ellipsis-v',
            'pi-envelope',
            'pi-euro',
            'pi-exclamation-circle',
            'pi-exclamation-triangle',
            'pi-external-link',
            'pi-eye-slash',
            'pi-eye',
            'pi-facebook',
            'pi-fast-backward',
            'pi-fast-forward',
            'pi-file-excel',
            'pi-file-pdf',
            'pi-file',
            'pi-filter',
            'pi-filter-slash',
            'pi-flag',
            'pi-folder-open',
            'pi-folder',
            'pi-forward',
            'pi-github',
            'pi-globe',
            'pi-google',
            'pi-heart',
            'pi-history',
            'pi-home',
            'pi-id-card',
            'pi-image',
            'pi-images',
            'pi-inbox',
            'pi-info-circle',
            'pi-info',
            'pi-key',
            'pi-link',
            'pi-list',
            'pi-lock-open',
            'pi-lock',
            'pi-map',
            'pi-map-marker',
            'pi-microphone',
            'pi-minus-circle',
            'pi-minus',
            'pi-mobile',
            'pi-money-bill',
            'pi-pause',
            'pi-paypal',
            'pi-pencil',
            'pi-percent',
            'pi-phone',
            'pi-play',
            'pi-plus-circle',
            'pi-plus',
            'pi-power-off',
            'pi-print',
            'pi-question-circle',
            'pi-question',
            'pi-reddit',
            'pi-refresh',
            'pi-replay',
            'pi-save',
            'pi-search-minus',
            'pi-search-plus',
            'pi-search',
            'pi-send',
            'pi-share-alt',
            'pi-shield',
            'pi-shopping-cart',
            'pi-sign-in',
            'pi-sign-out',
            'pi-sitemap',
            'pi-slack',
            'pi-sliders-h',
            'pi-sliders-v',
            'pi-sort-alpha-alt-down',
            'pi-sort-alpha-alt-up',
            'pi-sort-alpha-down',
            'pi-sort-alpha-up',
            'pi-sort-alt',
            'pi-sort-alt-slash',
            'pi-sort-amount-down-alt',
            'pi-sort-amount-down',
            'pi-sort-amount-up-alt',
            'pi-sort-amount-up',
            'pi-sort-down',
            'pi-sort-numeric-alt-down',
            'pi-sort-numeric-alt-up',
            'pi-sort-numeric-down',
            'pi-sort-numeric-up',
            'pi-sort-up',
            'pi-spinner',
            'pi-star-o',
            'pi-star',
            'pi-step-backward-alt',
            'pi-step-backward',
            'pi-step-forward-alt',
            'pi-step-forward',
            'pi-stop-circle',
            'pi-stop',
            'pi-sun',
            'pi-sync',
            'pi-table',
            'pi-tablet',
            'pi-tag',
            'pi-tags',
            'pi-th-large',
            'pi-thumbs-down',
            'pi-thumbs-up',
            'pi-ticket',
            'pi-times-circle',
            'pi-times',
            'pi-trash',
            'pi-twitter',
            'pi-undo',
            'pi-unlock',
            'pi-upload',
            'pi-user-edit',
            'pi-user-minus',
            'pi-user-plus',
            'pi-user',
            'pi-users',
            'pi-video',
            'pi-vimeo',
            'pi-volume-down',
            'pi-volume-off',
            'pi-volume-up',
            'pi-wallet',
            'pi-wifi',
            'pi-window-maximize',
            'pi-window-minimize',
            'pi-youtube',
        ].map((icon) => ({ label: icon, value: icon }));

        this.pagePermessions = this.permessionService.getPagePermessions(constants.pages.notificationSettings);
    }

    ngOnInit() {
        this.tableLoadingService.loading$.subscribe((isLoading) => {
            this.tableLoadingSpinner = isLoading;
        });

        this.menuItems = [];
        const editBtn = {
            label: this.translate.getInstant('shared.actions.edit'),
            icon: 'pi pi-fw pi-pencil',
            command: () => this.editNotificationType(this.notificationType),
        };
        const deleteBtn = {
            label: this.translate.getInstant('shared.actions.delete'),
            icon: 'pi pi-fw pi-trash',
            command: () => this.deleteNotificationType(this.notificationType),
        };

        if (this.hasPermission(this.actions.edit)) {
            this.menuItems.push(editBtn);
        }
        if (this.hasPermission(this.actions.delete)) {
            this.menuItems.push(deleteBtn);
        }

        this.initNotificationType();
        this.initNotificationTypeForm();

        this.subs.add(
            this.trainingServ.getCountOfActiveLanguage().subscribe((r) => {
                this.countOfActiveLanguages = r;
            })
        );

        this.subs.add(
            this.trainingServ.GetDefaultLanguage().subscribe((res) => {
                this.defaultLanguage = [res];
            })
        );
    }

    assigneCurrentSelect(notificationType: INotificationType) {
        this.notificationType = notificationType;
    }
    totalRecords: number = 0;

    loadNotificationTypes() {
        this.tableLoadingService.show();

        this.subs.add(
            this.notifServ.getAllNotificationTypesPagination(this.notificationPagiantion).subscribe((data) => {
                this.notificationTypes = data.data;
                console.log('notificationTypes', this.notificationTypes);
                this.totalRecords = data.totalRecords;

                this.ref.detectChanges();
                this.tableLoadingService.hide();
            })
        );
    }

    notificationPagiantion: IPaginationModel = {
        page: 0,
        size: 10,
        searchQuery: ''
    };

    lazyLoadNotificationTypes(event: any) {
        this.notificationPagiantion.searchQuery = event.globalFilter || '';
        this.notificationPagiantion.page = Math.floor(event.first / event.rows);
        this.notificationPagiantion.size = event.rows;
        this.loadNotificationTypes();
        this.scrollToTop();
    }

    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    //#region Edit Training Lesson

    editNotificationType(notificationType: INotificationType) {
        this.selectedNotificationLogo = null;
        this.selectetCategoryImage = null;
        this.loadNotificationTypes();

        this.notificationType = { ...notificationType };
        this.imageUrl = this.notificationType.notificationLogoUrl;

        this.editNotificationTypeForm.patchValue(notificationType);
        this.editNotificationTypeDialog = true;
    }

    declineEditNotificationType() {
        this.submitted = false;
        this.initNotificationType();
        this.initNotificationTypeForm();
        this.editNotificationTypeDialog = false;
    }

    saveEditnotificationType() {
        this.submitted = true;

        if (this.editNotificationTypeForm.valid) {
            const formData = new FormData();
            formData.append('id', this.editNotificationTypeForm.value.id);
            formData.append('Title', this.editNotificationTypeForm.value.title);
            formData.append('RedirectPageUrl', this.editNotificationTypeForm.value.redirectPageUrl);
            formData.append('NotificationIcon', this.editNotificationTypeForm.value.notificationIcon);
            formData.append('NotificationParameterKey1', this.editNotificationTypeForm.value.notificationParameterKey1);
            formData.append('NotificationParameterKey2', this.editNotificationTypeForm.value.notificationParameterKey2);

            const notificationLogoFile = this.selectedNotificationLogo;
            if (notificationLogoFile) {
                formData.append('NotificationLogoUrl', notificationLogoFile, notificationLogoFile.name);
            }

            this.subs.add(
                this.notifServ
                    .editNotificationType(formData)
                    .pipe(
                        switchMap(() => {
                            return this.notifServ.getAllNotificationTypes();
                        }),
                        finalize(() => {
                            this.loadNotificationTypes();
                            this.ref.detectChanges();
                            this.initNotificationType();
                            this.initNotificationTypeForm();
                            this.subs.add(
                                this.router.events.subscribe((event) => {
                                    if (event instanceof NavigationEnd) {
                                        this.router.navigated = false;
                                    }
                                })
                            );
                        })
                    )

                    .subscribe({
                        next: (types) => {
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Successful',
                                detail: 'Notification Type Updated',
                                life: 3000,
                            });

                            this.notificationTypes = types;
                            this.editNotificationTypeDialog = false;
                        },
                        error: () => {
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Error',
                                detail: 'Failed to update Notification Type',
                                life: 3000,
                            });
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

    saveAddNotificationType() {
        this.submitted = true;
        if (this.addNotificationTypeForm.valid) {
            const formData = new FormData();
            formData.append('Id', this.addNotificationTypeForm.value.id);
            formData.append('Title', this.addNotificationTypeForm.value.title);
            formData.append('LanguageId', this.addNotificationTypeForm.value.languageId);
            formData.append('NotificationMessage', this.addNotificationTypeForm.value.notificationMessage);
            formData.append('RedirectPageUrl', this.addNotificationTypeForm.value.redirectPageUrl);
            formData.append('NotificationIcon', this.addNotificationTypeForm.value.notificationIcon);
            formData.append('NotificationParameterKey1', this.addNotificationTypeForm.value.notificationParameterKey1);
            formData.append('NotificationParameterKey2', this.addNotificationTypeForm.value.notificationParameterKey2);

            const notificationLogoFile = this.selectedNotificationLogo;
            if (notificationLogoFile) {
                formData.append('NotificationLogoUrl', notificationLogoFile, notificationLogoFile.name);
            }
            this.subs.add(
                this.notifServ.addNotificationType(formData).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Notification Type Updated',
                            life: 3000,
                        });
                        this.loadNotificationTypes();
                        this.ref.detectChanges();
                        this.initNotificationType();
                        this.initNotificationTypeForm();
                        this.addNotificationTypeDialog = false;
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

    declineAddNotificationTypeDialog() {
        this.submitted = false;
        this.initNotificationType();
        this.initNotificationTypeForm();
        this.addNotificationTypeDialog = false;
    }

    //#endregion

    //#region Deletion

    deleteNotificationType(notificationType: INotificationType) {
        this.deletionNotificationTypeDialog = true;
        this.notificationType = { ...notificationType };
    }
    confirmDeletion() {
        this.deletionNotificationTypeDialog = false;
        this.subs.add(
            this.notifServ.deleteNotificationTypeById(this.notificationType.id).subscribe({
                next: (response) => {
                    if (response.code !== 406) {
                        this.messageService.add({
                            severity: 'info',
                            summary: 'Info',
                            detail: response.message,
                            life: 3000,
                        });
                        this.loadNotificationTypes();
                        this.ref.detectChanges();
                    } else {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Cannot delete because there are notification type languages associated with this notification type',
                            life: 5000,
                        });
                        this.loadNotificationTypes();
                        this.ref.detectChanges();
                    }
                },
            })
        );
        this.initNotificationType();
        this.deletionNotificationTypeDialog = false;
    }
    declineDeletion() {
        this.deletionNotificationTypeDialog = false;
        this.initNotificationType();
        this.loadNotificationTypes();
    }

    //#endregion

    //#region Activation
    switchActivation(notificationType: INotificationType) {
        this.switchActivationNotificationTypeDialog = true;
        this.notificationType = { ...notificationType };
    }
    declineActivation() {
        this.switchActivationNotificationTypeDialog = false;
        this.initNotificationType();
        this.loadNotificationTypes();
    }
    confirmtActivation() {
        this.toggleActivation(this.notificationType);
    }
    toggleActivation(notificationType: INotificationType) {
        if (notificationType.isActive) {
            this.subs.add(
                this.notifServ.deActiveNotificationTypeById(notificationType.id).subscribe((result) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Notification Type Deactivated',
                        life: 3000,
                    });
                    this.loadNotificationTypes();
                    this.ref.detectChanges();
                })
            );
        } else {
            this.subs.add(
                this.notifServ.activeNotificationTypeById(notificationType.id).subscribe((result) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Notification Type Activated',
                        life: 3000,
                    });
                    this.loadNotificationTypes();
                    this.ref.detectChanges();
                })
            );
        }
        this.initNotificationType();
        this.switchActivationNotificationTypeDialog = false;
    }

    //#endregion

    navigateToNotificationTypeLanguages(NotificationTypeId: string) {
        this.router.navigate(['phishing-category', NotificationTypeId]);
    }
    initNotificationType() {
        this.notificationType = {
            id: '',
            notificationTypeEnumId: 0,
            title: '',
            notificationLogoUrl: '',
            notificationIcon: '',
            notificationMessage: '',
            notificationParameterKey1: '',
            notificationParameterKey2: '',
            redirectPageUrl: '',
            languageId: '',
            notificationTypeLanguages: [],
        };
    }

    initNotificationTypeForm() {
        this.editNotificationTypeForm = this.formBuilder.group({
            id: [''],
            title: [''],
            notificationLogoUrl: [''],
            notificationIcon: [''],
            notificationParameterKey1: [''],
            notificationParameterKey2: [''],
            redirectPageUrl: [''],
        });

        this.addNotificationTypeForm = this.formBuilder.group({
            id: [''],
            title: [''],
            notificationLogoUrl: [''],
            notificationIcon: [''],
            notificationMessage: [''],
            notificationParameterKey1: [''],
            notificationParameterKey2: [''],
            redirectPageUrl: [''],
            languageId: [''],
        });
    }

    CreateNotificationType() {
        this.addNotificationTypeDialog = true;
        this.initNotificationTypeForm();
        this.initNotificationType();
        this.imageUrl = '../../../../../assets/media/upload-photo.jpg';
        this.selectedNotificationLogo = null;
        this.selectetCategoryImage = null;
    }

    onUploadNotificationLogoClick() {
        const fileInput = document.getElementById('NotificationLogo') as HTMLInputElement;
        fileInput.click();
    }

    onNotificationLogoSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length) {
            this.selectedNotificationLogo = input.files[0];
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.imageUrl = e.target.result;
                this.ref.detectChanges();
            };
            reader.readAsDataURL(this.selectedNotificationLogo);
        }
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    openContent(NotificationTypeLanguage: INotificationType, contentType: string) {
        this.notificationType = { ...NotificationTypeLanguage };

        this.displayContentType = contentType;
        this.openRedirectPageUrlDialog = true;
    }

    hideRedirectPageUrlDialog() {
        this.openRedirectPageUrlDialog = false;
    }

    hasPermission(controlKey: string): boolean {
        return this.pagePermessions.some((p) => p.controlKey === controlKey);
    }

    ngOnDestroy() {
        this.subs.unsubscribe();
    }
}
