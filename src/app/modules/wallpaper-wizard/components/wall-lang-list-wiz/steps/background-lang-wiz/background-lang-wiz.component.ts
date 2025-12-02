import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Editor } from 'ngx-editor';
import { MenuItem, MessageService, SelectItem } from 'primeng/api';
import { DataView } from 'primeng/dataview';
import { Subscription, finalize, switchMap } from 'rxjs';
import { constants } from 'src/app/core/constatnts/constatnts';
import { FileDownloadService } from 'src/app/core/Services/file-download.service';
import { LocalStorageService } from 'src/app/core/Services/local-storage.service';
import { PermessionsService } from 'src/app/core/Services/permessions.service';
import { TableLoadingService } from 'src/app/core/Services/table-loading.service';
import { TranslationService } from 'src/app/core/Services/translation.service';
import { GetUser } from 'src/app/layout/app-menuProfile/app.menuprofile.component';
import { IAspNetPageItemModel } from 'src/app/modules/page-management/models/IAspNetPageItemModel';
import { UserService } from 'src/app/modules/user/services/user.service';
import { ILibraryBackground } from 'src/app/modules/wallpaper-libraries/models/wallpaper-libraries';
import { WallpaperLibrariesService } from 'src/app/modules/wallpaper-libraries/services/wallpaper-libraries.service';

@Component({
    selector: 'app-background-lang-wiz',
    templateUrl: './background-lang-wiz.component.html',
    styleUrl: './background-lang-wiz.component.scss',
})
export class BackgroundLangWizComponent implements OnInit, OnDestroy {
    tableLoadingSpinner: boolean = true;

    editLibraryBackgroundDialog: boolean = false;
    addLibraryBackgroundDialog: boolean = false;
    deletionLibraryBackgroundDialog: boolean = false;
    switchActivationLibraryBackgroundDialog: boolean = false;
    submitted: boolean = false;
    libraryBackgrounds: ILibraryBackground[] = [];
    systemLibraryBackgrounds: ILibraryBackground[] = [];
    tenantLibraryBackgrounds: ILibraryBackground[] = [];
    libraryBackground: ILibraryBackground;
    subs: Subscription = new Subscription();
    editLibraryBackgroundForm: FormGroup;
    addLibraryBackgroundForm: FormGroup;
    editor: Editor;
    pagePermessions: IAspNetPageItemModel[] = [];
    actions = constants.pageActions;
    selectedTabIndex: number = 0;
    sortOrder: number = 0;
    sortOptions: SelectItem[] = [];
    cardMenu: MenuItem[] = [];
    ownerMenuItems: MenuItem[] = [];
    normalMenuItems: MenuItem[] = [];
    items: MenuItem[];
    selectedBackground: any = null;
    selectetBackgroundImage: File | null = null;
    selectetBackgroundImageThumbnail: File | null = null;
    user: GetUser;
    isIAwareTeamUser: boolean = false;

    libraryWallpaperId: string;
    libraryWallpaperName: string;

    imageUrl1: string = '../../../../../assets/media/upload-photo.jpg';
    imageUrlThumbnail: string = '../../../../../assets/media/upload-photo.jpg';
    sortField: string = '';
    constructor(
        private libraryBackGrServ: WallpaperLibrariesService,
        private messageService: MessageService,
        private formBuilder: FormBuilder,
        private router: Router,
        private ref: ChangeDetectorRef,
        private permessionService: PermessionsService,
        private translate: TranslationService,
        private userServ: UserService,
        private fileDownloadService: FileDownloadService,
        private route: ActivatedRoute,
        private localStorageServ: LocalStorageService,
        private tableLoadingService: TableLoadingService
    ) {
        this.pagePermessions = this.permessionService.getPagePermessions(constants.pages.libraryBackground);
    }

    ngOnInit() {
        this.tableLoadingService.loading$.subscribe((isLoading) => {
            this.tableLoadingSpinner = isLoading;
        });

        this.subs.add(
            this.userServ.getUserDetails().subscribe((res) => {
                this.user = res.data;
                if (this.user.iAwareTeam) {
                    this.isIAwareTeamUser = true;
                } else {
                    this.isIAwareTeamUser = false;
                }
            })
        );
        this.loadLibraryBackgrounds();
        this.initLibraryBackground();
        this.initLibraryBackgroundForm();

        this.route.parent?.params.subscribe((params) => {
            const id = params['id'];
            const wallName = params['wallName'];
            this.libraryWallpaperId = id;
            this.libraryWallpaperName = wallName;
        });
        const editBtn = {
            label: this.translate.getInstant('shared.actions.edit'),
            icon: 'pi pi-fw pi-pencil',
            command: () => this.editLibraryBackground(this.libraryBackground),
        };
        const deleteBtn = {
            label: this.translate.getInstant('shared.actions.delete'),
            icon: 'pi pi-fw pi-trash',
            command: () => this.deleteLibraryBackground(this.libraryBackground),
        };

        const downloadBtn = {
            label: this.translate.getInstant('shared.actions.download'),
            icon: 'pi pi-fw pi-download',
            command: () => this.download(this.libraryBackground),
        };
        const deafultBtn = {
            label: this.translate.getInstant('shared.actions.defaultInSystem'),
            icon: 'pi pi-fw pi-minus-circle',
            command: () => '',
        };

        this.ownerMenuItems = [];
        this.ownerMenuItems.push(editBtn);
        this.ownerMenuItems.push(deleteBtn);
        this.ownerMenuItems.push(downloadBtn);
        this.normalMenuItems = [];
        this.normalMenuItems.push(editBtn);
        this.normalMenuItems.push(deleteBtn);
        this.normalMenuItems.push(downloadBtn);
    }

