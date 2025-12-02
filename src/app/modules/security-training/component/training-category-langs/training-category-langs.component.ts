import { ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { TrainingLessonService } from '../../services/training-lesson.service';
import { MessageService } from 'primeng/api';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TableLoadingService } from 'src/app/core/Services/table-loading.service';
import { finalize, Subscription } from 'rxjs';
import { ITrainingLessonCategoryLanguages as ITrainingLessonCategoryLanguage} from '../../models/ISecurityTrainingModel';
import { IAspNetPageItemModel } from 'src/app/modules/page-management/models/IAspNetPageItemModel';
import { constants } from 'src/app/core/constatnts/constatnts';
import { ILanguageModel } from 'src/app/modules/language/models/ILanguageModel';
import { DropdownListDataSourceService } from 'src/app/core/Services/dropdown-list-data-source.service';
@Component({
    selector: 'app-training-category-langs',
    templateUrl: './training-category-langs.component.html',
    styleUrl: './training-category-langs.component.scss',
})
export class TrainingCategoryLangsComponent implements OnChanges, OnDestroy {
    @Input() trainigLessonCategoryId: string;

    tableLoadingSpinner: boolean = true;

    subs: Subscription = new Subscription();
    trainingCategoryLanguages: ITrainingLessonCategoryLanguage[] = [];
    defaultLanguageId: any;
    trainingCategoryLanguage: ITrainingLessonCategoryLanguage;
    editTrainingCategoryLanguageForm: FormGroup;
    addTrainingCategoryLanguageForm: FormGroup;
    pagePermessions: IAspNetPageItemModel[] = [];
    actions = constants.pageActions;

    addTrainingCategoryLanguageDialog: boolean = false;
    editTrainingCategoryLanguageDialog: boolean = false;
    deletionTrainingCategoryLanguageDialog: boolean = false;
    switchActivationTrainingCategoryLanguageDialog: boolean = false;
    submitted: boolean = false;
    defaultLanguage: ILanguageModel[];
    selectedLanguage: ILanguageModel;
    languages: ILanguageModel[] = [];
    selectedCategoryBanner: File | null = null;
    selectedCategoryBannerForAdd: File | null = null;
    imageUrl1: string = '../../../../../assets/media/upload-photo.jpg';
    imageUrl2: string = '../../../../../assets/media/upload-photo.jpg';
    openCategoryPageContentHtmlDialog: boolean = false;
    activeLanguage: ILanguageModel[] = [];

    constructor(
        private trainingServ: TrainingLessonService,
        private dropdownListDataSourceService: DropdownListDataSourceService,
        private messageService: MessageService,
        private formBuilder: FormBuilder,
        private router: Router,
        private route: ActivatedRoute,
        private ref: ChangeDetectorRef,
        private tableLoadingService: TableLoadingService
    ) { }
    ngOnChanges(changes: SimpleChanges): void {
        this.tableLoadingService.loading$.subscribe((isLoading) => {
            this.tableLoadingSpinner = isLoading;
        });

        this.loadTraingCategoryLanguages(this.trainigLessonCategoryId);
        this.initTrainingCategoryLanguageModel();
        this.initAddTrianingCategoryLangaugeForm();
        this.initEditTrianingCategoryLangaugeForm();
    }

    loadTraingCategoryLanguages(id: string) {
        this.tableLoadingService.show();
        this.subs.add(
            this.trainingServ.getTrainingCategoryLanguagesByTrainingLessonCategoryId(id).subscribe((data) => {
                this.trainingCategoryLanguages = data.data;
                this.tableLoadingService.hide();
            })
        );
    }

    openAddTrainingCategoryLanguageDialog() {
        this.addTrainingCategoryLanguageDialog = true;
        this.initTrainingCategoryLanguageModel();
        this.initAddTrianingCategoryLangaugeForm();
        this.imageUrl1 = '../../../../../assets/media/upload-photo.jpg';
        this.imageUrl2 = '../../../../../assets/media/upload-photo.jpg';
        this.selectedCategoryBannerForAdd = null;
        this.getActiveLanguageForAddForm();
    }

