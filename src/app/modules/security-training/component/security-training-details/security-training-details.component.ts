import {
    Component,
    OnInit,
    OnDestroy,
    ViewChild,
    ChangeDetectorRef,
    SecurityContext,
    AfterViewChecked,
    NgZone,
} from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Subscription, finalize } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { ILanguageModel } from 'src/app/modules/language/models/ILanguageModel';
import { Table } from 'primeng/table';
import {
    ITrainingLesson,
    ITrainingLessonQuiz,
    ITrainingLessonQuote,
    ITrainingLessonScreenSaver,
    ITrainingLessonWallpaper,
    ITrainingLessonsLanguage,
} from '../../models/ISecurityTrainingModel';
import { TrainingLessonService } from '../../services/training-lesson.service';
import { Galleria } from 'primeng/galleria';
import { Editor } from 'ngx-editor';
import { DomSanitizer } from '@angular/platform-browser';
import { TableLoadingService } from 'src/app/core/Services/table-loading.service';
import { ScreenSaverPlatformType } from 'src/app/core/enums/ScreenSaverPlatformType';
import { FileDownloadService } from 'src/app/core/Services/file-download.service';
import { DropdownListDataSourceService } from 'src/app/core/Services/dropdown-list-data-source.service';
declare var $: any;

@Component({
    selector: 'app-security-training-details',
    templateUrl: './security-training-details.component.html',
    styleUrls: ['./security-training-details.component.scss'],
})
export class SecurityTrainingDetailsComponent implements OnInit, OnDestroy {
    tableLoadingSpinner: boolean = true;

    editTrainingLanguageDialog: boolean = false;
    deletionTrainingLanguageDialog: boolean = false;
    quotesListTrainingLanguageDialog: boolean = false;
    pdfViewerDialog: boolean = false;
    galleryHeader: string;
    quizTrainingDialog: boolean = false;
    addQuoteTrainingLanguageDialog: boolean = false;
    quizzesListTrainingLanguageDialog: boolean = false;
    switchActivationTrainingLessonDialog: boolean = false;
    libraryWallpaperDialog = false;

    editQuoteTrainingLanguageDialog: boolean = false;
    editQuizTrainingLanguageDialog: boolean = false;
    deletionQuoteTrainingLessonDialog: boolean = false;
    addQuizTrainingLanguageDialog: boolean = false;
    deletionQuizTrainingLessonDialog: boolean = false;
    deletionImageTrainingLessonDialog: boolean = false;
    editEmailTrainingLanguageDialog: boolean = false;
    editImageDialog: boolean = false;
    screenSavers: ITrainingLessonScreenSaver[] = [];
    wallpapers: ITrainingLessonWallpaper[] = [];

    trainingLesson: ITrainingLessonsLanguage;
    trainingLessonsLanguages: ITrainingLessonsLanguage[] = [];
    trainingLessonQuizzes: ITrainingLessonQuiz[] = [];
    trainingLessonQuotes: ITrainingLessonQuote[] = [];
    quoteText: string = '';
    QuotesText: string[] = [];
    trainingLessonQuote: ITrainingLessonQuote;
    trainingLessonQuiz: ITrainingLessonQuiz;

    numberOfWallpapers: number = 0;
    submitted: boolean = false;
    subs: Subscription = new Subscription();
    countOfActiveLanguage: Number = 0;
    defaultLanguage: ILanguageModel[] = [];
    selectedLanguage: ILanguageModel;
    trainigLessonId: string;
    newTrainingLessonForm: FormGroup;
    editTrainingLessonForm: FormGroup;
    imageForm: FormGroup;
    display: boolean = false;
    switchQuoteActivationDialog: boolean = false;
    switchQuizActivationDialog: boolean = false;
    languages: ILanguageModel[] = [];
    currentLanguage: ILanguageModel | undefined;
    lessonAwarenessEmailContentHtml: string;
    lessonAwarenessEmailSubject: string;
    trainingLessonLanguageId: string;
    editor: Editor;
    selectedQuizAnswerIndex: number = -1;
    imageEditDialog: boolean = false;
    selectedImage: File | null = null;
    imageUrl: string = '../../../../../assets/media/upload-photo.jpg';
    addImageHeaderDialogText: string = '';
    image: any;
    defaultLanguageId: any;
    Email = {
        emailSubject: '',
        emailContent: '',
    };

    fixedAnswers: any[] = [
        { answerText: '', isTrueAnswer: false, orderNo: 0 },
        { answerText: '', isTrueAnswer: false, orderNo: 1 },
        { answerText: '', isTrueAnswer: false, orderNo: 2 },
        { answerText: '', isTrueAnswer: false, orderNo: 3 },
    ];
    activeLanguages: ILanguageModel[] = [];
    contentType: string;

    //#region GALLERY

    responsiveOptions: any[] | undefined;
    images: any[] = [];
    walls: any[] = [];
    showThumbnails: boolean;
    fullscreen: boolean = false;
    activeIndex: number = 0;
    onFullScreenListener: any;
    displayGallery: boolean = false;
    displayWallPaperGallery = false;
    imageType: string;
    lessonEmailForm: FormGroup;

    @ViewChild('galleria') galleria: Galleria;

    //#endregion

    //#region Pdf
    selectedTabIndex: number = 0;
    editBookDialog: boolean = false;
    selectedBookPdf: File | null = null;
    bookPdfImageUrl: string = '../../../../../assets/media/upload-photo.jpg';
    bookPdfUrl: string = '../../../../../assets/media/upload-photo.jpg';

    editVideoDialog: boolean = false;
    selectedBookVideo: File | null = null;
    bookVideoUrl: string | null = null;
    public bookVideoUrlInput: string = '';
    bookVideoImageUrl: string = '../../../../../assets/media/upload-photo.jpg';

    //#endregion

    //#region Screen Savers

    screenSaverDialog: boolean = false;
    addScreenSaverDialog: boolean = false;
    editScreenSaverDialog: boolean = false;
    deleteScreenSaverDialog: boolean = false;
    screenSaverId: string = '';
    screenSaverTitle: string = '';
    screenSaverPlatform: string | null = null;
    screenSaverFile: any = null;
    platformOptions: string[] = Object.values(ScreenSaverPlatformType);

    //#endregion

    get trainingLessonScreenSavers(): FormArray {
        return this.newTrainingLessonForm.get('trainingLessonScreenSavers') as FormArray;
    }

    get imagesArray(): FormArray {
        return this.imageForm.get('imagesArray') as FormArray;
    }

    get trainingLessonWallpapers(): FormArray {
        return this.newTrainingLessonForm.get('trainingLessonWallpapers') as FormArray;
    }

    constructor(
        private sanitizer: DomSanitizer,
        private trainingServ: TrainingLessonService,
        private messageService: MessageService,
        private formBuilder: FormBuilder,
        private router: Router,
        private route: ActivatedRoute,
        private ref: ChangeDetectorRef,
        private tableLoadingService: TableLoadingService,
        private fileDownloadService: FileDownloadService,
        private dropdownListDataSourceService: DropdownListDataSourceService
    ) { }

    isContentEmpty(html: string): boolean {
        const strippedHtml = this.sanitizer
            .sanitize(SecurityContext.HTML, html)
            ?.replace(/<\/?[^>]+(>|$)/g, '')
            ?.trim();
        return !strippedHtml;
    }

    ngOnInit() {
        this.tableLoadingService.loading$.subscribe((isLoading) => {
            this.tableLoadingSpinner = isLoading;
        });

        this.getActiveLanguageForEditForm();
        this.subs.add(
            this.trainingServ.GetDefaultLanguage().subscribe((res) => {
                this.defaultLanguageId = res.id;
            })
        );
        this.subs.add(
            this.dropdownListDataSourceService.getActiveLanguages().subscribe((res) => {
                this.languages = res.data;
            })
        );
        this.editor = new Editor();

        this.imageForm = this.formBuilder.group({
            imagesArray: this.formBuilder.array([this.createImage()]),
        });
        this.initImageForm();
        this.bindDocumentListeners();

        this.responsiveOptions = [
            {
                breakpoint: '1024px',
                numVisible: 5,
            },
            {
                breakpoint: '768px',
                numVisible: 3,
            },
            {
                breakpoint: '560px',
                numVisible: 1,
            },
        ];

        this.display = true;

        this.route.params.subscribe((params) => {
            const id = params['id'];
            this.trainigLessonId = id;
            this.loadSecurityTraining(this.trainigLessonId);
        });
        this.initScreenSaverForm();
        this.initTrainingLesson();
        this.initEditTrianingLessonFormModels();
        this.initNewTrianingLessonFormModels();
        this.subs.add(
            this.trainingServ.getCountOfActiveLanguage().subscribe((r) => {
                this.countOfActiveLanguage = r;
            })
        );
    }

