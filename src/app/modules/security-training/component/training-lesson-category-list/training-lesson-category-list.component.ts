import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { constants } from 'src/app/core/constatnts/constatnts';
import { PermessionsService } from 'src/app/core/Services/permessions.service';
import { TableLoadingService } from 'src/app/core/Services/table-loading.service';
import { IAspNetPageItemModel } from 'src/app/modules/page-management/models/IAspNetPageItemModel';
import { ITrainingCategoryModel } from '../../models/ISecurityTrainingCategoryModel';
import { TrainingLessonService } from '../../services/training-lesson.service';
import { ILanguageModel } from 'src/app/modules/language/models/ILanguageModel';
import { IPaginationModel } from 'src/app/core/Dtos/IPaginationModel';

interface expandedRows {
    [key: string]: boolean;
}

@Component({
    selector: 'app-training-lesson-category-list',
    templateUrl: './training-lesson-category-list.component.html',
    styleUrl: './training-lesson-category-list.component.scss',
})
export class TrainingLessonCategoryListComponent implements OnDestroy {
    tableLoadingSpinner: boolean = true;
    defaultLanguage: ILanguageModel[] = [];

    pagePermessions: IAspNetPageItemModel[] = [];
    actions = constants.pageActions;
    trainingLessonCategoryDialog: boolean = false;
    deletionTrainingLessonCategoryDialog: boolean = false;
    switchActivationTrainingLessonCategoryDialog: boolean = false;
    openTrainingLessonCategoryLanguagesDialog: boolean = false;
    submitted: boolean = false;
    trainingLessonCategories: ITrainingCategoryModel[];
    trainingLessonCategory: ITrainingCategoryModel;
    expandedRows: expandedRows = {};
    isExpanded: boolean = false;

    subs: Subscription = new Subscription();
    selectedCategoryId: string;
    totalRecords: number = 0;
    pagination : IPaginationModel = {
        page:0,
        size:9,
        searchQuery:''
    } 

    constructor(
        private CatServ: TrainingLessonService,
        private messageService: MessageService,
        private ref: ChangeDetectorRef,
        private permessionService: PermessionsService,
        private tableLoadingService: TableLoadingService
    ) {
        this.pagePermessions = this.permessionService.getPagePermessions(constants.pages.trainingLessonCateogry);
    }

    ngOnInit() {
        this.tableLoadingService.loading$.subscribe((isLoading) => {
            this.tableLoadingSpinner = isLoading;
        });

        this.subs.add(
            this.CatServ.GetDefaultLanguage().subscribe((res) => {
                this.defaultLanguage = [res];
            })
        );

        this.initTrainingLessonCategory();
    }

    onLazyLoad(event : any){
        this.pagination.page = event.first /event.rows;
        this.pagination.size = event.rows;
        this.pagination.searchQuery = event.globalFilter || '';
        this.loadTrainingLessonCategories()
    }


    loadTrainingLessonCategories() {
        this.tableLoadingService.show();
        this.subs.add(
            this.CatServ.getAllCategories(this.pagination).subscribe((data) => {
                this.trainingLessonCategories = data.data;
                this.totalRecords = data.totalRecords
                this.tableLoadingService.hide();
            })
        );
    }

    openCatLangs(id: string) {
        this.selectedCategoryId = id;
        this.openTrainingLessonCategoryLanguagesDialog = true;
        this.ref.detectChanges();
    }
    
    //#region Edit Training Lesson Category

    editTrainingLessonCategory(trainingLessonCategory: ITrainingCategoryModel) {
        this.trainingLessonCategory = { ...trainingLessonCategory };
        this.trainingLessonCategoryDialog = true;

        this.imageUrl1 =
            this.trainingLessonCategory.trainingCategoryImageUrl ?? '../../../../../assets/media/upload-photo.jpg';

        this.imageUrl2 =
            this.trainingLessonCategory.trainingCategoryBannerImageUrl ??
            '../../../../../assets/media/upload-photo.jpg';
    }

    declineTrainingLessonCategory() {
        this.submitted = false;
        this.initTrainingLessonCategory();
        this.trainingLessonCategoryDialog = false;
        this.imageUrl1 = '../../../../../assets/media/upload-photo.jpg';
        this.imageUrl2 = '../../../../../assets/media/upload-photo.jpg';
        this.loadTrainingLessonCategories();

    }

