import { AfterViewChecked, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, ConfirmationService, MenuItem } from 'primeng/api';
import { Subscription, finalize, switchMap } from 'rxjs';

import { Table } from 'primeng/table';
import { ILanguageModel } from 'src/app/modules/language/models/ILanguageModel';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { ITrainingCategoryModel } from 'src/app/modules/security-training/models/ISecurityTrainingCategoryModel';
import { IPhishingCategoryLanguage } from '../../models/IPhishingCategoryLanguage';
import { IPhishingCategory } from '../../models/IPhishingCategory';
import { PhishingCategoryService } from '../../services/phishing-category.service';
import { TrainingLessonService } from 'src/app/modules/security-training/services/training-lesson.service';
import { Editor } from 'ngx-editor';
import { TranslationService } from 'src/app/core/Services/translation.service';
import { TableLoadingService } from 'src/app/core/Services/table-loading.service';
import { UserService } from 'src/app/modules/user/services/user.service';
import { GetUser } from 'src/app/layout/app-menuProfile/app.menuprofile.component';
import { DropdownListDataSourceService } from 'src/app/core/Services/dropdown-list-data-source.service';
interface expandedRows {
    [key: string]: boolean;
}

@Component({
    selector: 'app-phishing-category-language-list',
    templateUrl: './phishing-category-language-list.component.html',
    styleUrl: './phishing-category-language-list.component.scss',
})
export class PhishingCategoryLanguageListComponent implements OnInit, AfterViewChecked {
    tableLoadingSpinner: boolean = true;

    addpPishingCategoryLanguageDialog: boolean = false;
    editPhishingCategoryLanguageDialog: boolean = false;
    deletionPhishingCategoryLanguageDialog: boolean = false;
    switchActivationPhishingCategoryLanguageDialog: boolean = false;
    submitted: boolean = false;
    phishingCategoryLanguages: IPhishingCategoryLanguage[];
    defaultLanguage: ILanguageModel[];
    selectedLanguage: ILanguageModel;
    languages: ILanguageModel[] = [];
    phishingCategoryLanguage: IPhishingCategoryLanguage;
    phishingCategoryId: string;
    defaultLanguageId: any;
    editor: Editor;
    selectedCategoryBanner: File | null = null;
    selectedCategoryImage: File | null = null;
    selectedCategoryBannerForAdd: File | null = null;
    imageUrl: string = '../../../../../assets/media/upload-photo.jpg';
    openCategoryPageContentHtmlDialog: boolean = false;
    subs: Subscription = new Subscription();
    editPhishingCategoryLanguageForm: FormGroup;
    addPhishingCategoryLanguageForm: FormGroup;
    activeLanguage: ILanguageModel[] = [];
    ownerMenuItems: MenuItem[] = [];
    normalMenuItems: MenuItem[] = [];
    isIAwareTeamUser: boolean = false;
    displayContentType: string = '';
    user: GetUser;
    defaultPhishingCategories: boolean = false;
    expandedRows: expandedRows = {};

    constructor(
        private trainingServ: TrainingLessonService,
        private phishServ: PhishingCategoryService,
        private messageService: MessageService,
        private formBuilder: FormBuilder,
        private router: Router,
        private ref: ChangeDetectorRef,
        private route: ActivatedRoute,
        private translate: TranslationService,
        private tableLoadingService: TableLoadingService,
        private userServ: UserService,
        private dropdownListDataSourceService: DropdownListDataSourceService
    ) { }

    ngAfterViewChecked(): void {
        this.ref.detectChanges();
    }

