import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { finalize, Subscription } from 'rxjs';

import { Table } from 'primeng/table';
import { ILanguageModel } from 'src/app/modules/language/models/ILanguageModel';
import { Router } from '@angular/router';
import { ITrainingLesson } from '../../models/ISecurityTrainingModel';
import { TrainingLessonService } from '../../services/training-lesson.service';
import { ITrainingCategoryModel } from '../../models/ISecurityTrainingCategoryModel';
import { IAspNetPageItemModel } from 'src/app/modules/page-management/models/IAspNetPageItemModel';
import { PermessionsService } from 'src/app/core/Services/permessions.service';
import { constants } from 'src/app/core/constatnts/constatnts';
import { WallpaperLibrariesService } from 'src/app/modules/wallpaper-libraries/services/wallpaper-libraries.service';
import { ILibraryWallpaper } from 'src/app/modules/wallpaper-libraries/models/wallpaper-libraries';
import { TableLoadingService } from 'src/app/core/Services/table-loading.service';
import { TagesService } from 'src/app/modules/tages/services/tages.service';
import { ITagModel } from 'src/app/modules/tages/models/ITagModel';
import { DropdownListDataSourceService } from 'src/app/core/Services/dropdown-list-data-source.service';
import { IPaginationModel } from 'src/app/core/Dtos/IPaginationModel';
@Component({
    selector: 'app-security-training-list',
    templateUrl: './security-training-list.component.html',
    styleUrls: ['./security-training-list.component.scss'],
    providers: [MessageService, ConfirmationService],
})
export class SecurityTrainingListComponent implements OnInit {
    tableLoadingSpinner: boolean = true;

    pagePermessions: IAspNetPageItemModel[] = [];
    actions = constants.pageActions;
    editTrainingLessonDialog: boolean = false;
    deletionTrainingLessonDialog: boolean = false;
    switchActivationTrainingLessonDialog: boolean = false;
    submitted: boolean = false;
    trainingLessons: ITrainingLesson[];
    defaultLanguage: ILanguageModel[];
    categories: ITrainingCategoryModel[];
    selectedLanguage: ILanguageModel;
    trainingLesson: ITrainingLesson;
    subs: Subscription = new Subscription();
    countOfActiveLanguages: Number;
    libraryWallpaperDialog = false;
    chooseWllpapersDialog = false;
    editTrainingLessonForm: FormGroup;
    wallpapers: ILibraryWallpaper[];
    checkboxStates: { [key: string]: boolean } = {};
    selectedWallpapers: any[] = [];

    
    selectedTages : string[] = [];    
    tages : ITagModel[] = [];
    totalRecords: number = 0;
    pagination : IPaginationModel = {
        page:0,
        size:10,
        searchQuery:''
    }

    constructor(
        private trainingServ: TrainingLessonService,
        private messageService: MessageService,
        private dropdownListDataSourceService : DropdownListDataSourceService,
        private formBuilder: FormBuilder,
        private router: Router,
        private ref: ChangeDetectorRef,
        private permessionService: PermessionsService,
        private wallServ: WallpaperLibrariesService,
        private tableLoadingService: TableLoadingService,
        private tagesAPIService : TagesService
    ) {
        this.pagePermessions = this.permessionService.getPagePermessions(constants.pages.securityTraining);
    }

    ngOnInit() {
        this.tableLoadingService.loading$.subscribe((isLoading) => {
            this.tableLoadingSpinner = isLoading;
        });

        this.initTrainingLesson();
        this.initEditTrainingLessonForm();

        this.subs.add(
            this.trainingServ.getCountOfActiveLanguage().subscribe((r) => {
                this.countOfActiveLanguages = r;
            })
        );

        this.subs.add(
            this.dropdownListDataSourceService.getTrainingCategories().subscribe((r) => {
                this.categories = r.data;
            })
        );
    }

    onLazyLoad(event : any){
        this.pagination.page = event.first /event.rows;
        this.pagination.size = event.rows;
        this.pagination.searchQuery = event.globalFilter || '';
        this.loadTrainingLessons()
    }

