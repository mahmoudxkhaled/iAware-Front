import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Console } from 'console';
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
import { ILanguageModel } from 'src/app/modules/language/models/ILanguageModel';
import { IAspNetPageItemModel } from 'src/app/modules/page-management/models/IAspNetPageItemModel';
import { TrainingLessonService } from 'src/app/modules/security-training/services/training-lesson.service';
import { UserService } from 'src/app/modules/user/services/user.service';
import {
    ILibraryLanguageCharacter,
    ILibraryWallpaperLanguage,
} from 'src/app/modules/wallpaper-libraries/models/wallpaper-libraries';
import { WallpaperLibrariesService } from 'src/app/modules/wallpaper-libraries/services/wallpaper-libraries.service';
import { DropdownListDataSourceService } from 'src/app/core/Services/dropdown-list-data-source.service';
export interface LibraryLanguageCharacterDto {
    id: string;
    characterName: string;
    characterImageUrl: string;
    languageId: string;
    languageName: string;
    isActive: boolean;
}

export interface CharacterLanguageGroup {
    languageId: string;
    languageName: string;
    characters: LibraryLanguageCharacterDto[];
}

@Component({
    selector: 'app-character-lang-wiz',
    templateUrl: './character-lang-wiz.component.html',
    styleUrl: './character-lang-wiz.component.scss',
})
export class CharacterLangWizComponent implements OnInit, OnDestroy {
    tableLoadingSpinner: boolean = true;

    editLibraryCharacterDialog: boolean = false;
    addLibraryCharacterDialog: boolean = false;
    deletionLibraryCharacterDialog: boolean = false;
    switchActivationLibraryCharacterDialog: boolean = false;
    submitted: boolean = false;
    defaultLanguage: ILanguageModel[] = [];
    libraryCharacters: ILibraryLanguageCharacter[] = [];
    CharacterLanguageGroups: CharacterLanguageGroup[] = [];

    libraryCharacter: ILibraryLanguageCharacter;
    selectedLanguage: ILanguageModel | null = null;
    selectedLanguageAdd: ILanguageModel[] = [];
    subs: Subscription = new Subscription();
    countOfActiveLanguages: Number;
    editLibraryCharacterForm: FormGroup;
    addLibraryCharacterForm: FormGroup;
    editor: Editor;
    pagePermessions: IAspNetPageItemModel[] = [];
    actions = constants.pageActions;
    sortOrder: number = 0;
    sortOptions: SelectItem[] = [];
    cardMenu: MenuItem[] = [];
    activeLanguages: ILanguageModel[] = [];
    items: MenuItem[];
    isEditWallpaperLanguage: boolean = false;

    imageUrl1: string = '../../../../../assets/media/upload-photo.jpg';
    selectetCharacterImage: File | null = null;
    selectetCharacterImageThumbnail: File | null = null;
    imageUrlThumbnail: string = '../../../../../assets/media/upload-photo.jpg';
    ownerMenuItems: MenuItem[] = [];
    normalMenuItems: MenuItem[] = [];
    isIAwareTeamUser: boolean = false;
    user: GetUser;

    sortField: string = '';