    saveTrainingLessonCategory() {
        this.submitted = true;
        const formData = new FormData();
        formData.append('Name', this.trainingLessonCategory.name);
        formData.append('Description', this.trainingLessonCategory.description);
        formData.append('LanguageId', this.defaultLanguage[0].id);

        const categoryImageFile = this.selectetCategoryImage;
        if (categoryImageFile) {
            formData.append('TrainingCategoryImageFile', categoryImageFile, categoryImageFile.name);
        }

        const categoryBannerImageFile = this.selectetCategoryBannerImage;
        if (categoryBannerImageFile) {
            formData.append('TrainingCategoryBannerImageFile', categoryBannerImageFile, categoryBannerImageFile.name);
        }

        this.CatServ.addTrainingLessonCategory(formData).subscribe({
            next: (response) => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Training Lesson Category Added',
                    life: 3000,
                });

                // this.loadTrainingLessonCategories();
                this.initTrainingLessonCategory();
                this.ref.detectChanges();
                this.loadTrainingLessonCategories();
                this.trainingLessonCategoryDialog = false;
                this.imageUrl1 = '../../../../../assets/media/upload-photo.jpg';
                this.imageUrl2 = '../../../../../assets/media/upload-photo.jpg';
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to create Category',
                    life: 3000,
                });
            },
        });
    }

    //#endregion

    //#region Deletion

    deleteTrainingLessonCategory(trainingLessonCategory: ITrainingCategoryModel) {
        this.deletionTrainingLessonCategoryDialog = true;
        this.trainingLessonCategory = { ...trainingLessonCategory };
    }
    confirmDeletion() {
        this.deletionTrainingLessonCategoryDialog = false;
        this.subs.add(
            this.CatServ.deleteTrainingLessonCategoryById(this.trainingLessonCategory.id).subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successfully',
                        detail: 'Category deleted successfully',
                        life: 5000,
                    });

                    this.loadTrainingLessonCategories();
                    this.initTrainingLessonCategory();
                    this.ref.detectChanges();
                    this.deletionTrainingLessonCategoryDialog = false;
                },
            })
        );
    }
    declineDeletion() {
        this.deletionTrainingLessonCategoryDialog = false;
        this.initTrainingLessonCategory();
        this.loadTrainingLessonCategories();
        this.ref.detectChanges();
    }

    //#endregion

    //#region Activation
    switchActivation(trainingLesson: ITrainingCategoryModel) {
        this.switchActivationTrainingLessonCategoryDialog = true;
        this.trainingLessonCategory = { ...trainingLesson };
    }

    declineCatActivation() {
        this.switchActivationTrainingLessonCategoryDialog = false;
        this.initTrainingLessonCategory();
        this.loadTrainingLessonCategories();
    }

    confirmtActivation() {
        this.toggleActivation(this.trainingLessonCategory);
    }

    toggleActivation(trainingLessonCategory: ITrainingCategoryModel) {
        if (trainingLessonCategory.isActive) {
            this.subs.add(
                this.CatServ.deActivateTrainingLessonCategoryById(trainingLessonCategory.id).subscribe((result) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Category Deactivated',
                        life: 3000,
                    });

                    this.loadTrainingLessonCategories();
                    this.initTrainingLessonCategory();
                    this.ref.detectChanges();
                    this.switchActivationTrainingLessonCategoryDialog = false;
                })
            );
        } else {
            this.subs.add(
                this.CatServ.activateTrainingLessonCategoryById(trainingLessonCategory.id).subscribe((result) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Category Activated',
                        life: 3000,
                    });
                    this.loadTrainingLessonCategories();
                    this.initTrainingLessonCategory();
                    this.ref.detectChanges();
                    this.switchActivationTrainingLessonCategoryDialog = false;
                })
            );
        }
    }

    //#endregion



    initTrainingLessonCategory() {
        this.trainingLessonCategory = {
            id: '',
            name: '',
            description: '',
            trainingCategoryImageUrl: '',
            trainingCategoryBannerImageUrl: '',
            isActive: true,
            lessons: [],
            LessonsCount: 0,
        };
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    addNewCat() {
        this.initTrainingLessonCategory();
        this.submitted = false;
        this.trainingLessonCategoryDialog = true;
    }
    imageUrl1: string = '../../../../../assets/media/upload-photo.jpg';
    imageUrl2: string = '../../../../../assets/media/upload-photo.jpg';
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

    expandAll() {
        if (!this.isExpanded) {
            this.trainingLessonCategories.forEach((cat) =>
                cat && cat.name ? (this.expandedRows[cat.name] = true) : ''
            );
        } else {
            this.expandedRows = {};
        }
        this.isExpanded = !this.isExpanded;
    }

    closeTrainingCatLangsDialog() {
        this.selectedCategoryId = '';
        this.loadTrainingLessonCategories();
        this.openTrainingLessonCategoryLanguagesDialog = false;

    }

    hasPermission(controlKey: string): boolean {
        return this.pagePermessions.some((p) => p.controlKey === controlKey);
    }

    ngOnDestroy(): void {
        this.subs.unsubscribe();
    }
}