    loadTrainingLessons() {
        this.tableLoadingService.show();

        this.subs.add(
            this.trainingServ
                .getAllTrainingLessons(this.pagination)
                .pipe(
                    finalize(() => {
                        this.tableLoadingService.hide();
                    })
                )
                .subscribe((data) => {
                    this.trainingLessons = data.data;
                    this.totalRecords = data.totalRecords;
                })
        );
    }

    //#region Edit Training Lesson

    editTrainingLesson(trainingLesson: ITrainingLesson) {
        this.fetchAllTages();
        this.trainingLesson = { ...trainingLesson };
        this.editTrainingLessonForm.patchValue(trainingLesson);
        this.editTrainingLessonDialog = true;
    }
    
    fetchAllTages(){
        this.subs.add(this.tagesAPIService.getAllTages().subscribe({
            next: (res) => {
                this.tages = res.data;
            },
            error: (error) => {
                //this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
            }
        }))
    }

    declineEditTrainingLesson() {
        this.submitted = false;
        this.initTrainingLesson();
        this.initEditTrainingLessonForm();
        this.editTrainingLessonDialog = false;
    }

    saveEditTrainingLesson() {
        this.submitted = true;
        if (this.editTrainingLessonForm.valid) {
            if (this.editTrainingLessonForm.value.id && this.editTrainingLessonForm.value.id !== '') {
                this.trainingServ.editTrainingLesson(this.editTrainingLessonForm.value).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Training Lesson Updated',
                            life: 3000,
                        });
                        this.loadTrainingLessons();
                        this.ref.detectChanges();
                        this.initTrainingLesson();
                        this.initEditTrainingLessonForm();
                        this.editTrainingLessonDialog = false;
                    },
                });
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

    deleteTrainingLesson(trainingLesson: ITrainingLesson) {
        this.deletionTrainingLessonDialog = true;
        this.trainingLesson = { ...trainingLesson };
    }

    confirmDeletion() {
        this.deletionTrainingLessonDialog = false;
        this.subs.add(
            this.trainingServ.deleteTrainingLessonById(this.trainingLesson.id).subscribe({
                next: (response) => {
                    if (response.code !== 460) {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: response.message,
                            life: 3000,
                        });
                        this.loadTrainingLessons();
                        this.ref.detectChanges();
                    } else {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Cannot delete because there are lesson languages associated with this training lesson',
                            life: 5000,
                        });
                        this.loadTrainingLessons();
                        this.ref.detectChanges();
                    }
                },
            })
        );
        this.trainingLesson = {} as ITrainingLesson;
        this.deletionTrainingLessonDialog = false;
    }

    declineDeletion() {
        this.deletionTrainingLessonDialog = false;
        this.trainingLesson = {} as ITrainingLesson;
        this.loadTrainingLessons();
    }

    //#endregion

    //#region Activation
    switchActivation(trainingLesson: ITrainingLesson) {
        this.switchActivationTrainingLessonDialog = true;
        this.trainingLesson = { ...trainingLesson };
    }

    declineActivation() {
        this.switchActivationTrainingLessonDialog = false;
        this.initTrainingLesson();
        this.loadTrainingLessons();
    }

    confirmtActivation() {
        this.toggleActivation(this.trainingLesson);
    }
    
    toggleActivation(trainingLesson: ITrainingLesson) {
        if (trainingLesson.isActive) {
            this.subs.add(
                this.trainingServ.deActivateTrainingLessonById(trainingLesson.id).subscribe((result) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Security Training Deactivated',
                        life: 3000,
                    });
                    this.loadTrainingLessons();
                    this.ref.detectChanges();
                })
            );
        } else {
            this.subs.add(
                this.trainingServ.activateTrainingLessonById(trainingLesson.id).subscribe((result) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Security Training Activated',
                        life: 3000,
                    });
                    this.loadTrainingLessons();
                    this.ref.detectChanges();
                })
            );
        }
        this.initTrainingLesson();
        this.switchActivationTrainingLessonDialog = false;
    }

    //#endregion

    initEditTrainingLessonForm() {
        this.editTrainingLessonForm = this.formBuilder.group({
            id: [''],
            name: ['', Validators.required],
            description: ['', Validators.required],
            trainingLessonCategoryId: ['', Validators.required],
            tages: [[]],
        });
    }

    initTrainingLesson() {
        this.trainingLesson = {
            id: '',
            name: '',
            description: '',
            trainingLessonCategoryName: '',
            trainingLessonCategoryId: '',
            trainingLessonsLanguages: [],
            isActive: true,
            lessonsCount: 0,
            wallpapersCount: 0,
            tages : []
        };
    }

    isWallSelected(wall: any): boolean {
        return !!this.checkboxStates[wall.id];
    }

    toggleSelection(event: any, wall: any) {
        const isSelected = this.isWallSelected(wall);

        if (event) {
            // If event is defined, it's from the checkbox
            if (event.checked) {
                this.addToSelected(wall);
            } else {
                this.removeFromSelected(wall);
            }
            this.checkboxStates[wall.id] = event.checked; // Update the state
        } else {
            // If event is null, it's from the div
            if (isSelected) {
                this.removeFromSelected(wall);
                this.checkboxStates[wall.id] = false; // Update the state
            } else {
                this.addToSelected(wall);
                this.checkboxStates[wall.id] = true; // Update the state
            }
        }
    }

    removeFromSelected(wall: any) {
        this.selectedWallpapers = this.selectedWallpapers.filter((w) => w.id !== wall.id);
    }

    addToSelected(wall: any) {
        this.selectedWallpapers.push(wall);
    }

    // loadWallpapers() {
    //     this.subs.add(
    //         this.wallServ.getAllLibraryWallpapers().subscribe((data) => {
    //             this.wallpapers = data;

    //             // After loading all wallpapers, check the ones associated with the lesson
    //             this.wallpapers.forEach((wall: any) => {
    //                 const isAssociated = this.selectedWallpapers.some((sw: any) => sw.id === wall.id);
    //                 if (isAssociated) {
    //                     this.checkboxStates[wall.id] = true;
    //                 }
    //             });

    //
    //         })
    //     );
    // }
    associatedWallpapers: any;

    loadWallpaperForLessonByLessonId(lessonId: string) {
        // Load all wallpapers
        this.wallServ.getAllLibraryWallpapers().subscribe((allWallpapers) => {
            this.wallpapers = allWallpapers;

            // Load associated wallpapers
            this.trainingServ
                .getAllWallpaperForLessonByLessonId(lessonId)
                .pipe(
                    finalize(() => {
                        this.selectedWallpapers = [];
                        this.checkboxStates = {};

                        setTimeout(() => {
                            this.associatedWallpapers.forEach((associatedWall: any) => {
                                this.ref.detectChanges();

                                if (associatedWall?.id) {
                                    this.checkboxStates[associatedWall.id] = true;

                                    this.selectedWallpapers.push(associatedWall);

                                    this.ref.detectChanges();
                                }
                            });
                        }, 10);
                        this.ref.detectChanges();
                    })
                )
                .subscribe((associatedData) => {
                    this.associatedWallpapers = associatedData?.data || [];
                });
        });
    }

    confirmWallpaperSelected() {
        this.chooseWllpapersDialog = false;

        const AddWallpapersToTrainingLessonDto = {
            TrainingLessonId: this.trainingLesson.id,
            WallpaperId: this.selectedWallpapers.map((x) => x.id),
        };

        this.subs.add(
            this.trainingServ.addWallpaperToTrainingLesson(AddWallpapersToTrainingLessonDto).subscribe((result) => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Wallpapers Added to Training Lesson Successfully',
                    life: 3000,
                });
                this.loadTrainingLessons();
                this.ref.detectChanges();
            })
        );
        this.checkboxStates = {};
        this.selectedWallpapers = [];
    }

    openWallpapers(training: ITrainingLesson) {
        this.loadWallpaperForLessonByLessonId(training.id);
        this.trainingLesson = training;
        this.chooseWllpapersDialog = true;
    }

    CreateWallpaper() {
        this.libraryWallpaperDialog = true;
    }

    BacktoWallapapersGallery() {
        // this.loadWallpapers();
        this.libraryWallpaperDialog = false;
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    navigateToCreateTraining() {
        this.router.navigate(['Security-Training/Security-Training-Create']);
    }

    hasPermission(controlKey: string): boolean {
        return this.pagePermessions.some((p) => p.controlKey === controlKey);
    }

    ngOnDestroy(): void {
        this.subs.unsubscribe();
    }
}