    ngOnInit() {
        this.getUserDetails();

        this.tableLoadingService.loading$.subscribe((isLoading) => {
            this.tableLoadingSpinner = isLoading;
        });

        this.editor = new Editor();

        this.route.params.subscribe((params) => {
            const id = params['id'];
            this.defaultPhishingCategories = params['where'] && params['where']  === 'defaultPhishingCategories';
            this.phishingCategoryId = id;
            // this.loadPhishingCategoryLanguage(id);
        });
        this.subs.add(
            this.trainingServ.GetDefaultLanguage().subscribe((res) => {
                this.defaultLanguageId = res.id;
            })
        );
        this.loadPhishingCategoryLanguage(this.phishingCategoryId);
        this.initPhishingCategoryLanguageModel();
        this.initEditPhishingCategoryLanguageForm();

        this.subs.add(
            this.trainingServ.GetAllLanguages().subscribe((res) => {
                this.languages = res;
            })
        );

        const deafultBtn = {
            label: this.translate.getInstant('shared.actions.defaultInSystem'),
            icon: 'pi pi-fw pi-minus-circle',
            command: () => '',
        };

        const editBtn = {
            label: this.translate.getInstant('shared.actions.edit'),
            icon: 'pi pi-fw pi-pencil',
            command: () => this.editPhishingCategoryLanguage(this.phishingCategoryLanguage),
        };

        const deleteBtn = {
            label: this.translate.getInstant('shared.actions.delete'),
            icon: 'pi pi-fw pi-trash',
            command: () => this.deletePhishingCategoryLanguage(this.phishingCategoryLanguage),
        };



        this.ownerMenuItems = [];

        this.ownerMenuItems.push(editBtn);
        this.ownerMenuItems.push(deleteBtn);

        this.normalMenuItems = [];
        this.normalMenuItems.push(deafultBtn);
    }

    getUserDetails() {
        this.userServ.getUserDetails().subscribe((res) => {
            this.user = res.data;

            if (this.user.iAwareTeam) {
                this.isIAwareTeamUser = true;
            } else {
                this.isIAwareTeamUser = false;
            }
        });
    }

    assigneCurrentSelect(phishingCategorylanguage: IPhishingCategoryLanguage) {
        this.phishingCategoryLanguage = phishingCategorylanguage;
    }

    isDefaultLanguage(cat: any): boolean {
        return cat.languageId === this.defaultLanguageId;
    }

    loadPhishingCategoryLanguage(id: string) {
        this.tableLoadingService.show();
        this.subs.add(
            this.phishServ.getPhishingCategoryLangaugesByPhishingCategoryId(id).subscribe((r) => {
                this.phishingCategoryLanguages = r;
                this.tableLoadingService.hide();
            })
        );
    }

    CreatePhishingCategory() {
        this.addpPishingCategoryLanguageDialog = true;
        this.initAddPhishingCategoryLanguageForm();
        this.initPhishingCategoryLanguageModel();
        this.imageUrl = '../../../../../assets/media/upload-photo.jpg';
        this.selectedCategoryBannerForAdd = null;
        this.getActiveLanguageForAddForm();
    }

    getActiveLanguageForAddForm() {
        this.dropdownListDataSourceService.getActiveLanguages().subscribe({
            next: (res) => {
                this.activeLanguage = res.data;
                const p = this.phishingCategoryLanguages.map((c) => c.languageId);
                this.activeLanguage = this.activeLanguage.filter((c) => !p.includes(c.id));
            },
            error: (err) => { },
        });
    }

    getActiveLanguageForEditForm() {
        this.dropdownListDataSourceService.getActiveLanguages().subscribe({
            next: (res) => {
                this.activeLanguage = res.data;

                const currentLanguage = this.activeLanguage.find(
                    (lang) => lang.id === this.phishingCategoryLanguage.languageId
                );

                if (currentLanguage) {
                    const p = this.phishingCategoryLanguages.map((c) => c.languageId);
                    this.activeLanguage = this.activeLanguage.filter((c) => !p.includes(c.id));
                    this.activeLanguage = [...this.activeLanguage, currentLanguage];
                }
                if (this.isEnglishSelected()) {
                    this.editPhishingCategoryLanguageForm.get('languageId')?.disable();
                } else {
                    this.editPhishingCategoryLanguageForm.get('languageId')?.enable();
                }
            },
            error: (err) => { },
        });
    }
    //#region Edit Training Lesson

    editPhishingCategoryLanguage(phishingCategoryLanguage: IPhishingCategoryLanguage) {
        this.phishingCategoryLanguage = { ...phishingCategoryLanguage };
        this.getActiveLanguageForEditForm();
        this.imageUrl = this.phishingCategoryLanguage.categoryBannerUrl;
        this.editPhishingCategoryLanguageForm.patchValue(phishingCategoryLanguage);
        this.editPhishingCategoryLanguageDialog = true;
    }

    isEnglishSelected(): boolean {
        const selectedLanguageId = this.editPhishingCategoryLanguageForm.get('languageId')?.value;
        const selectedLanguage = this.activeLanguage.find((lang) => lang.id === selectedLanguageId);
        return selectedLanguage?.name.toLowerCase() === 'english';
    }

