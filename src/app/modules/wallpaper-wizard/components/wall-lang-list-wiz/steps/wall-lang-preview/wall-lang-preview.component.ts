import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Observable, Subscription, finalize } from 'rxjs';
import { ILanguageModel } from 'src/app/modules/language/models/ILanguageModel';

import { ActivatedRoute, Router } from '@angular/router';
import { Editor } from 'ngx-editor';
import { constants } from 'src/app/core/constatnts/constatnts';
import { PermessionsService } from 'src/app/core/Services/permessions.service';
import { IAspNetPageItemModel } from 'src/app/modules/page-management/models/IAspNetPageItemModel';
import {
    ILibraryBackground,
    ILibraryLanguageCharacter,
    ILibraryLanguageQuote,
    ILibraryWallpaperLanguage,
} from 'src/app/modules/wallpaper-libraries/models/wallpaper-libraries';
import { WallpaperLibrariesService } from 'src/app/modules/wallpaper-libraries/services/wallpaper-libraries.service';
import { TrainingLessonService } from 'src/app/modules/security-training/services/training-lesson.service';
import { LocalStorageService } from 'src/app/core/Services/local-storage.service';
import { UserService } from 'src/app/modules/user/services/user.service';
import { DropdownListDataSourceService } from 'src/app/core/Services/dropdown-list-data-source.service';
@Component({
    selector: 'app-wall-lang-preview',
    templateUrl: './wall-lang-preview.component.html',
    styleUrl: './wall-lang-preview.component.scss',
})
export class WallLangPreviewComponent implements OnInit {
    pagePermessions: IAspNetPageItemModel[] = [];
    selectedLanguageId: string = '';

    selectedLanguageIdAdd: ILanguageModel[] = [];
    addQuoteDialog: boolean = false;
    editQuoteDialog: boolean = false;
    deletionQuoteDialog: boolean = false;
    chooseTitleDialog: boolean = false;
    isEditWallpaperLanguage: boolean = false;

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
    defaultLanguage: ILanguageModel;
    WallpaperTitle: string = '';
    selectedBackground: ILibraryBackground | null = null;
    selectedCharacter: ILibraryLanguageCharacter | null = null;
    selectedQuote: ILibraryLanguageQuote | null = null;
    libraryWallpaperId: string;
    WallpaperLangId: string = '';
    libraryWallpaperName: string;
    isIAwareTeamUser : boolean = false;

    constructor(
        private wallServ: WallpaperLibrariesService,
        private messageService: MessageService,
        private permessionService: PermessionsService,
        private router: Router,
        private route: ActivatedRoute,
        private trainingServ: TrainingLessonService,
        private dropdownListDataSourceService: DropdownListDataSourceService,
        private localStorageServ: LocalStorageService,
        private userServ: UserService,
    ) {
        this.isLoading$ = this.wallServ.isLoadingSubject;
        this.pagePermessions = this.permessionService.getPagePermessions(constants.pages.libraryQuote);
    }
    ngOnInit(): void {
        this.route.parent?.params.subscribe((params) => {
            const id = params['id'];
            const wallName = params['wallName'];
            this.libraryWallpaperId = id;
            this.libraryWallpaperName = wallName;
        });  

        this.loadLibraryWallpaperLanguage(this.libraryWallpaperId);
        this.selectedLanguageId = this.localStorageServ.getItem('selectedLanguageId');
        this.isEditWallpaperLanguage = this.localStorageServ.getItem('isEditWallpaperLanguage');
        this.WallpaperTitle = this.localStorageServ.getItem('WallpaperTitle');
        this.WallpaperLangId = this.localStorageServ.getItem('WallpaperLangId');
        this.selectedQuote = this.localStorageServ.getItem('selectedQuote');
        this.selectedBackground = this.localStorageServ.getItem('selectedBackground');
        this.selectedCharacter = this.localStorageServ.getItem('selectedCharacter');
        this.defaultLanguage = this.localStorageServ.getItem('wallLanguage');
        const wallLanguage = this.localStorageServ.getItem('wallLanguage');       

        if (this.WallpaperTitle) {
            this.defaultLanguage = wallLanguage;
        }

        this.subs.add(
            this.userServ.getUserDetails().subscribe((res) => {
                if (res.data.iAwareTeam) {
                    this.isIAwareTeamUser = true;
                } else {
                    this.isIAwareTeamUser = false;
                }
            })
        );
    }

