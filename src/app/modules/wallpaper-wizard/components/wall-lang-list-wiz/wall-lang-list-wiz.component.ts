import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MenuItem, MessageService } from 'primeng/api';
import { Subscription, finalize } from 'rxjs';

import { ActivatedRoute, Router } from '@angular/router';
import { DataView } from 'primeng/dataview';
import { Table } from 'primeng/table';
import { constants } from 'src/app/core/constatnts/constatnts';
import { PermessionsService } from 'src/app/core/Services/permessions.service';
import { ILanguageModel } from 'src/app/modules/language/models/ILanguageModel';
import { IAspNetPageItemModel } from 'src/app/modules/page-management/models/IAspNetPageItemModel';
import {
    ILibraryBackground,
    ILibraryLanguageCharacter,
    ILibraryLanguageQuote,
    ILibraryWallpaperLanguage,
} from 'src/app/modules/wallpaper-libraries/models/wallpaper-libraries';
import { WallpaperLibrariesService } from 'src/app/modules/wallpaper-libraries/services/wallpaper-libraries.service';
import { LibraryWallpaperLanguageDto } from 'src/app/modules/wallpaper-libraries/components/library-wallpaper-language/library-wallpaper-language.component';
import { FileDownloadService } from 'src/app/core/Services/file-download.service';
import { TranslationService } from 'src/app/core/Services/translation.service';
import { TableLoadingService } from 'src/app/core/Services/table-loading.service';
import { UserService } from 'src/app/modules/user/services/user.service';
import { GetUser } from 'src/app/layout/app-menuProfile/app.menuprofile.component';
import { DropdownListDataSourceService } from 'src/app/core/Services/dropdown-list-data-source.service';
@Component({
    selector: 'app-wall-lang-list-wiz',
    templateUrl: './wall-lang-list-wiz.component.html',
    styleUrl: './wall-lang-list-wiz.component.scss',
})
export class WallLangListWizComponent implements OnInit {
    tableLoadingSpinner: boolean = true;
    addDisable: boolean = true

    @Input() libraryWallpaperId: string;
    @Input() libraryWallpaperName: string;
    @Output() backToWallpapers: EventEmitter<void> = new EventEmitter<void>();

    LibraryWallpaperLanguageDialog: boolean = false;
    deletionLibraryWallpaperLanguageDialog: boolean = false;
    switchActivationLibraryWallpaperLanguageDialog: boolean = false;
    submitted: boolean = false;
    libraryWallpaperLanguages: ILibraryWallpaperLanguage[];
    defaultLanguage: ILanguageModel[] = [];
    selectedLanguage: ILanguageModel;
    languages: ILanguageModel[] = [];
    libraryWallpaperLanguage: ILibraryWallpaperLanguage;
    defaultLanguageId: any;
    selectedCategoryBanner: File | null = null;
    imageUrl: string = '../../../../../assets/media/upload-photo.jpg';

    pagePermessions: IAspNetPageItemModel[] = [];
    actions = constants.pageActions;
    currentWallId: string;
    openCategoryPageContentHtmlDialog: boolean = false;
    subs: Subscription = new Subscription();
    editWallpaperForm: FormGroup;
    activeLanguage: ILanguageModel[] = [];

    backgrounds: ILibraryBackground[];
    characters: ILibraryLanguageCharacter[] = [];
    quotes: ILibraryLanguageQuote[] = [];

    selectedBackground: ILibraryBackground | null = null;
    selectedCharacter: ILibraryLanguageCharacter | null = null;
    selectedQuote: ILibraryLanguageQuote | null = null;
    addWallpaperDialog: boolean = false;
    editWallpaperDialog: boolean = false;
    addWallpaperForm: FormGroup;

    ownerMenuItems: MenuItem[] = [];
    normalMenuItems: MenuItem[] = [];
    isEditMode: boolean = false
    isAddMode: boolean = false
    someCondition: boolean = false

    displayImageDialog: boolean = false; // Tracks dialog visibility
    currentImage: string | null = null; // Holds the selected image URL


    defaultWallpapers: boolean = false;
    user: GetUser;
    isIAwareTeamUser: boolean = false;

