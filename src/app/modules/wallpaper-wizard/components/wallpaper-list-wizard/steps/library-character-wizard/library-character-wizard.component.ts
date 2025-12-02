import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { Editor } from 'ngx-editor';
import { MenuItem, MessageService, SelectItem } from 'primeng/api';
import { DataView } from 'primeng/dataview';
import { Subscription, finalize, switchMap } from 'rxjs';
import { constants } from 'src/app/core/constatnts/constatnts';
import { LocalStorageService } from 'src/app/core/Services/local-storage.service';
import { PermessionsService } from 'src/app/core/Services/permessions.service';
import { TableLoadingService } from 'src/app/core/Services/table-loading.service';
import { TranslationService } from 'src/app/core/Services/translation.service';
import { GetUser } from 'src/app/layout/app-menuProfile/app.menuprofile.component';
import { ILanguageModel } from 'src/app/modules/language/models/ILanguageModel';
import { IAspNetPageItemModel } from 'src/app/modules/page-management/models/IAspNetPageItemModel';
import { TrainingLessonService } from 'src/app/modules/security-training/services/training-lesson.service';
import { UserService } from 'src/app/modules/user/services/user.service';
import { ILibraryLanguageCharacter } from 'src/app/modules/wallpaper-libraries/models/wallpaper-libraries';
import { WallpaperLibrariesService } from 'src/app/modules/wallpaper-libraries/services/wallpaper-libraries.service';
import { DropdownListDataSourceService } from 'src/app/core/Services/dropdown-list-data-source.service';
@Component({
    selector: 'app-library-character-wizard',
    templateUrl: './library-character-wizard.component.html',
    styleUrl: './library-character-wizard.component.scss',
})
export class LibraryCharacterWizardComponent implements OnInit, OnDestroy {
    tableLoadingSpinner: boolean = true;