    declineEditPhishingCategoryLanguage() {
        this.submitted = false;
        this.initPhishingCategoryLanguageModel();
        this.initEditPhishingCategoryLanguageForm();
        this.editPhishingCategoryLanguageDialog = false;
    }

    saveEditPhishingCategoryLanguage() {
        this.submitted = true;
        if (this.editPhishingCategoryLanguageForm.valid) {
            const formData = new FormData();
            const formValues = this.editPhishingCategoryLanguageForm.getRawValue();

            formData.append('id', formValues.id);
            formData.append('name', formValues.name);
            formData.append('categoryDescription', formValues.categoryDescription);
            formData.append('categoryPageContentHtml', formValues.categoryPageContentHtml);
            formData.append('languageId', formValues.languageId);

            if (this.selectedCategoryBanner) {
                formData.append('categoryBannerUrl', this.selectedCategoryBanner, this.selectedCategoryBanner.name);
            }

            this.subs.add(
                this.phishServ
                    .editPhishingCategoryLangauge(formData)
                    .pipe(
                        switchMap(() => {
                            return this.phishServ.getPhishingCategoryLangaugesByPhishingCategoryId(
                                this.phishingCategoryId
                            );
                        }),
                        finalize(() => {
                            this.loadPhishingCategoryLanguage(this.phishingCategoryId);
                            this.ref.detectChanges();
                            this.initPhishingCategoryLanguageModel();
                            this.initEditPhishingCategoryLanguageForm();
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
                                detail: 'Phishing Category Updated',
                                life: 3000,
                            });
                            this.editPhishingCategoryLanguageDialog = false;
                        },
                        error: () => {
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Error',
                                detail: 'Failed to update Phishing Category',
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

    addPhishingCategoryLanguage() {
        this.submitted = true;
        if (this.addPhishingCategoryLanguageForm.valid) {
            const formData = new FormData();
            formData.append('id', this.addPhishingCategoryLanguageForm.value.id);

            formData.append('name', this.addPhishingCategoryLanguageForm.value.name);
            formData.append('categoryDescription', this.addPhishingCategoryLanguageForm.value.categoryDescription);
            formData.append(
                'categoryPageContentHtml',
                this.addPhishingCategoryLanguageForm.value.categoryPageContentHtml
            );
            formData.append('languageId', this.addPhishingCategoryLanguageForm.value.languageId);
            formData.append('phishingCategoryId', this.phishingCategoryId);
            const categoryBannerFile = this.selectedCategoryBannerForAdd;
            if (categoryBannerFile) {
                formData.append('categoryBannerUrl', categoryBannerFile, categoryBannerFile.name);
            }

            this.subs.add(
                this.phishServ
                    .addPhishingCategoryLangauge(formData)
                    .pipe(
                        switchMap(() => {
                            return this.phishServ.getPhishingCategoryLangaugesByPhishingCategoryId(
                                this.phishingCategoryId
                            );
                        }),
                        finalize(() => {
                            this.loadPhishingCategoryLanguage(this.phishingCategoryId);
                            this.ref.detectChanges();
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
                                detail: 'Phishing Category Updated',
                                life: 3000,
                            });
                            this.addpPishingCategoryLanguageDialog = false;
                        },
                        error: () => {
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Error',
                                detail: 'Failed to update Phishing Category',
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

    //#endregion

    //#region Deletion

    deletePhishingCategoryLanguage(phishingCategoryLanguage: IPhishingCategoryLanguage) {
        this.deletionPhishingCategoryLanguageDialog = true;
        this.phishingCategoryLanguage = { ...phishingCategoryLanguage };
    }

    confirmDeletion() {
        this.deletionPhishingCategoryLanguageDialog = false;
        this.subs.add(
            this.phishServ.deletePhishingCategoryLangaugeById(this.phishingCategoryLanguage.id).subscribe({
                next: (response) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: response.message,
                        life: 3000,
                    });
                    this.loadPhishingCategoryLanguage(this.phishingCategoryId);
                    this.deletionPhishingCategoryLanguageDialog = false;
                },
                error: (err) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to delete Category',
                        life: 3000,
                    });
                },
            })
        );
        this.phishingCategoryLanguage = {} as IPhishingCategoryLanguage;
        this.deletionPhishingCategoryLanguageDialog = false;
    }

    declineDeletion() {
        this.deletionPhishingCategoryLanguageDialog = false;
        this.phishingCategoryLanguage = {} as IPhishingCategoryLanguage;
        this.loadPhishingCategoryLanguage(this.phishingCategoryId);
    }

    //#endregion

    //#region Activation

    switchActivation(phishingCategoryLanguage: IPhishingCategoryLanguage) {
        this.switchActivationPhishingCategoryLanguageDialog = true;
        this.phishingCategoryLanguage = { ...phishingCategoryLanguage };
    }

    declineActivation() {
        this.switchActivationPhishingCategoryLanguageDialog = false;
        this.initPhishingCategoryLanguageModel();
        this.ref.detectChanges();

        this.loadPhishingCategoryLanguage(this.phishingCategoryId);
    }

    confirmtActivation() {
        this.toggleActivation(this.phishingCategoryLanguage);
    }

    toggleActivation(phishingCategoryLanguage: IPhishingCategoryLanguage) {
        if (phishingCategoryLanguage.isActive) {
            this.subs.add(
                this.phishServ
                    .deActivatePhishingCategoryLangaugeById(phishingCategoryLanguage.id)
                    .subscribe((result) => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Category Deactivated',
                            life: 3000,
                        });
                        this.loadPhishingCategoryLanguage(this.phishingCategoryId);
                        this.ref.detectChanges();
                    })
            );
        } else {
            this.subs.add(
                this.phishServ.ActivatePhishingCategoryLangaugeById(phishingCategoryLanguage.id).subscribe((result) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Category Activated',
                        life: 3000,
                    });
                    this.loadPhishingCategoryLanguage(this.phishingCategoryId);
                    this.ref.detectChanges();
                })
            );
        }
        this.initPhishingCategoryLanguageModel();
        this.switchActivationPhishingCategoryLanguageDialog = false;
    }

    //#endregion

    initEditPhishingCategoryLanguageForm() {
        this.editPhishingCategoryLanguageForm = this.formBuilder.group({
            id: [''],
            name: [''],
            categoryImageUrl: [''],
            categoryBannerUrl: [''],
            categoryDescription: [''],
            categoryPageContentHtml: [''],
            languageId: [''],
        });
    }

    initAddPhishingCategoryLanguageForm() {
        this.addPhishingCategoryLanguageForm = this.formBuilder.group({
            id: [''],
            name: ['', Validators.required],
            categoryImageUrl: [''],
            categoryBannerUrl: [''],
            categoryDescription: ['', Validators.required],
            categoryPageContentHtml: ['', Validators.required],
            languageId: ['', Validators.required],
        });
    }

    initPhishingCategoryLanguageModel() {
        this.phishingCategoryLanguage = {
            id: '',
            name: '',
            categoryBannerUrl: '',
            categoryDescription: '',
            languageId: '',
            languageName: '',
            phishingCategoryId: '',
            phishingCategoryName: '',
            isActive: true,
            categoryPageContentHtml: '',
        };
    }



    onUploadCategoryBannerClick() {
        const fileInput = document.getElementById('myCategoryBanner') as HTMLInputElement;
        fileInput.click();
    }

    onUploadCategoryBannerClickAdd() {
        const fileInput = document.getElementById('myCategoryBannerAdd') as HTMLInputElement;
        fileInput.click();
    }

    onCategoryBannerSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length) {
            this.selectedCategoryBanner = input.files[0];

            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.imageUrl = e.target.result;
                this.ref.detectChanges();
            };
            reader.readAsDataURL(this.selectedCategoryBanner);
        }
    }

    onCategoryBannerSelectedAdd(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length) {
            this.selectedCategoryBannerForAdd = input.files[0];

            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.imageUrl = e.target.result;
                this.ref.detectChanges();
            };
            reader.readAsDataURL(this.selectedCategoryBannerForAdd);
        }
    }

    openContent(phishingCategoryLanguage: IPhishingCategoryLanguage, contentType: string) {
        this.phishingCategoryLanguage = { ...phishingCategoryLanguage };
        this.displayContentType = contentType;
        this.openCategoryPageContentHtmlDialog = true;
    }

    hideCategoryPageContentHtmlDialog() {
        this.openCategoryPageContentHtmlDialog = false;
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    ngOnDestroy(): void {
        this.subs.unsubscribe();
    }
}
