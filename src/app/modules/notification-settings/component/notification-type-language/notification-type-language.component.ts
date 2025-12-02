import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, ConfirmationService, MenuItem } from 'primeng/api';
import { Subscription, finalize, switchMap } from 'rxjs';

import { Table } from 'primeng/table';
import { ILanguageModel } from 'src/app/modules/language/models/ILanguageModel';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { ITrainingCategoryModel } from 'src/app/modules/security-training/models/ISecurityTrainingCategoryModel';
import { TrainingLessonService } from 'src/app/modules/security-training/services/training-lesson.service';
import { Editor } from 'ngx-editor';
import { INotificationTypeLanguage } from '../../models/notification-settings';
import { NotificationSettingsService } from '../../services/notification-settings.service';
import { TranslationService } from 'src/app/core/Services/translation.service';
import { TableLoadingService } from 'src/app/core/Services/table-loading.service';
import { DropdownListDataSourceService } from 'src/app/core/Services/dropdown-list-data-source.service';
@Component({
    selector: 'app-notification-type-language',
    templateUrl: './notification-type-language.component.html',
    styleUrl: './notification-type-language.component.scss',
})
export class NotificationTypeLanguageComponent implements OnInit, AfterViewInit {
    tableLoadingSpinner: boolean = true;

    notificationTypeLanguageDialog: boolean = false;
    deletionNotificationTypeLanguageDialog: boolean = false;
    switchActivationNotificationTypeLanguageDialog: boolean = false;
    submitted: boolean = false;
    notificationTypeLanguages: INotificationTypeLanguage[];
    defaultLanguage: ILanguageModel[];
    selectedLanguage: ILanguageModel;
    languages: ILanguageModel[] = [];
    notificationTypeLanguage: INotificationTypeLanguage;
    notificationTypeId: string;
    defaultLanguageId: any;
    editor: Editor;
    selectedNotificationLogo: File | null = null;
    imageUrl: string = '../../../../../assets/media/upload-photo.jpg';

    openNotificationMessageDialog: boolean = false;

    subs: Subscription = new Subscription();

    notificationTypeLanguageForm: FormGroup;
    activeLanguage: ILanguageModel[] = [];
    menuItems: MenuItem[] = [];
    constructor(
        private trainingServ: TrainingLessonService,
        private notifServ: NotificationSettingsService,
        private messageService: MessageService,
        private formBuilder: FormBuilder,
        private router: Router,
        private ref: ChangeDetectorRef,
        private route: ActivatedRoute,
        private translate: TranslationService,
        private tableLoadingService: TableLoadingService,
        private dropdownListDataSourceService: DropdownListDataSourceService
    ) {}

    ngAfterViewInit(): void {
        const element = document.getElementById('');
    }

    ngOnInit() {
        this.tableLoadingService.loading$.subscribe((isLoading) => {
            this.tableLoadingSpinner = isLoading;
        });

        this.editor = new Editor();
        this.menuItems = [];

        const editBtn = {
            label: this.translate.getInstant('shared.actions.edit'),
            icon: 'pi pi-fw pi-pencil',
            command: () => this.editNotificationTypeLanguage(this.notificationTypeLanguage),
        };

        const deleteBtn = {
            label: this.translate.getInstant('shared.actions.delete'),
            icon: 'pi pi-fw pi-trash',
            id: 'deleteBTN',
            command: () => this.deleteNotificationTypeLanguage(this.notificationTypeLanguage),
        };

        this.route.params.subscribe((params) => {
            const id = params['id'];
            this.notificationTypeId = id;
            this.loadNotificationTypeLanguage(id);
        });
        this.loadNotificationTypeLanguage(this.notificationTypeId);
        this.initNotificationTypeLanguage();
        this.initNotificationTypeLanguageForm();

        this.subs.add(
            this.trainingServ.GetDefaultLanguage().subscribe((res) => {
                this.defaultLanguageId = res.id;
            })
        );

        this.subs.add(
            this.trainingServ.GetAllLanguages().subscribe((res) => {
                this.languages = res;
            })
        );
    }

    assigneCurrentSelect(notificationTypeLanguage: INotificationTypeLanguage) {
        this.notificationTypeLanguage = notificationTypeLanguage;
    }

    isDefaultLanguage(cat: any): boolean {
        return cat.languageId === this.defaultLanguageId;
    }

