import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, MenuItem } from 'primeng/api';
import { finalize, Subscription } from 'rxjs';

import { Table } from 'primeng/table';
import { ILanguageModel } from 'src/app/modules/language/models/ILanguageModel';
import {
    ILibraryBackground,
    ILibraryLanguageCharacter,
    ILibraryLanguageQuote,
    ILibraryWallpaper,
} from '../../models/wallpaper-libraries';
import { WallpaperLibrariesService } from '../../services/wallpaper-libraries.service';
import { DataView } from 'primeng/dataview';
import { Router } from '@angular/router';
import { PermessionsService } from 'src/app/core/Services/permessions.service';
import { IAspNetPageItemModel } from 'src/app/modules/page-management/models/IAspNetPageItemModel';
import { constants } from 'src/app/core/constatnts/constatnts';
import { DropdownListDataSourceService } from 'src/app/core/Services/dropdown-list-data-source.service';
export interface AddLibraryWallpaperDto {
    WallpaperTitle: string;
    LanguageId: string;
    LibraryBackgroundId: string;
    LibraryLanguageCharacterId: string;
    LibraryLanguageQuoteId: string;
}

@Component({
    selector: 'app-library-wallpaper',
    templateUrl: './library-wallpaper.component.html',
    styleUrl: './library-wallpaper.component.scss',
})
export class LibraryWallpaperComponent implements OnInit {
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
    selectedWallpaper: { id: string; title: string } | null = null;

    editWallpaperDialog: boolean = false;
    deletionWallpaperDialog: boolean = false;
    switchActivationWallpaperDialog: boolean = false;
    openCategoryPageContentHtmlDialog: boolean = false;

    addWallpaperDialog: boolean = false;
    submitted: boolean = false;
    wallpapers: ILibraryWallpaper[];
    defaultLanguage: ILanguageModel[] = [];
    selectedLanguage: ILanguageModel;
    wallpaper: ILibraryWallpaper;
    subs: Subscription = new Subscription();
    countOfActiveLanguages: Number;
    pagePermessions: IAspNetPageItemModel[] = [];
    actions = constants.pageActions;
    editWallpaperForm: FormGroup;
    addWallpaperForm: FormGroup;

    backgrounds: ILibraryBackground[];
    characters: ILibraryLanguageCharacter[] = [];
    quotes: ILibraryLanguageQuote[] = [];

    selectedBackground: ILibraryBackground | null = null;
    selectedCharacter: ILibraryLanguageCharacter | null = null;
    selectedQuote: ILibraryLanguageQuote | null = null;
    activeLanguages: ILanguageModel[] = [];
    menuItems: MenuItem[] = [];

    constructor(
        private wallServ: WallpaperLibrariesService,
        private messageService: MessageService,
        private formBuilder: FormBuilder,
        private ref: ChangeDetectorRef,
        private router: Router,
        private permessionService: PermessionsService,
        private dropdownListDataSourceService: DropdownListDataSourceService
    ) {
        this.pagePermessions = this.permessionService.getPagePermessions(constants.pages.libraryWallpaper);
        this.subs.add(
            this.wallServ
                .getTenantDefaultLanguage()
                .pipe(
                    finalize(() => {
                        this.subs.add(
                            this.wallServ
                                .getLibraryLanguageQuoteByLanguageId(this.defaultLanguage[0].id)
                                .subscribe((r) => {
                                    this.quotes = r;
                                })
                        );
                        this.subs.add(
                            this.wallServ
                                .getLibraryLanguageCharacterByLangaugeId(this.defaultLanguage[0].id)
                                .subscribe((r) => {
                                    this.characters = r;
                                })
                        );
                    })
                )
                .subscribe((res) => {
                    this.defaultLanguage = [res];
                    
                })
        );
    }

