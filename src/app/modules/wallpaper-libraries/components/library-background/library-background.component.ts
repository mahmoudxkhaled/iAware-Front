import { ApplicationRef, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { MessageService, ConfirmationService, MenuItem } from 'primeng/api';
import { Subscription, finalize, switchMap } from 'rxjs';
import { ILanguageModel } from 'src/app/modules/language/models/ILanguageModel';
import { TrainingLessonService } from 'src/app/modules/security-training/services/training-lesson.service';
import { DataView } from 'primeng/dataview';
import { SelectItem } from 'primeng/api';
import { Editor } from 'ngx-editor';
import { ILibraryBackground } from '../../models/wallpaper-libraries';
import { WallpaperLibrariesService } from '../../services/wallpaper-libraries.service';
import { PermessionsService } from 'src/app/core/Services/permessions.service';
import { IAspNetPageItemModel } from 'src/app/modules/page-management/models/IAspNetPageItemModel';
import { constants } from 'src/app/core/constatnts/constatnts';
@Component({
    selector: 'app-library-background',

    templateUrl: './library-background.component.html',
    styleUrl: './library-background.component.scss',
})
export class LibraryBackgroundComponent implements OnInit, OnDestroy {
    editLibraryBackgroundDialog: boolean = false;
    addLibraryBackgroundDialog: boolean = false;
    deletionLibraryBackgroundDialog: boolean = false;
    switchActivationLibraryBackgroundDialog: boolean = false;
    submitted: boolean = false;
    libraryBackgrounds: ILibraryBackground[] = [];
    libraryBackground: ILibraryBackground;
    subs: Subscription = new Subscription();
    editLibraryBackgroundForm: FormGroup;
    addLibraryBackgroundForm: FormGroup;
    editor: Editor;
    pagePermessions: IAspNetPageItemModel[] = [];
    actions = constants.pageActions;
    sortOrder: number = 0;
    sortOptions: SelectItem[] = [];
    cardMenu: MenuItem[] = [];

    items: MenuItem[];
    selectetBackgroundImage: File | null = null;

    imageUrl1: string = '../../../../../assets/media/upload-photo.jpg';
    menuItems: MenuItem[] = [];

    sortField: string = '';
    constructor(
        private libraryBackGrServ: WallpaperLibrariesService,
        private messageService: MessageService,
        private formBuilder: FormBuilder,
        private router: Router,
        private ref: ChangeDetectorRef,
        private permessionService: PermessionsService
    ) {
        this.pagePermessions = this.permessionService.getPagePermessions(constants.pages.libraryBackground);
    }

    ngOnInit() {
        this.loadLibraryBackgrounds();
        this.initLibraryBackground();
        this.initLibraryBackgroundForm();

        this.sortOptions = [
            { label: 'Name', value: 'name' },
            { label: 'Price Low to High', value: 'price' },
        ];

        const editBtn = {
            label: 'Edit',
            icon: 'pi pi-fw pi-pencil',
            command: () => this.editLibraryBackground(this.libraryBackground),
        };
        const deleteBtn = {
            label: 'Delete',
            icon: 'pi pi-fw pi-trash',
            command: () => this.deleteLibraryBackground(this.libraryBackground),
        };
        this.menuItems = [];
        if (this.hasPermission(this.actions.edit)) {
            this.menuItems.push(editBtn);
        }
        if (this.hasPermission(this.actions.delete)) {
            this.menuItems.push(deleteBtn);
        }
    }
    assigneCurrentSelect(LibraryBackground: ILibraryBackground) {
        this.libraryBackground = LibraryBackground;
    }

    loadLibraryBackgrounds() {
        this.subs.add(
            this.libraryBackGrServ.getAllLibraryBackgrounds().subscribe((data) => {
                this.libraryBackgrounds = data;
                this.ref.detectChanges();
                
            })
        );
    }

    //#region Edit Training Lesson

    editLibraryBackground(LibraryBackground: ILibraryBackground) {
        this.selectetBackgroundImage = null;
        this.loadLibraryBackgrounds();
        this.libraryBackground = { ...LibraryBackground };
        this.imageUrl1 = this.libraryBackground.backgroundImageUrl;
        this.editLibraryBackgroundForm.patchValue(LibraryBackground);
        this.editLibraryBackgroundDialog = true;
    }

    declineEditLibraryBackground() {
        this.submitted = false;
        this.initLibraryBackground();
        this.initLibraryBackgroundForm();
        this.editLibraryBackgroundDialog = false;
    }

    saveEditLibraryBackground() {
        this.submitted = true;
        if (this.editLibraryBackgroundForm.valid) {
            const formData = new FormData();
            const backgroundImageFile = this.selectetBackgroundImage;
            formData.append('Id', this.editLibraryBackgroundForm.value.id);
            if (backgroundImageFile) {
                formData.append('BackgroundImageUrl', backgroundImageFile, backgroundImageFile.name);
            }
            this.subs.add(
                this.libraryBackGrServ
                    .editLibraryBackground(formData)
                    .pipe(
                        switchMap(() => {
                            return this.libraryBackGrServ.getAllLibraryBackgrounds();
                        }),
                        finalize(() => {
                            this.loadLibraryBackgrounds();
                            this.ref.detectChanges();
                            this.initLibraryBackground();
                            this.initLibraryBackgroundForm();
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
                        next: (images) => {
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Successful',
                                detail: 'Background Image Updated',
                                life: 3000,
                            });
                            this.libraryBackgrounds = images;
                            this.editLibraryBackgroundDialog = false;
                        },
                        error: () => {
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Error',
                                detail: 'Failed to update Background Image',
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

    saveAddLibraryBackground() {
        this.submitted = true;
        if (this.addLibraryBackgroundForm.valid) {
            const formData = new FormData();
            const backgroundImageFile = this.selectetBackgroundImage;
            if (backgroundImageFile) {
                formData.append('BackgroundImageUrl', backgroundImageFile, backgroundImageFile.name);
            }
            this.subs.add(
                this.libraryBackGrServ.addLibraryBackground(formData).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Background Image Added',
                            life: 3000,
                        });
                        this.loadLibraryBackgrounds();
                        this.ref.detectChanges();
                        this.initLibraryBackground();
                        this.initLibraryBackgroundForm();
                        this.addLibraryBackgroundDialog = false;
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

    declineAddLibraryBackgroundDialog() {
        this.submitted = false;
        this.initLibraryBackground();
        this.initLibraryBackgroundForm();
        this.addLibraryBackgroundDialog = false;
    }

    //#endregion

    //#region Deletion

    deleteLibraryBackground(LibraryBackground: ILibraryBackground) {
        this.deletionLibraryBackgroundDialog = true;
        this.libraryBackground = { ...LibraryBackground };
    }
    confirmDeletion() {
        this.deletionLibraryBackgroundDialog = false;
        this.subs.add(
            this.libraryBackGrServ.deleteLibraryBackgroundById(this.libraryBackground.id).subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'info',
                        summary: 'Info',
                        detail: 'deleted successfully',
                        life: 3000,
                    });
                    this.loadLibraryBackgrounds();
                    this.ref.detectChanges();
                },
            })
        );
        this.initLibraryBackground();
        this.deletionLibraryBackgroundDialog = false;
    }
    declineDeletion() {
        this.deletionLibraryBackgroundDialog = false;
        this.initLibraryBackground();
        this.loadLibraryBackgrounds();
    }

    //#endregion

    //#region Activation
    switchActivation(LibraryBackground: ILibraryBackground) {
        this.switchActivationLibraryBackgroundDialog = true;
        this.libraryBackground = { ...LibraryBackground };
    }
    declineActivation() {
        this.switchActivationLibraryBackgroundDialog = false;
        this.initLibraryBackground();
        this.loadLibraryBackgrounds();
    }
    confirmtActivation() {
        this.toggleActivation(this.libraryBackground);
    }
    toggleActivation(LibraryBackground: ILibraryBackground) {
        if (LibraryBackground.isActive) {
            this.subs.add(
                this.libraryBackGrServ.deactivateLibraryBackgroundById(LibraryBackground.id).subscribe(() => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Background Image Deactivated',
                        life: 3000,
                    });
                    this.loadLibraryBackgrounds();
                    this.ref.detectChanges();
                })
            );
        } else {
            this.subs.add(
                this.libraryBackGrServ.activateLibraryBackgroundById(LibraryBackground.id).subscribe(() => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Background Image Activated',
                        life: 3000,
                    });
                    this.loadLibraryBackgrounds();
                    this.ref.detectChanges();
                })
            );
        }
        this.initLibraryBackground();
        this.switchActivationLibraryBackgroundDialog = false;
    }

    //#endregion

    initLibraryBackground() {
        this.libraryBackground = {
            id: '',
            backgroundImageUrl: '',
            backgroundImageThumbnailUrl:'',
            isActive: true,
        };
    }

    initLibraryBackgroundForm() {
        this.editLibraryBackgroundForm = this.formBuilder.group({
            id: [''],
            backgroundImageUrl: [null],
        });

        this.addLibraryBackgroundForm = this.formBuilder.group({
            backgroundImageUrl: [''],
        });
    }

    CreateLibraryBackground() {
        this.addLibraryBackgroundDialog = true;
        this.initLibraryBackgroundForm();
        this.initLibraryBackground();
        this.imageUrl1 = '../../../../../assets/media/upload-photo.jpg';
        this.selectetBackgroundImage = null;
    }

    onUploadBackgroundImageClick() {
        const fileInput = document.getElementById('myBackgroundImage') as HTMLInputElement;
        fileInput.click();
    }

    onBackgroundImageSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length) {
            this.selectetBackgroundImage = input.files[0];
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.imageUrl1 = e.target.result;
                this.ref.detectChanges();
            };
            reader.readAsDataURL(this.selectetBackgroundImage);
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
