import { AfterViewChecked, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MenuItem, MessageService } from 'primeng/api';
import { finalize, Subscription } from 'rxjs';

import { Router } from '@angular/router';
import { DataView, DataViewLazyLoadEvent } from 'primeng/dataview';
import { Table } from 'primeng/table';
import { constants } from 'src/app/core/constatnts/constatnts';
import { PermessionsService } from 'src/app/core/Services/permessions.service';
import { ILanguageModel } from 'src/app/modules/language/models/ILanguageModel';
import { IAspNetPageItemModel } from 'src/app/modules/page-management/models/IAspNetPageItemModel';
import {
    ILibraryBackground,
    ILibraryLanguageCharacter,
    ILibraryLanguageQuote,
    ILibraryWallpaper,
} from 'src/app/modules/wallpaper-libraries/models/wallpaper-libraries';
import { WallpaperLibrariesService } from 'src/app/modules/wallpaper-libraries/services/wallpaper-libraries.service';
import { AddLibraryWallpaperDto } from 'src/app/modules/wallpaper-libraries/components/library-wallpaper/library-wallpaper.component';
import { TranslationService } from 'src/app/core/Services/translation.service';
import { GetUser } from 'src/app/layout/app-menuProfile/app.menuprofile.component';
import { UserService } from 'src/app/modules/user/services/user.service';
import { TableLoadingService } from 'src/app/core/Services/table-loading.service';
import { ITagModel } from 'src/app/modules/tages/models/ITagModel';
import { TagesService } from 'src/app/modules/tages/services/tages.service';
import { DropdownListDataSourceService } from 'src/app/core/Services/dropdown-list-data-source.service';
import { IPaginationModel } from 'src/app/core/Dtos/IPaginationModel';

@Component({
    selector: 'app-wallpaper-list-wizard',
    templateUrl: './wallpaper-list-wizard.component.html',
    styleUrl: './wallpaper-list-wizard.component.scss',
})
export class WallpaperListWizardComponent implements OnInit, AfterViewChecked {
    tableLoadingSpinner: boolean = true;
    iAwareWallpapersLoading: boolean | null = null;
    companyWallpapersLoading: boolean | null = null;
    defaultWallpapersLoading: boolean | null = null;

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
    wallUrl: string = '../../../../../assets/media/upload-photo.jpg';
    wallUrlThumbnail: string = '../../../../../assets/media/upload-photo.jpg';
    selectedImage: File | null = null;
    selectedTages: string[] = [];
    selectedImageThumbnail: File | null = null;
    imageTitle: string;
    editWallpaperDialog: boolean = false;
    deletionWallpaperDialog: boolean = false;
    switchActivationWallpaperDialog: boolean = false;
    openCategoryPageContentHtmlDialog: boolean = false;
    addNewStandaloneWallpaperDialog: boolean = false;
    addWallpaperDialog: boolean = false;
    submitted: boolean = false;
    wallpapers: ILibraryWallpaper[];
    systemWallpapers: ILibraryWallpaper[];
    filteredSystemWallpapers: ILibraryWallpaper[];
    tenantWallpapers: ILibraryWallpaper[];
    filteredTenantWallpapers: ILibraryWallpaper[];
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
    ownerMenuItems: MenuItem[] = [];
    normalMenuItems: MenuItem[] = [];
    originalWallpapers: any[] = [];
    user: GetUser;
    isIAwareTeamUser: boolean | null = null;
    tages: ITagModel[] = [];
    totalRecords: number = 0;
    iAwareWallpapersTotalRecords: number = 0;
    companyWallpapersTotalRecords: number = 0;
    constructor(
        private wallServ: WallpaperLibrariesService,
        private messageService: MessageService,
        private formBuilder: FormBuilder,
        private ref: ChangeDetectorRef,
        private router: Router,
        private permessionService: PermessionsService,
        private translate: TranslationService,
        private userServ: UserService,
        private dropdownListDataSourceService: DropdownListDataSourceService,
        private tableLoadingService: TableLoadingService,
        private tagesAPIService: TagesService
    ) {
        this.pagePermessions = this.permessionService.getPagePermessions(constants.pages.libraryWallpaper);
        this.fetchTenantDefaultLanguage();
    }

    ngOnInit() {
        this.tableLoadingService.loading$.subscribe((isLoading) => {
            this.tableLoadingSpinner = isLoading;
            this.ref.detectChanges();
        });

        this.initWallpaper();
        this.initiateMenu();
        this.fetchUser();
        this.fetchAllTages();
        this.fetchActiveLanguages();
        // this.addWallpaperForm.get('languageId')?.valueChanges.subscribe((languageId) => {
        //     this.loadQuotesAndCharacters(languageId);
        // });
    }

