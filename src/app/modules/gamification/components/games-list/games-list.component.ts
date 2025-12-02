import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IGame } from '../../models/gamification-models';
import { ILanguageModel } from 'src/app/modules/language/models/ILanguageModel';
import { LanguageService } from 'src/app/modules/language/services/language.service';
import { GamificationService } from '../../services/gamification.service';
import { finalize, Subscription } from 'rxjs';
import { MessageService } from 'primeng/api';
import { LocalStorageService } from 'src/app/core/Services/local-storage.service';
import { TableLoadingService } from 'src/app/core/Services/table-loading.service';
import { PermessionsService } from 'src/app/core/Services/permessions.service';
import { IAspNetPageItemModel } from 'src/app/modules/page-management/models/IAspNetPageItemModel';
import { constants } from 'src/app/core/constatnts/constatnts';
import { environment } from 'src/environments/environment';
import { DropdownListDataSourceService } from 'src/app/core/Services/dropdown-list-data-source.service';
@Component({
    selector: 'app-games-list',
    templateUrl: './games-list.component.html',
    styleUrls: ['./games-list.component.scss'],
})
export class GamesListComponent implements OnInit, OnDestroy {

    pagePermessions: IAspNetPageItemModel[] = [];
    actions = constants.pageActions;

    tableLoadingSpinner: boolean = true;

    games: IGame[] = [];
    game: IGame;

    selectedGame: IGame | null = null;
    editGameDialog: boolean = false;
    addGameDialog: boolean = false;
    addGameForm: FormGroup;
    userId: string;
    selectedGameImage: File | null = null;
    activeLanguages: ILanguageModel[] = [];
    subs: Subscription = new Subscription();
    submitted: boolean = false;
    token: string
    imageUrl: string = '../../../../../assets/media/upload-photo.jpg';
    gamificationEnvironment: string = environment.gamificationEnvironment;
    
    constructor(
        private ref: ChangeDetectorRef,
        private gameServ: GamificationService,
        private formBuilder: FormBuilder,
        private langServ: LanguageService,
        private messageService: MessageService,
        private localStorageServ: LocalStorageService,
        private tableLoadingService: TableLoadingService,
        private permessionService: PermessionsService,
        private dropdownListDataSourceService: DropdownListDataSourceService
    ) {
        this.loadGames();
        this.pagePermessions = this.permessionService.getPagePermessions(constants.pages.gamification);
    }

    ngOnInit(): void {
        const token = this.localStorageServ.getItem('userData');
        this.token = token.token
        this.tableLoadingService.loading$.subscribe((isLoading) => {
            this.tableLoadingSpinner = isLoading;
        });

        this.initGame();
        this.initAddNewGameForm();
        this.getActiveLanguageForAddForm();
        const userData = this.localStorageServ.getCurrentUserData();
        this.userId = userData.userId;
    }

    loadGames() {
        this.tableLoadingService.show();
        this.subs.add(
            this.gameServ.getAllGames().subscribe((data) => {
                this.games = data.data;
                this.tableLoadingService.hide();
            })
        );
    }

    getActiveLanguageForAddForm() {
        this.dropdownListDataSourceService.getActiveLanguages().subscribe({
            next: (res) => {
                this.activeLanguages = res.data;
            },
            error: (err) => { },
        });
    }

    openEditDialog(game: IGame): void {
        this.selectedGame = game;
        this.editGameDialog = true;
    }

    closeDialog(): void {
        this.editGameDialog = false;
        this.addGameDialog = false;
        this.selectedGame = null;
        this.loadGames();
    }

    initAddNewGameForm() {
        this.addGameForm = this.formBuilder.group({
            id: [0, Validators.required],
            name: ['', Validators.required],
            questionCount: [0, Validators.required],
            languageId: [''],
            imageFile: [null],
            layoutUrl: ['', Validators.required],
            description: [0, Validators.required],
            autoNextAllowed: [false],
            previousAllowed: [false],
        });
    }

    initGame() {
        this.game = {
            id: 0,
            name: '',
            imageUrl: '',
            questionCount: 0,
            isActive: true,
            gameLanguages: [],
            autoNextAllowed: false,
            previousAllowed: false,
            isExpanded: false,
        };
    }

    saveAddNewGame() {
        this.submitted = true;
        if (this.addGameForm.valid) {
            const formData = new FormData();

            formData.append('Id', this.addGameForm.value.id);
            formData.append('Name', this.addGameForm.value.name);
            formData.append('LanguageId', this.addGameForm.value.languageId);
            formData.append('QuestionCount', this.addGameForm.value.questionCount);
            formData.append('Description', this.addGameForm.value.description);
            formData.append('LayoutUrl', this.addGameForm.value.layoutUrl);
            formData.append('AutoNextAllowed', this.addGameForm.value.autoNextAllowed ? 'true' : 'false');
            formData.append('PreviousAllowed', this.addGameForm.value.previousAllowed ? 'true' : 'false');
            const GameImageFile = this.selectedGameImage;
            if (GameImageFile) {
                formData.append('ImageFile', GameImageFile, GameImageFile.name);
            }

            this.subs.add(
                this.gameServ.addGame(formData).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Game Added Successfully',
                            life: 3000,
                        });

                        this.loadGames();
                        this.ref.detectChanges();
                        this.initAddNewGameForm();
                        this.closeDialog()
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

    onUploadGameImageClick() {
        const fileInput = document.getElementById('GameImage') as HTMLInputElement;
        fileInput.click();
    }

    onGameImageSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length) {
            this.selectedGameImage = input.files[0];

            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.imageUrl = e.target.result;
                this.ref.detectChanges();
            };
            reader.readAsDataURL(this.selectedGameImage);
        }
    }

    openAddNewGameDialog() {
        this.addGameDialog = true;
    }

    declineAddNewGame() {
        this.addGameDialog = false;
        this.initAddNewGameForm();
    }

    toggleDescription(game: IGame): void {
        if (game.description && game.description.length > 90) {
            game.isExpanded = !game.isExpanded;
        }
    }

    hasPermission(controlKey: string): boolean {
        return this.pagePermessions.some((p) => p.controlKey === controlKey);
    }

    ngOnDestroy(): void {
        this.subs.unsubscribe();
    }
}