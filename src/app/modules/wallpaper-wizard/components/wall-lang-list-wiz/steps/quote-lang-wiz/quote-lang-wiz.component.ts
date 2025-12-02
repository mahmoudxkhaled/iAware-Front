import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { Subscription, finalize } from 'rxjs';
import { ILanguageModel } from 'src/app/modules/language/models/ILanguageModel';

import { Editor } from 'ngx-editor';
import { constants } from 'src/app/core/constatnts/constatnts';
import { PermessionsService } from 'src/app/core/Services/permessions.service';
import { IAspNetPageItemModel } from 'src/app/modules/page-management/models/IAspNetPageItemModel';
import { WallpaperLibrariesService } from 'src/app/modules/wallpaper-libraries/services/wallpaper-libraries.service';
import {
    ILibraryLanguageQuote,
    ILibraryWallpaperLanguage,
} from 'src/app/modules/wallpaper-libraries/models/wallpaper-libraries';
import { ActivatedRoute, Router } from '@angular/router';
import { TrainingLessonService } from 'src/app/modules/security-training/services/training-lesson.service';
import { LocalStorageService } from 'src/app/core/Services/local-storage.service';
import { TranslationService } from 'src/app/core/Services/translation.service';
import { TableLoadingService } from 'src/app/core/Services/table-loading.service';
import { DropdownListDataSourceService } from 'src/app/core/Services/dropdown-list-data-source.service';
export interface LibraryLanguageQuoteDto {
    id: string;
    QuoteText: string;
    languageId: string;
    languageName: string;
    isActive: boolean;
}

export interface QuoteLanguageGroup {
    languageId: string;
    languageName: string;
    quotes: LibraryLanguageQuoteDto[];
}

@Component({
    selector: 'app-quote-lang-wiz',
    templateUrl: './quote-lang-wiz.component.html',
    styleUrl: './quote-lang-wiz.component.scss',
})
export class QuoteLangWizComponent implements OnInit, OnDestroy {
    tableLoadingSpinner: boolean = true;