    ngAfterViewChecked() {
        this.ref.detectChanges();
    }

    iAwareWallpapersPagination: IPaginationModel = {
        page: 0,
        size: 9,
        searchQuery: ''
    };

    companyWallpapersPagination: IPaginationModel = {
        page: 0,
        size: 9,
        searchQuery: ''
    };


    lazyLoadiAwareWallpapers(event: any) {
        this.iAwareWallpapersPagination.searchQuery = event.globalFilter || '';
        this.iAwareWallpapersPagination.page = Math.floor(event.first / event.rows);
        this.iAwareWallpapersPagination.size = event.rows;
        this.fetchiAwareWallpapers();
        this.scrollToTop();
    }


    lazyLoadCompanyWallpapers(event: any) {
        this.companyWallpapersPagination.searchQuery = event.globalFilter || '';
        this.companyWallpapersPagination.page = Math.floor(event.first / event.rows);
        this.companyWallpapersPagination.size = event.rows;
        this.fetchCompanyWallpapers();
        this.scrollToTop();
    }

    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    iAwareWallpapers: ILibraryWallpaper[] = [];
    companyWallpapers: ILibraryWallpaper[] = [];

    fetchiAwareWallpapers() {
        this.iAwareWallpapersLoading = true;
        this.subs.add(
            this.wallServ.getAllIAwareLibraryWallpapersWithPagination(this.iAwareWallpapersPagination).pipe(
                finalize(() => {
                    this.iAwareWallpapersLoading = false;
                    this.ref.detectChanges();
                })
            ).subscribe({
                next: (res) => {
                    this.iAwareWallpapers = res.data;
                    console.log('iAwareWallpapers', this.iAwareWallpapers);
                    this.iAwareWallpapersTotalRecords = res.totalRecords;
                    this.iAwareWallpapersLoading = false;
                    this.ref.detectChanges();
                },
                error: (err) => {
                    // this.iAwareWallpapersLoading = false;
                    this.ref.detectChanges();
                },
            })
        )
    }
    fetchCompanyWallpapers() {
        this.companyWallpapersLoading = true;
        this.subs.add(
            this.wallServ.getAllCompanyLibraryWallpapersWithPagination(this.companyWallpapersPagination).pipe(
                finalize(() => {
                    this.companyWallpapersLoading = false;
                    this.ref.detectChanges();
                })
            ).subscribe({
                next: (res) => {
                    this.companyWallpapers = res.data;
                    console.log('companyWallpapers', this.companyWallpapers);
                    this.companyWallpapersTotalRecords = res.totalRecords;
                    this.companyWallpapersLoading = false;
                    this.ref.detectChanges();
                },
                error: (err) => {
                    // this.companyWallpapersLoading = false;
                    this.ref.detectChanges();
                },
            })
        )
    }


    initiateMenu() {
        const editBtn = {
            label: this.translate.getInstant('shared.actions.edit'),
            icon: 'pi pi-fw pi-pencil',
            command: () => this.openEditWallpaper(this.wallpaper),
        };

        const deleteBtn = {
            label: this.translate.getInstant('shared.actions.delete'),
            icon: 'pi pi-fw pi-trash',
            command: () => this.openDeleteWallpaper(this.wallpaper),
        };

        const deafultBtn = {
            label: this.translate.getInstant('shared.actions.defaultInSystem'),
            icon: 'pi pi-fw pi-minus-circle',
            command: () => '',
        };

        this.ownerMenuItems = [];
        this.ownerMenuItems.push(editBtn);
        this.ownerMenuItems.push(deleteBtn);
        this.normalMenuItems = [];
        this.normalMenuItems.push(deleteBtn);
    }