    getActiveLanguageForAddForm() {
        this.dropdownListDataSourceService.getActiveLanguages().subscribe({
            next: (res) => {
                this.activeLanguages = res.data;
                const p = this.trainingLessonsLanguages.map((c) => c.languageId);
                this.activeLanguages = this.activeLanguages.filter((c) => !p.includes(c.id));
                this.trainingServ.setActiveLanguagesAdd(this.activeLanguages);
            },
            error: (err) => { },
        });
    }

    isDefaultLanguage(training: any): boolean {
        return training.languageId === this.defaultLanguageId;
    }

    loadSecurityTraining(id: string) {
        this.tableLoadingService.show();

        this.subs.add(
            this.trainingServ.getLessonsLanguagesByTrainingLessonId(id).subscribe((trainingLanguages) => {
                this.trainingLessonsLanguages = trainingLanguages;
                // Patch the form with the languages
                this.newTrainingLessonForm.patchValue(trainingLanguages);
                // Loop through each language and load the wallpapers
                trainingLanguages.forEach((trainingLessonLang) => {
                    // Assuming trainingLessonLang contains languageId and trainingLessonId
                    const lessonLangId = trainingLessonLang.languageId;
                    const trainingLessonId = id; // Use the id passed to loadSecurityTraining

                    // Call the method to load the wallpapers for each language
                    this.loadTrainingLessonLangWallpapersOnInit(lessonLangId, trainingLessonId, trainingLessonLang);
                });
                this.tableLoadingService.hide();
            })
        );
    }

    onClose() {
        this.display = false;
    }

    openNew() {
        this.initTrainingLesson();
        this.initNewTrianingLessonFormModels();
        this.trainingServ.GetDefaultLanguage().subscribe((res) => {
            this.defaultLanguage = [res];
        });

        this.submitted = false;
        this.editTrainingLanguageDialog = true;
    }

    //#region Email

    hideEditEmailDialog() {
        this.loadSecurityTraining(this.trainigLessonId);
        this.ref.detectChanges();
        this.editEmailTrainingLanguageDialog = false;
        this.submitted = false;
    }