    ngOnInit() {
        this.loadWallpapers();
        this.initWallpaper();
        this.initEditWallpaperForm();
        this.initAddWallpaperForm();
        const deleteBtn = {
            label: 'Delete',
            icon: 'pi pi-fw pi-trash',
            command: () => this.deleteWallpaper(this.wallpaper),
        };
        const editBtn = {
            label: 'Edit',
            icon: 'pi pi-fw pi-pencil',
            command: () => this.editWallpaper(this.wallpaper),
        };
        this.menuItems = [];
        if (this.hasPermission(this.actions.edit)) {
            // this.menuItems.push(editBtn);
        }
        if (this.hasPermission(this.actions.delete)) {
            this.menuItems.push(deleteBtn);
        }

        this.subs.add(
            this.dropdownListDataSourceService.getActiveLanguages().subscribe((res) => {
                this.activeLanguages = res.data;
            })
        );

        this.subs.add(
            this.wallServ.getCountOfActiveLanguage().subscribe((r) => {
                this.countOfActiveLanguages = r;
            })
        );

        this.subs.add(
            this.wallServ.getAllLibraryBackgrounds().subscribe((r) => {
                this.backgrounds = r;
            })
        );

        this.addWallpaperForm.get('languageId')?.valueChanges.subscribe((languageId) => {
            this.loadQuotesAndCharacters(languageId);
        });
    }

    selectWallpaper(wallId: string, wallName: string): void {
        this.selectedWallpaper = { id: wallId, title: wallName };
    }

    //#region Add Wallpaper

    loadQuotesAndCharacters(languageId: string) {
        this.wallServ.getLibraryLanguageQuoteByLanguageId(languageId).subscribe((quotes) => (this.quotes = quotes));
        this.wallServ
            .getLibraryLanguageCharacterByLangaugeId(languageId)
            .subscribe((characters) => (this.characters = characters));

        this.selectedBackground = null;
        this.selectedCharacter = null;
        this.selectedQuote = null;
    }

    CreateWallpaper() {
        this.initAddWallpaperForm();
        this.addWallpaperForm.patchValue({ languageId: this.defaultLanguage[0].id });
        this.addWallpaperDialog = true;
    }

    declineAddWallpaper() {
        this.addWallpaperDialog = false;
        this.selectedBackground = null;
        this.selectedCharacter = null;
        this.selectedQuote = null;
    }

    selectBackground(background: ILibraryBackground) {
        this.addWallpaperForm.patchValue({ libraryBackgroundId: background.id });
        this.selectedBackground = background;
    }

    selectCharacter(char: ILibraryLanguageCharacter) {
        this.addWallpaperForm.patchValue({ libraryLanguageCharacterId: char.id });

        this.selectedCharacter = char;
    }

    selectQuote(quote: ILibraryLanguageQuote) {
        this.addWallpaperForm.patchValue({ libraryLanguageQuoteId: quote.id });
        this.selectedQuote = quote;
    }

    onRadioButtonClick(event: MouseEvent, item: any) {
        event.stopPropagation();
    }

