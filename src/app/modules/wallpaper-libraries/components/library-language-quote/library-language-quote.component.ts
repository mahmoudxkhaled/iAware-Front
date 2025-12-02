import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import { Subscription, finalize } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { ILanguageModel } from 'src/app/modules/language/models/ILanguageModel';
import { Table } from 'primeng/table';

import { Editor } from 'ngx-editor';
import { ILibraryLanguageQuote } from '../../models/wallpaper-libraries';
import { WallpaperLibrariesService } from '../../services/wallpaper-libraries.service';
import { FormBuilder } from '@angular/forms';
import { PermessionsService } from 'src/app/core/Services/permessions.service';
import { IAspNetPageItemModel } from 'src/app/modules/page-management/models/IAspNetPageItemModel';
import { constants } from 'src/app/core/constatnts/constatnts';
import { DropdownListDataSourceService } from 'src/app/core/Services/dropdown-list-data-source.service';

@Component({
    selector: 'app-library-language-quote',
    templateUrl: './library-language-quote.component.html',
    styleUrl: './library-language-quote.component.scss',
})
export class LibraryLanguageQuoteComponent implements OnInit, OnDestroy {
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

    ownerMenuItems: MenuItem[] = [];
    normalMenuItems: MenuItem[] = [];
    quoteText: string = '';
    libraryQuote: ILibraryLanguageQuote;
    switchQuoteActivationDialog: boolean = false;
    subs: Subscription = new Subscription();
    selectedLanguageId: string = '';
    constructor(
        private wallServ: WallpaperLibrariesService,
        private messageService: MessageService,
        private ref: ChangeDetectorRef,
        private dropdownListDataSourceService: DropdownListDataSourceService,
        private permessionService: PermessionsService
    ) {
        this.pagePermessions = this.permessionService.getPagePermessions(constants.pages.libraryQuote);
    }
    ngOnInit(): void {
        this.editor = new Editor();
        this.subs.add(
            this.dropdownListDataSourceService.getActiveLanguages().subscribe((res) => {
                this.activeLanguages = res.data;
            })
        );

        const editBtn = {
            label: 'Edit',
            icon: 'pi pi-fw pi-pencil',
            command: () => this.editLibraryQuote(this.libraryQuote),
        };

        const deleteBtn = {
            label: 'Delete',
            icon: 'pi pi-fw pi-trash',
            command: () => this.deleteLibraryQuote(this.libraryQuote),
        };

        const deafultBtn = {
            label: 'Default in System',
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
    }

    assigneCurrentSelect(quote: ILibraryLanguageQuote) {
        this.libraryQuote = quote;
    }

    // loadLibraryLanguageQuotes() {
    //     this.subs.add(
    //         this.wallServ.getAllLibraryLanguageQuotes().subscribe((data) => {
    //             this.libraryQuotes = data;
    //         })
    //     );
    // }

    addNewQuote() {
        this.quoteText = '';
        this.selectedLanguageId = '';
        this.addQuoteDialog = true;
        this.selectedLanguageId = this.selectedLanguageAdd[0].id;
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
                            this.addQuoteDialog = false;
                            this.submitted = false;
                            this.quoteText = '';
                            this.selectedLanguageId = '';
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
                            this.ref.detectChanges();
                            this.initQuote();
                            this.quoteText = '';
                            this.editQuoteDialog = false;
                            this.submitted = false;
                        })
                    )
                    .subscribe(() => {
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
        this.selectLanguage(this.selectedLanguage!);
    }

    editLibraryQuote(libraryQuote: ILibraryLanguageQuote) {
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