    loadNotificationTypeLanguage(id: string) {
        this.tableLoadingService.show();
        this.subs.add(
            this.notifServ.getNotificationTypeLangaugesByNotificationTypeId(id).subscribe((r) => {
                this.notificationTypeLanguages = r;
                this.tableLoadingService.hide();
            })
        );
    }

    CreateNotificationType() {
        this.notificationTypeLanguageDialog = true;
        this.initNotificationTypeLanguageForm();
        this.initNotificationTypeLanguage();
        this.imageUrl = '../../../../../assets/media/upload-photo.jpg';
        this.selectedNotificationLogo = null;
        this.getActiveLanguageForAddForm();
    }

    getActiveLanguageForAddForm() {
        this.dropdownListDataSourceService.getActiveLanguages().subscribe({
            next: (res) => {
                this.activeLanguage = res.data;
                const p = this.notificationTypeLanguages.map((c) => c.languageId);
                this.activeLanguage = this.activeLanguage.filter((c) => !p.includes(c.id));
            },
            error: (err) => {},
        });
    }

    getActiveLanguageForEditForm() {
        this.dropdownListDataSourceService.getActiveLanguages().subscribe({
            next: (res) => {
                this.activeLanguage = res.data;

                const currentLanguage = this.activeLanguage.find(
                    (lang) => lang.id === this.notificationTypeLanguage.languageId
                );

                if (currentLanguage) {
                    const p = this.notificationTypeLanguages.map((c) => c.languageId);
                    this.activeLanguage = this.activeLanguage.filter((c) => !p.includes(c.id));
                    this.activeLanguage = [...this.activeLanguage, currentLanguage];
                }
                if (this.isEnglishSelected()) {
                    this.notificationTypeLanguageForm.get('languageId')?.disable();
                } else {
                    this.notificationTypeLanguageForm.get('languageId')?.enable();
                }
            },
            error: (err) => {},
        });
    }
    //#region Edit Training Lesson

    editNotificationTypeLanguage(notificationTypeLanguage: INotificationTypeLanguage) {
        this.notificationTypeLanguage = { ...notificationTypeLanguage };

        this.getActiveLanguageForEditForm();
        // this.imageUrl = this.notificationTypeLanguage.categoryBannerUrl;

        this.notificationTypeLanguageForm.patchValue(notificationTypeLanguage);

        this.notificationTypeLanguageDialog = true;
    }

    isEnglishSelected(): boolean {
        const selectedLanguageId = this.notificationTypeLanguageForm.get('languageId')?.value;
        const selectedLanguage = this.activeLanguage.find((lang) => lang.id === selectedLanguageId);
        return selectedLanguage?.name.toLowerCase() === 'english';
    }

    declineEditNotificationTypeLanguage() {
        this.submitted = false;
        this.initNotificationTypeLanguage();
        this.initNotificationTypeLanguageForm();
        this.notificationTypeLanguageDialog = false;
    }

