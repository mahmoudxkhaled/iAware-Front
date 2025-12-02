import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, ConfirmationService, MenuItem } from 'primeng/api';
import { Subscription, finalize, forkJoin, switchMap } from 'rxjs';

import { Table } from 'primeng/table';
import { ILanguageModel } from 'src/app/modules/language/models/ILanguageModel';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { ITrainingCategoryModel } from 'src/app/modules/security-training/models/ISecurityTrainingCategoryModel';
import { TrainingLessonService } from 'src/app/modules/security-training/services/training-lesson.service';
import { Editor } from 'ngx-editor';
import {
    ILibraryBackground,
    ILibraryLanguageCharacter,
    ILibraryLanguageQuote,
    ILibraryWallpaperLanguage,
} from '../../models/wallpaper-libraries';
import { WallpaperLibrariesService } from '../../services/wallpaper-libraries.service';
import { AddLibraryWallpaperDto } from '../library-wallpaper/library-wallpaper.component';
import { DataView } from 'primeng/dataview';
import { PermessionsService } from 'src/app/core/Services/permessions.service';
import { IAspNetPageItemModel } from 'src/app/modules/page-management/models/IAspNetPageItemModel';
import { constants } from 'src/app/core/constatnts/constatnts';
import { DropdownListDataSourceService } from 'src/app/core/Services/dropdown-list-data-source.service';

export interface LibraryWallpaperLanguageDto {
    id?: string;
    WallpaperTitle: string;
    LibraryWallpaperId: string;
    LanguageId: string;
    LibraryBackgroundId: string;
    LibraryLanguageCharacterId: string;
    LibraryLanguageQuoteId: string;
}

@Component({
    selector: 'app-library-wallpaper-language',
    templateUrl: './library-wallpaper-language.component.html',
    styleUrl: './library-wallpaper-language.component.scss',
})
export class LibraryWallpaperLanguageComponent implements OnInit {
    @Input() libraryWallpaperId: string;
    @Input() libraryWallpaperName: string;
    @Output() backToWallpapers: EventEmitter<void> = new EventEmitter<void>();

    LibraryWallpaperLanguageDialog: boolean = false;
    deletionLibraryWallpaperLanguageDialog: boolean = false;
    switchActivationLibraryWallpaperLanguageDialog: boolean = false;
    submitted: boolean = false;
    libraryWallpaperLanguages: ILibraryWallpaperLanguage[];
    defaultLanguage: ILanguageModel[];
    selectedLanguage: ILanguageModel;
    languages: ILanguageModel[] = [];
    libraryWallpaperLanguage: ILibraryWallpaperLanguage;
    defaultLanguageId: any;
    selectedCategoryBanner: File | null = null;
    imageUrl: string = '../../../../../assets/media/upload-photo.jpg';

    iAwaremenuItems: MenuItem[] = [];
    adminMenuItems: MenuItem[] = [];
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

    constructor(
        private wallServ: WallpaperLibrariesService,
        private dropdownListDataSourceService :DropdownListDataSourceService,
        private messageService: MessageService,
        private formBuilder: FormBuilder,
        private router: Router,
        private ref: ChangeDetectorRef,
        private route: ActivatedRoute,
        private permessionService: PermessionsService
    ) {
        this.pagePermessions = this.permessionService.getPagePermessions(constants.pages.libraryWallpaperLanguage);
    }

