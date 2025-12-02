import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Table } from 'primeng/table';
import { GamificationService } from '../../services/gamification.service';
import { MessageService } from 'primeng/api';
import { ILanguageModel } from 'src/app/modules/language/models/ILanguageModel';
import { IAspNetPageItemModel } from 'src/app/modules/page-management/models/IAspNetPageItemModel';
import { finalize, Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GameEnum, IGame, IGameLanguage, IGameLanguageQuestion } from '../../models/gamification-models';
import { TableLoadingService } from 'src/app/core/Services/table-loading.service';
import { DropdownListDataSourceService } from 'src/app/core/Services/dropdown-list-data-source.service';

@Component({
    selector: 'app-game-edit',
    templateUrl: './game-edit.component.html',
    styleUrl: './game-edit.component.scss',
})
export class GameEditComponent implements OnInit, OnChanges {
    tableLoadingSpinner: boolean = true;

    gameTypes = GameEnum; // Access GameEnum in the template
    gameDetails: IGame;
    gameLanguage: IGameLanguage;
    gameQuestions: IGameLanguageQuestion[] = [];
    gameQuestion: IGameLanguageQuestion;
    addNewQuestionDialog: boolean = false;
    selectedQuestionAnswerIndex: number = -1;
    submitted: boolean = false;
    @Input() game: IGame | null = null;
    activeLanguages: ILanguageModel[] = [];
    pagePermessions: IAspNetPageItemModel[] = [];
    imageUrl: string = '../../../../../assets/media/upload-photo.jpg';
    subs: Subscription = new Subscription();
    gameId: number;
    addNewGameLanguageDialog: boolean;
    addNewGameLanguageForm: FormGroup;
    public activeTabIndex: number = 0; // Default to the first tab (index 0)

    selectedGameImage: File | null = null;
    switchActivationGameLanguageDialog: boolean = false;

    constructor(
        private gameServ: GamificationService,
        private messageService: MessageService,
        private ref: ChangeDetectorRef,
        private tableLoadingService: TableLoadingService,
        private formBuilder: FormBuilder,
        private dropdownListDataSourceService: DropdownListDataSourceService
    ) { }
    ngOnChanges(changes: SimpleChanges): void {
        if (changes['game'] && this.game) {
            // This block will run whenever the 'game' input changes

            this.gameId = this.game.id;
            this.loadGameLanguages(this.game.id);

            this.imageUrl = this.game.imageUrl ?? '../../../../../assets/media/upload-photo.jpg';
        }
    }
    ngOnInit() {
        this.tableLoadingService.loading$.subscribe((isLoading) => {
            this.tableLoadingSpinner = isLoading;
        });

        this.initGameQuestionModels();
        this.initAddNewGameLanguageForm();
    }
    loadGameLanguages(gameId: number) {
        this.tableLoadingService.show();

        this.gameServ
            .getAllQuestionsWithAnswersByGameId(gameId)
            .pipe(
                finalize(() => {
                    this.getActiveLanguageForAddForm();
                    this.tableLoadingService.hide();
                })
            )
            .subscribe((response) => {
                this.gameDetails = response.data; // This should be an object where keys are language IDs
                this.game = this.gameDetails;
                // Ensure gameLanguages are present for further use
                if (!this.game.gameLanguages) {
                    this.game.gameLanguages = [];
                }
            });
    }
    // loadGameLanguage() {
    //     this.gameServ.getGameLanguageById(this.gameLanguage.id).subscribe((response) => {
    //         this.gameLanguage = response.data;
    //         this.ref.detectChanges();
    //     });
    // }
    getActiveLanguageForAddForm() {
        this.dropdownListDataSourceService.getActiveLanguages().subscribe({
            next: (res) => {
                this.activeLanguages = res.data;

                if (this.game && this.game.gameLanguages && this.game.gameLanguages.length > 0) {
                    const existingLanguageIds = this.game.gameLanguages.map((c) => c.languageId);

                    this.activeLanguages = this.activeLanguages.filter((language) => {
                        return !existingLanguageIds.includes(language.id);
                    });
                }
            },
            error: (err) => { },
        });
    }

    //#region Add New Game Language

    //#endregion

    //#region Game Question

    loadGameLanguageQuestions() {
        this.gameServ.getGameLanguageQuestionsByGameLanguageIdAsync(this.gameLanguage.id).subscribe((response) => {
            this.gameLanguage.gameLanguageQuestions = [...response.data];
        });
    }