    constructor(
        private wallServ: WallpaperLibrariesService,
        private dropdownListDataSourceService: DropdownListDataSourceService,
        private messageService: MessageService,
        private formBuilder: FormBuilder,
        private router: Router,
        private ref: ChangeDetectorRef,
        private route: ActivatedRoute,
        private permessionService: PermessionsService,
        private fileDownloadService: FileDownloadService,
        private translate: TranslationService,
        private tableLoadingService: TableLoadingService,
        private userServ: UserService,
    ) {
        this.pagePermessions = this.permessionService.getPagePermessions(constants.pages.libraryWallpaperLanguage);
    }

    ngOnInit() {
        this.tableLoadingService.loading$.subscribe((isLoading) => {
            this.tableLoadingSpinner = isLoading;
        });
        this.getTenantDefaultLanguage();

        this.route.params.subscribe((params) => {
            const id = params['id'];
            const wallName = params['wallName'];
            const defaultWallpapers = params['where'];
            this.libraryWallpaperId = id;
            this.libraryWallpaperName = wallName;
            this.defaultWallpapers = defaultWallpapers && defaultWallpapers === 'defaultWallpapers' ? true : false;
        });

        this.loadLibraryWallpaperLanguage(this.libraryWallpaperId);
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
        this.initLibraryWallpaperLanguage();
        this.initAddWallpaperForm();
        this.initEditWallpaperForm();

        const editBtn = {
            label: this.translate.getInstant('shared.actions.edit'),
            icon: 'pi pi-fw pi-pencil',
            command: () => this.editLibraryWallpaperLanguage(this.libraryWallpaperLanguage)

        };

        const deleteBtn = {
            label: this.translate.getInstant('shared.actions.delete'),
            icon: 'pi pi-fw pi-trash',
            command: () => this.deleteLibraryWallpaperLanguage(this.libraryWallpaperLanguage),
        };

        const downloadBtn = {
            label: this.translate.getInstant('shared.actions.download'),
            icon: 'pi pi-fw pi-download',
            command: () => this.downloadLibraryWallpaperLanguage(this.libraryWallpaperLanguage),
        };

        const previewBtn = {
            label: this.translate.getInstant('shared.actions.preview'),
            icon: 'pi pi-fw pi-eye',
            command: () => this.previewLibraryWallpaperLanguage(this.libraryWallpaperLanguage),
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
        this.normalMenuItems.push(previewBtn);
        this.ownerMenuItems.push(previewBtn);

        this.subs.add(
            this.dropdownListDataSourceService.getActiveLanguages().subscribe((r) => {
                this.activeLanguage = r.data;
            })
        );

        this.subs.add(
            this.wallServ.getAllLibraryBackgrounds().subscribe((r) => {
                this.backgrounds = r;
            })
        );

        this.subs.add(
            this.wallServ.getAllLibraryLanguageCharacters().subscribe((r) => {
                this.characters = r;
            })
        );

        this.subs.add(
            this.wallServ.getAllLibraryLanguageQuotes().subscribe((r) => {
                this.quotes = r;
            })
        );

        this.addWallpaperForm.get('languageId')?.valueChanges.subscribe((languageId) => {


            this.loadQuotesAndCharacters(languageId);
            this.ref.detectChanges();
        });

        this.editWallpaperForm.get('languageId')?.valueChanges.subscribe((languageId) => {
            this.loadQuotesAndCharacters(languageId);
            this.ref.detectChanges();
        });
    }

    getTenantDefaultLanguage() {
        return this.wallServ.getTenantDefaultLanguage().subscribe((data) => {
            this.defaultLanguage[0] = data
        })
    }


    downloadLibraryWallpaperLanguage(LibraryWallpaperLanguage: ILibraryWallpaperLanguage) {
        const filePath = LibraryWallpaperLanguage.wallpaperImageUrl;
        this.fileDownloadService.downloadFile(filePath).subscribe();
    }

    // Function to close the preview
    closePreview(): void {
        this.displayImageDialog = false;
        this.currentImage = null;
    }

    previewLibraryWallpaperLanguage(LibraryWallpaperLanguage: ILibraryWallpaperLanguage) {
        this.currentImage = LibraryWallpaperLanguage.wallpaperImageUrl; // Set the image URL
        this.displayImageDialog = true; // Show the dialog
    }

    isDefaultLanguage(wall: any): boolean {
        return wall.languageId === this.defaultLanguageId;
    }

    assigneCurrentSelect(LibraryBackground: ILibraryWallpaperLanguage) {
        this.libraryWallpaperLanguage = LibraryBackground;
    }

    loadLibraryWallpaperLanguage(id: string) {
        this.tableLoadingService.show();

        this.subs.add(
            this.wallServ.getLibraryWallpaperLanguagesByLibraryWallpaperId(id).subscribe((r) => {
                this.libraryWallpaperLanguages = r;
                console.log('libraryWallpaperLanguages', this.libraryWallpaperLanguages);
                this.tableLoadingService.hide();

                this.dropdownListDataSourceService.getActiveLanguages().subscribe((languages) => {
                    if (languages.data && this.libraryWallpaperLanguages.length < languages.data.length) {
                        this.addDisable = true;
                    } else {
                        this.addDisable = false;

                    }
                });
            })
        );
    }


    CreateNewLibraryWallpaperLanguage() {
        const id = this.libraryWallpaperId;
        const wallName = this.libraryWallpaperName;
        this.router.navigate([`wallpaper-wizard/${id}/${wallName}/createWallpaperLanguage/background`]);
    }

    //#region Add Wallpaper

    getActiveLanguageForAddForm() {
        this.dropdownListDataSourceService.getActiveLanguages().subscribe({
            next: (res) => {
                this.activeLanguage = res.data;
                const p = this.libraryWallpaperLanguages.map((c) => c.languageId);
                this.activeLanguage = this.activeLanguage.filter((c) => !p.includes(c.id));
            },
            error: (err) => { },
        });
    }

    loadQuotesAndCharacters(languageId: string) {
        if (languageId) {
            this.wallServ.getLibraryLanguageQuoteByLanguageId(languageId).subscribe((quotes) => (this.quotes = quotes ?? []));
            this.wallServ
                .getLibraryLanguageCharacterByLangaugeId(languageId)
                .subscribe((characters) => (this.characters = characters ?? []));
            this.initSelected();
        }
    }

    initSelected() {
        this.selectedBackground = null;
        this.selectedCharacter = null;
        this.selectedQuote = null;
    }

    declineAddWallpaper() {
        this.addWallpaperDialog = false;
        this.initSelected();
        this.initAddWallpaperForm();
        this.addWallpaperForm.get('languageId')?.valueChanges.subscribe((languageId) => {
            this.loadQuotesAndCharacters(languageId);
            this.ref.detectChanges();
        });
    }
    selectBackgroundAdd(background: ILibraryBackground) {
        this.addWallpaperForm.patchValue({ libraryBackgroundId: background.id });
        this.selectedBackground = background;
    }

    selectCharacterAdd(char: ILibraryLanguageCharacter) {
        this.addWallpaperForm.patchValue({ libraryLanguageCharacterId: char.id });
        this.selectedCharacter = char;
    }

    selectQuoteAdd(quote: ILibraryLanguageQuote) {
        this.addWallpaperForm.patchValue({ libraryLanguageQuoteId: quote.id });
        this.selectedQuote = quote;
    }

    onRadioButtonClick(event: MouseEvent, item: any) {
        event.stopPropagation();
    }

    saveAddWallpaper() {
        this.submitted = true;
        if (this.addWallpaperForm.valid) {
            const wallpaperData: LibraryWallpaperLanguageDto = {
                LibraryWallpaperId: this.libraryWallpaperId,
                WallpaperTitle: this.addWallpaperForm.value.wallpaperTitle,
                LanguageId: this.addWallpaperForm.value.languageId,
                LibraryBackgroundId: this.addWallpaperForm.value.libraryBackgroundId,
                LibraryLanguageCharacterId: this.addWallpaperForm.value.libraryLanguageCharacterId,
                LibraryLanguageQuoteId: this.addWallpaperForm.value.libraryLanguageQuoteId,
            };
            this.subs.add(
                this.wallServ
                    .addLibraryWallpaperLanguage(wallpaperData)
                    .pipe(
                        finalize(() => {
                            this.loadLibraryWallpaperLanguage(this.libraryWallpaperId);
                            this.addWallpaperDialog = false;
                            this.submitted = false;
                            this.initSelected();
                        })
                    )
                    .subscribe(() => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Wallpaper added successfully',
                            life: 3000,
                        });
                    })
            );
        } else {
        }
    }

    initAddWallpaperForm() {
        this.addWallpaperForm = this.formBuilder.group({
            id: [''],
            wallpaperTitle: ['', Validators.required],
            languageId: ['', Validators.required],
            libraryWallpaperId: [''],
            libraryBackgroundId: [''],
            libraryLanguageCharacterId: [''],
            libraryLanguageQuoteId: [''],
        });
    }

    //#endregion

    //#region Edit Wallpaper

    selectBackgroundEdit(background: ILibraryBackground) {
        this.editWallpaperForm.patchValue({ libraryBackgroundId: background.id });
        this.selectedBackground = background;
    }

    selectCharacterEdit(char: ILibraryLanguageCharacter) {
        this.editWallpaperForm.patchValue({ libraryLanguageCharacterId: char.id });
        this.selectedCharacter = char;
    }

    selectQuoteEdit(quote: ILibraryLanguageQuote) {
        this.editWallpaperForm.patchValue({ libraryLanguageQuoteId: quote.id });
        this.selectedQuote = quote;
    }

    initEditWallpaperForm() {
        this.editWallpaperForm = this.formBuilder.group({
            id: [''],
            wallpaperTitle: ['', Validators.required],
            languageId: ['', Validators.required],
            libraryWallpaperId: [''],
            libraryBackgroundId: [''],
            libraryLanguageCharacterId: [''],
            libraryLanguageQuoteId: [''],
        });
    }

    getActiveLanguageForEditForm() {
        this.dropdownListDataSourceService.getActiveLanguages().subscribe({
            next: (res) => {
                this.activeLanguage = res.data;

                const currentLanguage = this.activeLanguage.find(
                    (lang) => lang.id === this.libraryWallpaperLanguage.languageId
                );

                if (currentLanguage) {
                    const p = this.libraryWallpaperLanguages.map((c) => c.languageId);
                    this.activeLanguage = this.activeLanguage.filter((c) => !p.includes(c.id));
                    this.activeLanguage = [...this.activeLanguage, currentLanguage];
                }

                if (this.isEnglishSelected()) {
                    this.editWallpaperForm.get('languageId')?.disable();

                } else {
                    this.editWallpaperForm.get('languageId')?.enable();
                }

            },
            error: (err) => { },
        });
    }


    isLoading = false;
    isBackgroundLoaded = false;
    isCharacterLoaded = false;
    isQuoteLoaded = false;


    editSingleLibraryWallpaperLanguage(LibraryWallpaperLanguage: ILibraryWallpaperLanguage) {
        this.libraryWallpaperLanguage = { ...LibraryWallpaperLanguage }
        this.editSingleWallpaperDialog = true
        this.selectedLang = this.libraryWallpaperLanguage.languageId
        this.imageTitle = this.libraryWallpaperLanguage.wallpaperTitle

        this.wallUrl = this.libraryWallpaperLanguage.wallpaperImageUrl
        this.wallThumbnailUrl = this.libraryWallpaperLanguage.wallpaperImageThumbnailUrl
        this.updateDropdownDisabledStatus();
        // this.getActiveLanguageForEditForm();

    }



    editLibraryWallpaperLanguage(LibraryWallpaperLanguage: ILibraryWallpaperLanguage) {
        this.getActiveLanguageForEditForm();
        // Set loading flags to track each data load
        this.libraryWallpaperLanguage = { ...LibraryWallpaperLanguage };

        if (LibraryWallpaperLanguage.libraryBackgroundId == null &&
            LibraryWallpaperLanguage.libraryLanguageCharacterId == null &&
            LibraryWallpaperLanguage.libraryLanguageQuoteId == null
        ) {

            this.editSingleLibraryWallpaperLanguage(LibraryWallpaperLanguage)

        } else {
            this.isBackgroundLoaded = false;
            this.isCharacterLoaded = false;
            this.isQuoteLoaded = false;
            // Load the background
            this.subs.add(
                this.wallServ
                    .getLibraryBackgroundById(this.libraryWallpaperLanguage.libraryBackgroundId)
                    .pipe(
                        finalize(() => {
                            this.isBackgroundLoaded = true;
                            this.checkIfAllDataLoaded();
                            localStorage.setItem('selectedBackground', JSON.stringify(this.selectedBackground));
                        })
                    )
                    .subscribe((data) => {
                        this.selectedBackground = data;
                    })
            );

            // Load the character
            this.subs.add(
                this.wallServ
                    .getLibraryLanguageCharacterById(this.libraryWallpaperLanguage.libraryLanguageCharacterId)
                    .pipe(
                        finalize(() => {
                            this.isCharacterLoaded = true;
                            this.checkIfAllDataLoaded();
                            localStorage.setItem('selectedCharacter', JSON.stringify(this.selectedCharacter));
                        })
                    )
                    .subscribe((data) => {
                        this.selectedCharacter = data;
                        this.isCharacterLoaded = true;
                        this.checkIfAllDataLoaded();
                    })
            );

            // Load the quote
            this.subs.add(
                this.wallServ
                    .getLibraryLanguageQuoteById(this.libraryWallpaperLanguage.libraryLanguageQuoteId)
                    .pipe(
                        finalize(() => {
                            this.isQuoteLoaded = true;
                            this.checkIfAllDataLoaded();
                            localStorage.setItem('selectedQuote', JSON.stringify(this.selectedQuote));
                        })
                    )
                    .subscribe((data) => {
                        this.selectedQuote = data;
                    })
            );

            localStorage.setItem('selectedLanguageId', JSON.stringify(LibraryWallpaperLanguage.languageId));
            localStorage.setItem('WallpaperTitle', JSON.stringify(LibraryWallpaperLanguage.wallpaperTitle));
            localStorage.setItem('WallpaperLangId', JSON.stringify(LibraryWallpaperLanguage.id));
            localStorage.setItem('isEditWallpaperLanguage', 'true');

            this.loadQuotesAndCharacters(LibraryWallpaperLanguage.languageId);
            this.editWallpaperForm.patchValue(LibraryWallpaperLanguage);

        }

    }

    checkIfAllDataLoaded() {
        if (this.isBackgroundLoaded && this.isCharacterLoaded && this.isQuoteLoaded) {
            this.editWallpaperDialog = true;

            const id = this.libraryWallpaperLanguage.libraryWallpaperId;
            const wallName = this.libraryWallpaperLanguage.wallpaperTitle;
            if (this.selectedBackground) {
                localStorage.setItem('selectedBackground', JSON.stringify(this.selectedBackground));
            }
            this.router.navigate([`wallpaper-wizard/${id}/${wallName}/createWallpaperLanguage/background`]);
        }
    }

    isEnglishSelected(): boolean {
        const selectedLanguageId = this.editWallpaperForm.get('languageId')?.value;
        const selectedLanguage = this.activeLanguage.find((lang) => lang.id === selectedLanguageId);
        // return selectedLanguage?.name.toLowerCase() === 'english';
        return selectedLanguage?.name.toLowerCase() === this.defaultLanguage[0].name.toLowerCase();
    }

    isDropdownDisabled: boolean = false;

    // Call this method when you need to recalculate
    updateDropdownDisabledStatus(): void {
        if (!this.selectedLang || !this.defaultLanguage || this.defaultLanguage.length === 0) {
            this.isDropdownDisabled = false;
        } else {
            console.log(111)
            const selectedLanguage = this.activeLanguage.find(lang => lang.id === this.selectedLang);
            console.log(selectedLanguage)
            console.log(selectedLanguage && selectedLanguage.name.toLowerCase())
            console.log(this.defaultLanguage[0].name.toLowerCase())

            this.isDropdownDisabled = !!(
                selectedLanguage &&
                selectedLanguage.name.toLowerCase() === this.defaultLanguage[0].name.toLowerCase()
            );
        }
        console.log(this.isDropdownDisabled)
    }

    // Call `updateDropdownDisabledStatus()` when data changes, such as in `editSingleLibraryWallpaperLanguage()`.



    declineEditLibraryWallpaperLanguage() {
        this.submitted = false;
        this.initLibraryWallpaperLanguage();
        this.editWallpaperDialog = false;
        this.initSelected();
    }

    saveEditLibraryWallpaperLanguage() {
        this.submitted = true;
        if (this.editWallpaperForm.valid) {
            const wallpaperData: LibraryWallpaperLanguageDto = {
                id: this.editWallpaperForm.value.id,
                WallpaperTitle: this.editWallpaperForm.value.wallpaperTitle,
                LanguageId: this.editWallpaperForm.value.languageId,
                LibraryWallpaperId: this.editWallpaperForm.value.libraryWallpaperId,
                LibraryBackgroundId: this.editWallpaperForm.value.libraryBackgroundId,
                LibraryLanguageCharacterId: this.editWallpaperForm.value.libraryLanguageCharacterId,
                LibraryLanguageQuoteId: this.editWallpaperForm.value.libraryLanguageQuoteId,
            };
            this.subs.add(
                this.wallServ
                    .editLibraryWallpaperLanguage(wallpaperData)
                    .pipe(
                        finalize(() => {
                            this.loadLibraryWallpaperLanguage(this.libraryWallpaperId);
                            this.editWallpaperDialog = false;
                            this.submitted = false;
                            this.initSelected();
                        })
                    )
                    .subscribe(() => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Wallpaper updated successfully',
                            life: 3000,
                        });
                    })
            );
        } else {
        }
    }

    //#endregion

    //#region Deletion

    deleteLibraryWallpaperLanguage(LibraryWallpaperLanguage: ILibraryWallpaperLanguage) {
        this.deletionLibraryWallpaperLanguageDialog = true;
        this.libraryWallpaperLanguage = { ...LibraryWallpaperLanguage };
    }

    confirmDeletion() {
        this.deletionLibraryWallpaperLanguageDialog = false;
        this.subs.add(
            this.wallServ.deleteLibraryWallpaperLanguageById(this.libraryWallpaperLanguage.id).subscribe({
                next: (response) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: response.message,
                        life: 3000,
                    });
                    this.loadLibraryWallpaperLanguage(this.libraryWallpaperId);
                    this.deletionLibraryWallpaperLanguageDialog = false;
                },
                error: (err) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to delete Wallpaper Language',
                        life: 3000,
                    });
                },
            })
        );
        this.libraryWallpaperLanguage = {} as ILibraryWallpaperLanguage;
        this.deletionLibraryWallpaperLanguageDialog = false;
    }
    declineDeletion() {
        this.deletionLibraryWallpaperLanguageDialog = false;
        this.libraryWallpaperLanguage = {} as ILibraryWallpaperLanguage;
        this.loadLibraryWallpaperLanguage(this.libraryWallpaperId);
    }

    //#endregion

    //#region Activation
    switchActivation(LibraryWallpaperLanguage: ILibraryWallpaperLanguage) {
        this.switchActivationLibraryWallpaperLanguageDialog = true;
        this.libraryWallpaperLanguage = { ...LibraryWallpaperLanguage };
    }

    declineActivation() {
        this.switchActivationLibraryWallpaperLanguageDialog = false;
        this.initLibraryWallpaperLanguage();
        this.ref.detectChanges();
        this.loadLibraryWallpaperLanguage(this.libraryWallpaperId);
    }

    confirmtActivation() {
        this.toggleActivation(this.libraryWallpaperLanguage);
    }

    toggleActivation(LibraryWallpaperLanguage: ILibraryWallpaperLanguage) {
        if (LibraryWallpaperLanguage.isActive) {
            this.subs.add(
                this.wallServ
                    .deactivateLibraryWallpaperLanguageById(LibraryWallpaperLanguage.id)
                    .subscribe((result) => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Wallpaper Language Deactivated',
                            life: 3000,
                        });
                        this.loadLibraryWallpaperLanguage(this.libraryWallpaperId);
                        this.ref.detectChanges();
                    })
            );
        } else {
            this.subs.add(
                this.wallServ.activateLibraryWallpaperLanguageById(LibraryWallpaperLanguage.id).subscribe((result) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Wallpaper Language Activated',
                        life: 3000,
                    });
                    this.loadLibraryWallpaperLanguage(this.libraryWallpaperId);
                    this.ref.detectChanges();
                })
            );
        }
        this.initLibraryWallpaperLanguage();
        this.switchActivationLibraryWallpaperLanguageDialog = false;
    }

    //#endregion


    //#region Single Wallpaper
    addNewStandaloneWallpaperDialog = false;
    editSingleWallpaperDialog = false;
    wallUrl: string = '../../../../../assets/media/upload-photo.jpg';
    wallThumbnailUrl: string = '../../../../../assets/media/upload-photo.jpg';
    selectedImage: File | null = null;
    selectedImageThumbnail: File | null = null;
    imageTitle: string;
    selectedLang: any

    onLanguageChange(event: any) {
        console.log('Selected Language:', event.value);
        this.selectedLang = event.value;
        this.ref.detectChanges();

    }

    openAddNewStandaloneWallpaperLangDialog() {
        this.isAddMode = true
        this.selectedLang = '';
        this.selectedImage = null;
        this.selectedImageThumbnail = null;
        this.wallUrl = '../../../../../assets/media/upload-photo.jpg';
        this.wallThumbnailUrl = '../../../../../assets/media/upload-photo.jpg';
        this.imageTitle = ''
        this.getActiveLanguageForAddForm();
        this.addNewStandaloneWallpaperDialog = true;
    }



    confirmAddSingleWallpaper() {

        this.submitted = true;
        // Check if required fields are filled
        if (!this.selectedLang || !this.imageTitle || (!this.libraryWallpaperLanguage.id && !this.selectedImage)) {
            this.messageService.add({
                severity: 'error',
                summary: 'Validation Error',
                detail: 'Please fill in all required fields.',
                life: 3000,
            });
            return;
        }

        const formData = new FormData();
        formData.append('WallpaperTitle', this.imageTitle);
        formData.append('LanguageId', this.selectedLang);

        if (this.libraryWallpaperLanguage.id) {
            formData.append('Id', this.libraryWallpaperLanguage.id);
        } else {
            formData.append('LibraryWallpaperId', this.libraryWallpaperId);
        }

        if (this.selectedImage) {
            formData.append('WallpaperImage', this.selectedImage, this.selectedImage.name);
        }

        if (this.selectedImageThumbnail) {
            formData.append('WallpaperImageThumbnail', this.selectedImageThumbnail, this.selectedImageThumbnail.name);
        }

        // Use appropriate service method based on the presence of an ID
        const serviceMethod = this.libraryWallpaperLanguage.id ? this.wallServ.editSingleLibraryWallpaperLanguage(formData) : this.wallServ.addSingleLibraryWallpaperLanguage(formData);
        serviceMethod.subscribe({
            next: () => {
                this.ref.detectChanges();
                this.loadLibraryWallpaperLanguage(this.libraryWallpaperId);
                this.addNewStandaloneWallpaperDialog = false;
                this.editSingleWallpaperDialog = false;
                this.submitted = false;


                this.ref.detectChanges();
                this.messageService.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Wallpaper Added',
                    life: 3000,
                });
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to Add Wallpaper',
                    life: 3000,
                });
            },
        });
    }


    declineAddSingleWallpaper() {
        this.addNewStandaloneWallpaperDialog = false;
        this.editSingleWallpaperDialog = false;
        this.loadLibraryWallpaperLanguage(this.libraryWallpaperId);
        this.ref.detectChanges();
    }

    onUploadWallpaperImageClick() {
        const fileInput = document.getElementById('addWallpaperImage') as HTMLInputElement;
        fileInput.click();
    }

    onImageSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length) {
            this.selectedImage = input.files[0];
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.wallUrl = e.target.result;
                this.ref.detectChanges();
            };
            reader.readAsDataURL(this.selectedImage);
        }
    }

    onUploadWallpaperImageThumbnailClick() {
        const fileInput = document.getElementById('addWallpaperImageThumbnail') as HTMLInputElement;
        fileInput.click();
    }

    onThumbnailImageSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length) {
            this.selectedImageThumbnail = input.files[0];
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.wallThumbnailUrl = e.target.result;
                this.ref.detectChanges();
            };
            reader.readAsDataURL(this.selectedImageThumbnail);
        }
    }


    //#endregion



    initLibraryWallpaperLanguage() {
        this.libraryWallpaperLanguage = {
            id: '',
            languageId: '',
            isActive: true,
            languageName: '',
            wallpaperImageUrl: '',
            wallpaperImageThumbnailUrl: '',
            libraryBackgroundId: '',
            wallpaperBackgroundImage: '',
            wallpaperCharacterImage: '',
            wallpaperQuote: '',
            libraryLanguageCharacterId: '',
            libraryLanguageQuoteId: '',
            libraryWallpaperId: '',
            wallpaperTitle: '',
        };
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    openContent(wall: ILibraryWallpaperLanguage) {
        this.libraryWallpaperLanguage = { ...wall };
        this.openCategoryPageContentHtmlDialog = true;
    }

    @ViewChild('dc') dc: DataView;
    @ViewChild('dq') dq: DataView;

    CharactersFilter(event: Event) {
        const inputElement = event.target as HTMLInputElement;
        const filterValue = inputElement.value;
        this.dc.filter(filterValue);
    }

    QuotesFilter(event: Event) {
        const inputElement = event.target as HTMLInputElement;
        const filterValue = inputElement.value;
        this.dq.filter(filterValue);
    }

    backToLanguages() {
        this.router.navigate(['wallpaper-wizard']);
    }

    hasPermission(controlKey: string): boolean {
        return this.pagePermessions.some((p) => p.controlKey === controlKey);
    }

    ngOnDestroy(): void {
        this.subs.unsubscribe();
    }
}