    fetchTenantDefaultLanguage() {
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

    fetchUser() {
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
    }

    fetchActiveLanguages() {
        this.subs.add(
            this.dropdownListDataSourceService.getActiveLanguages().subscribe((res) => {
                this.activeLanguages = res.data;
                this.countOfActiveLanguages = this.activeLanguages.length
            })
        );
    }

    fetchAllTages() {
        this.subs.add(
            this.tagesAPIService.getAllTages().subscribe({
                next: (res) => {
                    this.tages = res.data?.filter((t: ITagModel) => t.wallpaperAllowed);

                },
                error: (error) => {
                    //this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
                },
            })
        );
    }

    fetchLibraryBackgrounds() {
        this.subs.add(
            this.wallServ.getAllLibraryBackgrounds().subscribe((r) => {
                this.backgrounds = r;
            })
        );
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

    CreateNewWallpaper() {
        localStorage.setItem('wallLanguage', JSON.stringify(this.defaultLanguage[0]));
        this.router.navigate(['wallpaper-wizard/create/background']);
    }

    declineAddWallpaper() {
        this.addWallpaperDialog = false;
        this.selectedBackground = null;
        this.selectedCharacter = null;
        this.selectedQuote = null;
    }

    // selectBackground(background: ILibraryBackground) {
    //     this.addWallpaperForm.patchValue({ libraryBackgroundId: background.id });
    //     this.selectedBackground = background;
    // }

    // selectCharacter(char: ILibraryLanguageCharacter) {
    //     this.addWallpaperForm.patchValue({ libraryLanguageCharacterId: char.id });

    //     this.selectedCharacter = char;
    // }

    // selectQuote(quote: ILibraryLanguageQuote) {
    //     this.addWallpaperForm.patchValue({ libraryLanguageQuoteId: quote.id });
    //     this.selectedQuote = quote;
    // }

    onRadioButtonClick(event: MouseEvent, item: any) {
        event.stopPropagation();
    }

    // saveAddWallpaper() {
    //     this.submitted = true;
    //     if (this.addWallpaperForm.valid) {
    //         const wallpaperData: AddLibraryWallpaperDto = {
    //             WallpaperTitle: this.addWallpaperForm.value.wallpaperTitle,
    //             LanguageId: this.addWallpaperForm.value.languageId,
    //             LibraryBackgroundId: this.addWallpaperForm.value.libraryBackgroundId,
    //             LibraryLanguageCharacterId: this.addWallpaperForm.value.libraryLanguageCharacterId,
    //             LibraryLanguageQuoteId: this.addWallpaperForm.value.libraryLanguageQuoteId,
    //         };
    //         this.subs.add(
    //             this.wallServ
    //                 .addLibraryWallpaper(wallpaperData)
    //                 .pipe(
    //                     finalize(() => {
    //                         this.loadWallpapers();
    //                         this.addWallpaperDialog = false;
    //                         this.submitted = false;
    //                     })
    //                 )
    //                 .subscribe(() => {
    //                     this.messageService.add({
    //                         severity: 'success',
    //                         summary: 'Successful',
    //                         detail: 'Wallpaper added successfully',
    //                         life: 3000,
    //                     });
    //                 })
    //         );
    //     } else {
    //     }
    // }

    //#endregion

    //#region Edit Wallpaper

    openEditWallpaper(wallpaper: ILibraryWallpaper) {
        this.wallpaper = { ...wallpaper };
        this.editWallpaperDialog = true;
        this.fetchAllTages();
        this.wallServ.getLibraryWallpaperByIdWithTages(wallpaper.id).subscribe({
            next: (res) => {
                this.editWallpaperForm.patchValue({
                    id: wallpaper.id,
                    tages: res.data.tages,
                });
            },
            error: (error) => {
                //this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
            },
        });
    }

    declineEditWallpaper() {
        this.submitted = false;
        this.initWallpaper();
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
                        this.initWallpaper();
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

    saveEditWallpaprTages() {
        this.submitted = true;
        if (this.editWallpaperForm.valid) {
            if (this.editWallpaperForm.value.id && this.editWallpaperForm.value.id !== '') {
                this.wallServ
                    .editLibraryWallpaperTages(this.editWallpaperForm.value.id, this.editWallpaperForm.value.tages)
                    .subscribe({
                        next: () => {
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Successful',
                                detail: 'Wallpaper Tages Updated',
                                life: 3000,
                            });

                            this.loadWallpapers();
                            this.initWallpaper();
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

    openDeleteWallpaper(wallpaper: ILibraryWallpaper) {
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

    //#region Load Wallpaper
    loadWallpapers() {
        this.tableLoadingService.show();

        this.subs.add(
            this.wallServ.getAllLibraryWallpapers().subscribe({
                next: (data) => {
                    this.wallpapers = data || [];
                    this.systemWallpapers = this.wallpapers.filter((bg) => bg.canEdit);
                    this.filteredSystemWallpapers = this.systemWallpapers;
                    this.tenantWallpapers = this.wallpapers.filter((bg) => !bg.canEdit);
                    this.filteredTenantWallpapers = this.tenantWallpapers;
                    this.ref.detectChanges();
                    this.tableLoadingService.hide();
                },
                error: () => {
                    this.wallpapers = [];
                    this.systemWallpapers = [];
                    this.tenantWallpapers = [];

                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to load wallpapers',
                        life: 3000,
                    });

                    this.tableLoadingService.hide();
                },
            })
        );
    }

    // fetchSystemWallpapers(event: DataViewLazyLoadEvent) {
    //     const page = (event.first || 0) / (event.rows || 10) + 1;
    //     const params = {
    //         page: page,
    //         pageSize: event.rows
    //     };

    //     this.tableLoadingService.show();
    //     this.subs.add(
    //         this.wallServ.getAllLibraryWallpapersWithPagination(params).subscribe({
    //             next: (res) => {
    //                 this.wallpapers = res.data || [];
    //                 this.systemWallpapers = this.wallpapers.filter((bg) => bg.canEdit);
    //                 this.filteredSystemWallpapers = this.systemWallpapers;
    //                 this.tenantWallpapers = this.wallpapers.filter((bg) => !bg.canEdit);
    //                 this.filteredTenantWallpapers = this.tenantWallpapers;
    //                 this.totalRecords = res.totalRecords
    //                 this.tableLoadingService.hide();
    //             },
    //             error: () => {
    //                 this.wallpapers = [];
    //                 this.systemWallpapers = [];
    //                 this.tenantWallpapers = [];
    //                 this.messageService.add({
    //                     severity: 'error',
    //                     summary: 'Error',
    //                     detail: 'Failed to load wallpapers',
    //                     life: 3000,
    //                 });

    //                 this.tableLoadingService.hide();
    //             },
    //         })
    //     );
    // }

    onTagFilterChanged(selectedTagIds: string[]): void {
        if (selectedTagIds.length > 0) {
            this.filteredSystemWallpapers = this.systemWallpapers.filter((wallpaper) => {
                return wallpaper.tages?.some((tagId: string) => selectedTagIds.includes(tagId));
            });

            this.filteredTenantWallpapers = this.tenantWallpapers.filter((wallpaper) => {
                return wallpaper.tages?.some((tagId: string) => selectedTagIds.includes(tagId));
            });
        } else {
            this.filteredSystemWallpapers = this.systemWallpapers;
            this.filteredTenantWallpapers = this.tenantWallpapers;
        }
    }

    initWallpaper() {
        this.wallpaper = {
            id: '',
            wallpaperBackgroundImage: '',
            wallpaperImageUrl: '',
            wallpaperImageThumbnailUrl: '',
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

    navigateToLangauges(wallId: string, wallName: string, where: string): void {
        this.router.navigate(['wallpaper-wizard', wallId, wallName, where]);
    }

    //#endregion

    //#region Single Wallpaper

    openAddNewStandaloneWallpaperDialog() {
        this.fetchAllTages();
        this.selectedImage = null;
        this.selectedImageThumbnail = null;
        this.imageTitle = '';
        this.wallUrl = '../../../../../assets/media/upload-photo.jpg';
        this.wallUrlThumbnail = '../../../../../assets/media/upload-photo.jpg';
        this.addNewStandaloneWallpaperDialog = true;
    }

    confirmAddSingleWallpaper() {
        this.submitted = true;
        if (!this.imageTitle || !this.selectedImage) {
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
        formData.append('LanguageId', this.defaultLanguage[0].id);
        const tagges = this.selectedTages;
        if (tagges && tagges.length > 0) {
            tagges.forEach((tag: any, index: number) => {
                formData.append(`Tages[${index}]`, tag);
            });
        }
        if (this.selectedImage && this.selectedImageThumbnail) {
            formData.append('WallpaperImage', this.selectedImage, this.selectedImage.name);
            formData.append('WallpaperImageThumbnail', this.selectedImageThumbnail, this.selectedImageThumbnail.name);

            this.wallServ.addSingleLibraryWallpaper(formData).subscribe({
                next: () => {
                    this.ref.detectChanges();
                    this.loadWallpapers();
                    this.addNewStandaloneWallpaperDialog = false;
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
    }

    declineAddSingleWallpaper() {
        this.submitted = false;
        this.addNewStandaloneWallpaperDialog = false;
        this.loadWallpapers();
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
                this.wallUrlThumbnail = e.target.result;
                this.ref.detectChanges();
            };
            reader.readAsDataURL(this.selectedImageThumbnail);
        }
    }

    //#endregion

    //#region Wallpaper Permissions
    hasPermission(controlKey: string): boolean {
        return this.pagePermessions.some((p) => p.controlKey === controlKey);
    }

    handleBackToWallpapers(): void {
        this.selectedWallpaper = null;
    }

    //#endregion

    ngOnDestroy(): void {
        this.subs.unsubscribe();
    }
}