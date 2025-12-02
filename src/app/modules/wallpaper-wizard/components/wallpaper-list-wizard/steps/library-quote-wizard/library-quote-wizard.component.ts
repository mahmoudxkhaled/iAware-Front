import { AfterViewChecked, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { Subscription, finalize } from 'rxjs';
import { ILanguageModel } from 'src/app/modules/language/models/ILanguageModel';

import { Router } from '@angular/router';
import { Editor } from 'ngx-editor';
import { constants } from 'src/app/core/constatnts/constatnts';
import { PermessionsService } from 'src/app/core/Services/permessions.service';
import { IAspNetPageItemModel } from 'src/app/modules/page-management/models/IAspNetPageItemModel';
import { ILibraryLanguageQuote } from 'src/app/modules/wallpaper-libraries/models/wallpaper-libraries';
import { WallpaperLibrariesService } from 'src/app/modules/wallpaper-libraries/services/wallpaper-libraries.service';
import { TranslationService } from 'src/app/core/Services/translation.service';
import { UserService } from 'src/app/modules/user/services/user.service';
import { GetUser } from 'src/app/layout/app-menuProfile/app.menuprofile.component';
import { TableLoadingService } from 'src/app/core/Services/table-loading.service';
import { DropdownListDataSourceService } from 'src/app/core/Services/dropdown-list-data-source.service';
@Component({
    selector: 'app-library-quote-wizard',
    templateUrl: './library-quote-wizard.component.html',
    styleUrl: './library-quote-wizard.component.scss',
})
export class LibraryQuoteWizardComponent implements OnInit, AfterViewChecked ,OnDestroy {
    tableLoadingSpinner: boolean = true;

    selectedLanguage: ILanguageModel | null = null;
    selectedLanguageAdd: ILanguageModel[] = [];
    addQuoteDialog: boolean = false;
    editQuoteDialog: boolean = false;
    deletionQuoteDialog: boolean = false;
    chooseTitleDialog: boolean = false;

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
    defaultLanguage: ILanguageModel[] = [];
    isIAwareTeamUser: boolean = false;
    user: GetUser;

    constructor(
        private wallServ: WallpaperLibrariesService,
        private dropdownListDataSourceService: DropdownListDataSourceService,
        private messageService: MessageService,
        private ref: ChangeDetectorRef,
        private permessionService: PermessionsService,
        private router: Router,
        private translate: TranslationService,
        private userServ: UserService,
        private tableLoadingService: TableLoadingService
    ) {
        this.pagePermessions = this.permessionService.getPagePermessions(constants.pages.libraryQuote);
    }

    ngAfterViewChecked(): void {
        this.ref.detectChanges();
    }

    loadQuotes() {
        this.tableLoadingService.show();

        this.subs.add(
            this.wallServ
                .getTenantDefaultLanguage()
                .pipe(
                    finalize(() => {
                        this.subs.add(
                            this.wallServ
                                .getLibraryLanguageQuoteByLanguageId(this.defaultLanguage[0].id)
                                .pipe(
                                    finalize(() => {
                                        this.checkStoredQuote();
                                        this.filterQuotesForLanguages();
                                    })
                                )
                                .subscribe((r) => {
                                    this.libraryQuotes = r;
                                })
                        );
                    })
                )
                .subscribe((res) => {
                    this.defaultLanguage = [res];
                })
        );
    }

    ngOnInit(): void {
        this.tableLoadingService.loading$.subscribe((isLoading) => {
            this.tableLoadingSpinner = isLoading;
        });
        this.loadQuotes();

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
        this.editor = new Editor();
        // this.loadLibraryLanguageQuotes();
        // this.subs.add(
        //     this.wallServ.GetActiveLanguages().subscribe((res) => {
        //         this.activeLanguages = res;
        //     })
        // );
    }

    loadLibraryLanguageQuotes() {
        this.subs.add(
            this.wallServ.getAllLibraryLanguageQuotes().subscribe((data) => {
                this.libraryQuotes = data;
                this.checkStoredQuote();

                this.subs.add(
                    this.dropdownListDataSourceService
                        .getActiveLanguages()
                        .pipe(
                            finalize(() => {
                                this.filterQuotesForLanguages();
                            })
                        )
                        .subscribe((res) => {
                            this.activeLanguages = res.data;
                        })
                );
            })
        );
    }

    checkStoredQuote() {
        const storedQuote = localStorage.getItem('selectedQuote');
        if (storedQuote) {
            this.selectedQuote = JSON.parse(storedQuote);
        }
    }

    addNewQuote(language: ILanguageModel) {
        this.quoteText = '';
        this.selectedLanguageId = '';
        this.addQuoteDialog = true;
        this.selectedLanguageId = language.id;
        this.selectedLanguageAdd = [language];
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
                            this.initQuote();
                            this.ref.detectChanges();
                            this.addQuoteDialog = false;
                            this.submitted = false;
                            this.quoteText = '';
                            this.selectedLanguageId = '';
                            this.loadQuotes();
                        })
                    )
                    .subscribe(() => {
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
                            this.initQuote();
                            this.loadQuotes();
                            this.quoteText = '';
                            this.submitted = false;
                            this.ref.detectChanges();
                        })
                    )
                    .subscribe(() => {
                        this.editQuoteDialog = false;
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
        this.ref.detectChanges();
        this.loadQuotes();
    }

    switchQuoteActivation(quote: ILibraryLanguageQuote) {
        this.switchQuoteActivationDialog = true;
        this.libraryQuote = { ...quote };
    }

    declineQuoteActivation() {
        this.switchQuoteActivationDialog = false;
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
                            this.loadQuotes();
                            this.initQuote();
                            this.ref.detectChanges();
                            this.switchQuoteActivationDialog = false;
                        })
                    )
                    .subscribe(() => {
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
                            this.loadQuotes();
                            this.initQuote();
                            this.ref.detectChanges();
                            this.switchQuoteActivationDialog = false;
                        })
                    )
                    .subscribe(() => {
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
                        this.loadQuotes();
                        this.initQuote();
                        this.ref.detectChanges();
                        this.deletionQuoteDialog = false;
                    })
                )
                .subscribe({
                    next: () => {
                        this.deletionQuoteDialog = false;
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
        this.initQuote();
        this.loadQuotes();
    }

    editLibraryQuote(libraryQuote: ILibraryLanguageQuote, language: ILanguageModel) {
        this.selectedLanguageAdd = [language];
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

    filterQuotesForLanguages() {
        this.filteredQuotesByLanguage = {};

        this.defaultLanguage.forEach((language) => {
            this.filteredQuotesByLanguage[language.id] = this.libraryQuotes.filter(
                (quo) => quo.languageId === language.id
            );
        });
        this.tableLoadingService.hide();
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
        localStorage.setItem('selectedQuote', JSON.stringify(quo));
    }

    removeFromSelected() {
        this.selectedQuote = null;
        localStorage.removeItem('selectedQuote');
    }

    isQuoteSelected(quo: any): any {
        if (this.selectedQuote && this.selectedQuote.id === quo.id) {
            return true;
        }
    }

    WallpaperTitle = '';

    openChooseTitleDialog() {
        this.chooseTitleDialog = true;
    }

    declineCreateWallpaper() {
        this.chooseTitleDialog = false;
    }

    confirmCreateWallpaper() {
        this.createWallpaper();
        this.chooseTitleDialog = false;
    }
    createWallpaper() {
        const selectedQuote = JSON.parse(localStorage.getItem('selectedQuote') || '{}');
        const selectedBackground = JSON.parse(localStorage.getItem('selectedBackground') || '{}');
        const selectedCharacter = JSON.parse(localStorage.getItem('selectedCharacter') || '{}');

        if (selectedQuote.id && selectedBackground.id && selectedCharacter.id) {
            this.submitted = true;

            const wallpaperData = {
                WallpaperTitle: this.WallpaperTitle,
                LanguageId: this.defaultLanguage[0].id,
                LibraryBackgroundId: selectedBackground.id,
                LibraryLanguageCharacterId: selectedCharacter.id,
                LibraryLanguageQuoteId: selectedQuote.id,
            };

            // Add wallpaper using the service
            this.subs.add(
                this.wallServ
                    .addLibraryWallpaper(wallpaperData)
                    .pipe(
                        finalize(() => {
                            this.router.navigate(['wallpaper-wizard']);
                            this.chooseTitleDialog = false;
                            this.submitted = false;
                        })
                    )
                    .subscribe({
                        next: () => {
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Successful',
                                detail: 'Wallpaper added successfully',
                                life: 3000,
                            });
                        },
                        error: (err) => {
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Error',
                                detail: 'Failed to add wallpaper: ' + err.message,
                                life: 3000,
                            });
                        },
                    })
            );
        } else {
            this.messageService.add({
                severity: 'warn',
                summary: 'Warning',
                detail: 'Please select all required items before submitting.',
                life: 3000,
            });
        }
    }

    prevPage() {
        localStorage.setItem('selectedQuote', JSON.stringify(this.selectedQuote));
        this.router.navigate(['wallpaper-wizard/create/character']);
    }
    nextPage() {
        this.router.navigate(['wallpaper-wizard/create/preview']);
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