    selectedLanguage: ILanguageModel | null = null;
    selectedLanguageAdd: ILanguageModel[] = [];
    addQuoteDialog: boolean = false;
    editQuoteDialog: boolean = false;
    deletionQuoteDialog: boolean = false;
    submitted: boolean = false;
    pagePermessions: IAspNetPageItemModel[] = [];
    actions = constants.pageActions;
    libraryQuotes: ILibraryLanguageQuote[] = [];
    editor: Editor;
    activeLanguages: ILanguageModel[] = [];
    quoteText: string = '';
    libraryQuote: ILibraryLanguageQuote;
    switchQuoteActivationDialog: boolean = false;
    subs: Subscription = new Subscription();
    selectedLanguageId: string = '';
    QuoteLanguageGroups: QuoteLanguageGroup[] = [];
    isEditWallpaperLanguage: boolean = false;
    ownerMenuItems: MenuItem[] = [];
    normalMenuItems: MenuItem[] = [];
    constructor(
        private wallServ: WallpaperLibrariesService,
        private messageService: MessageService,
        private ref: ChangeDetectorRef,
        private permessionService: PermessionsService,
        private router: Router,
        private route: ActivatedRoute,
        private trainingServ: TrainingLessonService,
        private localStorageServ: LocalStorageService,
        private translate: TranslationService,
        private tableLoadingService: TableLoadingService,
        private dropdownListDataSourceService: DropdownListDataSourceService
    ) {
        this.pagePermessions = this.permessionService.getPagePermessions(constants.pages.libraryQuote);
    }
    libraryWallpaperId: string;
    libraryWallpaperName: string;
    ngOnInit(): void {
        this.tableLoadingService.loading$.subscribe((isLoading) => {
            this.tableLoadingSpinner = isLoading;
        });
        this.tableLoadingService.show();

        this.getActiveLanguages();
        this.isEditWallpaperLanguage = this.localStorageServ.getItem('isEditWallpaperLanguage');

        this.editor = new Editor();
        this.route.parent?.params.subscribe((params) => {
            const id = params['id'];
            const wallName = params['wallName'];
            this.libraryWallpaperId = id;
            this.libraryWallpaperName = wallName;
        });

        const editBtn = {
            label: this.translate.getInstant('shared.actions.edit'),
            icon: 'pi pi-fw pi-pencil',
            command: () => this.editLibraryQuote(this.libraryQuote, this.selectedLanguageId),
        };

        const deleteBtn = {
            label: this.translate.getInstant('shared.actions.delete'),
            icon: 'pi pi-fw pi-trash',
            command: () => this.deleteLibraryQuote(this.libraryQuote),
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

        this.normalMenuItems = [];
        this.normalMenuItems.push(deafultBtn);
        this.selectedTabIndex = this.localStorageServ.getItem('selectedCharacterTabIndex');
    }

    assigneCurrentSelect(quote: ILibraryLanguageQuote, langId: string) {
        this.libraryQuote = quote;
        this.selectedLanguageId = langId;
    }

    libraryWallpaperLanguages: ILibraryWallpaperLanguage[];

    loadLibraryWallpaperLanguage(id: string) {
        this.subs.add(
            this.wallServ.getLibraryWallpaperLanguagesByLibraryWallpaperId(id).subscribe((r) => {
                this.libraryWallpaperLanguages = r;
                this.loadLibraryQuotes();
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
        this.QuoteLanguageGroups = this.QuoteLanguageGroups.filter((group) =>
            this.activeLanguages.some((language) => language.id === group.languageId)
        );
    }

    getActiveLanguageForEditForm() {
        this.QuoteLanguageGroups = this.QuoteLanguageGroups.filter((group) =>
            this.activeLanguages.some((language) => language.id === group.languageId)
        );
    }

    getQuotesByLanguage(languageId: string) {
        const quoteGroup = this.QuoteLanguageGroups.find((group) => group.languageId === languageId);
        return quoteGroup ? quoteGroup.quotes : [];
    }

    loadLibraryQuotes() {
        this.subs.add(
            this.wallServ
                .getAllLibraryLanguageQuotesGroupedByLanguageId()
                .pipe(
                    finalize(() => {
                        this.tableLoadingService.hide();

                        if (this.isEditWallpaperLanguage) {
                            this.getActiveLanguageForEditForm();
                        } else {
                            this.getActiveLanguageForAddForm();
                        }
                    })
                )
                .subscribe((data) => {
                    this.QuoteLanguageGroups = data.data;
                    this.checkStoredQuote();
                    this.setSelectedTabIndex();
                    this.ref.detectChanges();
                    this.tableLoadingService.hide();
                })
        );
    }

    loadLibraryQuotesForForm() {
        this.subs.add(
            this.wallServ
                .getAllLibraryLanguageQuotesGroupedByLanguageId()

                .subscribe((data) => {
                    this.QuoteLanguageGroups = data.data;
                    this.checkStoredQuote();
                    this.setSelectedTabIndex();
                    this.ref.detectChanges();
                })
        );
    }

    checkStoredQuote() {
        this.selectedQuote = this.localStorageServ.getItem('selectedQuote');
    }

    addNewQuote(languageId: string) {
        this.quoteText = '';
        this.selectedLanguageId = '';
        this.addQuoteDialog = true;
        this.selectedLanguageId = languageId;
        this.selectedLanguageAdd = this.activeLanguages.filter((x) => x.id === languageId);
    }

    saveNewQuote() {
        this.submitted = true;
        if (!this.isQuoteTextEmpty(this.quoteText)) {
            const addLibraryLanguageQuoteDto = {
                LanguageId: this.selectedLanguageId,
                QuoteText: this.quoteText,
            };
            this.subs.add(
                this.wallServ
                    .addLibraryLanguageQuote(addLibraryLanguageQuoteDto)
                    .pipe(
                        finalize(() => {
                            this.selectLanguage(this.selectedLanguage!);
                            this.initQuote();
                            this.ref.detectChanges();
                            this.loadLibraryQuotes();
                            this.addQuoteDialog = false;
                            this.submitted = false;
                            this.quoteText = '';
                            this.selectedLanguageId = '';
                        })
                    )
                    .subscribe(() => {
                        this.addQuoteDialog = false;
                        this.loadLibraryQuotes();
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Quote added successfully',
                            life: 3000,
                        });
                    })
            );
        }
    }
    hideNewQuoteDialog() {
        this.addQuoteDialog = false;
        this.submitted = false;
        this.quoteText = '';
        this.selectedLanguageId = '';
        this.initQuote();
        this.selectLanguage(this.selectedLanguage!);
        this.ref.detectChanges();
    }

    isQuoteTextEmpty(quoteText: string): boolean {
        if (!quoteText) {
            return true;
        }
        const tempElement = document.createElement('div');
        tempElement.innerHTML = quoteText;
        return !tempElement.innerText.trim();
    }
    saveEditQuote() {
        this.submitted = true;

        if (!this.isQuoteTextEmpty(this.libraryQuote.quoteText)) {
            this.libraryQuote.languageId = this.selectedLanguageId;
            this.subs.add(
                this.wallServ
                    .editLibraryLanguageQuote(this.libraryQuote)
                    .pipe(
                        finalize(() => {
                            this.selectLanguage(this.selectedLanguage!);
                            this.initQuote();
                            this.quoteText = '';
                            this.editQuoteDialog = false;
                            this.submitted = false;
                            this.ref.detectChanges();
                        })
                    )
                    .subscribe(() => {
                        this.editQuoteDialog = false;
                        this.loadLibraryQuotes();
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Quote updated successfully',
                            life: 3000,
                        });
                    })
            );
        }
    }