    download(LibraryWallpaperLanguage: ILibraryBackground) {
        const filePath = LibraryWallpaperLanguage.backgroundImageUrl;
        this.fileDownloadService.downloadFile(filePath).subscribe();
    }

    assigneCurrentSelect(LibraryBackground: ILibraryBackground) {
        this.libraryBackground = LibraryBackground;
    }

    loadLibraryBackgrounds() {
        this.tableLoadingService.show();

        this.subs.add(
            this.libraryBackGrServ.getAllLibraryBackgrounds().subscribe((data: ILibraryBackground[]) => {
                this.libraryBackgrounds = data;
                this.systemLibraryBackgrounds = data.filter((bg) => bg.canEdit);
                this.tenantLibraryBackgrounds = data.filter((bg) => !bg.canEdit);
                this.checkStoredBackground();
                this.setSelectedTabIndex();
                this.ref.detectChanges();
                this.tableLoadingService.hide();
            })
        );
    }

    checkStoredBackground() {
        const storedQuote = localStorage.getItem('selectedBackground');
        if (storedQuote) {
            this.selectedBackground = JSON.parse(storedQuote);
        }
    }

    setSelectedTabIndex() {
        if (this.selectedBackground) {
            const index = this.tenantLibraryBackgrounds.findIndex((bg) => bg.id === this.selectedBackground?.id);

            if (index !== -1) {
                this.selectedTabIndex = index;
            }
        } else {
            this.selectedTabIndex = 0;
        }
    }

    Cancel() {
        const id = this.libraryWallpaperId;
        const wallName = this.libraryWallpaperName;
        this.router.navigate([`wallpaper-wizard/${id}/${wallName}/background`]);
    }

    nextPage() {
        const id = this.libraryWallpaperId;
        const wallName = this.libraryWallpaperName;
        if (this.selectedBackground) {
            this.localStorageServ.setItem('selectedBackground', this.selectedBackground);
        }
        this.router.navigate([`wallpaper-wizard/${id}/${wallName}/createWallpaperLanguage/character`]);
    }

    //#region Edit Training Lesson

    editLibraryBackground(LibraryBackground: ILibraryBackground) {
        this.selectetBackgroundImage = null;
        this.selectetBackgroundImageThumbnail = null;
        this.loadLibraryBackgrounds();
        this.libraryBackground = { ...LibraryBackground };
        this.imageUrl1 = this.libraryBackground.backgroundImageUrl;
        this.imageUrlThumbnail = this.libraryBackground.backgroundImageThumbnailUrl;
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
            const backgroundImageFileThumbnail = this.selectetBackgroundImageThumbnail;

            if (!backgroundImageFile && !backgroundImageFileThumbnail) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Please upload either a background image or a thumbnail.',
                    life: 3000,
                });
                return;
            }

            formData.append('Id', this.editLibraryBackgroundForm.value.id);

            if (backgroundImageFile) {
                formData.append('BackgroundImageUrl', backgroundImageFile, backgroundImageFile.name);
            }
            if (backgroundImageFileThumbnail) {
                formData.append('BackgroundImageThumbnailUrl', backgroundImageFileThumbnail, backgroundImageFileThumbnail.name);
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
            const backgroundImageFileThumbnail = this.selectetBackgroundImageThumbnail;
            if (backgroundImageFile && backgroundImageFileThumbnail) {
                formData.append('BackgroundImageUrl', backgroundImageFile, backgroundImageFile.name);
                formData.append('BackgroundImageThumbnailUrl', backgroundImageFileThumbnail, backgroundImageFileThumbnail.name);
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
            backgroundImageThumbnailUrl: '',
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
        this.imageUrlThumbnail = '../../../../../assets/media/upload-photo.jpg';
        this.selectetBackgroundImage = null;
        this.selectetBackgroundImageThumbnail = null;
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

    onUploadBackgroundImageThumbnailClick() {
        const fileInput = document.getElementById('myBackgroundImageThumbnail') as HTMLInputElement;
        fileInput.click();
    }

    onBackgroundImageThumbnailSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length) {
            this.selectetBackgroundImageThumbnail = input.files[0];
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.imageUrlThumbnail = e.target.result;
                this.ref.detectChanges();
            };
            reader.readAsDataURL(this.selectetBackgroundImageThumbnail);
        }
    }


    toggleSelection(quo: any) {
        if (this.selectedBackground && this.selectedBackground.id === quo.id) {
            this.removeFromSelected();
        } else {
            this.addToSelected(quo);
        }
    }

    addToSelected(char: any) {
        this.selectedBackground = char;
        localStorage.setItem('selectedBackground', JSON.stringify(char));
    }

    removeFromSelected() {
        this.selectedBackground = null;
        localStorage.removeItem('selectedBackground');
    }

    isCharSelected(char: any): boolean {
        return this.selectedBackground && this.selectedBackground.id === char.id;
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