    saveAddWallpaper() {
        this.submitted = true;
        if (this.addWallpaperForm.valid) {
            const wallpaperData: AddLibraryWallpaperDto = {
                WallpaperTitle: this.addWallpaperForm.value.wallpaperTitle,
                LanguageId: this.addWallpaperForm.value.languageId,
                LibraryBackgroundId: this.addWallpaperForm.value.libraryBackgroundId,
                LibraryLanguageCharacterId: this.addWallpaperForm.value.libraryLanguageCharacterId,
                LibraryLanguageQuoteId: this.addWallpaperForm.value.libraryLanguageQuoteId,
            };
            this.subs.add(
                this.wallServ
                    .addLibraryWallpaper(wallpaperData)
                    .pipe(
                        finalize(() => {
                            this.loadWallpapers();
                            this.addWallpaperDialog = false;
                            this.submitted = false;
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

    editWallpaper(wallpaper: ILibraryWallpaper) {
        this.wallpaper = { ...wallpaper };
        this.editWallpaperForm.patchValue(wallpaper);
        this.editWallpaperDialog = true;
    }
    declineEditWallpaper() {
        this.submitted = false;
        this.initWallpaper();
        this.initEditWallpaperForm();
        this.editWallpaperDialog = false;
    }

    saveEditWallpapr() {
        this.submitted = true;
        if (this.editWallpaperForm.valid) {
            if (this.editWallpaperForm.value.id && this.editWallpaperForm.value.id !== '') {
                this.wallServ.editLibraryWallpaper(this.editWallpaperForm.value).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Wallpaper Updated',
                            life: 3000,
                        });
                        this.loadWallpapers();
                        this.ref.detectChanges();
                        this.initWallpaper();
                        this.initEditWallpaperForm();
                        this.editWallpaperDialog = false;
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

    deleteWallpaper(wallpaper: ILibraryWallpaper) {
        this.deletionWallpaperDialog = true;
        this.wallpaper = { ...wallpaper };
    }
    confirmDeletion() {
        this.deletionWallpaperDialog = false;
        this.subs.add(
            this.wallServ.deleteLibraryWallpaperById(this.wallpaper.id).subscribe({
                next: (response) => {
                    if (response.code !== 460) {
                        this.messageService.add({
                            severity: 'info',
                            summary: 'Info',
                            detail: response.message,
                            life: 3000,
                        });
                        this.loadWallpapers();
                        this.ref.detectChanges();
                    } else {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Cannot delete because there are wallpapers languages associated with this Wallpaper',
                            life: 5000,
                        });
                        this.loadWallpapers();
                        this.ref.detectChanges();
                    }
                },
            })
        );
        this.wallpaper = {} as ILibraryWallpaper;
        this.deletionWallpaperDialog = false;
    }
    declineDeletion() {
        this.deletionWallpaperDialog = false;
        this.wallpaper = {} as ILibraryWallpaper;
        this.loadWallpapers();
    }

    //#endregion

    //#region Activation
    switchActivation(wallpaper: ILibraryWallpaper) {
        this.switchActivationWallpaperDialog = true;
        this.wallpaper = { ...wallpaper };
    }

    declineActivation() {
        this.switchActivationWallpaperDialog = false;
        this.initWallpaper();
        this.loadWallpapers();
    }

    confirmtActivation() {
        this.toggleActivation(this.wallpaper);
    }

    toggleActivation(wallpaper: ILibraryWallpaper) {
        if (wallpaper.isActive) {
            this.subs.add(
                this.wallServ.deactivateLibraryWallpaperById(wallpaper.id).subscribe((result) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Wallpaper Deactivated',
                        life: 3000,
                    });
                    this.loadWallpapers();
                    this.ref.detectChanges();
                })
            );
        } else {
            this.subs.add(
                this.wallServ.activateLibraryWallpaperById(wallpaper.id).subscribe((result) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Wallpaper Activated',
                        life: 3000,
                    });
                    this.loadWallpapers();
                    this.ref.detectChanges();
                })
            );
        }
        this.initWallpaper();
        this.switchActivationWallpaperDialog = false;
    }

    //#endregion

    loadWallpapers() {
        this.subs.add(
            this.wallServ.getAllLibraryWallpapers().subscribe((data) => {
                this.wallpapers = data;
                
            })
        );
    }
    initEditWallpaperForm() {
        this.editWallpaperForm = this.formBuilder.group({
            id: [''],
            name: [''],
        });
    }

    initWallpaper() {
        this.wallpaper = {
            id: '',
            wallpaperBackgroundImage: '',
            wallpaperImageUrl: '',
            wallpaperImageThumbnailUrl:'',
            wallpaperCharacterImage: '',
            wallpaperQuote: '',
            wallpaperTitle: '',
            libraryWallpaperLanguages: [],
            isActive: true,
        };
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    onGlobalFilterCharacters(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    assigneCurrentSelect(wall: ILibraryWallpaper) {
        this.wallpaper = wall;
    }

    openContent(wall: ILibraryWallpaper) {
        this.wallpaper = { ...wall };
        this.openCategoryPageContentHtmlDialog = true;
    }

    hideCategoryPageContentHtmlDialog() {
        this.openCategoryPageContentHtmlDialog = false;
    }

    navigateToLangauges(wallId: string, wallName: string): void {
        this.router.navigate(['wallpaper-libraries', wallId, wallName]);
    }

    hasPermission(controlKey: string): boolean {
        return this.pagePermessions.some((p) => p.controlKey === controlKey);
    }
    handleBackToWallpapers(): void {
        this.selectedWallpaper = null;
    }

    ngOnDestroy(): void {
        this.subs.unsubscribe();
    }
}
