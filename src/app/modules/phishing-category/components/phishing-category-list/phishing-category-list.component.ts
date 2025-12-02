import { AfterViewChecked, ApplicationRef, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { MessageService, ConfirmationService, MenuItem } from 'primeng/api';
import { PhishingCategoryService } from '../../services/phishing-category.service';
import { Subscription, finalize, switchMap } from 'rxjs';
import { IPhishingCategory } from '../../models/IPhishingCategory';
import { ILanguageModel } from 'src/app/modules/language/models/ILanguageModel';
import { TrainingLessonService } from 'src/app/modules/security-training/services/training-lesson.service';
import { DataView } from 'primeng/dataview';
import { SelectItem } from 'primeng/api';
import { Editor } from 'ngx-editor';
import { IAspNetPageItemModel } from 'src/app/modules/page-management/models/IAspNetPageItemModel';
import { PermessionsService } from 'src/app/core/Services/permessions.service';
import { constants } from 'src/app/core/constatnts/constatnts';
import { TranslationService } from 'src/app/core/Services/translation.service';
import { TableLoadingService } from 'src/app/core/Services/table-loading.service';
import { UserService } from 'src/app/modules/user/services/user.service';
import { GetUser } from 'src/app/layout/app-menuProfile/app.menuprofile.component';
import { IPaginationModel } from 'src/app/core/Dtos/IPaginationModel';

@Component({
    selector: 'app-phishing-category-list',
    templateUrl: './phishing-category-list.component.html',
    styleUrl: './phishing-category-list.component.scss',
    providers: [MessageService, ConfirmationService],
})
export class PhishingCategoryListComponent implements OnInit, AfterViewChecked, OnDestroy {
    tableLoadingSpinner: boolean = true;
    isIAwareTeamUser: boolean | null = null;
    pagePermessions: IAspNetPageItemModel[] = [];
    actions = constants.pageActions;
    editPhishingCategoryDialog: boolean = false;
    addPhishingCategoryDialog: boolean = false;
    deletionPhishingCategoryDialog: boolean = false;
    switchActivationPhishingCategoryDialog: boolean = false;
    submitted: boolean = false;
    defaultLanguage: ILanguageModel[] = [];
    phishingCategories: IPhishingCategory[] = [];
    systemPhishingCategories: IPhishingCategory[] = [];
    tenantPhishingCategories: IPhishingCategory[] = [];
    phishingCategory: IPhishingCategory;
    selectedLanguage: ILanguageModel;
    subs: Subscription = new Subscription();
    countOfActiveLanguages: Number;
    editPhishingCategoryForm: FormGroup;
    addPhishingCategoryForm: FormGroup;
    editor: Editor;
    sortOrder: number = 0;
    sortOptions: SelectItem[] = [];
    cardMenu: MenuItem[] = [];
    items: MenuItem[];
    selectedCategoryBanner: File | null = null;
    selectetCategoryImage: File | null = null;
    imageUrl1: string = '../../../../../assets/media/upload-photo.jpg';
    imageUrl2: string = '../../../../../assets/media/upload-photo.jpg';
    ownerMenuItems: MenuItem[] = [];
    normalMenuItems: MenuItem[] = [];
    user: GetUser;
    sortField: string = '';

    defaultTotalRecords: number = 9;
    tenantTotalRecords: number = 9;
    defaultPagination : IPaginationModel = {
        page: 0,
        size: 9,
        searchQuery: ''
    }
    tenantPagination : IPaginationModel = {
        page: 0,
        size: 9,
        searchQuery: ''
    }
    constructor(
        private trainingServ: TrainingLessonService,
        private phishingServ: PhishingCategoryService,
        private messageService: MessageService,
        private formBuilder: FormBuilder,
        private router: Router,
        private ref: ChangeDetectorRef,
        private permessionService: PermessionsService,
        private translate: TranslationService,
        private tableLoadingService: TableLoadingService,
        private userServ: UserService ) {
        this.pagePermessions = this.permessionService.getPagePermessions(constants.pages.phishingCategory);
        this.getUserDetails();
        this.initPhishingCategoryForm();
    }

    ngAfterViewChecked(): void {
        this.ref.detectChanges();
    }

    ngOnInit() {
        this.tableLoadingService.loading$.subscribe((isLoading) => {
            this.tableLoadingSpinner = isLoading;
        });

        this.initPhishingCategory();
        this.initPhishingCategoryForm();
        this.assigneMenueItems(); 
        this.loadDefaultLanguage();
        this.loadCountOfActiveLanguages();
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

    assigneMenueItems() {
        const editBtn = {
            label: this.translate.getInstant('shared.actions.edit'),
            icon: 'pi pi-fw pi-pencil',
            command: () => this.editPhishingCategory(this.phishingCategory),
        };
        const deleteBtn = {
            label: this.translate.getInstant('shared.actions.delete'),
            icon: 'pi pi-fw pi-trash',
            command: () => this.deletePhishingCategory(this.phishingCategory),
        };


        this.ownerMenuItems = [];
        this.ownerMenuItems.push(deleteBtn);
        this.ownerMenuItems.push(editBtn);

        this.normalMenuItems = [];
        this.normalMenuItems.push(deleteBtn);
        this.normalMenuItems.push(editBtn);

    }

    assigneCurrentSelect(phishingCategory: IPhishingCategory) {
        this.phishingCategory = phishingCategory;
    }

    onLazyLoadDefualtCategories(event: any) {
        this.defaultPagination.page = event.first / event.rows;
        this.defaultPagination.size = event.rows;
        this.loadDefualtCategories();
    }

    onLazyLoadTenantCategories(event: any) {
        this.tenantPagination.page = event.first / event.rows;
        this.tenantPagination.size = event.rows;
        this.loadTenantCategories();
    }

    loadDefualtCategories() {
        this.tableLoadingService.show();
        const sub = this.phishingServ.getDefualtCategories(this.defaultPagination).subscribe({
            next: (data) => {
                this.systemPhishingCategories = data.data;
                this.defaultTotalRecords = data.totalRecords;
                this.tableLoadingService.hide();
            },
            error: () => {
                this.tableLoadingService.hide();
            }
        });
        this.subs.add(sub);
    }

    loadTenantCategories() {
        this.tableLoadingService.show();
        const sub = this.phishingServ.getTenantCategories(this.tenantPagination).subscribe({
            next: (data) => {
                this.tenantPhishingCategories = data.data;
                this.tenantTotalRecords = data.totalRecords;
                this.tableLoadingService.hide();
            },
            error: () => {
                this.tableLoadingService.hide();
            }
        });
        this.subs.add(sub);
    }

    loadPhishingCategories() {
        this.tableLoadingService.show();
        this.subs.add(
            this.phishingServ.getAllPhishingCategories().subscribe((data) => {
                this.phishingCategories = data;
                this.systemPhishingCategories = data.filter((bg: IPhishingCategory) => bg.canEdit);
                this.tenantPhishingCategories = data.filter((bg: IPhishingCategory) => !bg.canEdit);
                this.ref.detectChanges();
                this.tableLoadingService.hide();
            })
        );

        this.items = [
            {
                icon: 'pi pi-pencil',
                iconStyle: { fontSize: '5rem', width: '10px', height: '10px' }, // Adjust size as needed
                style: { fontSize: '5rem', width: '10px', height: '10px' }, // Adjust size as needed
                command: () => {
                    this.messageService.add({ severity: 'info', summary: 'Add', detail: 'Data Added' });
                },
            },
            {
                icon: 'pi pi-trash',
                command: () => {
                    this.messageService.add({ severity: 'error', summary: 'Delete', detail: 'Data Deleted' });
                },
            },
            {
                icon: 'pi pi-plus',
                command: () => {
                    this.messageService.add({ severity: 'error', summary: 'Delete', detail: 'Data Deleted' });
                },
            },
        ];
        this.cardMenu = [
            {
                icon: 'pi pi-fw pi-check',
            },
            {
                icon: 'pi pi-fw pi-refresh',
            },
            {
                icon: 'pi pi-fw pi-trash',
            },
        ];
    }

    loadDefaultLanguage() {
        this.subs.add(
            this.trainingServ.GetDefaultLanguage().subscribe((res) => {
                this.defaultLanguage = [res];
            })
        );
    }

    loadCountOfActiveLanguages() {
        this.subs.add(
            this.trainingServ.getCountOfActiveLanguage().subscribe((r) => {
                this.countOfActiveLanguages = r;
            })
        );
    }

    //#region Edit Training Lesson

    editPhishingCategory(phishingCategory: IPhishingCategory) {
        this.selectedCategoryBanner = null;
        this.selectetCategoryImage = null;
        this.loadPhishingCategories();

        this.phishingCategory = { ...phishingCategory };
        this.imageUrl1 = this.phishingCategory.categoryImageUrl;

        this.editPhishingCategoryForm.patchValue(phishingCategory);
        this.editPhishingCategoryDialog = true;
    }

    declineEditPhishingCategory() {
        this.submitted = false;
        this.initPhishingCategory();
        this.initPhishingCategoryForm();
        this.editPhishingCategoryDialog = false;
    }

    saveEditPhishingCategory() {
        this.submitted = true;

        if (this.editPhishingCategoryForm.valid) {
            const formData = new FormData();
            formData.append('id', this.editPhishingCategoryForm.value.id);
            formData.append('name', this.editPhishingCategoryForm.value.name);
            const categoryImageFile = this.selectetCategoryImage;

            if (categoryImageFile) {
                formData.append('categoryImageUrl', categoryImageFile, categoryImageFile.name);
            }

            this.subs.add(
                this.phishingServ
                    .editPhishingCategory(formData)
                    .pipe(
                        switchMap(() => {
                            return this.phishingServ.getAllPhishingCategories();
                        }),
                        finalize(() => {
                            this.loadPhishingCategories();
                            this.ref.detectChanges();
                            this.initPhishingCategory();
                            this.initPhishingCategoryForm();
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
                        next: (categories) => {
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Successful',
                                detail: 'Phishing Category Updated',
                                life: 3000,
                            });
                            this.phishingCategories = categories;
                            this.editPhishingCategoryDialog = false;
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

    saveAddPhishingCategory() {
        this.submitted = true;
        if (this.addPhishingCategoryForm.valid) {
            const formData = new FormData();
            formData.append('Name', this.addPhishingCategoryForm.value.name);
            formData.append('CategoryDescription', this.addPhishingCategoryForm.value.categoryDescription);
            formData.append('CategoryPageContentHtml', this.addPhishingCategoryForm.value.categoryPageContentHtml);
            formData.append('LanguageId', this.addPhishingCategoryForm.value.languageId);

            const categoryBannerFile = this.selectedCategoryBanner;
            if (categoryBannerFile) {
                formData.append('CategoryBannerUrl', categoryBannerFile, categoryBannerFile.name);
            }

            const categoryImageFile = this.selectetCategoryImage;
            if (categoryImageFile) {
                formData.append('CategoryImageUrl', categoryImageFile, categoryImageFile.name);
            }

            this.subs.add(
                this.phishingServ.addPhishingCategory(formData).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Phishing Category Updated',
                            life: 3000,
                        });
                        this.loadPhishingCategories();
                        this.ref.detectChanges();
                        this.initPhishingCategory();
                        this.initPhishingCategoryForm();
                        this.addPhishingCategoryDialog = false;
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
    declineAddPhishingCategoryDialog() {
        this.submitted = false;
        this.initPhishingCategory();
        this.initPhishingCategoryForm();
        this.addPhishingCategoryDialog = false;
    }

    //#endregion

    //#region Deletion

    deletePhishingCategory(phishingCategory: IPhishingCategory) {
        this.deletionPhishingCategoryDialog = true;
        this.phishingCategory = { ...phishingCategory };
    }
    confirmDeletion() {
        this.deletionPhishingCategoryDialog = false;
        this.subs.add(
            this.phishingServ.deletePhishingCategoryById(this.phishingCategory.id).subscribe({
                next: (response) => {
                    if (response.code !== 406) {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Sussfully',
                            detail: response.message,
                            life: 3000,
                        });
                        this.loadPhishingCategories();
                        this.ref.detectChanges();
                    } else {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Cannot delete because there are phishing category languages associated with this phishing category',
                            life: 5000,
                        });
                        this.loadPhishingCategories();
                        this.ref.detectChanges();
                    }
                },
            })
        );
        this.initPhishingCategory();
        this.deletionPhishingCategoryDialog = false;
    }
    declineDeletion() {
        this.deletionPhishingCategoryDialog = false;
        this.initPhishingCategory();
        this.loadPhishingCategories();
    }

    //#endregion

    //#region Activation
    switchActivation(phishingCategory: IPhishingCategory) {
        this.switchActivationPhishingCategoryDialog = true;
        this.phishingCategory = { ...phishingCategory };
    }

    declineActivation() {
        this.switchActivationPhishingCategoryDialog = false;
        this.initPhishingCategory();
        this.loadPhishingCategories();
    }

    confirmtActivation() {
        this.toggleActivation(this.phishingCategory);
    }

    toggleActivation(phishingCategory: IPhishingCategory) {
        if (phishingCategory.isActive) {
            this.subs.add(
                this.phishingServ.deActivatePhishingCategoryById(phishingCategory.id).subscribe((result) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Phishing Category Deactivated',
                        life: 3000,
                    });
                    this.loadPhishingCategories();
                    this.ref.detectChanges();
                })
            );
        } else {
            this.subs.add(
                this.phishingServ.activatePhishingCategoryById(phishingCategory.id).subscribe((result) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Phishing Category Activated',
                        life: 3000,
                    });
                    this.loadPhishingCategories();
                    this.ref.detectChanges();
                })
            );
        }
        this.initPhishingCategory();
        this.switchActivationPhishingCategoryDialog = false;
    }

    //#endregion

    navigateToCategoryLanguages(CategoryId: string, where: string) {
        this.router.navigate(['phishing-category', CategoryId, where]);
    }

    initPhishingCategory() {
        this.phishingCategory = {
            id: '',
            name: '',
            categoryImageUrl: '',
            isActive: false,
            phishingCategoryLanguages: [],
        };
    }

    initPhishingCategoryForm() {
        this.editPhishingCategoryForm = this.formBuilder.group({
            id: [''],
            name: ['', Validators.required],
            categoryImageUrl: [null],
        });

        this.addPhishingCategoryForm = this.formBuilder.group({
            id: [''],
            name: [''],
            categoryImageUrl: [''],
            categoryBannerUrl: [''],
            categoryDescription: [''],
            categoryPageContentHtml: [''],
            languageId: [''],
        });
    }

    CreatePhishingCategory() {
        this.addPhishingCategoryDialog = true;
        this.initPhishingCategoryForm();
        this.initPhishingCategory();
        this.imageUrl1 = '../../../../../assets/media/upload-photo.jpg';
        this.imageUrl2 = '../../../../../assets/media/upload-photo.jpg';
        this.selectedCategoryBanner = null;
        this.selectetCategoryImage = null;
    }

    onUploadCategoryBannerClick() {
        const fileInput = document.getElementById('myCategoryBanner') as HTMLInputElement;
        fileInput.click();
    }

    onCategoryBannerSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length) {
            this.selectedCategoryBanner = input.files[0];

            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.imageUrl2 = e.target.result;
                this.ref.detectChanges();
            };
            reader.readAsDataURL(this.selectedCategoryBanner);
        }
    }

    onUploadCategoryImageClick() {
        const fileInput = document.getElementById('myCategoryImage') as HTMLInputElement;
        fileInput.click();
    }

    onCategoryImageSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length) {
            this.selectetCategoryImage = input.files[0];

            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.imageUrl1 = e.target.result;
                this.ref.detectChanges();
            };
            reader.readAsDataURL(this.selectetCategoryImage);
        }
    }

    onSortChange(event: any) {
        const value = event.value;

        if (value.indexOf('!') === 0) {
            this.sortOrder = -1;
            this.sortField = value.substring(1, value.length);
        } else {
            this.sortOrder = 1;
            this.sortField = value;
        }
    }

    onFilter(dv: DataView, event: Event) {
        dv.filter((event.target as HTMLInputElement).value);
    }

    hasPermission(controlKey: string): boolean {
        return this.pagePermessions.some((p) => p.controlKey === controlKey);
    }

    ngOnDestroy() {
        this.subs.unsubscribe();
    }
}