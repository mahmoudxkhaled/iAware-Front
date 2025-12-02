import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Observable, Subscription, finalize } from 'rxjs';
import { ILanguageModel } from 'src/app/modules/language/models/ILanguageModel';

import { Router } from '@angular/router';
import { Editor } from 'ngx-editor';
import { constants } from 'src/app/core/constatnts/constatnts';
import { PermessionsService } from 'src/app/core/Services/permessions.service';
import { IAspNetPageItemModel } from 'src/app/modules/page-management/models/IAspNetPageItemModel';

import {
    ILibraryBackground,
    ILibraryLanguageCharacter,
    ILibraryLanguageQuote,
} from 'src/app/modules/wallpaper-libraries/models/wallpaper-libraries';

import { WallpaperLibrariesService } from 'src/app/modules/wallpaper-libraries/services/wallpaper-libraries.service';
import { TranslationService } from 'src/app/core/Services/translation.service';
import { ITagModel } from 'src/app/modules/tages/models/ITagModel';
import { TagesService } from 'src/app/modules/tages/services/tages.service';
@Component({
    selector: 'app-wall-preview',
    templateUrl: './wall-preview.component.html',
    styleUrl: './wall-preview.component.scss',
})
export class WallPreviewComponent implements OnInit {
    pagePermessions: IAspNetPageItemModel[] = [];
    selectedLanguage: ILanguageModel | null = null;
    selectedLanguageAdd: ILanguageModel[] = [];
    addQuoteDialog: boolean = false;
    editQuoteDialog: boolean = false;
    deletionQuoteDialog: boolean = false;
    chooseTitleDialog: boolean = false;
    isLoading$: Observable<boolean>;

    submitted: boolean = false;
    actions = constants.pageActions;
    libraryQuotes: ILibraryLanguageQuote[] = [];
    editor: Editor;
    activeLanguages: ILanguageModel[] = [];
    quoteText: string = '';
    libraryQuote: ILibraryLanguageQuote;
    switchQuoteActivationDialog: boolean = false;
    subs: Subscription = new Subscription();
    selectedLanguageId: string = '';
    defaultLanguage: ILanguageModel;
    WallpaperTitle: string = '';
    selectedBackground: ILibraryBackground | null = null;
    selectedCharacter: ILibraryLanguageCharacter | null = null;
    selectedQuote: ILibraryLanguageQuote | null = null;
    tages : ITagModel[] = [];
    selectedTages : string[] = [];
    constructor(
        private wallServ: WallpaperLibrariesService,
        private messageService: MessageService,
        private ref: ChangeDetectorRef,
        private permessionService: PermessionsService,
        private router: Router,
        private translate: TranslationService,
        private tagesAPIService : TagesService
    ) {
        this.isLoading$ = this.wallServ.isLoadingSubject;

        this.pagePermessions = this.permessionService.getPagePermessions(constants.pages.libraryQuote);
    }
    ngOnInit(): void {
        const WallpaperTitle = localStorage.getItem('WallpaperTitle');
        if (WallpaperTitle) {
            this.WallpaperTitle = WallpaperTitle;
        }
        const wallLanguage = JSON.parse(localStorage.getItem('wallLanguage') || '{}');

        if (WallpaperTitle) {
            this.defaultLanguage = wallLanguage;
        }
        this.selectedQuote = JSON.parse(localStorage.getItem('selectedQuote') || '{}');
        this.selectedBackground = JSON.parse(localStorage.getItem('selectedBackground') || '{}');
        this.selectedCharacter = JSON.parse(localStorage.getItem('selectedCharacter') || '{}');
        this.defaultLanguage = JSON.parse(localStorage.getItem('wallLanguage') || '{}');
        this.fetchAllTages();
    }

    fetchAllTages(){
        this.subs.add(this.tagesAPIService.getAllTages().subscribe({
            next: (res) => {
                this.tages = res.data?.filter((t : ITagModel) => t.wallpaperAllowed);
            },
            error: (error) => {
                //this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
            }
        }))
    }

    createWallpaper() {
        if (
            this.selectedQuote?.id &&
            this.selectedBackground?.id &&
            this.selectedCharacter?.id &&
            this.WallpaperTitle &&
            this.WallpaperTitle.trim() !== ''
        ) {
            this.submitted = true;

            const wallpaperData = {
                WallpaperTitle: this.WallpaperTitle,
                LanguageId: this.defaultLanguage.id,
                LibraryBackgroundId: this.selectedBackground.id,
                LibraryLanguageCharacterId: this.selectedCharacter?.id,
                LibraryLanguageQuoteId: this.selectedQuote.id,
                Tages : this.selectedTages
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
        localStorage.setItem('WallpaperTitle', this.WallpaperTitle);
        this.router.navigate(['wallpaper-wizard/create/character']);
    }
}