    ngOnInit() {
        
        
        this.loadLibraryWallpaperLanguage(this.libraryWallpaperId);
        // this.route.params.subscribe((params) => {
        //     const id = params['id'];
        //     const wallName = params['wallName'];
        //     this.libraryWallpaperId = id;
        //     this.libraryWallpaperName = wallName;
        // });
        this.initLibraryWallpaperLanguage();
        this.initAddWallpaperForm();
        this.initEditWallpaperForm();

        const editBtn = {
            label: 'Edit',
            icon: 'pi pi-fw pi-pencil',
            command: () => this.editLibraryWallpaperLanguage(this.libraryWallpaperLanguage),
        };
        const deleteBtn = {
            label: 'Delete',
            icon: 'pi pi-fw pi-trash',
            command: () => this.deleteLibraryWallpaperLanguage(this.libraryWallpaperLanguage),
        };
        this.iAwaremenuItems = [];
        if (this.hasPermission(this.actions.edit)) {
            this.iAwaremenuItems.push(editBtn);
        }
        if (this.hasPermission(this.actions.delete)) {
            this.iAwaremenuItems.push(deleteBtn);
        }

        this.adminMenuItems = [];
        if (this.hasPermission(this.actions.edit)) {
            this.adminMenuItems.push(editBtn);
        }
        if (this.hasPermission(this.actions.delete)) {
            this.adminMenuItems.push(deleteBtn);
        }

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
    isDefaultLanguage(wall: any): boolean {
        return wall.languageId === this.defaultLanguageId;
    }
    assigneCurrentSelect(LibraryBackground: ILibraryWallpaperLanguage) {
        this.libraryWallpaperLanguage = LibraryBackground;
    }

    loadLibraryWallpaperLanguage(id: string) {
        this.subs.add(
            this.wallServ.getLibraryWallpaperLanguagesByLibraryWallpaperId(id).subscribe((r) => {
                this.libraryWallpaperLanguages = r;
            })
        );
    }

    CreateLibraryWallpaperLanguage() {
        this.addWallpaperDialog = true;
        this.getActiveLanguageForAddForm();
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
    }

    //#region Add Wallpaper

    getActiveLanguageForAddForm() {
        this.dropdownListDataSourceService.getActiveLanguages().subscribe({
            next: (res) => {
                this.activeLanguage = res.data;
                const p = this.libraryWallpaperLanguages.map((c) => c.languageId);
                this.activeLanguage = this.activeLanguage.filter((c) => !p.includes(c.id));
            },
            error: (err) => {
                
            },
        });
    }

    loadQuotesAndCharacters(languageId: string) {
        this.wallServ.getLibraryLanguageQuoteByLanguageId(languageId).subscribe((quotes) => (this.quotes = quotes));
        this.wallServ
            .getLibraryLanguageCharacterByLangaugeId(languageId)
            .subscribe((characters) => (this.characters = characters));
        this.initSelected();
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
            error: (err) => {
                
            },
        });
    }
    isLoading = false;
    isBackgroundLoaded = false;
    isCharacterLoaded = false;
    isQuoteLoaded = false;

    editLibraryWallpaperLanguage(LibraryWallpaperLanguage: ILibraryWallpaperLanguage) {
        this.getActiveLanguageForEditForm();
        // Set loading flags to track each data load
        this.isBackgroundLoaded = false;
        this.isCharacterLoaded = false;
        this.isQuoteLoaded = false;

        this.libraryWallpaperLanguage = { ...LibraryWallpaperLanguage };

        // Load the background
        this.subs.add(
            this.wallServ
                .getLibraryBackgroundById(this.libraryWallpaperLanguage.libraryBackgroundId)
                .pipe(
                    finalize(() => {
                        this.isBackgroundLoaded = true;
                        this.checkIfAllDataLoaded();
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
                    })
                )
                .subscribe((data) => {
                    this.selectedQuote = data;
                })
        );
        this.loadQuotesAndCharacters(LibraryWallpaperLanguage.languageId);
        this.editWallpaperForm.patchValue(LibraryWallpaperLanguage);
    }

    checkIfAllDataLoaded() {
        if (this.isBackgroundLoaded && this.isCharacterLoaded && this.isQuoteLoaded) {
            this.editWallpaperDialog = true;
        }
    }

    isEnglishSelected(): boolean {
        const selectedLanguageId = this.editWallpaperForm.get('languageId')?.value;
        const selectedLanguage = this.activeLanguage.find((lang) => lang.id === selectedLanguageId);
        return selectedLanguage?.name.toLowerCase() === 'english';
    }

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

    initLibraryWallpaperLanguage() {
        this.libraryWallpaperLanguage = {
            id: '',
            languageId: '',
            isActive: true,
            languageName: '',
            wallpaperImageUrl: '',
            wallpaperImageThumbnailUrl:'',
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
        this.backToWallpapers.emit();
    }
    hasPermission(controlKey: string): boolean {
        return this.pagePermessions.some((p) => p.controlKey === controlKey);
    }

    ngOnDestroy(): void {
        this.subs.unsubscribe();
    }
}
