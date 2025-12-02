import { ApplicationRef, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { MessageService, ConfirmationService, MenuItem } from 'primeng/api';
import { Subscription, finalize, switchMap } from 'rxjs';
import { ILanguageModel } from 'src/app/modules/language/models/ILanguageModel';
import { TrainingLessonService } from 'src/app/modules/security-training/services/training-lesson.service';
import { DataView } from 'primeng/dataview';
import { SelectItem } from 'primeng/api';
import { Editor } from 'ngx-editor';
import { WallpaperLibrariesService } from '../../services/wallpaper-libraries.service';
import { ILibraryLanguageCharacter } from '../../models/wallpaper-libraries';
import { PermessionsService } from 'src/app/core/Services/permessions.service';
import { IAspNetPageItemModel } from 'src/app/modules/page-management/models/IAspNetPageItemModel';
import { constants } from 'src/app/core/constatnts/constatnts';
import { DropdownListDataSourceService } from 'src/app/core/Services/dropdown-list-data-source.service';
@Component({
    selector: 'app-library-language-character',

    templateUrl: './library-language-character.component.html',
    styleUrl: './library-language-character.component.scss',
})
export class LibraryLanguageCharacterComponent implements OnInit, OnDestroy {
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
    menuItems: MenuItem[] = [];
    sortField: string = '';
    constructor(
        private trainingServ: TrainingLessonService,
        private libraryWallServ: WallpaperLibrariesService,
        private messageService: MessageService,
        private formBuilder: FormBuilder,
        private router: Router,
        private ref: ChangeDetectorRef,
        private dropdownListDataSourceService: DropdownListDataSourceService,
        private permessionService: PermessionsService
    ) {
        this.pagePermessions = this.permessionService.getPagePermessions(constants.pages.libraryCharacter);
    }

    ngOnInit() {
        // this.loadLibraryCharacters();
        this.initLibraryCharacter();
        this.initLibraryCharacterForm();

        this.subs.add(
            this.trainingServ.getCountOfActiveLanguage().subscribe((r) => {
                this.countOfActiveLanguages = r;
            })
        );

        this.subs.add(
            this.dropdownListDataSourceService.getActiveLanguages().subscribe((res) => {
                this.activeLanguages = res.data;
            })
        );

        this.subs.add(
            this.trainingServ.GetDefaultLanguage().subscribe((res) => {
                this.defaultLanguage = [res];
            })
        );
        this.sortOptions = [
            { label: 'Name', value: 'name' },
            { label: 'Price Low to High', value: 'price' },
        ];

        const editBtn = {
            label: 'Edit',
            icon: 'pi pi-fw pi-pencil',
            command: () => this.editLibraryCharacter(this.libraryCharacter),
        };
        const deleteBtn = {
            label: 'Delete',
            icon: 'pi pi-fw pi-trash',
            command: () => this.deleteLibraryCharacter(this.libraryCharacter),
        };
        this.menuItems = [];

        if (this.hasPermission(this.actions.edit)) {
            this.menuItems.push(editBtn);
        }
        if (this.hasPermission(this.actions.delete)) {
            this.menuItems.push(deleteBtn);
        }
    }
    assigneCurrentSelect(LibraryCharacter: ILibraryLanguageCharacter) {
        this.libraryCharacter = LibraryCharacter;
    }

    // loadLibraryCharacters() {
    //     this.subs.add(
    //         this.libraryWallServ.getAllLibraryLanguageCharacters().subscribe((data) => {
    //             this.libraryCharacters = data;
    //             this.ref.detectChanges();
    //         })
    //     );
    // }

    //#region Edit Training Lesson

    editLibraryCharacter(LibraryCharacter: ILibraryLanguageCharacter) {
        this.selectetCharacterImage = null;
        this.selectLanguage(this.selectedLanguage!);
        this.libraryCharacter = { ...LibraryCharacter };
        this.imageUrl1 = this.libraryCharacter.characterImageUrl;
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

            const CharacterImageFile = this.selectetCharacterImage;
            if (CharacterImageFile) {
                formData.append('CharacterImageUrl', CharacterImageFile, CharacterImageFile.name);
            }

            this.subs.add(
                this.libraryWallServ
                    .editLibraryLanguageCharacter(formData)
                    .pipe(
                        switchMap(() => {
                            return this.libraryWallServ.getAllLibraryLanguageCharacters();
                        }),
                        finalize(() => {
                            this.selectLanguage(this.selectedLanguage!);
                            this.ref.detectChanges();
                            this.initLibraryCharacter();
                            this.initLibraryCharacterForm();
                            this.subs.add(
                                this.router.events.subscribe((event) => {
                                    if (event instanceof NavigationEnd) {
                                        this.router.navigated = false;
                                    }
                                })
                            );
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
        if (this.addLibraryCharacterForm.valid) {
            const formData = new FormData();
            formData.append('CharacterName', this.addLibraryCharacterForm.value.characterName);
            formData.append('LanguageId', this.addLibraryCharacterForm.value.languageId);
            const CharacterImageFile = this.selectetCharacterImage;
            if (CharacterImageFile) {
                formData.append('CharacterImageUrl', CharacterImageFile, CharacterImageFile.name);
            }
            this.subs.add(
                this.libraryWallServ.addLibraryLanguageCharacter(formData).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Character Image Added',
                            life: 3000,
                        });

                        this.selectLanguage(this.selectedLanguage!);
                        this.ref.detectChanges();
                        this.initLibraryCharacter();
                        this.initLibraryCharacterForm();
                        this.addLibraryCharacterDialog = false;
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
            characterImageThumbnailUrl:'',
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

    CreateLibraryCharacter() {
        this.addLibraryCharacterDialog = true;
        this.initLibraryCharacterForm();
        this.initLibraryCharacter();
        this.imageUrl1 = '../../../../../assets/media/upload-photo.jpg';
        this.selectetCharacterImage = null;
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
    selectedLanguageName: string | null = null;
    selectLanguage(lang: ILanguageModel) {
        this.selectedLanguage = lang;
        this.libraryWallServ.getLibraryLanguageCharacterByLangaugeId(lang.id).subscribe((data) => {
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

    ngOnDestroy() {
        this.subs.unsubscribe();
    }
}