    constructor(
        private trainingServ: TrainingLessonService,
        private dropdownListDataSourceService: DropdownListDataSourceService,
        private libraryWallServ: WallpaperLibrariesService,
        private messageService: MessageService,
        private formBuilder: FormBuilder,
        private router: Router,
        private ref: ChangeDetectorRef,
        private permessionService: PermessionsService,
        private route: ActivatedRoute,
        private localStorageServ: LocalStorageService,
        private fileDownloadService: FileDownloadService,
        private translate: TranslationService,
        private userServ: UserService,
        private tableLoadingService: TableLoadingService
    ) {
        this.pagePermessions = this.permessionService.getPagePermessions(constants.pages.libraryCharacter);
    }
    libraryWallpaperId: string;
    libraryWallpaperName: string;
    ngOnInit() {
        this.tableLoadingService.loading$.subscribe((isLoading) => {
            this.tableLoadingSpinner = isLoading;
        });
        this.tableLoadingService.show();

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

        this.getActiveLanguages();
        this.isEditWallpaperLanguage = this.localStorageServ.getItem('isEditWallpaperLanguage');

        this.route.parent?.params.subscribe((params) => {
            const id = params['id'];
            const wallName = params['wallName'];
            this.libraryWallpaperId = id;
            this.libraryWallpaperName = wallName;
        });
        this.initLibraryCharacter();
        this.initLibraryCharacterForm();

        const editBtn = {
            label: this.translate.getInstant('shared.actions.edit'),
            icon: 'pi pi-fw pi-pencil',
            command: () => this.editLibraryCharacter(this.libraryCharacter),
        };
        const deleteBtn = {
            label: this.translate.getInstant('shared.actions.delete'),
            icon: 'pi pi-fw pi-trash',
            command: () => this.deleteLibraryCharacter(this.libraryCharacter),
        };
        const downloadBtn = {
            label: this.translate.getInstant('shared.actions.download'),
            icon: 'pi pi-fw pi-download',
            command: () => this.download(this.libraryCharacter),
        };

        const deafultBtn = {
            label: this.translate.getInstant('shared.actions.defaultInSystem'),
            icon: 'pi pi-fw pi-minus-circle',
            command: () => '',
        };

        this.ownerMenuItems = [];

        if (this.hasPermission(this.actions.edit)) {
            this.ownerMenuItems.push(editBtn);
        }
        if (this.hasPermission(this.actions.delete)) {
            this.ownerMenuItems.push(deleteBtn);
        }
        this.ownerMenuItems.push(downloadBtn);

        this.normalMenuItems = [];

        this.normalMenuItems.push(deafultBtn);
        this.normalMenuItems.push(downloadBtn);

        this.selectedTabIndex = this.localStorageServ.getItem('selectedCharacterTabIndex');
    }

    download(LibraryWallpaperLanguage: ILibraryLanguageCharacter) {
        const filePath = LibraryWallpaperLanguage.characterImageUrl;
        this.fileDownloadService.downloadFile(filePath).subscribe();
    }

    libraryWallpaperLanguages: ILibraryWallpaperLanguage[];

    loadLibraryWallpaperLanguage(id: string) {
        this.subs.add(
            this.libraryWallServ.getLibraryWallpaperLanguagesByLibraryWallpaperId(id).subscribe((r) => {
                this.libraryWallpaperLanguages = r;
                this.loadLibraryCharacters();
            })
        );
    }

    getActiveLanguages() {
        this.dropdownListDataSourceService
            .getActiveLanguages()
            .pipe(
                finalize(() => {
                    this.loadLibraryWallpaperLanguage(this.libraryWallpaperId);
                })
            )
            .subscribe({
                next: (res) => {
                    this.activeLanguages = res.data;

                    let selectedLanguageId = this.localStorageServ.getItem('selectedLanguageId');

                    if (selectedLanguageId) {
                        const selectedLanguage = this.activeLanguages.find((x) => x.id === selectedLanguageId!);

                        if (selectedLanguage) {
                            this.activeLanguages = [selectedLanguage];
                        }
                    }
                },
            });
    }

    getActiveLanguageForAddForm() {
        const p = this.libraryWallpaperLanguages.map((c) => c.languageId);
        this.activeLanguages = this.activeLanguages.filter((c) => !p.includes(c.id));
        this.trainingServ.setActiveLanguagesAdd(this.activeLanguages);
        this.CharacterLanguageGroups = this.CharacterLanguageGroups.filter((group) =>
            this.activeLanguages.some((language) => language.id === group.languageId)
        );
    }

    getActiveLanguageForEditForm() {
        this.CharacterLanguageGroups = this.CharacterLanguageGroups.filter((group) =>
            this.activeLanguages.some((language) => language.id === group.languageId)
        );
    }