    saveEditNotificationTypeLanguage() {
        this.submitted = true;
        if (this.notificationTypeLanguageForm.valid) {
            if (this.notificationTypeLanguageForm.value.id && this.notificationTypeLanguageForm.value.id !== '') {
                const formData = new FormData();
                formData.append('Id', this.notificationTypeLanguageForm.value.id);
                formData.append('Title', this.notificationTypeLanguageForm.value.title);
                formData.append('NotificationMessage', this.notificationTypeLanguageForm.value.notificationMessage);
                formData.append('LanguageId', this.notificationTypeLanguageForm.value.languageId);

                this.subs.add(
                    this.notifServ
                        .editNotificationTypeLanguage(formData)
                        .pipe(
                            switchMap(() => {
                                return this.notifServ.getNotificationTypeLangaugesByNotificationTypeId(
                                    this.notificationTypeId
                                );
                            }),
                            finalize(() => {
                                this.loadNotificationTypeLanguage(this.notificationTypeId);
                                this.ref.detectChanges();
                                this.initNotificationTypeLanguage();
                                this.initNotificationTypeLanguageForm();
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
                            next: () => {
                                this.messageService.add({
                                    severity: 'success',
                                    summary: 'Successful',
                                    detail: 'Notification Type Updated',
                                    life: 3000,
                                });
                                this.notificationTypeLanguageDialog = false;
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
                const formData = new FormData();
                formData.append('Title', this.notificationTypeLanguageForm.value.title);
                formData.append('NotificationTypeId', this.notificationTypeId);
                formData.append('NotificationMessage', this.notificationTypeLanguageForm.value.notificationMessage);
                formData.append('LanguageId', this.notificationTypeLanguageForm.value.languageId);

                this.subs.add(
                    this.notifServ.addNotificationTypeLanguage(formData).subscribe({
                        next: () => {
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Successful',
                                detail: 'Notification Type language Updated',
                                life: 3000,
                            });
                            this.loadNotificationTypeLanguage(this.notificationTypeId);
                            this.ref.detectChanges();
                            this.initNotificationTypeLanguage();
                            this.initNotificationTypeLanguageForm();
                            this.notificationTypeLanguageDialog = false;
                        },
                    })
                );
            }
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

    //#region Deletion

    deleteNotificationTypeLanguage(notificationTypeLanguage: INotificationTypeLanguage) {
        this.deletionNotificationTypeLanguageDialog = true;
        this.notificationTypeLanguage = { ...notificationTypeLanguage };
    }
    confirmDeletion() {
        this.deletionNotificationTypeLanguageDialog = false;
        this.subs.add(
            this.notifServ.deleteNotificationTypeLangaugeById(this.notificationTypeLanguage.id).subscribe({
                next: (response) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: response.message,
                        life: 3000,
                    });
                    this.loadNotificationTypeLanguage(this.notificationTypeId);

                    this.deletionNotificationTypeLanguageDialog = false;
                },
                error: (err) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to delete security training',
                        life: 3000,
                    });
                },
            })
        );
        this.notificationTypeLanguage = {} as INotificationTypeLanguage;
        this.deletionNotificationTypeLanguageDialog = false;
    }
    declineDeletion() {
        this.deletionNotificationTypeLanguageDialog = false;
        this.notificationTypeLanguage = {} as INotificationTypeLanguage;
        this.loadNotificationTypeLanguage(this.notificationTypeId);
    }

    //#endregion

    //#region Activation
    switchActivation(notificationTypeLanguage: INotificationTypeLanguage) {
        this.switchActivationNotificationTypeLanguageDialog = true;
        this.notificationTypeLanguage = { ...notificationTypeLanguage };
    }
    declineActivation() {
        this.switchActivationNotificationTypeLanguageDialog = false;
        this.initNotificationTypeLanguage();
        this.ref.detectChanges();

        this.loadNotificationTypeLanguage(this.notificationTypeId);
    }
    confirmtActivation() {
        this.toggleActivation(this.notificationTypeLanguage);
    }
    toggleActivation(NotificationTypeLanguage: INotificationTypeLanguage) {
        if (NotificationTypeLanguage.isActive) {
            this.subs.add(
                this.notifServ.deActiveNotificationTypeLanguage(NotificationTypeLanguage.id).subscribe((result) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Notification Type Deactivated',
                        life: 3000,
                    });
                    this.loadNotificationTypeLanguage(this.notificationTypeId);
                    this.ref.detectChanges();
                })
            );
        } else {
            this.subs.add(
                this.notifServ.activeNotificationTypeLanguageById(NotificationTypeLanguage.id).subscribe((result) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Security Training Activated',
                        life: 3000,
                    });
                    this.loadNotificationTypeLanguage(this.notificationTypeId);
                    this.ref.detectChanges();
                })
            );
        }
        this.initNotificationTypeLanguage();
        this.switchActivationNotificationTypeLanguageDialog = false;
    }

    //#endregion

    initNotificationTypeLanguageForm() {
        this.notificationTypeLanguageForm = this.formBuilder.group({
            id: [''],
            title: [''],
            notificationMessage: [''],
            notificationTypeId: [''],
            languageId: [''],
        });
    }

    initNotificationTypeLanguage() {
        this.notificationTypeLanguage = {
            id: '',
            title: '',
            languageId: '',
            notificationTypeId: '',
            isActive: true,
            notificationMessage: '',
        };
    }

    onUploadCategoryBannerClick() {
        const fileInput = document.getElementById('NotificationLogo') as HTMLInputElement;
        fileInput.click();
    }

    onCategoryBannerSelected(event: Event): void {
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

    displayContentType: string = '';
    openContent(NotificationTypeLanguage: INotificationTypeLanguage, contentType: string) {
        this.notificationTypeLanguage = { ...NotificationTypeLanguage };

        this.displayContentType = contentType;
        this.openNotificationMessageDialog = true;
    }
    hideCategoryPageContentHtmlDialog() {
        this.openNotificationMessageDialog = false;
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    ngOnDestroy(): void {
        this.subs.unsubscribe();
    }
}