    saveEditEmail() {
        this.submitted = true;

        const emailDto = {
            lessonLanguageId: this.trainingLessonLanguageId,
            emailSubject: this.Email.emailSubject,
            emailContent: this.Email.emailContent,
        };
        this.subs.add(
            this.trainingServ
                .editLessonLanguageEmail(emailDto)
                .pipe(
                    finalize(() => {
                        this.loadSecurityTraining(this.trainigLessonId);
                        this.ref.detectChanges();
                        this.editEmailTrainingLanguageDialog = false;
                        this.submitted = false;
                    })
                )
                .subscribe(() => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Email updated successfully',
                        life: 3000,
                    });
                })
        );
    }

    initEmail() {
        this.Email = {
            emailSubject: '',
            emailContent: '',
        };
    }

    openEditEmail(lessonId: string) {
        this.editEmailTrainingLanguageDialog = true;
        this.trainingLessonLanguageId = lessonId;
        this.subs.add(
            this.trainingServ.getEmailByLessonLanguageId(lessonId).subscribe((data) => {
                this.Email = data;
            })
        );
        this.ref.detectChanges();
    }

    //#endregion

    //#region Quotes

    addNewQuote() {
        this.QuotesText = [];
        this.addQuoteTrainingLanguageDialog = true;
    }

    saveNewQuote() {
        this.submitted = true;
        if (!this.isQuoteTextEmpty(this.quoteText)) {
            this.QuotesText[0] = this.quoteText;

            const addTrainingLessonQuoteDto = {
                trainingLessonId: this.trainingLessonLanguageId,
                quoteText: this.QuotesText,
            };

            this.subs.add(
                this.trainingServ
                    .addLessonLanguageQuotes(addTrainingLessonQuoteDto)
                    .pipe(
                        finalize(() => {
                            this.loadTrainingLessonQuotes();
                            this.initQuote();
                            this.ref.detectChanges();
                            this.loadSecurityTraining(this.trainigLessonId);
                            this.addQuoteTrainingLanguageDialog = false;
                            this.quotesListTrainingLanguageDialog = true;
                            this.submitted = false;
                            this.QuotesText = [];
                            this.quoteText = '';
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
        this.addQuoteTrainingLanguageDialog = false;
        this.quotesListTrainingLanguageDialog = true;
        this.submitted = false;
        this.QuotesText = [];
        this.quoteText = '';
        this.initQuote();
        this.loadTrainingLessonQuotes();
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

        if (!this.isQuoteTextEmpty(this.trainingLessonQuote.quoteText)) {
            this.subs.add(
                this.trainingServ
                    .editLessonLanguageQuote(this.trainingLessonQuote)
                    .pipe(
                        finalize(() => {
                            this.loadTrainingLessonQuotes();
                            this.ref.detectChanges();
                            this.initQuote();
                            this.quoteText = '';
                            this.editQuoteTrainingLanguageDialog = false;
                            this.quotesListTrainingLanguageDialog = true;
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
        this.editQuoteTrainingLanguageDialog = false;
        this.quotesListTrainingLanguageDialog = true;
        this.submitted = false;
        this.initQuote();
        this.loadTrainingLessonQuotes();
        this.ref.detectChanges();
    }

    openQuoteList(lessonId: string) {
        this.quotesListTrainingLanguageDialog = true;
        this.trainingLessonLanguageId = lessonId;
        this.subs.add(
            this.trainingServ.getQuotesByLessonLanguageId(lessonId).subscribe((data) => {
                this.trainingLessonQuotes = data;
            })
        );
    }

    switchQuoteActivation(traininingLessonQuote: ITrainingLessonQuote) {
        this.switchQuoteActivationDialog = true;
        this.trainingLessonQuote = { ...traininingLessonQuote };
    }

    declineQuoteActivation() {
        this.switchQuoteActivationDialog = false;
        this.loadTrainingLessonQuotes();
        this.ref.detectChanges();
        this.initQuote();
    }

    loadTrainingLessonQuotes() {
        this.tableLoadingService.show();

        this.subs.add(
            this.trainingServ.getQuotesByLessonLanguageId(this.trainingLessonLanguageId).subscribe((data) => {
                this.trainingLessonQuotes = data;
                this.tableLoadingService.hide();
            })
        );
    }

    confirmtQuoteActivation() {
        this.toggleQuoteActivation(this.trainingLessonQuote);
    }

    toggleQuoteActivation(traininingLessonQuote: ITrainingLessonQuote) {
        if (traininingLessonQuote.isActive) {
            this.subs.add(
                this.trainingServ
                    .deActivateQuoteById(traininingLessonQuote.id)
                    .pipe(
                        finalize(() => {
                            this.loadTrainingLessonQuotes();
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
                this.trainingServ
                    .activateQuoteById(traininingLessonQuote.id)
                    .pipe(
                        finalize(() => {
                            this.loadTrainingLessonQuotes();
                            this.initQuote();
                            this.ref.detectChanges();
                            this.switchQuoteActivationDialog = false;
                        })
                    )
                    .subscribe(() => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Security Training Activated',
                            life: 3000,
                        });
                    })
            );
        }
    }

    deleteQuoteLesson(trainingLessonQuote: ITrainingLessonQuote) {
        this.deletionQuoteTrainingLessonDialog = true;
        this.trainingLessonQuote = { ...trainingLessonQuote };
    }

    confirmQuoteDeletion() {
        this.subs.add(
            this.trainingServ
                .deleteQuoteById(this.trainingLessonQuote.id)
                .pipe(
                    finalize(() => {
                        this.loadTrainingLessonQuotes();
                        this.initQuote();
                        this.ref.detectChanges();
                        this.loadSecurityTraining(this.trainigLessonId);
                        this.deletionQuoteTrainingLessonDialog = false;
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
        this.deletionQuoteTrainingLessonDialog = false;
        this.initQuote();
        this.loadTrainingLessonQuotes();
    }

    editQuoteLesson(trainingLessonQuote: ITrainingLessonQuote) {
        this.editQuoteTrainingLanguageDialog = true;
        this.trainingLessonQuote = { ...trainingLessonQuote };
    }

    initQuote() {
        this.trainingLessonQuote = {
            id: '',
            quoteText: '',
            isActive: true,
        };
    }

    //#endregion

    //#region Quizzes

    addNewQuizz() {
        this.initQuiz();
        this.selectedQuizAnswerIndex = -1;
        this.addQuizTrainingLanguageDialog = true;
    }

    saveNewQuiz() {
        this.submitted = true;

        if (!this.trainingLessonQuiz.quizText.trim()) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Question text is required',
                life: 3000,
            });
            return;
        }

        const validAnswers = this.trainingLessonQuiz.trainingLessonQuizAnswers.filter((answer) =>
            answer.answerText.trim()
        );

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
            this.selectedQuizAnswerIndex === -1 ||
            this.selectedQuizAnswerIndex >= this.trainingLessonQuiz.trainingLessonQuizAnswers.length ||
            !this.trainingLessonQuiz.trainingLessonQuizAnswers[this.selectedQuizAnswerIndex].answerText.trim()
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
            answer.isTrueAnswer = index === this.selectedQuizAnswerIndex;
            answer.orderNo = index;
        });

        const addTrainingLessonQuizDto = {
            trainingLessonLanguageId: this.trainingLessonLanguageId,
            quizText: this.trainingLessonQuiz.quizText,
            lessonQuizAnswers: validAnswers,
        };

        this.subs.add(
            this.trainingServ
                .addLessonLanguageQuizWithAnswers(addTrainingLessonQuizDto)
                .pipe(
                    finalize(() => {
                        this.loadTrainingLessonQuizzes();
                        this.initQuiz();
                        this.selectedQuizAnswerIndex = -1;
                        this.ref.detectChanges();
                        this.loadSecurityTraining(this.trainigLessonId);
                        this.addQuizTrainingLanguageDialog = false;
                        this.quizzesListTrainingLanguageDialog = true;
                        this.submitted = false;
                    })
                )
                .subscribe(() => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Quiz added successfully',
                        life: 3000,
                    });
                })
        );
    }

    saveEditQuiz() {
        this.submitted = true;

        if (!this.trainingLessonQuiz.quizText.trim()) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Question text is required',
                life: 3000,
            });
            return;
        }

        const validAnswers = this.trainingLessonQuiz.trainingLessonQuizAnswers.filter((answer) =>
            answer.answerText.trim()
        );

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
            this.selectedQuizAnswerIndex === -1 ||
            this.selectedQuizAnswerIndex >= this.fixedAnswers.length ||
            !this.fixedAnswers[this.selectedQuizAnswerIndex].answerText.trim()
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
            answer.isTrueAnswer = index === this.selectedQuizAnswerIndex;
            answer.orderNo = index; // Set the order property
        });

        const editTrainingLessonQuizDto = {
            id: this.trainingLessonQuiz.id,
            quizText: this.trainingLessonQuiz.quizText,
            lessonQuizAnswers: validAnswers,
        };

        this.trainingLessonQuiz.trainingLessonQuizAnswers = validAnswers;

        this.subs.add(
            this.trainingServ
                .editLessonLanguageQuizWithAnswers(editTrainingLessonQuizDto)
                .pipe(
                    finalize(() => {
                        this.loadTrainingLessonQuizzes();
                        this.initQuiz();
                        this.selectedQuizAnswerIndex = -1;
                        this.ref.detectChanges();
                        this.editQuizTrainingLanguageDialog = false;
                        this.quizzesListTrainingLanguageDialog = true;
                        this.submitted = false;
                    })
                )
                .subscribe(() => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Quiz updated successfully',
                        life: 3000,
                    });
                })
        );
    }

    hideNewQuizDialog() {
        this.addQuizTrainingLanguageDialog = false;
        this.quizzesListTrainingLanguageDialog = true;
        this.submitted = false;
        this.initQuiz();
        this.selectedQuizAnswerIndex = -1;
        this.loadTrainingLessonQuizzes();
        this.ref.detectChanges();
    }

    hideEditQuizDialog() {
        this.editQuizTrainingLanguageDialog = false;
        this.quizzesListTrainingLanguageDialog = true;
        this.submitted = false;
        this.initQuote();
        this.loadTrainingLessonQuotes();
        this.ref.detectChanges();
    }

    openQuizList(lessonId: string) {
        this.tableLoadingService.show();

        this.quizzesListTrainingLanguageDialog = true;
        this.trainingLessonLanguageId = lessonId;
        this.subs.add(
            this.trainingServ.getQuizzesWithAnswersByLessonLanguageId(lessonId).subscribe((data) => {
                this.trainingLessonQuizzes = data.map((quiz) => {
                    quiz.trainingLessonQuizAnswers.sort((a, b) => a.orderNo - b.orderNo);
                    return quiz;
                });
                this.tableLoadingService.hide();
            })
        );
    }

    switchQuizzActivation(trainingLessonQuiz: ITrainingLessonQuiz) {
        this.switchQuizActivationDialog = true;
        this.trainingLessonQuiz = { ...trainingLessonQuiz };
    }

    declineQuizActivation() {
        this.switchQuizActivationDialog = false;
        this.loadTrainingLessonQuizzes();
        this.ref.detectChanges();
        this.initQuiz();
    }

    loadTrainingLessonQuizzes() {
        this.trainingServ
            .getQuizzesWithAnswersByLessonLanguageId(this.trainingLessonLanguageId)
            .subscribe((quizzes) => {
                this.trainingLessonQuizzes = quizzes.map((quiz) => {
                    quiz.trainingLessonQuizAnswers.sort((a, b) => a.orderNo - b.orderNo);
                    return quiz;
                });
            });
    }

    confirmtQuizActivation() {
        this.toggleQuizActivation(this.trainingLessonQuiz);
    }

    toggleQuizActivation(trainingLessonQuiz: ITrainingLessonQuiz) {
        if (trainingLessonQuiz.isActive) {
            this.subs.add(
                this.trainingServ
                    .deActivateQuizById(trainingLessonQuiz.id)
                    .pipe(
                        finalize(() => {
                            this.loadTrainingLessonQuizzes();
                            this.initQuiz();
                            this.ref.detectChanges();
                            this.switchQuizActivationDialog = false;
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
                this.trainingServ
                    .activateQuizById(trainingLessonQuiz.id)
                    .pipe(
                        finalize(() => {
                            this.loadTrainingLessonQuizzes();
                            this.initQuiz();
                            this.ref.detectChanges();
                            this.switchQuizActivationDialog = false;
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

    deleteQuizLesson(trainingLessonQuiz: ITrainingLessonQuiz) {
        this.deletionQuizTrainingLessonDialog = true;
        this.trainingLessonQuiz = { ...trainingLessonQuiz };
    }

    confirmQuizDeletion() {
        this.subs.add(
            this.trainingServ
                .deleteQuizWithAnswersByQuizId(this.trainingLessonQuiz.id)
                .pipe(
                    finalize(() => {
                        this.loadTrainingLessonQuizzes();
                        this.initQuiz();
                        this.ref.detectChanges();
                        this.loadSecurityTraining(this.trainigLessonId);
                        this.deletionQuizTrainingLessonDialog = false;
                    })
                )
                .subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Info',
                            detail: 'Quiz Deleted Successfully',
                            life: 3000,
                        });
                    },
                })
        );
    }

    declineQuizDeletion() {
        this.deletionQuizTrainingLessonDialog = false;
        this.initQuiz();
        this.loadTrainingLessonQuizzes();
    }

    editQuizzLesson(trainingLessonQuiz: ITrainingLessonQuiz) {
        this.trainingLessonQuiz = { ...trainingLessonQuiz };
        this.ensureFixedAnswers();

        this.selectedQuizAnswerIndex = this.trainingLessonQuiz.trainingLessonQuizAnswers.findIndex(
            (answer) => answer.isTrueAnswer
        );
        this.editQuizTrainingLanguageDialog = true;
    }

    ensureFixedAnswers() {
        if (!this.trainingLessonQuiz.trainingLessonQuizAnswers) {
            this.trainingLessonQuiz.trainingLessonQuizAnswers = [];
        }

        for (let i = 0; i < 4; i++) {
            if (!this.trainingLessonQuiz.trainingLessonQuizAnswers[i]) {
                this.trainingLessonQuiz.trainingLessonQuizAnswers[i] = {
                    id: '',
                    answerText: '',
                    isTrueAnswer: false,
                    orderNo: i,
                };
            }
        }

        this.fixedAnswers = this.trainingLessonQuiz.trainingLessonQuizAnswers.slice(0, 4);
    }

    initQuiz() {
        this.trainingLessonQuiz = {
            id: '',
            quizText: '',
            isActive: true,
            trainingLessonQuizAnswers: [
                { id: '', answerText: '', isTrueAnswer: false, orderNo: 0 },
                { id: '', answerText: '', isTrueAnswer: false, orderNo: 1 },
                { id: '', answerText: '', isTrueAnswer: false, orderNo: 2 },
                { id: '', answerText: '', isTrueAnswer: false, orderNo: 3 },
            ],
        };
    }

    //#endregion

    getActiveLanguageForEditForm() {
        this.dropdownListDataSourceService.getActiveLanguages().subscribe({
            next: (res) => {
                this.activeLanguages = res.data;

                const currentLanguage = this.activeLanguages.find((lang) => lang.id === this.trainingLesson.languageId);
                if (currentLanguage) {
                    const p = this.trainingLessonsLanguages.map((c) => c.languageId);
                    this.activeLanguages = this.activeLanguages.filter((c) => !p.includes(c.id));
                    this.activeLanguages = [...this.activeLanguages, currentLanguage];
                }

                if (this.isEnglishSelected()) {
                    this.editTrainingLessonForm.get('languageId')?.disable();
                } else {
                    this.editTrainingLessonForm.get('languageId')?.enable();
                }
            },
            error: (err) => { },
        });
    }

    isEnglishSelected(): boolean {
        const selectedLanguageId = this.editTrainingLessonForm.get('languageId')?.value;
        const selectedLanguage = this.activeLanguages.find((lang) => lang.id === selectedLanguageId);
        return selectedLanguage?.name.toLowerCase() === 'english';
    }

    editTrainingLesson(trainingLesson: ITrainingLessonsLanguage) {
        this.trainingLesson = { ...trainingLesson };
        this.initEditTrianingLessonFormModels();
        this.getActiveLanguageForEditForm();
        this.editTrainingLessonForm.patchValue(this.trainingLesson);
        this.editTrainingLanguageDialog = true;
    }

    deleteTrainingLesson(securityTraining: ITrainingLessonsLanguage) {
        this.deletionTrainingLanguageDialog = true;
        this.trainingLesson = { ...securityTraining };
    }

    confirmDelete() {
        this.deletionTrainingLanguageDialog = false;
        this.subs.add(
            this.trainingServ.deleteTrainingLessonLangaugeById(this.trainingLesson.id).subscribe({
                next: (response) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: response.message,
                        life: 3000,
                    });
                    this.loadSecurityTraining(this.trainigLessonId);
                    this.deletionTrainingLanguageDialog = false;
                },
                error: (err) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to delete security training',
                        life: 3000,
                    });
                },
            })
        );
        this.trainingLesson = {} as ITrainingLessonsLanguage;
    }

    toggleActive(training: ITrainingLessonsLanguage) {
        const action = training.isActive ? 'deactivate' : 'activate';
        const serviceMethod = training.isActive
            ? this.trainingServ.dectivateTrainingLessonLanguageById
            : this.trainingServ.activateTrainingLessonLanguageById;

        this.subs.add(
            serviceMethod.call(this.trainingServ, training.id?.toString()).subscribe((result) => {
                if (result.isSuccess) {
                    // this.loadSecurityTrainings();
                }
            })
        );
    }

    hideEditTrainingLessonDialog() {
        this.initEditTrianingLessonFormModels();
        this.editTrainingLanguageDialog = false;
        this.submitted = false;
    }

    saveEditTrainingLesson() {
        this.submitted = true;

        if (this.editTrainingLessonForm.valid) {
            const formData = new FormData();
            formData.append('Id', this.trainingLesson.id);
            formData.append('Name', this.editTrainingLessonForm.value.name);
            formData.append('Description', this.editTrainingLessonForm.value.description);
            formData.append('LanguageId', this.editTrainingLessonForm.value.languageId ?? this.trainingLesson.languageId);

            this.subs.add(
                this.trainingServ.editTrainingLessonLangauge(formData).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Lesson Language updated',
                            life: 3000,
                        });
                        this.ref.detectChanges();
                        this.loadSecurityTraining(this.trainigLessonId);
                        this.initEditTrianingLessonFormModels();
                        this.editTrainingLanguageDialog = false;
                    },
                })
            );
        } else {
        }
    }

    initNewTrianingLessonFormModels() {
        this.newTrainingLessonForm = this.formBuilder.group({
            id: [''],
            name: ['', Validators.required],
            languageId: ['', Validators.required],
            language: ['', Validators.required],
            description: [''],
            lessonBookUrl: [''],
            lessonVideoUrl: [''],
            lessonAwarenessEmailSubject: ['', Validators.required],
            lessonAwarenessEmailContentHtml: ['', Validators.required],
            TrainingLessonscreenSavers: this.formBuilder.array([this.createLessonScreenSaver()]),
            securityTrainingLessonWallpapers: this.formBuilder.array([this.createlessonWallpaper()]),
            trainingLessonQuotes: this.formBuilder.array([this.createQuoteFormGroup()]),
        });
    }

    initEditTrianingLessonFormModels() {
        const isDefaultLanguage = this.isDefaultLanguage(this.trainingLesson);

        this.editTrainingLessonForm = this.formBuilder.group({
            id: [''],
            name: [''],
            languageId: [
                { value: this.trainingLesson.languageId || '', disabled: isDefaultLanguage },
                Validators.required,
            ],
            description: [''],
        });
    }

    createQuoteFormGroup(): FormGroup {
        return this.formBuilder.group({
            quoteText: ['', Validators.required],
        });
    }

    createLessonScreenSaver(): FormGroup {
        return this.formBuilder.group({
            screenSaverTitle: ['', Validators.required],
            screenSaverUrl: [''],
        });
    }

    createlessonWallpaper(): FormGroup {
        return this.formBuilder.group({
            wallpaperTitle: ['', Validators.required],
            wallpaperUrl: [''],
        });
    }

    createImage(): FormGroup {
        return this.formBuilder.group({
            imageTitle: ['', Validators.required],
            imageUrl: ['', Validators.required],
        });
    }

    initTrainingLesson() {
        this.trainingLesson = {
            id: '',
            name: '',
            description: '',
            languageId: '',
            lessonAwarenessEmailContentHtml: '',
            lessonAwarenessEmailSubject: '',
            lessonBookUrl: '',
            lessonBookImageUrl: '',
            lessonVideoImageUrl: '',
            lessonVideoUrl: '',
            trainingLessonScreenSavers: [],
            trainingLessonWallpapers: [],
            trainingLessonQuizzes: [],
            trainingLessonQuotes: [],
            languageName: '',
            isActive: true,
        };
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    navigateToCreateTrainingLessonLanguage() {
        this.router.navigate(['Security-Training/Training-LessonLanguage-Create', this.trainigLessonId]);
        this.getActiveLanguageForAddForm();
    }

    //#region Pdf

    openPdfViewer(trainingLessonLang: ITrainingLessonsLanguage): void {
        this.trainingLesson = { ...trainingLessonLang };
        this.bookPdfUrl = trainingLessonLang.lessonBookUrl;
        this.bookPdfImageUrl = trainingLessonLang.lessonBookImageUrl;
        this.editBookDialog = true;
    }

    openVideoViewer(trainingLessonLang: ITrainingLessonsLanguage): void {
        this.trainingLesson = { ...trainingLessonLang };
        this.bookVideoUrl = this.trainingLesson.lessonVideoUrl;
        this.bookVideoUrlInput = this.trainingLesson.lessonVideoUrl;
        this.bookVideoImageUrl = this.trainingLesson.lessonVideoImageUrl;
        this.editVideoDialog = true;
    }

    closeEditVideoDialog() {
        this.bookVideoUrl = '';
    }
    
    closeEditBookDilog(){
        this.bookPdfUrl = '';
    }

    onlessonImageVideoChange(event: Event, trainingLessonLang: ITrainingLessonsLanguage): void {
        event.preventDefault();
        const input = event.target as HTMLInputElement;

        if (input.files && input.files.length) {
            this.selectedBookVideo = input.files[0];
        }

        const reader = new FileReader();
        reader.onload = (e: any) => {
            this.bookVideoImageUrl = e.target.result;
        };
        reader.readAsDataURL(this.selectedBookVideo!);
        this.editLessonImageVideo(trainingLessonLang.id);
    }

    editLessonImageVideo(id: string) {
        const formData = new FormData();
        if (this.selectedBookVideo) {
            formData.append('LessonVideoImage', this.selectedBookVideo);
        }

        this.subs.add(
            this.trainingServ.editLessonLanguageImageVideoById(id, formData).subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Video Image lesson language updated successfully',
                        life: 3000,
                    });

                    this.loadSecurityTraining(this.trainigLessonId);
                    this.ref.detectChanges();
                },
            })
        );
    }

    editLessonVideoUrl(id: string) {
        if (this.bookVideoUrlInput) {
            this.subs.add(
                this.trainingServ.editLessonLanguageVideoUrlById(id, this.bookVideoUrlInput).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Video lesson language updated successfully',
                            life: 3000,
                        });

                        this.bookVideoUrl = this.bookVideoUrlInput;
                        this.loadSecurityTraining(this.trainigLessonId);
                        this.ref.detectChanges();
                    },
                })
            );
        }
    }

    onlessonImageBookChange(event: Event, trainingLessonLang: ITrainingLessonsLanguage): void {
        const input = event.target as HTMLInputElement;

        if (input.files && input.files.length) {
            this.selectedBookPdf = input.files[0];

            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.bookPdfImageUrl = e.target.result;
            };

            reader.readAsDataURL(this.selectedBookPdf);
            this.editLessonImageBook(trainingLessonLang.id);
        }
    }

    editLessonImageBook(id: string) {
        const formData = new FormData();
        if (this.selectedBookPdf) {
            formData.append('LessonBookImage', this.selectedBookPdf);
        }

        this.subs.add(
            this.trainingServ.editLessonLanguageImageBookById(id, formData).subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Book Image lesson language updated successfully',
                        life: 3000,
                    });
                    this.loadSecurityTraining(this.trainigLessonId);
                    this.ref.detectChanges();
                },
            })
        );
    }

    onlessonBookChange(event: Event, trainingLessonLang: ITrainingLessonsLanguage): void {
        const input = event.target as HTMLInputElement;

        if (input.files && input.files.length) {
            this.selectedBookPdf = input.files[0];

            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.bookPdfUrl = e.target.result;
            };

            reader.readAsDataURL(this.selectedBookPdf);
            this.editLessonBook(trainingLessonLang.id);
        }
    }

    editLessonBook(id: string) {
        const formData = new FormData();
        if (this.selectedBookPdf) {
            formData.append('LessonBookFile', this.selectedBookPdf);
        }

        this.subs.add(
            this.trainingServ.editLessonLanguageBookById(id, formData).subscribe({
                next: (a) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Book lesson language updated successfully',
                        life: 3000,
                    });

                    this.loadSecurityTraining(this.trainigLessonId);
                    this.ref.detectChanges();
                },
            })
        );
    }

    closeVideoViewer(): void {
        this.bookVideoUrl = null;
    }

    //#endregion

    //#region Gallery

    loadTrainingLessonLangWallpapersOnInit(
        languageId: string,
        trainingLessonId: string,
        training: ITrainingLessonsLanguage
    ) {
        this.subs.add(
            this.trainingServ
                .getLessonLanguageWallpapersByLangIdAndLessonIdAsync(languageId, trainingLessonId)
                .subscribe(
                    (data) => {
                        this.wallpapers = data.data ?? [];
                        training.numberOfWallpapers = this.wallpapers.length;
                    },
                    (error) => {
                        console.error('Error fetching wallpapers:', error);
                        this.wallpapers = [];
                        training.numberOfWallpapers = 0;
                    }
                )
        );
    }

    loadTrainingLessonLangWallpapers(languageId: string, trainingLessonId: string, training: ITrainingLessonsLanguage) {
        this.subs.add(
            this.trainingServ
                .getLessonLanguageWallpapersByLangIdAndLessonIdAsync(languageId, trainingLessonId)
                .pipe(
                    finalize(() => {
                        this.walls = this.wallpapers.map((wall) => ({
                            id: wall.id,
                            orderNo: wall.orderNo,
                            imageTitle: wall.wallpaperTitle,
                            thumbnailImageSrc: wall.wallpaperUrl,
                            itemImageSrc: wall.wallpaperUrl,
                            contentType: 'wallpapers',
                        }));
                    })
                )
                .subscribe((data) => {
                    this.wallpapers = data.data;
                    training.numberOfWallpapers = this.wallpapers?.length; // Set the number of wallpapers for this training language
                })
        );

        // Optionally, you can use this second service call if you want to fetch a count separately
        this.subs.add(
            this.trainingServ.getLibraryWallpaperCountByTrainingLessonId(trainingLessonId).subscribe((data) => {
                training.numberOfWallpapers = data.data; // Set the count of wallpapers
            })
        );
    }

    HideWallPaperGallery() {
        const lessonLangId = this.trainingLesson.languageId;
        const trainingLessonId = this.trainigLessonId;
        this.loadTrainingLessonLangWallpapers(lessonLangId, trainingLessonId, this.trainingLesson);
        this.displayWallPaperGallery = false;
        this.images = [];
    }

    onThumbnailButtonClick() {
        this.showThumbnails = !this.showThumbnails;
    }

    toggleFullScreen() {
        if (this.fullscreen) {
            this.closePreviewFullScreen();
        } else {
            this.openPreviewFullScreen();
        }
    }

    openPreviewFullScreen() {
        let elem = this.galleria.element.nativeElement.querySelector('.p-galleria');
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem['mozRequestFullScreen']) {
            /* Firefox */
            elem['mozRequestFullScreen']();
        } else if (elem['webkitRequestFullscreen']) {
            /* Chrome, Safari & Opera */
            elem['webkitRequestFullscreen']();
        } else if (elem['msRequestFullscreen']) {
            /* IE/Edge */
            elem['msRequestFullscreen']();
        }
    }

    onFullScreenChange() {
        this.fullscreen = !this.fullscreen;
    }

    closePreviewFullScreen() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
        // else if (document['mozCancelFullScreen']) {
        //     document['mozCancelFullScreen']();
        // }
        // else if (document['webkitExitFullscreen']) {
        //     document['webkitExitFullscreen']();
        // }
        // else if (document['msExitFullscreen']) {
        //     document['msExitFullscreen']();
        // }
    }

    bindDocumentListeners() {
        this.onFullScreenListener = this.onFullScreenChange.bind(this);
        document.addEventListener('fullscreenchange', this.onFullScreenListener);
        document.addEventListener('mozfullscreenchange', this.onFullScreenListener);
        document.addEventListener('webkitfullscreenchange', this.onFullScreenListener);
        document.addEventListener('msfullscreenchange', this.onFullScreenListener);
    }

    unbindDocumentListeners() {
        document.removeEventListener('fullscreenchange', this.onFullScreenListener);
        document.removeEventListener('mozfullscreenchange', this.onFullScreenListener);
        document.removeEventListener('webkitfullscreenchange', this.onFullScreenListener);
        document.removeEventListener('msfullscreenchange', this.onFullScreenListener);
        this.onFullScreenListener = null;
    }

    galleriaClass() {
        return `custom-galleria ${this.fullscreen ? 'fullscreen' : ''}`;
    }

    wallpaperGalleriaClass() {
        return `custom-galleria ${this.fullscreen ? 'fullscreen' : ''}`;
    }

    fullScreenIcon() {
        return `pi ${this.fullscreen ? 'pi-window-minimize' : 'pi-window-maximize'}`;
    }

    //endregion

    BacktoWallapapersGallery() {
        this.libraryWallpaperDialog = false;
    }

    openWallpaperGallery(traininglessonlang: ITrainingLessonsLanguage) {
        this.walls = [];
        this.initImageForm();

        this.trainingLesson = traininglessonlang;
        const lessonLangId = traininglessonlang.languageId;

        const trainingLessonId = this.trainigLessonId;
        this.loadTrainingLessonLangWallpapers(lessonLangId, trainingLessonId, this.trainingLesson);
        this.galleryHeader = 'Wallpapers Gallery';
        this.displayWallPaperGallery = true;
    }

    //#region New Approach of Screen Saver Functionalities

    openScreenSaverDialog(traininglessonlang: ITrainingLessonsLanguage) {
        this.tableLoadingService.show();
        this.trainingLesson = traininglessonlang;
        this.trainingLessonLanguageId = this.trainingLesson.id;
        this.screenSaverDialog = true;
        this.fetchScreenSavers();
    }

    fetchScreenSavers() {
        this.trainingServ.getScreenSaversByLessonLanguageId(this.trainingLesson.id)
            .subscribe({
                next: (screenSavers: ITrainingLessonScreenSaver[]) => {
                    this.screenSavers = screenSavers;
                    console.log(this.screenSavers);
                },
                error: (error) => {
                    console.error('Error retrieving screen savers:', error);
                    this.tableLoadingService.hide();
                },
                complete: () => {
                    this.tableLoadingService.hide();
                },
            })
    }

    closeScreenSaverDialog() {
        this.screenSaverDialog = false;
        this.reInitilizeScreenSaverDialog();
        this.loadSecurityTraining(this.trainigLessonId);
    }

    reInitilizeScreenSaverDialog() {
        this.screenSaverId = '';
        this.screenSaverTitle = '';
        this.screenSaverPlatform = null;
        this.screenSaverFile = null;
    }

    openAddScreenSaver() {
        this.addScreenSaverDialog = true;
        this.reInitilizeScreenSaverDialog();
    }

    addScreenSaver() {
        if (this.screenSaverTitle && this.screenSaverPlatform && this.screenSaverFile) {
            const formData = new FormData();
            formData.append(`ScreenSaverTitle`, this.screenSaverTitle);
            formData.append(`screenSaverPlatform`, this.screenSaverPlatform);
            formData.append(`ScreenSaverFile`, this.screenSaverFile, this.screenSaverFile.name);
            formData.append('LessonLanguageId', this.trainingLessonLanguageId);
            this.trainingServ.addSingleScreenSaver(formData).subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Screen Saver added successfully',
                    })
                    this.addScreenSaverDialog = false;
                    this.fetchScreenSavers();
                    this.reInitilizeScreenSaverDialog();
                },
                error: (error) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'An error occurred while adding screen saver',
                    })
                },
            })
        }
    }

    openEditScreenSaver(screenSaver: ITrainingLessonScreenSaver) {
        this.editScreenSaverDialog = true;
        this.screenSaverPlatform = screenSaver.screenSaverPlatform;
        this.screenSaverTitle = screenSaver.screenSaverTitle;
        this.screenSaverId = screenSaver.id
    }

    editScreenSaver() {
        if (this.screenSaverId &&this.screenSaverTitle && this.screenSaverPlatform) {
            const formData = new FormData();
            formData.append(`Id`, this.screenSaverId);
            formData.append(`ScreenSaverTitle`, this.screenSaverTitle);
            formData.append(`screenSaverPlatform`, this.screenSaverPlatform);
            if(this.screenSaverFile) {
                formData.append(`ScreenSaverFile`, this.screenSaverFile, this.screenSaverFile.name);
            }
            this.trainingServ.editScreenSaver(formData).subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Screen Saver added successfully',
                    })
                    this.editScreenSaverDialog = false;
                    this.fetchScreenSavers();
                    this.reInitilizeScreenSaverDialog();
                },
                error: (error) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'An error occurred while editing screen saver',
                    })
                },
            })
        }
    }

    openDeleteScreenSaver(screenSaver: ITrainingLessonScreenSaver) {
        this.screenSaverId = screenSaver.id
        this.screenSaverTitle = screenSaver.screenSaverTitle;
        this.deleteScreenSaverDialog = true;
    }

    deleteScreenSaver() {
        if (this.screenSaverId){
            this.trainingServ.deleteScreenSaverById(this.screenSaverId).subscribe({
                next: () => {
                    this.messageService.add({
                        severity:'success',
                        summary: 'Success',
                        detail: 'Screen Saver deleted successfully',
                    })
                    this.deleteScreenSaverDialog = false;
                    this.fetchScreenSavers();
                    this.reInitilizeScreenSaverDialog();
                },
                error: (error) => {
                    console.error('Error deleting screen saver:', error);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'An error occurred while deleting screen saver',
                    })
                },                
            })
        }
    }

    downloadScreenSaverFile(screenSaverFile: string) {
        if (screenSaverFile) {
            this.fileDownloadService.downloadFile(screenSaverFile).subscribe();
        } else {
            this.messageService.add({
                severity: 'warn',
                summary: 'Warning File Not Found',
                detail: 'Screen Saver file not found',
            })
        }
    }

    cancelAddScreenSaver() {
        this.addScreenSaverDialog = false;
        this.reInitilizeScreenSaverDialog();
    }

    cancelScreenSaverEdite() {
        this.editScreenSaverDialog = false;
        this.reInitilizeScreenSaverDialog();
    }

    cancelScreenSaverDeletion() {
        this.deleteScreenSaverDialog = false;
        this.reInitilizeScreenSaverDialog();
    }

    isScreenSaverUploaded(): boolean {
        return this.screenSaverFile != null ? true : false;
    }

    onScreenSaverChange(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length) {
            this.screenSaverFile = input.files[0];
        }
    }

    //#endregion

    openGallery(traininglessonlang: ITrainingLessonsLanguage, type: string): void {
        this.tableLoadingService.show();
        this.contentType = type;
        this.trainingLesson = traininglessonlang;
        this.initImageForm();
        this.images = [];
        this.trainingServ
            .getScreenSaversByLessonLanguageId(this.trainingLesson.id)
            .subscribe((screenSavers: ITrainingLessonScreenSaver[]) => {
                (this.trainingLessonLanguageId = this.trainingLesson.id),
                    (this.images = screenSavers?.map((saver) => ({
                        id: saver.id,
                        orderNo: saver.orderNo,
                        itemImageSrc: saver.screenSaverUrl,
                        thumbnailImageSrc: saver.screenSaverUrl,
                        imageTitle: saver.screenSaverTitle,
                        contentType: 'screensavers',
                    }))),
                    (this.screenSavers = screenSavers);

                this.galleryHeader = 'Screen Savers Gallery';
                this.displayGallery = true;
                this.tableLoadingService.hide();
            });
        this.trainingLessonLanguageId = this.trainingLesson.id;
        this.imageType = type;
        this.displayGallery = true;
    }

    initScreenSaverForm() {
        this.newTrainingLessonForm = this.formBuilder.group({
            lessonId: [''],
            trainingLessonScreenSavers: this.formBuilder.array([this.createLessonScreenSaver()]),
        });
    }

    initImageForm() {
        this.imageForm = this.formBuilder.group({
            lessonId: [''],
            imagesArray: this.formBuilder.array([this.createImage()]),
        });
    }

    saveImages(): void {
        this.submitted = true;
        this.imageForm.markAllAsTouched();

        if (this.imageForm.valid) {
            const images = this.imageForm.get('imagesArray')?.value;

            const formData = new FormData();

            if (this.imageType === 'screensavers') {
                images.forEach((image: any, index: number) => {
                    formData.append(`request[${index}].ScreenSaverTitle`, image.imageTitle);
                    if (image.imageUrl) {
                        formData.append(`request[${index}].ScreenSaverFile`, image.imageUrl);
                    }
                });
            } else {
                images.forEach((image: any, index: number) => {
                    formData.append(`request[${index}].WallpaperTitle`, image.imageTitle);
                    if (image.imageUrl) {
                        formData.append(`request[${index}].WallpaperFile`, image.imageUrl);
                    }
                });
            }

            this.trainingServ
                .addLessonLanguageImages(this.trainingLessonLanguageId, formData, this.imageType)
                .pipe(
                    finalize(() => {
                        if (this.imageType === 'screensavers') {
                            this.trainingServ
                                .getScreenSaversByLessonLanguageId(this.trainingLessonLanguageId)
                                .subscribe((screenSavers: ITrainingLessonScreenSaver[]) => {
                                    this.images = screenSavers.map((saver) => ({
                                        id: saver.id,
                                        itemImageSrc: saver.screenSaverUrl,
                                        thumbnailImageSrc: saver.screenSaverUrl,
                                        imageTitle: saver.screenSaverTitle,
                                        contentType: 'screensavers',
                                    }));
                                    this.galleryHeader = 'Screen Savers Gallery';
                                });
                        } else if (this.imageType === 'wallpapers') {
                            this.trainingServ
                                .getWallpapersByLessonLanguageId(this.trainingLessonLanguageId)
                                .subscribe((wallpapers: ITrainingLessonWallpaper[]) => {
                                    this.images = wallpapers.map((wall) => ({
                                        id: wall.id,
                                        itemImageSrc: wall.wallpaperUrl,
                                        thumbnailImageSrc: wall.wallpaperUrl,
                                        imageTitle: wall.wallpaperTitle,
                                        contentType: 'wallpapers',
                                    }));
                                    this.galleryHeader = 'Wallpapers Gallery';
                                });
                        }
                        this.ref.detectChanges();
                        this.loadSecurityTraining(this.trainigLessonId);
                        this.initImageForm();

                        this.displayGallery = true;
                        this.submitted = false;
                    })
                )
                .subscribe({
                    next: (response) => {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: 'Images saved successfully',
                        });
                        this.displayGallery = true;
                    },
                    error: (error) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Failed to save images',
                        });
                    },
                });
        }
    }

    declineImageDeletion(): void {
        this.image = null;
        this.deletionImageTrainingLessonDialog = false;
    }

    onlessonScreenSaverChange(event: Event, index: number) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length) {
            const file = input.files[0];
            const screenSaverArray = this.imageForm.get('trainingLessonScreenSavers') as FormArray;
            screenSaverArray.at(index).patchValue({ screenSaverUrl: file });
        }
    }

    onlessonWallpaperChange(event: Event, index: number) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length) {
            const file = input.files[0];
            const wallpaperArray = this.newTrainingLessonForm.get('trainingLessonWallpapers') as FormArray;
            wallpaperArray.at(index).patchValue({ wallpaperUrl: file });
        }
    }

    removeLessonScreenSaver(index: number): void {
        if (index !== 0) {
            this.trainingLessonScreenSavers.removeAt(index);
        }
    }

    removelessonWallpaper(index: number): void {
        if (index !== 0) {
            this.trainingLessonWallpapers.removeAt(index);
        }
    }

    addlessonWallpaper(): void {
        this.trainingLessonWallpapers.push(this.createlessonWallpaper());
    }

    addLessonScreenSaver(): void {
        this.trainingLessonScreenSavers.push(this.createLessonScreenSaver());
    }

    addImage(): void {
        this.imagesArray.push(this.createImage());
    }

    removeImage(index: number): void {
        this.imagesArray.removeAt(index);
    }

    onImageChange(event: Event, index: number): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length) {
            const file = input.files[0];
            const imageArray = this.imageForm.get('imagesArray') as FormArray;
            imageArray.at(index).patchValue({ imageUrl: file });
            this.ref.detectChanges();
        }
    }

    // deleteImage(index: number, contentType: string, imageId: string) {
    //     this.images.splice(index, 1);

    //     if (contentType === 'wallpapers') {
    //         this.trainingServ.deleteWallpaperById(imageId).subscribe(() => {
    //
    //         });
    //     } else if (contentType === 'screensavers') {
    //         this.trainingServ.deleteScreenSaverById(imageId).subscribe(() => {
    //
    //         });
    //     }
    // }

    // deleteImage(index: number, contentType: string, id: number): void {
    //     this.imageToDelete = { index, contentType, id };
    //     this.deletionImageTrainingLessonDialog = true;
    // }

    // confirmImageDeletion() {
    //     this.images.splice(this.imageToDelete.index, 1);

    //     if (this.imageToDelete.contentType === 'wallpapers') {
    //         this.trainingServ.deleteWallpaperById(this.imageToDelete.id).subscribe(() => {
    //
    //             this.imageToDelete = null;
    //             this.ref.detectChanges();

    //             this.deletionImageTrainingLessonDialog = false;
    //             this.loadSecurityTraining(this.trainigLessonId);
    //         });
    //     } else if (this.imageToDelete.contentType === 'screensavers') {
    //         this.trainingServ.deleteScreenSaverById(this.imageToDelete.id).subscribe(() => {
    //
    //             this.imageToDelete = null;
    //             this.ref.detectChanges();

    //             this.deletionImageTrainingLessonDialog = false;
    //             this.loadSecurityTraining(this.trainigLessonId);
    //         });
    //     }
    // }

    editImage(image: any) {
        this.selectedImage = null;
        this.image = image;
        this.imageUrl = image.itemImageSrc;
        this.imageEditDialog = true;
        // this.selectedImage = { contentType, id };
    }

    addNewImage(type: string) {
        this.imageUrl = '../../../../../assets/media/upload-photo.jpg';
        this.imageEditDialog = true;
        this.image = {
            id: '',
            orderNo: '',
            itemImageSrc: '',
            thumbnailImageSrc: '',
            imageTitle: '',
            contentType: type,
        };

        if (type === 'wallpapers') {
            this.addImageHeaderDialogText = 'Add Wallpaper Saver';
        } else {
            this.addImageHeaderDialogText = 'Add Screen Saver';
        }
    }

    onUploadImageClick() {
        const fileInput = document.getElementById('image') as HTMLInputElement;
        fileInput.click();
    }

    onImageSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length) {
            this.selectedImage = input.files[0];
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.imageUrl = e.target.result;
                this.ref.detectChanges();
            };
            reader.readAsDataURL(this.selectedImage);
        }
    }

    confirmEditImage() {
        const formData = new FormData();

        if (this.image.id !== '') {
            if (this.image.contentType === 'wallpapers') {
                formData.append('Id', this.image.id);
                formData.append('WallpaperTitle', this.image.imageTitle);
                if (this.image.orderNo) {
                    formData.append('OrderNo', this.image.orderNo);
                }

                const WallpaperFile = this.selectedImage;
                if (WallpaperFile) {
                    formData.append('WallpaperFile', WallpaperFile, WallpaperFile.name);
                }

                this.trainingServ.editWallpaper(formData).subscribe(() => {
                    this.ref.detectChanges();
                    this.image = null;
                    this.editImageDialog = false;
                    this.trainingServ
                        .getWallpapersByLessonLanguageId(this.trainingLesson.id)
                        .subscribe((wallpapers: ITrainingLessonWallpaper[]) => {
                            this.images = wallpapers.map((wall) => ({
                                id: wall.id,
                                orderNo: wall.orderNo,
                                itemImageSrc: wall.wallpaperUrl,
                                thumbnailImageSrc: wall.wallpaperUrl,
                                imageTitle: wall.wallpaperTitle,
                                contentType: 'wallpapers',
                            }));
                            this.galleryHeader = 'Wallpapers Gallery';
                            this.displayGallery = true;
                        });
                });
            } else if (this.image.contentType === 'screensavers') {
                formData.append('Id', this.image.id);
                formData.append('ScreenSaverTitle', this.image.imageTitle);
                if (this.image.orderNo) {
                    formData.append('OrderNo', this.image.orderNo);
                }
                const screenSaverFile = this.selectedImage;
                if (screenSaverFile) {
                    formData.append('ScreenSaverFile', screenSaverFile, screenSaverFile.name);
                }
                this.trainingServ.editScreenSaver(formData).subscribe(() => {
                    this.trainingServ
                        .getScreenSaversByLessonLanguageId(this.trainingLesson.id)
                        .subscribe((screenSavers: ITrainingLessonScreenSaver[]) => {
                            this.images = screenSavers.map((saver) => ({
                                id: saver.id,
                                orderNo: saver.orderNo,
                                itemImageSrc: saver.screenSaverUrl,
                                thumbnailImageSrc: saver.screenSaverUrl,
                                imageTitle: saver.screenSaverTitle,
                                contentType: 'screensavers',
                            }));

                            this.galleryHeader = 'Screen Savers Gallery';
                            this.displayGallery = true;
                        });
                    this.image = null;
                    this.ref.detectChanges();
                    this.editImageDialog = false;
                    this.loadSecurityTraining(this.trainigLessonId);
                });
            }
            this.selectedImage = null;
            this.imageEditDialog = false;
            this.ref.detectChanges();
        } else {
            if (this.image.contentType === 'wallpapers') {
                formData.append('LessonLanguageId', this.trainingLessonLanguageId);
                formData.append('WallpaperTitle', this.image.imageTitle);

                if (this.image.orderNo) {
                    formData.append('OrderNo', this.image.orderNo);
                }

                const WallpaperFile = this.selectedImage;
                if (WallpaperFile) {
                    formData.append('WallpaperFile', WallpaperFile, WallpaperFile.name);
                }

                this.trainingServ.addSingleWallpaper(formData).subscribe(() => {
                    this.ref.detectChanges();
                    this.image = null;
                    this.editImageDialog = false;
                    this.trainingServ
                        .getWallpapersByLessonLanguageId(this.trainingLesson.id)
                        .subscribe((wallpapers: ITrainingLessonWallpaper[]) => {
                            this.images = wallpapers.map((wall) => ({
                                id: wall.id,
                                orderNo: wall.orderNo,
                                itemImageSrc: wall.wallpaperUrl,
                                thumbnailImageSrc: wall.wallpaperUrl,
                                imageTitle: wall.wallpaperTitle,
                                contentType: 'wallpapers',
                            }));
                            this.galleryHeader = 'Wallpapers Gallery';
                            this.displayGallery = true;
                        });
                });
            } else if (this.image.contentType === 'screensavers') {
                formData.append('LessonLanguageId', this.trainingLessonLanguageId);
                formData.append('ScreenSaverTitle', this.image.imageTitle);
                if (this.image.orderNo) {
                    formData.append('OrderNo', this.image.orderNo);
                }
                const screenSaverFile = this.selectedImage;
                if (screenSaverFile) {
                    formData.append('ScreenSaverFile', screenSaverFile, screenSaverFile.name);
                }
                this.trainingServ.addSingleScreenSaver(formData).subscribe(() => {
                    this.trainingServ
                        .getScreenSaversByLessonLanguageId(this.trainingLesson.id)
                        .subscribe((screenSavers: ITrainingLessonScreenSaver[]) => {
                            this.images = screenSavers.map((saver) => ({
                                id: saver.id,
                                orderNo: saver.orderNo,
                                itemImageSrc: saver.screenSaverUrl,
                                thumbnailImageSrc: saver.screenSaverUrl,
                                imageTitle: saver.screenSaverTitle,
                                contentType: 'screensavers',
                            }));
                            this.galleryHeader = 'Screen Savers Gallery';
                            this.displayGallery = true;
                        });

                    this.image = null;
                    this.ref.detectChanges();
                    this.editImageDialog = false;
                    this.loadSecurityTraining(this.trainigLessonId);
                });
            }
            this.selectedImage = null;
            this.imageEditDialog = false;
            this.ref.detectChanges();
        }
    }

    declineEditImage() {
        this.image = null;
        this.selectedImage = null;
        this.imageEditDialog = false;
        this.ref.detectChanges();
    }

    deleteImage(image: any): void {
        this.image = image;
        this.deletionImageTrainingLessonDialog = true;
    }

    confirmImageDeletion() {
        if (this.image.contentType === 'wallpapers') {
            this.trainingServ.deleteWallpaperById(this.image.id).subscribe(() => {
                this.image = null;
                this.ref.detectChanges();
                this.trainingServ
                    .getWallpapersByLessonLanguageId(this.trainingLesson.id)
                    .subscribe((wallpapers: ITrainingLessonWallpaper[]) => {
                        this.images = wallpapers.map((wall) => ({
                            id: wall.id,
                            orderNo: wall.orderNo,
                            itemImageSrc: wall.wallpaperUrl,
                            thumbnailImageSrc: wall.wallpaperUrl,
                            imageTitle: wall.wallpaperTitle,
                            contentType: 'wallpapers',
                        }));
                        this.galleryHeader = 'Wallpapers Gallery';
                        this.displayGallery = true;
                    });

                this.deletionImageTrainingLessonDialog = false;
                this.loadSecurityTraining(this.trainigLessonId);
            });
        } else if (this.image.contentType === 'screensavers') {
            this.trainingServ.deleteScreenSaverById(this.image.id).subscribe(() => {
                this.image = null;
                this.trainingServ
                    .getScreenSaversByLessonLanguageId(this.trainingLesson.id)
                    .subscribe((screenSavers: ITrainingLessonScreenSaver[]) => {
                        this.images = screenSavers.map((saver) => ({
                            id: saver.id,
                            orderNo: saver.orderNo,
                            itemImageSrc: saver.screenSaverUrl,
                            thumbnailImageSrc: saver.screenSaverUrl,
                            imageTitle: saver.screenSaverTitle,
                            contentType: 'screensavers',
                        }));
                        this.galleryHeader = 'Screen Savers Gallery';
                        this.displayGallery = true;
                    });
                this.ref.detectChanges();

                this.deletionImageTrainingLessonDialog = false;
                this.loadSecurityTraining(this.trainigLessonId);
            });
        }
    }

    //#region Activation

    switchActivation(trainingLesson: ITrainingLessonsLanguage) {
        this.switchActivationTrainingLessonDialog = true;
        this.trainingLesson = { ...trainingLesson };
        this.trainingLessonLanguageId = this.trainingLesson.id;
    }

    declineActivation() {
        this.switchActivationTrainingLessonDialog = false;
        this.loadSecurityTraining(this.trainigLessonId);
        this.initTrainingLesson();
        this.ref.detectChanges();
    }

    confirmtActivation() {
        this.toggleActivation(this.trainingLesson);
    }

    toggleActivation(trainingLesson: ITrainingLessonsLanguage) {
        if (trainingLesson.isActive) {
            this.subs.add(
                this.trainingServ.dectivateTrainingLessonLanguageById(this.trainingLesson.id).subscribe((result) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Lesson Language Deactivated',
                        life: 3000,
                    });
                    this.loadSecurityTraining(this.trainigLessonId);
                    this.ref.detectChanges();
                })
            );
        } else {
            this.subs.add(
                this.trainingServ.activateTrainingLessonLanguageById(this.trainingLesson.id).subscribe((result) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Lesson Language Activated',
                        life: 3000,
                    });
                    this.loadSecurityTraining(this.trainigLessonId);
                    this.ref.detectChanges();
                })
            );
        }
        this.initTrainingLesson();
        this.switchActivationTrainingLessonDialog = false;
    }

    reInitilizeDialog() {
        this.images = [];
        const lessonLangId = this.trainingLesson.languageId;
        const trainingLessonId = this.trainigLessonId;
        this.loadTrainingLessonLangWallpapers(lessonLangId, trainingLessonId, this.trainingLesson);
        this.ref.detectChanges();
    }

    //#endregion

    ngOnDestroy() {
        this.subs.unsubscribe();
    }
}