    editLibraryCharacterDialog: boolean = false;
    addLibraryCharacterDialog: boolean = false;
    deletionLibraryCharacterDialog: boolean = false;
    switchActivationLibraryCharacterDialog: boolean = false;
    submitted: boolean = false;
    defaultLanguage: ILanguageModel[] = [];
    libraryCharacters: ILibraryLanguageCharacter[] = [];
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
    selectetCharacterImage: File | null = null;
    imageUrl1: string = '../../../../../assets/media/upload-photo.jpg';
    selectetCharacterImageThumbnail: File | null = null;
    imageUrlThumbnail: string = '../../../../../assets/media/upload-photo.jpg';
    menuItems: MenuItem[] = [];
    selectedCharacter: any = null;
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
        private translate: TranslationService,
        private userServ: UserService,
        private localStorageServ: LocalStorageService,
        private tableLoadingService: TableLoadingService
    ) {
        this.pagePermessions = this.permessionService.getPagePermessions(constants.pages.libraryCharacter);
    }

    ownerMenuItems: MenuItem[] = [];
    normalMenuItems: MenuItem[] = [];
    user: GetUser;
    isIAwareTeamUser: boolean = false;

    ngOnInit() {
        this.tableLoadingService.loading$.subscribe((isLoading) => {
            this.tableLoadingSpinner = isLoading;
        });

        this.tableLoadingService.show();
        this.subs.add(
            this.libraryWallServ
                .getTenantDefaultLanguage()
                .pipe(
                    finalize(() => {
                        this.subs.add(
                            this.libraryWallServ
                                .getLibraryLanguageCharacterByLangaugeId(this.defaultLanguage[0].id)
                                .pipe(
                                    finalize(() => {
                                        this.tableLoadingService.hide();
                                    })
                                )
                                .subscribe((r) => {
                                    this.libraryCharacters = r;
                                    this.checkStoredCharacter();
                                    this.filterCharactersForLanguages();
                                })
                        );
                    })
                )
                .subscribe((res) => {
                    this.defaultLanguage = [res];
                    //
                })
        );
        const wallLanguage = this.localStorageServ.getItem('wallLanguage');
        this.selectedLanguage = wallLanguage;
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
        this.loadLibraryCharacters();
        this.initLibraryCharacter();
        this.initLibraryCharacterForm();

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
        // const downloadBtn = {
        //     label: this.translate.getInstant('shared.actions.download'),
        //     icon: 'pi pi-fw pi-download',
        //     command: () => this.download(this.libraryCharacter),
        // };

        const deafultBtn = {
            label: this.translate.getInstant('shared.actions.defaultInSystem'),
            icon: 'pi pi-fw pi-minus-circle',
            command: () => '',
        };

        this.ownerMenuItems = [];

        this.ownerMenuItems.push(editBtn);
        this.ownerMenuItems.push(deleteBtn);
        // this.ownerMenuItems.push(downloadBtn);
        // this.normalMenuItems.push(deafultBtn);
        // this.normalMenuItems.push(downloadBtn);

        this.filterCharactersForLanguages();
    }

    assigneCurrentSelect(LibraryCharacter: ILibraryLanguageCharacter, lang: ILanguageModel) {
        this.libraryCharacter = LibraryCharacter;
        this.selectedLanguage = lang;
    }

    loadLibraryCharacters() {
        this.subs.add(
            this.libraryWallServ
                .getAllLibraryLanguageCharacters()
                .pipe(finalize(() => { }))
                .subscribe((data) => {
                    this.libraryCharacters = data;
                    this.checkStoredCharacter();
                    this.ref.detectChanges();
                    this.subs.add(
                        this.dropdownListDataSourceService
                            .getActiveLanguages()
                            .pipe(
                                finalize(() => {
                                    this.filterCharactersForLanguages();
                                })
                            )
                            .subscribe((res) => {
                                this.activeLanguages = res.data;
                            })
                    );
                })
        );
    }
    checkStoredCharacter() {
        const storedQuote = localStorage.getItem('selectedCharacter');
        if (storedQuote) {
            this.selectedCharacter = JSON.parse(storedQuote);
        }
    }

    //#region Edit Training Lesson

    editLibraryCharacter(LibraryCharacter: ILibraryLanguageCharacter) {
        this.selectetCharacterImage = null;
        this.selectetCharacterImageThumbnail = null;
        this.selectLanguage(this.selectedLanguage!);
        this.libraryCharacter = { ...LibraryCharacter };
        this.imageUrl1 = LibraryCharacter.characterImageUrl;
        this.imageUrlThumbnail = LibraryCharacter.characterImageThumbnailUrl;
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
        if (this.addLibraryCharacterForm.valid && this.selectetCharacterImage && this.selectetCharacterImageThumbnail) {
            const formData = new FormData();
            formData.append('CharacterName', this.addLibraryCharacterForm.value.characterName);
            formData.append('LanguageId', this.addLibraryCharacterForm.value.languageId);
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
                        this.initLibraryCharacter();
                        this.initLibraryCharacterForm();
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
            this.libraryWallServ.deleteLibraryLanguageCharacterById(this.libraryCharacter.id).subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'info',
                        summary: 'Info',
                        detail: 'deleted successfully',
                        life: 3000,
                    });
                    this.selectLanguage(this.selectedLanguage!);
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
            characterImageThumbnailUrl: '',
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

    CreateLibraryCharacter(language: ILanguageModel) {
        this.addLibraryCharacterDialog = true;
        this.initLibraryCharacterForm();
        this.initLibraryCharacter();
        this.imageUrl1 = '../../../../../assets/media/upload-photo.jpg';
        this.imageUrlThumbnail = '../../../../../assets/media/upload-photo.jpg';
        this.selectetCharacterImage = null;
        this.selectetCharacterImageThumbnail = null;
        this.selectedLanguageAdd = [language];
        this.addLibraryCharacterForm.controls['languageId'].setValue(language.id);
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
        this.tableLoadingService.show();
        this.selectedLanguage = lang;
        this.libraryWallServ
            .getLibraryLanguageCharacterByLangaugeId(lang.id)
            .pipe(
                finalize(() => {
                    this.filterCharactersForLanguages();
                    this.tableLoadingService.hide();
                })
            )
            .subscribe((data) => {
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

    filteredCharactersByLanguage: { [key: string]: ILibraryLanguageCharacter[] } = {};

    filterCharactersForLanguages() {
        this.filteredCharactersByLanguage = {};
        this.defaultLanguage.forEach((language) => {
            this.filteredCharactersByLanguage[language.id] = this.libraryCharacters.filter(
                (char) => char.languageId === language.id
            );
        });
    }

    toggleSelection(quo: any) {
        if (this.selectedCharacter && this.selectedCharacter.id === quo.id) {
            this.removeFromSelected();
        } else {
            this.addToSelected(quo);
        }
    }

    addToSelected(char: any) {
        this.selectedCharacter = char;
        localStorage.setItem('selectedCharacter', JSON.stringify(char));
    }

    removeFromSelected() {
        this.selectedCharacter = null;
        localStorage.removeItem('selectedCharacter');
    }

    isCharSelected(char: any): boolean {
        return this.selectedCharacter && this.selectedCharacter.id === char.id;
    }

    nextPage() {
        if (this.selectedCharacter) {
            localStorage.setItem('selectedCharacter', JSON.stringify(this.selectedCharacter));
        }
        this.router.navigate(['wallpaper-wizard/create/quote']);
    }

    prevPage() {
        this.router.navigate(['wallpaper-wizard/create/background']);
    }
    ngOnDestroy() {
        this.subs.unsubscribe();
    }
}