    assigneCurrentSelect(LibraryCharacter: ILibraryLanguageCharacter, langId: string) {
        this.libraryCharacter = LibraryCharacter;
        this.selectedLanguage = this.activeLanguages.find((x) => x.id === langId) || null;
    }

    loadLibraryCharacters() {
        this.subs.add(
            this.libraryWallServ
                .getAllLibraryLanguageCharactersGroupedByLanguageId()
                .pipe(
                    finalize(() => {
                        if (this.isEditWallpaperLanguage) {
                            this.getActiveLanguageForEditForm();
                            this.tableLoadingService.hide();
                        } else {
                            this.getActiveLanguageForAddForm();
                            this.tableLoadingService.hide();
                        }
                    })
                )
                .subscribe((data) => {
                    this.CharacterLanguageGroups = data.data;
                    this.checkStoredCharacter();
                    this.setSelectedTabIndex();
                    this.ref.detectChanges();
                })
        );
    }

    checkStoredCharacter() {
        this.selectedCharacter = this.localStorageServ.getItem('selectedCharacter');
    }

    //#region Edit Training Lesson

    editLibraryCharacter(LibraryCharacter: ILibraryLanguageCharacter) {
        this.selectetCharacterImage = null;
        this.selectetCharacterImageThumbnail = null;
        this.selectLanguage(this.selectedLanguage!);
        this.libraryCharacter = { ...LibraryCharacter };
        this.imageUrl1 = this.libraryCharacter.characterImageUrl;
        this.imageUrlThumbnail = this.libraryCharacter.characterImageThumbnailUrl;
        this.editLibraryCharacterForm.patchValue(LibraryCharacter);
        this.editLibraryCharacterDialog = true;
    }

    declineEditLibraryCharacter() {
        this.submitted = false;
        this.initLibraryCharacter();
        this.initLibraryCharacterForm();
        this.editLibraryCharacterDialog = false;
    }