    getActiveLanguageForAddForm() {
        this.dropdownListDataSourceService.getActiveLanguages().subscribe({
            next: (res) => {
                this.activeLanguage = res.data;
                const p = this.trainingCategoryLanguages.map((c) => c.languageId);
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
                    (lang) => lang.id === this.trainingCategoryLanguage.languageId
                );

                if (currentLanguage) {
                    const p = this.trainingCategoryLanguages.map((c) => c.languageId);
                    this.activeLanguage = this.activeLanguage.filter((c) => !p.includes(c.id));
                    this.activeLanguage = [...this.activeLanguage, currentLanguage];
                }
                if (this.isEnglishSelected()) {
                    this.editTrainingCategoryLanguageForm.get('languageId')?.disable();
                } else {
                    this.editTrainingCategoryLanguageForm.get('languageId')?.enable();
                }
            },
            error: (err) => { },
        });
    }

    //#region Edit Training Lesson

    editTrainingLessonCategoryLanguage(trainingCategoryLanguage: ITrainingLessonCategoryLanguage) {
        this.trainingCategoryLanguage = { ...trainingCategoryLanguage };
        this.getActiveLanguageForEditForm();
        this.imageUrl1 = this.trainingCategoryLanguage.trainingCategoryImageUrl;
        this.imageUrl2 = this.trainingCategoryLanguage.trainingCategoryBannerImageUrl;
        this.editTrainingCategoryLanguageForm.patchValue(trainingCategoryLanguage);

        this.editTrainingCategoryLanguageDialog = true;
    }

    isEnglishSelected(): boolean {
        const selectedLanguageId = this.editTrainingCategoryLanguageForm.get('languageId')?.value;
        const selectedLanguage = this.activeLanguage.find((lang) => lang.id === selectedLanguageId);
        return selectedLanguage?.name.toLowerCase() === 'english';
    }

    declineEdittrainingCategoryLanguage() {
        this.submitted = false;
        this.initTrainingCategoryLanguageModel();
        this.initEditTrianingCategoryLangaugeForm();
        this.editTrainingCategoryLanguageDialog = false;
    }

    saveEdittrainingCategoryLanguage() {
        this.submitted = true;
        if (this.editTrainingCategoryLanguageForm.valid) {
            const formData = new FormData();
            const formValues = this.editTrainingCategoryLanguageForm.getRawValue();

            formData.append('Id', formValues.id);
            formData.append('Name', formValues.name);
            formData.append('Description', formValues.description);
            formData.append('LanguageId', formValues.languageId);
            formData.append('TrainingLessonCategoryId', this.trainigLessonCategoryId);

            const categoryImageFile = this.selectetCategoryImage;
            if (categoryImageFile) {
                formData.append('TrainingCategoryImageFile', categoryImageFile, categoryImageFile.name);
            }

            const categoryBannerImageFile = this.selectetCategoryBannerImage;
            if (categoryBannerImageFile) {
                formData.append(
                    'TrainingCategoryBannerImageFile',
                    categoryBannerImageFile,
                    categoryBannerImageFile.name
                );
            }

            this.subs.add(
                this.trainingServ
                    .editTrainingLessonCategoryLanguage(formData)
                    .pipe(
                        finalize(() => {
                            this.loadTraingCategoryLanguages(this.trainigLessonCategoryId);
                            this.ref.detectChanges();
                            this.initTrainingCategoryLanguageModel();
                            this.initEditTrianingCategoryLangaugeForm();
                        })
                    )

                    .subscribe({
                        next: () => {
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Successful',
                                detail: 'Trianing Category Language Updated',
                                life: 3000,
                            });
                            this.editTrainingCategoryLanguageDialog = false;
                        },
                        error: () => {
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Error',
                                detail: 'Failed to update Trianing Category Language',
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

    addTrainingCategoryLanguage() {
        this.submitted = true;
        if (this.addTrainingCategoryLanguageForm.valid) {
            const formData = new FormData();
            formData.append('Name', this.addTrainingCategoryLanguageForm.value.name);
            formData.append('Description', this.addTrainingCategoryLanguageForm.value.description);
            formData.append('LanguageId', this.addTrainingCategoryLanguageForm.value.languageId);
            formData.append('TrainingLessonCategoryId', this.trainigLessonCategoryId);

            const categoryImageFile = this.selectetCategoryImage;
            if (categoryImageFile) {
                formData.append('TrainingCategoryImageFile', categoryImageFile, categoryImageFile.name);
            }

            const categoryBannerImageFile = this.selectetCategoryBannerImage;
            if (categoryBannerImageFile) {
                formData.append(
                    'TrainingCategoryBannerImageFile',
                    categoryBannerImageFile,
                    categoryBannerImageFile.name
                );
            }
            this.subs.add(
                this.trainingServ
                    .addTrainingLessonCategoryLanguage(formData)
                    .pipe(
                        finalize(() => {
                            this.loadTraingCategoryLanguages(this.trainigLessonCategoryId);
                            this.ref.detectChanges();
                        })
                    )
                    .subscribe({
                        next: () => {
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Successful',
                                detail: 'Trianing Category Language Updated',
                                life: 3000,
                            });
                            this.addTrainingCategoryLanguageDialog = false;
                        },
                        error: () => {
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Error',
                                detail: 'Failed to update Trianing Category Language',
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

    deleteTrainingLessonCategoryLanguage(trainingCategoryLanguage: ITrainingLessonCategoryLanguage) {
        this.deletionTrainingCategoryLanguageDialog = true;
        this.trainingCategoryLanguage = { ...trainingCategoryLanguage };
    }

    confirmDeletion() {
        this.subs.add(
            this.trainingServ.deleteTrainingLessonCategoryLanguageById(this.trainingCategoryLanguage.id).subscribe({
                next: (response) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: response.message,
                        life: 3000,
                    });
                    this.loadTraingCategoryLanguages(this.trainigLessonCategoryId);
                    this.deletionTrainingCategoryLanguageDialog = false;
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
        this.trainingCategoryLanguage = {} as ITrainingLessonCategoryLanguage;
    }

    declineDeletion() {
        this.deletionTrainingCategoryLanguageDialog = false;
        this.trainingCategoryLanguage = {} as ITrainingLessonCategoryLanguage;
        this.loadTraingCategoryLanguages(this.trainigLessonCategoryId);
    }

    //#endregion

    //#region Activation

    switchActivation(trainingCategoryLanguage: ITrainingLessonCategoryLanguage) {
        this.switchActivationTrainingCategoryLanguageDialog = true;
        this.trainingCategoryLanguage = { ...trainingCategoryLanguage };
    }

    declineActivation() {
        this.switchActivationTrainingCategoryLanguageDialog = false;
        this.initTrainingCategoryLanguageModel();
        this.ref.detectChanges();

        this.loadTraingCategoryLanguages(this.trainigLessonCategoryId);
    }

    confirmtActivation() {
        this.toggleActivation(this.trainingCategoryLanguage);
    }

    toggleActivation(trainingCategoryLanguage: ITrainingLessonCategoryLanguage) {
        if (trainingCategoryLanguage.isActive) {
            this.subs.add(
                this.trainingServ
                    .deActivateTrainingLessonCategoryLanguageById(trainingCategoryLanguage.id)
                    .subscribe((result) => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Security Training Deactivated',
                            life: 3000,
                        });
                        this.loadTraingCategoryLanguages(this.trainigLessonCategoryId);
                        this.ref.detectChanges();
                    })
            );
        } else {
            this.subs.add(
                this.trainingServ
                    .activateTrainingLessonCategoryLanguageById(trainingCategoryLanguage.id)
                    .subscribe((result) => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Security Training Activated',
                            life: 3000,
                        });
                        this.loadTraingCategoryLanguages(this.trainigLessonCategoryId);
                        this.ref.detectChanges();
                    })
            );
        }
        this.initTrainingCategoryLanguageModel();
        this.switchActivationTrainingCategoryLanguageDialog = false;
    }

    //#endregion

    selectetCategoryImage: File | null = null;
    selectetCategoryBannerImage: File | null = null;

    onUploadCategoryImageClick() {
        const fileInput = document.getElementById('myBackgroundImage') as HTMLInputElement;
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

    onUploadCategoryBannerImageClick() {
        const fileInput = document.getElementById('myBackgroundBannerImage') as HTMLInputElement;
        fileInput.click();
    }

    onCategoryBannerImageSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length) {
            this.selectetCategoryBannerImage = input.files[0];
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.imageUrl2 = e.target.result;
                this.ref.detectChanges();
            };
            reader.readAsDataURL(this.selectetCategoryBannerImage);
        }
    }

    displayContentType: string = '';
    openContent(trainingCategoryLanguage: ITrainingLessonCategoryLanguage, contentType: string) {
        this.trainingCategoryLanguage = { ...trainingCategoryLanguage };
        this.displayContentType = contentType;
        this.openCategoryPageContentHtmlDialog = true;
    }

    hideCategoryPageContentHtmlDialog() {
        this.openCategoryPageContentHtmlDialog = false;
    }

    hasPermission(controlKey: string): boolean {
        return this.pagePermessions.some((p) => p.controlKey === controlKey);
    }

    initAddTrianingCategoryLangaugeForm() {
        this.addTrainingCategoryLanguageForm = this.formBuilder.group({
            name: [''],
            description: [''],
            languageId: [''],
            trainingLessonCategoryId: [''],
        });
    }

    initEditTrianingCategoryLangaugeForm() {
        this.editTrainingCategoryLanguageForm = this.formBuilder.group({
            id: [''],
            name: [''],
            description: [''],
            languageId: [''],
            trainingLessonCategoryId: [''],
        });
    }

    initTrainingCategoryLanguageModel() {
        this.trainingCategoryLanguage = {
            id: '',
            name: '',
            description: '',
            languageId: '',
            languageName: '',
            isActive: true,
            trainingCategoryBannerImageUrl: '',
            trainingCategoryImageUrl: '',
        };
    }

    ngOnDestroy(): void {
        this.subs.unsubscribe();
    }
}