    hideEditQuoteDialog() {
        this.editQuoteDialog = false;
        this.submitted = false;
        this.selectedLanguageId = '';
        this.initQuote();
        this.selectLanguage(this.selectedLanguage!);
        this.ref.detectChanges();
    }

    switchQuoteActivation(quote: ILibraryLanguageQuote) {
        this.switchQuoteActivationDialog = true;
        this.libraryQuote = { ...quote };
    }

    declineQuoteActivation() {
        this.switchQuoteActivationDialog = false;
        this.loadLibraryQuotes();
        this.selectLanguage(this.selectedLanguage!);
        this.ref.detectChanges();
        this.initQuote();
    }

    confirmtQuoteActivation() {
        this.toggleQuoteActivation(this.libraryQuote);
    }

    toggleQuoteActivation(quote: ILibraryLanguageQuote) {
        if (quote.isActive) {
            this.subs.add(
                this.wallServ
                    .deactivateLibraryLanguageQuoteById(quote.id)
                    .pipe(
                        finalize(() => {
                            this.selectLanguage(this.selectedLanguage!);
                            this.initQuote();
                            this.ref.detectChanges();
                            this.switchQuoteActivationDialog = false;
                        })
                    )
                    .subscribe(() => {
                        this.switchQuoteActivationDialog = false;
                        this.loadLibraryQuotes();
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Quote Deactivated',
                            life: 3000,
                        });
                    })
            );
        } else {
            this.subs.add(
                this.wallServ
                    .activateLibraryLanguageQuoteById(quote.id)
                    .pipe(
                        finalize(() => {
                            this.selectLanguage(this.selectedLanguage!);
                            this.initQuote();
                            this.ref.detectChanges();
                            this.switchQuoteActivationDialog = false;
                        })
                    )
                    .subscribe(() => {
                        this.switchQuoteActivationDialog = false;
                        this.loadLibraryQuotes();
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Quote Activated',
                            life: 3000,
                        });
                    })
            );
        }
    }

    deleteLibraryQuote(LibraryLanguageQuote: ILibraryLanguageQuote) {
        this.deletionQuoteDialog = true;
        this.libraryQuote = { ...LibraryLanguageQuote };
    }

    confirmQuoteDeletion() {
        this.subs.add(
            this.wallServ
                .deleteLibraryLanguageQuoteById(this.libraryQuote.id)
                .pipe(
                    finalize(() => {
                        this.selectLanguage(this.selectedLanguage!);
                        this.initQuote();
                        this.ref.detectChanges();
                        this.deletionQuoteDialog = false;
                    })
                )
                .subscribe({
                    next: () => {
                        this.deletionQuoteDialog = false;
                        this.loadLibraryQuotes();
                        this.ref.detectChanges();

                        this.messageService.add({
                            severity: 'success',
                            summary: 'Info',
                            detail: 'Quote Deleted Successfully',
                            life: 3000,
                        });
                    },
                })
        );
    }

    declineQuoteDeletion() {
        this.deletionQuoteDialog = false;
        this.ref.detectChanges();
        this.loadLibraryQuotes();

        this.initQuote();
        this.selectLanguage(this.selectedLanguage!);
    }

    editLibraryQuote(libraryQuote: ILibraryLanguageQuote, languageId: string) {
        this.selectedLanguageAdd = this.activeLanguages.filter((x) => x.id === languageId);
        this.selectedLanguageId = libraryQuote.languageId;
        this.editQuoteDialog = true;
        this.libraryQuote = { ...libraryQuote };
    }

    initQuote() {
        this.libraryQuote = {
            id: '',
            quoteText: '',
            isActive: true,
            languageId: '',
            languageName: '',
        };
    }

    selectLanguage(lang: ILanguageModel) {
        this.selectedLanguage = lang;
        this.wallServ.getLibraryLanguageQuoteByLanguageId(lang.id).subscribe((data) => {
            this.libraryQuotes = data;
        });
        this.selectedLanguageAdd = [lang];
    }
    backToLanguages() {
        this.selectedLanguage = null;
        this.selectedLanguageAdd = [];
        this.libraryQuotes = [];
    }

    filteredQuotesByLanguage: { [key: string]: ILibraryLanguageQuote[] } = {};

    filterCharactersForLanguages() {
        this.filteredQuotesByLanguage = {};

        this.activeLanguages.forEach((language) => {
            this.filteredQuotesByLanguage[language.id] = this.libraryQuotes.filter(
                (quo) => quo.languageId === language.id
            );
        });
    }

    selectedQuote: any = null;
    toggleSelection(quo: any) {
        if (this.selectedQuote && this.selectedQuote.id === quo.id) {
            this.removeFromSelected();
        } else {
            this.addToSelected(quo);
        }
    }

    addToSelected(quo: any) {
        this.selectedQuote = quo;
        // Store the selected quote in local storage
        this.localStorageServ.setItem('selectedQuote', quo);
    }

    removeFromSelected() {
        this.selectedQuote = null;
        this.localStorageServ.removeItem('selectedQuote');
    }

    isQuoteSelected(quo: any): any {
        if (this.selectedQuote && this.selectedQuote.id === quo.id) {
            return true;
        }
    }
    selectedTabIndex: number;

    setSelectedTabIndex() {
        if (this.selectedQuote) {
            const selectedLanguageId = this.selectedQuote.languageId;
            const index = this.QuoteLanguageGroups.findIndex((group) => group.languageId === selectedLanguageId);
            if (index !== -1) {
                this.selectedTabIndex = index;
            }
        }
    }

    nextPage() {
        const id = this.libraryWallpaperId;
        const wallName = this.libraryWallpaperName;
        this.router.navigate([`wallpaper-wizard/${id}/${wallName}/createWallpaperLanguage/preview`]);
    }

    prevPage() {
        const id = this.libraryWallpaperId;
        const wallName = this.libraryWallpaperName;
        if (this.selectedQuote) {
            this.localStorageServ.setItem('selectedQuote', this.selectedQuote);
        }
        this.router.navigate([`wallpaper-wizard/${id}/${wallName}/createWallpaperLanguage/character`]);
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    hasPermission(controlKey: string): boolean {
        return this.pagePermessions.some((p) => p.controlKey === controlKey);
    }

    ngOnDestroy() {
        this.subs.unsubscribe();
    }
}