    saveEditLibraryCharacter() {
        this.submitted = true;
    
        if (this.editLibraryCharacterForm.valid) {
            const formData = new FormData();
            formData.append('Id', this.editLibraryCharacterForm.value.id);
            formData.append('CharacterName', this.editLibraryCharacterForm.value.characterName);
            formData.append('LanguageId', this.editLibraryCharacterForm.value.languageId);
    
            // Check if at least one of the files is provided
            if (!this.selectetCharacterImage && !this.selectetCharacterImageThumbnail) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Please upload either a character image or a thumbnail.',
                    life: 3000,
                });
                return;
            }
    
            // Append files to FormData if they exist
            if (this.selectetCharacterImage) {
                formData.append('CharacterImageUrl', this.selectetCharacterImage, this.selectetCharacterImage.name);
            }
            if (this.selectetCharacterImageThumbnail) {
                formData.append('CharacterImageThumbnailUrl', this.selectetCharacterImageThumbnail, this.selectetCharacterImageThumbnail.name);
            }
    
            this.subs.add(
                this.libraryWallServ
                    .editLibraryLanguageCharacter(formData)
                    .pipe(
                        switchMap(() => {
                            return this.libraryWallServ.getAllLibraryLanguageCharacters();
                        }),
                        finalize(() => {
                            this.loadLibraryCharacters();
                            this.ref.detectChanges();
                            this.initLibraryCharacter();
                            this.initLibraryCharacterForm();
                        })
                    )
                    .subscribe({
                        next: (images) => {
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Successful',
                                detail: 'Character Image Updated',
                                life: 3000,
                            });
    
                            this.libraryCharacters = images;
                            this.editLibraryCharacterDialog = false;
                        },
                        error: () => {
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Error',
                                detail: 'Failed to update Character Image',
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

    saveAddLibraryCharacter() {
        this.submitted = true;
        if (this.addLibraryCharacterForm.valid) {
            const formData = new FormData();
            formData.append('CharacterName', this.addLibraryCharacterForm.value.characterName);
            formData.append('LanguageId', this.addLibraryCharacterForm.value.languageId);
            if (this.selectetCharacterImage && this.selectetCharacterImageThumbnail) {
                formData.append('CharacterImageUrl', this.selectetCharacterImage, this.selectetCharacterImage.name);
                formData.append('CharacterImageThumbnailUrl', this.selectetCharacterImageThumbnail, this.selectetCharacterImageThumbnail.name);
                this.subs.add(
                    this.libraryWallServ.addLibraryLanguageCharacter(formData).subscribe({
                    next: () => {
                        this.addLibraryCharacterDialog = false;
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Character Image Added',
                            life: 3000,
                        });

                        this.loadLibraryCharacters();
                        this.ref.detectChanges();
                        this.initLibraryCharacter();
                        this.initLibraryCharacterForm();
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

    declineAddLibraryCharacterDialog() {
        this.submitted = false;
        this.initLibraryCharacter();
        this.initLibraryCharacterForm();
        this.addLibraryCharacterDialog = false;
    }

    //#endregion

    //#region Deletion

    deleteLibraryCharacter(LibraryCharacter: ILibraryLanguageCharacter) {
        this.deletionLibraryCharacterDialog = true;
        this.libraryCharacter = { ...LibraryCharacter };
    }

    confirmDeletion() {
        this.deletionLibraryCharacterDialog = false;
        this.subs.add(
            this.libraryWallServ
                .deleteLibraryLanguageCharacterById(this.libraryCharacter.id)

                .subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'info',
                            summary: 'Info',
                            detail: 'deleted successfully',
                            life: 3000,
                        });

                        console.log(this.selectedLanguage);
                        this.loadLibraryCharacters();

                        // this.selectLanguage(this.selectedLanguage!);
                        this.ref.detectChanges();
                    },
                })
        );
        this.initLibraryCharacter();
        this.deletionLibraryCharacterDialog = false;
    }

    declineDeletion() {
        this.deletionLibraryCharacterDialog = false;
        this.initLibraryCharacter();
        this.selectLanguage(this.selectedLanguage!);
    }

    //#endregion

    //#region Activation
    switchActivation(LibraryCharacter: ILibraryLanguageCharacter) {
        this.switchActivationLibraryCharacterDialog = true;
        this.libraryCharacter = { ...LibraryCharacter };
    }

    declineActivation() {
        this.switchActivationLibraryCharacterDialog = false;
        this.initLibraryCharacter();
        this.selectLanguage(this.selectedLanguage!);
    }

    confirmtActivation() {
        this.toggleActivation(this.libraryCharacter);
    }

    toggleActivation(LibraryCharacter: ILibraryLanguageCharacter) {
        if (LibraryCharacter.isActive) {
            this.subs.add(
                this.libraryWallServ.deactivateLibraryLanguageCharacterById(LibraryCharacter.id).subscribe(() => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Character Image Deactivated',
                        life: 3000,
                    });
                    this.selectLanguage(this.selectedLanguage!);
                    this.ref.detectChanges();
                })
            );
        } else {
            this.subs.add(
                this.libraryWallServ.activateLibraryLanguageCharacterById(LibraryCharacter.id).subscribe(() => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Character Image Activated',
                        life: 3000,
                    });
                    this.selectLanguage(this.selectedLanguage!);
                    this.ref.detectChanges();
                })
            );
        }
        this.initLibraryCharacter();
        this.switchActivationLibraryCharacterDialog = false;
    }

    //#endregion

    initLibraryCharacter() {
        this.libraryCharacter = {
            id: '',
            characterImageUrl: '',
            characterImageThumbnailUrl:'',
            languageName: '',
            characterName: '',
            languageId: '',
            isActive: true,
        };
    }

    initLibraryCharacterForm() {
        this.editLibraryCharacterForm = this.formBuilder.group({
            id: [''],
            characterName: [''],
            languageId: [this.selectedLanguage?.id!],
            characterImageUrl: [null],
        });

        this.addLibraryCharacterForm = this.formBuilder.group({
            characterName: [''],
            languageId: [this.selectedLanguage?.id!],
            characterImageUrl: [''],
        });
    }

    CreateLibraryCharacter(languageId: string) {
        this.addLibraryCharacterDialog = true;
        this.initLibraryCharacterForm();
        this.initLibraryCharacter();
        this.imageUrl1 = '../../../../../assets/media/upload-photo.jpg';
        this.imageUrlThumbnail = '../../../../../assets/media/upload-photo.jpg';
        this.selectetCharacterImage = null;
        this.selectetCharacterImageThumbnail = null;
        this.selectedLanguageAdd = this.activeLanguages.filter((x) => x.id === languageId);
        this.addLibraryCharacterForm.controls['languageId'].setValue(languageId);
    }

    onUploadCharacterImageClick() {
        const fileInput = document.getElementById('myCharacterImage') as HTMLInputElement;
        fileInput.click();
    }

    onCharacterImageSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length) {
            this.selectetCharacterImage = input.files[0];
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.imageUrl1 = e.target.result;
                this.ref.detectChanges();
            };
            reader.readAsDataURL(this.selectetCharacterImage);
        }
    }

    onUploadCharacterImageThumbnailClick() {
        const fileInput = document.getElementById('myCharacterImageThumbnail') as HTMLInputElement;
        fileInput.click();
    }

    onCharacterImageThumbnailSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length) {
            this.selectetCharacterImageThumbnail = input.files[0];
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.imageUrlThumbnail = e.target.result;
                this.ref.detectChanges();
            };
            reader.readAsDataURL(this.selectetCharacterImageThumbnail);
        }
    }

    selectedLanguageName: string | null = null;
    selectLanguage(lang: ILanguageModel) {
        this.selectedLanguage = lang;
        this.libraryWallServ.getLibraryLanguageCharacterByLangaugeId(lang.id).subscribe((data) => {
            this.libraryCharacters = data;
        });
        this.selectedLanguageAdd = [lang];
    }
    backToLanguages() {
        this.selectedLanguage = null;
        this.selectedLanguageAdd = [];
        this.libraryCharacters = [];
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

    selectedCharacter: any = null;

    toggleSelection(quo: any) {
        if (this.selectedCharacter && this.selectedCharacter.id === quo.id) {
            this.removeFromSelected();
        } else {
            this.addToSelected(quo);
        }
    }

    addToSelected(char: any) {
        this.selectedCharacter = char;
        this.localStorageServ.setItem('selectedCharacter', char);
    }

    removeFromSelected() {
        this.selectedCharacter = null;
        this.localStorageServ.removeItem('selectedCharacter');
    }

    isCharSelected(char: any): boolean {
        return this.selectedCharacter && this.selectedCharacter.id === char.id;
    }

    selectedTabIndex: number;

    setSelectedTabIndex() {
        if (this.selectedCharacter) {
            const selectedLanguageId = this.selectedCharacter.languageId;
            const index = this.CharacterLanguageGroups.findIndex((group) => group.languageId === selectedLanguageId);
            if (index !== -1) {
                this.selectedTabIndex = index;
            }
        }
    }

    nextPage() {
        const id = this.libraryWallpaperId;
        const wallName = this.libraryWallpaperName;
        if (this.selectedCharacter) {
            this.localStorageServ.setItem('selectedCharacter', this.selectedCharacter);
        }
        this.router.navigate([`wallpaper-wizard/${id}/${wallName}/createWallpaperLanguage/quote`]);
    }

    prevPage() {
        const id = this.libraryWallpaperId;
        const wallName = this.libraryWallpaperName;
        if (this.selectedCharacter) {
            this.localStorageServ.setItem('selectedCharacter', this.selectedCharacter);
        }
        this.router.navigate([`wallpaper-wizard/${id}/${wallName}/createWallpaperLanguage/background`]);
    }

    ngOnDestroy() {
        this.subs.unsubscribe();
    }
}