    addNewGameQuestion(gameLanguage: IGameLanguage) {
        this.initGameQuestionModels();
        this.gameLanguage = { ...gameLanguage };
        this.selectedQuestionAnswerIndex = -1;
        this.addNewQuestionDialog = true;
    }

    saveAddNewQuestion() {
        this.submitted = true;
        if (!this.gameQuestion.questionText.trim()) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Question text is required',
                life: 3000,
            });
            return;
        }
        const validAnswers = this.gameQuestion.gameLanguageQuestionAnswers.filter((answer) => answer.answerText.trim());
        if (validAnswers.length < 2) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'At least two answers are required',
                life: 3000,
            });
            return;
        }
        if (
            this.selectedQuestionAnswerIndex === -1 ||
            this.selectedQuestionAnswerIndex >= this.gameQuestion.gameLanguageQuestionAnswers.length ||
            !this.gameQuestion.gameLanguageQuestionAnswers[this.selectedQuestionAnswerIndex].answerText.trim()
        ) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Please select a valid correct answer',
                life: 3000,
            });
            return;
        }
        validAnswers.forEach((answer, index) => {
            answer.isTrueAnswer = index === this.selectedQuestionAnswerIndex;
            answer.orderNo = index;
        });
        const addGameQuestionDto = {
            QuestionText: this.gameQuestion.questionText,
            QuestionDifficultyLevel: this.gameQuestion.questionDifficultyLevel,
            GameLanguageId: this.gameLanguage.id,
            QuestionBackgroundUrl: '',
            GameLanguageQuestionAnswers: validAnswers,
        };

        const formData = new FormData();

        formData.append('QuestionText', addGameQuestionDto.QuestionText);
        formData.append('QuestionBackgroundUrl', addGameQuestionDto.QuestionBackgroundUrl);
        formData.append('QuestionDifficultyLevel', addGameQuestionDto.QuestionDifficultyLevel.toString());
        formData.append('GameLanguageId', addGameQuestionDto.GameLanguageId);

        // Append each answer as part of the FormData
        validAnswers.forEach((answer, index) => {
            // formData.append(`GameLanguageQuestionAnswers[${index}].Id`, answer.id);
            formData.append(`GameLanguageQuestionAnswers[${index}].AnswerText`, answer.answerText);
            formData.append(`GameLanguageQuestionAnswers[${index}].IsTrueAnswer`, answer.isTrueAnswer.toString());
            formData.append(`GameLanguageQuestionAnswers[${index}].OrderNo`, answer.orderNo.toString());
            formData.append(`GameLanguageQuestionAnswers[${index}].AnswerIcon`, answer.answerText);
        });

        this.subs.add(
            this.gameServ
                .addGameLanguageQuestion(formData)
                .pipe(
                    finalize(() => {
                        this.loadGameLanguages(this.game!.id);
                        this.ref.detectChanges();
                    })
                )
                .subscribe(() => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Game Question added successfully',
                        life: 3000,
                    });
                    this.addNewQuestionDialog = false;
                })
        );
    }
    hideAddNewQuestionDialog() {
        this.addNewQuestionDialog = false;
    }

    //#endregion

    //#region Game Details
    games: IGame[] = [];

    loadGames() {
        this.subs.add(
            this.gameServ.getAllGames().subscribe((data) => {
                this.games = data.data;
            })
        );
    }

    saveUpdateGameDetails() {
        this.submitted = true;
        const formData = new FormData();

        formData.append('Id', this.gameDetails.id.toString());
        formData.append('Name', this.gameDetails.name);
        formData.append('QuestionCount', this.gameDetails.questionCount.toString());
        formData.append('AutoNextAllowed', this.gameDetails.autoNextAllowed.toString());
        formData.append('PreviousAllowed', this.gameDetails.previousAllowed.toString());
        const GameImageFile = this.selectedGameImage;
        if (GameImageFile) {
            formData.append('ImageFile', GameImageFile, GameImageFile.name);
        }
        this.subs.add(
            this.gameServ.editGame(formData).subscribe({
                next: () => {
                    this.loadGames();
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Game Updated Successfully',
                        life: 3000,
                    });
                    this.ref.detectChanges();
                },
            })
        );
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
    //#endregion

    //#region Activation Game Language

    switchGameLanguageActivation(gameLanguage: IGameLanguage) {
        this.switchActivationGameLanguageDialog = true;
        this.gameLanguage = { ...gameLanguage };
    }

    declineGameLanguageActivation() {
        this.switchActivationGameLanguageDialog = false;
        this.loadGameLanguages(this.game!.id);
        this.ref.detectChanges();
    }

    confirmGameLanguageActivation() {
        this.toggleGameLanguageActivation(this.gameLanguage);
    }

    toggleGameLanguageActivation(gameLanguage: IGameLanguage) {
        if (gameLanguage.isActive) {
            this.subs.add(
                this.gameServ
                    .deActiveGameLanguageById(gameLanguage.id)
                    .pipe(
                        finalize(() => {
                            this.loadGameLanguages(this.game!.id);
                            this.ref.detectChanges();
                            this.switchActivationGameLanguageDialog = false;
                        })
                    )
                    .subscribe(() => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Game Language Deactivated',
                            life: 3000,
                        });
                    })
            );
        } else {
            this.subs.add(
                this.gameServ
                    .activeGameLanguageById(gameLanguage.id)
                    .pipe(
                        finalize(() => {
                            this.loadGameLanguages(this.game!.id);
                            this.ref.detectChanges();
                            this.switchActivationGameLanguageDialog = false;
                        })
                    )
                    .subscribe(() => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Game Language Activated',
                            life: 3000,
                        });
                    })
            );
        }
    }

    //#endregion

    //#region Activation Question
    switchActivationQuestionDialog: boolean = false;
    switchQuestionActivation(gameQuestion: IGameLanguageQuestion, gameLanguage: IGameLanguage) {
        this.switchActivationQuestionDialog = true;
        this.gameQuestion = { ...gameQuestion };
        this.gameLanguage = { ...gameLanguage };
    }

    declineQuestionActivation() {
        this.switchActivationQuestionDialog = false;
        this.loadGameLanguages(this.game!.id);
        this.ref.detectChanges();
    }

    confirmtQuestionActivation() {
        this.toggleQuestionActivation(this.gameQuestion);
    }

    toggleQuestionActivation(gameQuestion: IGameLanguageQuestion) {
        if (gameQuestion.isActive) {
            this.subs.add(
                this.gameServ
                    .deActiveGameQuestionById(gameQuestion.id)
                    .pipe(
                        finalize(() => {
                            this.loadGameLanguages(this.game!.id);
                            this.ref.detectChanges();
                            this.switchActivationQuestionDialog = false;
                        })
                    )
                    .subscribe(() => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Quiz Deactivated',
                            life: 3000,
                        });
                    })
            );
        } else {
            this.subs.add(
                this.gameServ
                    .activeGameQuestionById(gameQuestion.id)
                    .pipe(
                        finalize(() => {
                            this.loadGameLanguages(this.game!.id);
                            this.ref.detectChanges();
                            this.switchActivationQuestionDialog = false;
                        })
                    )
                    .subscribe(() => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Quiz Activated',
                            life: 3000,
                        });
                    })
            );
        }
    }

    //#endregion

    //#region Delete Question
    deleteQuestionDialog: boolean = false;
    deleteGameQuestion(gameQuestion: IGameLanguageQuestion, gameLanguage: IGameLanguage) {
        this.deleteQuestionDialog = true;
        this.gameQuestion = { ...gameQuestion };
        this.gameLanguage = { ...gameLanguage };
    }

    confirmQuestionDeletion() {
        this.subs.add(
            this.gameServ
                .deleteGameQuestionWithAnswersById(this.gameQuestion.id)
                .pipe(
                    finalize(() => {
                        this.loadGameLanguages(this.game!.id);
                        this.ref.detectChanges();
                        this.deleteQuestionDialog = false;
                    })
                )
                .subscribe({
                    next: () => {
                        this.deleteQuestionDialog = false;
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Info',
                            detail: 'Question Deleted Successfully',
                            life: 3000,
                        });
                    },
                })
        );
    }
    declineQuestionDeletion() {
        this.deleteQuestionDialog = false;
        this.loadGameLanguages(this.game!.id);
    }

    //#endregion

    //#region Delete Game Language

    deleteGameLanguageDialog: boolean = false;
    deleteGameLanguage(gameLanguage: IGameLanguage) {
        this.gameLanguage = { ...gameLanguage };
        this.deleteGameLanguageDialog = true;
    }
    declineGameLanguageDeletion() {
        this.deleteGameLanguageDialog = false;
    }

    confirmGameLanguageDeletion() {
        this.subs.add(
            this.gameServ
                .deleteGameLanguageById(this.gameLanguage.id)
                .pipe(
                    finalize(() => {
                        this.loadGameLanguages(this.game!.id);
                        this.ref.detectChanges();
                        this.deleteGameLanguageDialog = false;
                    })
                )
                .subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Info',
                            detail: 'Game Language Deleted Successfully',
                            life: 3000,
                        });
                    },
                })
        );
    }

    //#endregion

    //#region Edit Game Question

    fixedAnswers: any[] = [
        { answerText: '', isTrueAnswer: false, orderNo: 0 },
        { answerText: '', isTrueAnswer: false, orderNo: 1 },
        { answerText: '', isTrueAnswer: false, orderNo: 2 },
        { answerText: '', isTrueAnswer: false, orderNo: 3 },
    ];

    editGameLanguageQuestionDialog: boolean = false;

    editGameQuestion(gameQuestion: IGameLanguageQuestion, gameLanguage: IGameLanguage) {
        this.gameLanguage = JSON.parse(JSON.stringify(gameLanguage));
        this.gameQuestion = JSON.parse(JSON.stringify(gameQuestion));

        this.ensureFixedAnswers();

        this.selectedQuestionAnswerIndex = this.gameQuestion.gameLanguageQuestionAnswers.findIndex(
            (answer) => answer.isTrueAnswer
        );
        this.editGameLanguageQuestionDialog = true;
    }
    ensureFixedAnswers() {
        if (!this.gameQuestion.gameLanguageQuestionAnswers) {
            this.gameQuestion.gameLanguageQuestionAnswers = [];
        }

        for (let i = 0; i < 4; i++) {
            if (!this.gameQuestion.gameLanguageQuestionAnswers[i]) {
                this.gameQuestion.gameLanguageQuestionAnswers[i] = {
                    id: '',
                    answerText: '',
                    isTrueAnswer: false,
                    orderNo: i,
                };
            }
        }

        this.fixedAnswers = this.gameQuestion.gameLanguageQuestionAnswers.slice(0, 4);
    }

    saveEditQuestion() {
        this.submitted = true;

        if (!this.gameQuestion.questionText.trim()) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Question text is required',
                life: 3000,
            });
            return;
        }

        const validAnswers = this.gameQuestion.gameLanguageQuestionAnswers.filter((answer) => answer.answerText.trim());

        if (validAnswers.length < 2) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'At least two answer is required',
                life: 3000,
            });
            return;
        }

        if (
            this.selectedQuestionAnswerIndex === -1 ||
            this.selectedQuestionAnswerIndex >= this.fixedAnswers.length ||
            !this.fixedAnswers[this.selectedQuestionAnswerIndex].answerText.trim()
        ) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Please select a valid correct answer',
                life: 3000,
            });
            return;
        }

        validAnswers.forEach((answer, index) => {
            answer.isTrueAnswer = index === this.selectedQuestionAnswerIndex;
            answer.orderNo = index; // Set the order property
        });
        //
        const editGameLanguageQuestionDto = {
            id: this.gameQuestion.id,
            QuestionText: this.gameQuestion.questionText,
            GameLanguageQuestionAnswers: validAnswers,
            QuestionDifficultyLevel: this.gameQuestion.questionDifficultyLevel,
            GameLanguageId: this.gameLanguage.id,
            QuestionBackgroundUrl: '',
        };

        this.gameQuestion.gameLanguageQuestionAnswers = validAnswers;

        const formData = new FormData();
        formData.append('Id', editGameLanguageQuestionDto.id);
        formData.append('QuestionText', editGameLanguageQuestionDto.QuestionText);
        formData.append('QuestionBackgroundUrl', editGameLanguageQuestionDto.QuestionBackgroundUrl);
        formData.append('QuestionDifficultyLevel', editGameLanguageQuestionDto.QuestionDifficultyLevel.toString());
        formData.append('GameLanguageId', editGameLanguageQuestionDto.GameLanguageId);

        // Append each answer as part of the FormData
        validAnswers.forEach((answer, index) => {
            formData.append(`GameLanguageQuestionAnswers[${index}].Id`, answer.id);
            formData.append(`GameLanguageQuestionAnswers[${index}].AnswerText`, answer.answerText);
            formData.append(`GameLanguageQuestionAnswers[${index}].IsTrueAnswer`, answer.isTrueAnswer.toString());
            formData.append(`GameLanguageQuestionAnswers[${index}].OrderNo`, answer.orderNo.toString());
            formData.append(`GameLanguageQuestionAnswers[${index}].AnswerIcon`, answer.answerText);
        });

        this.subs.add(
            this.gameServ
                .editGameQuestionWithAnswers(formData)
                .pipe(
                    finalize(() => {
                        this.loadGameLanguages(this.game!.id);
                        this.ref.detectChanges(); // Trigger manual change detection

                        this.selectedQuestionAnswerIndex = -1;
                        this.editGameLanguageQuestionDialog = false;
                        this.submitted = false;
                    })
                )
                .subscribe((r) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Quiz updated successfully',
                        life: 3000,
                    });
                })
        );
    }

    hideEditQuestionDialog() {
        this.loadGameLanguageQuestions();
        this.editGameLanguageQuestionDialog = false;
        this.submitted = false;
        this.ref.detectChanges();
    }

    // Similarly, implement deletion, activation, and other required methods

    addNewQuestion(languageId: string) { }
    //#endregion

    //#region Add New Game Language
    addNewGameLanguage() {
        this.addNewGameLanguageDialog = true;
    }
    declineAddNewGameLanguage() {
        this.addNewGameLanguageDialog = false;
    }
    saveAddNewGameLanguage() {
        this.submitted = true;
        if (this.addNewGameLanguageForm.valid) {
            const formData = new FormData();

            formData.append('Name', this.addNewGameLanguageForm.value.name);
            formData.append('LayoutUrl', this.addNewGameLanguageForm.value.layoutUrl);
            formData.append('Description', this.addNewGameLanguageForm.value.description);
            formData.append('Instruction', this.addNewGameLanguageForm.value.instruction);
            formData.append('BackgroundInstruction', this.addNewGameLanguageForm.value.backgroundInstruction);
            formData.append('LanguageId', this.addNewGameLanguageForm.value.languageId);
            formData.append('GameId', this.gameId.toString());

            this.subs.add(
                this.gameServ.addNewGameLanguage(formData).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Game Added Successfully',
                            life: 3000,
                        });

                        this.loadGameLanguages(this.gameId);
                        this.ref.detectChanges();
                        this.initAddNewGameLanguageForm();
                        this.addNewGameLanguageDialog = false;
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
    //#endregion

    //#region update Game Language
    updateGameLanguage(gameLanguage: IGameLanguage) {
        this.submitted = true;

        const formData = new FormData();

        // Safely append values to formData, providing defaults if necessary
        formData.append('Id', gameLanguage.id.toString());
        formData.append('Name', gameLanguage.name ?? '');
        formData.append('LayoutUrl', gameLanguage.layoutUrl ?? '');
        formData.append('Description', gameLanguage.description ?? '');
        formData.append('Instruction', gameLanguage.instruction ?? '');
        formData.append('BackgroundInstruction', gameLanguage.backgroundInstruction ?? '');

        // Perform the API call for updating the game language
        this.subs.add(
            this.gameServ.editGameLanguage(formData).subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Game Language Updated Successfully',
                        life: 3000,
                    });

                    // Reload data and reset the form
                    this.loadGameLanguages(this.gameId);
                    this.ref.detectChanges();
                    this.initAddNewGameLanguageForm();
                    this.addNewGameLanguageDialog = false;
                },
                error: (err) => {
                    console.error('Error updating game language:', err);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'An error occurred while updating the game language',
                        life: 3000,
                    });
                },
            })
        );
    }

    //#endregion

    //#region
    //#endregion

    //#region
    //#endregion

    initGameQuestionModels() {
        this.gameQuestion = {
            id: '',
            gameLanguageId: '',
            questionDifficultyLevel: 0,
            questionText: '',
            isActive: false,
            gameLanguageQuestionAnswers: [
                { id: '', answerText: '', isTrueAnswer: false, orderNo: 0 },
                { id: '', answerText: '', isTrueAnswer: false, orderNo: 1 },
                { id: '', answerText: '', isTrueAnswer: false, orderNo: 2 },
                { id: '', answerText: '', isTrueAnswer: false, orderNo: 3 },
            ],
        };
    }

    initAddNewGameLanguageForm() {
        this.addNewGameLanguageForm = this.formBuilder.group({
            name: ['', Validators.required],
            description: [''],
            instruction: [''],
            backgroundInstruction: [''],
            layoutUrl: ['', Validators.required],
            languageId: [''],
            autoNextAllowed: false,
            previousAllowed: false,
        });
    }

    initGame() {
        this.game = {
            id: 0,
            name: '',
            imageUrl: '',
            autoNextAllowed: false,
            previousAllowed: false,
            gameLanguages: [],
            questionCount: 0,
            isActive: true,
            isExpanded: false
        };
    }

    hasPermission(controlKey: string): boolean {
        return this.pagePermessions.some((p) => p.controlKey === controlKey);
    }
    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }
}