    libraryWallpaperLanguages: ILibraryWallpaperLanguage[];

    loadLibraryWallpaperLanguage(id: string) {
        
        this.subs.add(
            this.wallServ.getLibraryWallpaperLanguagesByLibraryWallpaperId(id).subscribe((r) => {
                this.libraryWallpaperLanguages = r;
                this.getActiveLanguages();
            })
        );
    }

    getActiveLanguages() {
        this.dropdownListDataSourceService.getActiveLanguages().subscribe({
            next: (res) => {
                this.activeLanguages = res.data;

                if (this.isEditWallpaperLanguage) {
                    if (this.selectedLanguageId) {
                        const selectedLanguage = this.activeLanguages.find((x) => x.id == this.selectedLanguageId);
                        if (selectedLanguage) {
                            this.activeLanguages = [selectedLanguage];
                            
                        } else {
                            this.activeLanguages = [];
                        }
                    }
                } else {
                    this.getActiveLanguageForAddForm();
                }
            },
        });
    }

    getActiveLanguageForAddForm() {
        const p = this.libraryWallpaperLanguages.map((c) => c.languageId);
        this.activeLanguages = this.activeLanguages.filter((c) => !p.includes(c.id));
        this.trainingServ.setActiveLanguagesAdd(this.activeLanguages);
        this.activeLanguages = this.activeLanguages.filter((group) =>
            this.activeLanguages.some((language) => language.id === group.id)
        );
    }

    createWallpaper() {
        if (this.isEditWallpaperLanguage) {
            this.saveEditLibraryWallpaperLanguage();
        } else {
            this.saveAddWallpaper();
        }
    }
    
    saveEditLibraryWallpaperLanguage() {
        if (
            this.selectedQuote?.id &&
            this.selectedBackground?.id &&
            this.selectedCharacter?.id &&
            this.WallpaperTitle &&
            this.WallpaperTitle.trim() !== ''
        ) {
            this.submitted = true;

            const wallpaperData = {
                Id: this.WallpaperLangId,
                LibraryWallpaperId: this.libraryWallpaperId,
                WallpaperTitle: this.WallpaperTitle,
                LanguageId: this.selectedLanguageId,
                LibraryBackgroundId: this.selectedBackground.id,
                LibraryLanguageCharacterId: this.selectedCharacter?.id,
                LibraryLanguageQuoteId: this.selectedQuote.id,
            };

            this.subs.add(
                this.wallServ
                    .editLibraryWallpaperLanguage(wallpaperData)
                    .pipe(
                        finalize(() => {
                            this.router.navigate([
                                `wallpaper-wizard/${this.libraryWallpaperId}/${this.libraryWallpaperName}/${this.isIAwareTeamUser ? 'defaultWallpapers': 'companyWallpapers'}`,
                            ]);
                            this.chooseTitleDialog = false;
                            this.submitted = false;
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
        }
    }

    saveAddWallpaper() {
        if (
            this.selectedQuote?.id &&
            this.selectedBackground?.id &&
            this.selectedCharacter?.id &&
            this.WallpaperTitle &&
            this.WallpaperTitle.trim() !== ''
        ) {
            this.submitted = true;

            const wallpaperData = {
                LibraryWallpaperId: this.libraryWallpaperId,
                WallpaperTitle: this.WallpaperTitle,
                LanguageId: this.selectedLanguageId,
                LibraryBackgroundId: this.selectedBackground.id,
                LibraryLanguageCharacterId: this.selectedCharacter?.id,
                LibraryLanguageQuoteId: this.selectedQuote.id,
            };
            

            // Add wallpaper using the service
            this.subs.add(
                this.wallServ
                    .addLibraryWallpaperLanguage(wallpaperData)
                    .pipe(
                        finalize(() => {
                            this.router.navigate([
                                `wallpaper-wizard/${this.libraryWallpaperId}/${this.libraryWallpaperName}/${this.isIAwareTeamUser ? 'defaultWallpapers': 'companyWallpapers'}`,
                            ]);
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
        this.localStorageServ.setItem('WallpaperTitle', this.WallpaperTitle);
        
        this.localStorageServ.setItem('selectedLanguageId', this.selectedLanguageId);
        const id = this.libraryWallpaperId;
        const wallName = this.libraryWallpaperName;
        this.router.navigate([`wallpaper-wizard/${id}/${wallName}/createWallpaperLanguage/quote`]);
    }
}
