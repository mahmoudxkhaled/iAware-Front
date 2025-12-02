import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { finalize, Observable, Subscription } from 'rxjs';

import { ILanguageModel } from 'src/app/modules/language/models/ILanguageModel';
import { ActivatedRoute, Router } from '@angular/router';
import { ITrainingCategoryModel as ITrainingLessonCategory } from '../../models/ISecurityTrainingCategoryModel';
import { TrainingLessonService } from '../../services/training-lesson.service';
import { ITrainingLessonsLanguage } from '../../models/ISecurityTrainingModel';
import { ScreenSaverPlatformType } from 'src/app/core/enums/ScreenSaverPlatformType';
import { DropdownListDataSourceService } from 'src/app/core/Services/dropdown-list-data-source.service';

@Component({
    selector: 'app-training-lesson-language-create',
    templateUrl: './training-lesson-language-create.component.html',
    styleUrl: './training-lesson-language-create.component.scss',
})
export class TrainingLessonLanguageCreateComponent implements OnInit {
    @ViewChild('fileInput') fileInput: ElementRef;

    submitted: boolean = false;
    TrainingLessonId: string;

    subs: Subscription = new Subscription();

    selectedBooks: File[] = [];
    selectedVideos: File[] = [];
    bookVideoUrl: string = '';

    languages: ILanguageModel[] = [];
    selectedLanguage: ILanguageModel;
    categories: ITrainingLessonCategory[] = [];
    activeLanguage: ILanguageModel[] = [];
    trainingForm: FormGroup;
    trainingLessonsLanguages: ITrainingLessonsLanguage[] = [];
    isLoading$: Observable<boolean>;
    isScreenSaverUploadedFile: boolean[] = [];
    isWallpaperUploadedFile: boolean[] = [];
    screenSaverPlatformType : string[] =  Object.values(ScreenSaverPlatformType);

    get trainingLessonScreenSavers(): FormArray {
        return this.trainingForm.get('trainingLessonScreenSavers') as FormArray;
    }

    get trainingLessonWallpapers(): FormArray {
        return this.trainingForm.get('trainingLessonWallpapers') as FormArray;
    }

    get trainingLessonQuotes(): FormArray {
        return this.trainingForm.get('trainingLessonQuotes') as FormArray;
    }

    get trainingLessonQuizzes(): FormArray {
        return this.trainingForm.get('trainingLessonQuizzes') as FormArray;
    }

    constructor(
        private trainingServ: TrainingLessonService,
        private dropdownListDataSourceService : DropdownListDataSourceService,
        private messageService: MessageService,
        private formBuilder: FormBuilder,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.isLoading$ = this.trainingServ.isLoadingSubject;

        this.route.params.subscribe((params) => {
            const id = params['lessonId'];
            this.TrainingLessonId = id;
        });

        this.subs.add(
            this.trainingServ
                .getLessonsLanguagesByTrainingLessonId(this.TrainingLessonId)
                .pipe(
                    finalize(() => {
                        this.getActiveLanguageForAddForm();
                    })
                )
                .subscribe((r) => {
                    this.trainingLessonsLanguages = r;
                })
        );
    }

    ngOnInit() {
        this.initTrainingForm();
        this.subs.add(
            this.dropdownListDataSourceService.getTrainingCategories().subscribe((res) => {
                this.categories = res.data;
            })
        );
    }

    getActiveLanguageForAddForm() {
        this.dropdownListDataSourceService
            .getActiveLanguages()
            .pipe(
                finalize(() => {
                    const p = this.trainingLessonsLanguages.map((c) => c.languageId);
                    this.activeLanguage = this.languages.filter((language) => !p.includes(language.id));
                })
            )
            .subscribe({
                next: (res) => {
                    this.languages = res.data;
                },
                error: (err) => {},
            });
    }

    getQuizAnswers(quizIndex: number): FormArray {
        return this.trainingLessonQuizzes.at(quizIndex).get('quizAnswers') as FormArray;
    }

    saveTrainingLesson() {
        this.submitted = true;

        const formData = new FormData();
        formData.append('LessonName', this.trainingForm.value.name);
        formData.append('LessonDescription', this.trainingForm.value.description);
        formData.append('TrainingLessonId', this.TrainingLessonId);
        formData.append('LessonLanguageId', this.trainingForm.value.lessonLanguageId);

        if (this.trainingForm.value.lessonAwarenessEmailSubject) {
            formData.append('LessonAwarenessEmailSubject', this.trainingForm.value.lessonAwarenessEmailSubject);
        }

        if (this.trainingForm.value.lessonAwarenessEmailContentHtml) {
            formData.append('LessonAwarenessEmailContentHtml', this.trainingForm.value.lessonAwarenessEmailContentHtml);
        }

        const lessonBookFile = this.trainingForm.value.lessonBookUrl;
        if (lessonBookFile) {
            formData.append('LessonBookFile', lessonBookFile, lessonBookFile.name);
        }

        formData.append('LessonVideoUrl', this.trainingForm.value.lessonVideoUrl);

        const screenSavers = this.trainingForm.get('trainingLessonScreenSavers')?.value;
        if (screenSavers && screenSavers.length > 0) {
            screenSavers.forEach((x: any, index: number) => {
                if (x.screenSaverTitle) {
                    formData.append(`LessonScreenSavers[${index}].ScreenSaverTitle`, x.screenSaverTitle);
                }
                if (x.screenSaverPlatform) {
                    formData.append(`LessonScreenSavers[${index}].screenSaverPlatform`, x.screenSaverPlatform);
                }
                if (x.screenSaverUrl) {
                    formData.append(
                        `LessonScreenSavers[${index}].ScreenSaverFile`,
                        x.screenSaverUrl,
                        x.screenSaverUrl.name
                    );
                }
            });
        }

        // const wallpapers = this.trainingForm.get('trainingLessonWallpapers')?.value;
        // if (wallpapers && wallpapers.length > 0) {
        //     wallpapers.forEach((x: any, index: number) => {
        //         if (x.wallpaperTitle) {
        //             formData.append(`LessonWallpapers[${index}].WallpaperTitle`, x.wallpaperTitle);
        //         }
        //         if (x.wallpaperUrl) {
        //             formData.append(`LessonWallpapers[${index}].WallpaperFile`, x.wallpaperUrl, x.wallpaperUrl.name);
        //         }
        //     });
        // }

        const quotes = this.trainingForm.get('trainingLessonQuotes')?.value;
        if (quotes && quotes.length > 0) {
            quotes.forEach((x: any, index: number) => {
                if (x.quoteText) {
                    formData.append(`LessonQuotes[${index}].QuoteText`, x.quoteText);
                }
            });
        }

        const quizzes = this.trainingForm.get('trainingLessonQuizzes')?.value;
        if (quizzes && quizzes.length > 0) {
            quizzes.forEach((quiz: any, quizIndex: number) => {
                if (quiz.quizText.trim() !== '') {
                    formData.append(`LessonQuizzes[${quizIndex}].QuizText`, quiz.quizText);

                    const quizAnswers = quiz.quizAnswers as any[];

                    let trueAnswerFound = false;

                    // Filter out answers where answerText is not empty
                    const nonEmptyAnswers = quizAnswers.filter((answer: any) => {
                        const answerTextKey = `answerText${quizIndex}-${answer.orderNo}`;
                        const isNotEmpty = answer[answerTextKey]?.trim() !== '';

                        return isNotEmpty;
                    });

                    nonEmptyAnswers.forEach((answer: any, answerIndex: number) => {
                        formData.append(
                            `LessonQuizzes[${quizIndex}].LessonQuizAnswers[${answerIndex}].AnswerText`,
                            answer[`answerText${quizIndex}-${answerIndex}`]
                        );

                        let isTrueAnswer = false;
                        if (answer[`isTrueAnswer${quizIndex}`] === answerIndex && !trueAnswerFound) {
                            isTrueAnswer = true;
                            trueAnswerFound = true;
                        }
                        formData.append(
                            `LessonQuizzes[${quizIndex}].LessonQuizAnswers[${answerIndex}].IsTrueAnswer`,
                            isTrueAnswer.toString()
                        );
                        formData.append(
                            `LessonQuizzes[${quizIndex}].LessonQuizAnswers[${answerIndex}].OrderNo`,
                            answer.orderNo.toString()
                        );
                    });
                }
            });
        }

        this.trainingServ.addTrainingLessonLanguage(formData).subscribe({
            next: (response: any) => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Security Training Created',
                    life: 3000,
                });
                this.router.navigate(['/Security-Training/', this.TrainingLessonId]);
            },
        });
    }

    onAnswerSelected(quizIndex: number, answerIndex: number): void {
        const quizFormGroup = this.trainingLessonQuizzes.at(quizIndex) as FormGroup;
        const quizAnswersArray = quizFormGroup.get('quizAnswers') as FormArray;

        quizAnswersArray.controls.forEach((control: AbstractControl, index: number) => {
            const answerGroup = control as FormGroup;
            answerGroup.get('isTrueAnswer')?.setValue(-1);
        });

        const selectedAnswerGroup = quizAnswersArray.at(answerIndex) as FormGroup;
        selectedAnswerGroup.get('isTrueAnswer')?.setValue(answerIndex);
    }

    private initTrainingForm(): void {
        this.trainingForm = this.formBuilder.group({
            name: ['', Validators.required],
            description: [''],
            lessonLanguageId: ['', Validators.required],
            lessonBookUrl: [''],
            lessonVideoUrl: [''],
            lessonAwarenessEmailSubject: [''],
            lessonAwarenessEmailContentHtml: [''],
            trainingLessonScreenSavers: this.formBuilder.array([this.createLessonScreenSaver()]),
            trainingLessonWallpapers: this.formBuilder.array([this.createlessonWallpaper()]),
            trainingLessonQuotes: this.formBuilder.array([this.createLessonQuote()]),
            trainingLessonQuizzes: this.formBuilder.array([this.createLessonQuizzes(0)]),
        });
    }

    createLessonScreenSaver(): FormGroup {
        return this.formBuilder.group({
            screenSaverTitle: [''],
            screenSaverPlatform: [''],
            screenSaverUrl: [''],
        });
    }

    createlessonWallpaper(): FormGroup {
        return this.formBuilder.group({
            wallpaperTitle: [''],
            wallpaperUrl: [''],
        });
    }

    createLessonQuizzes(quizIndex: number): FormGroup {
        return this.formBuilder.group({
            quizText: [''],
            quizAnswers: this.formBuilder.array([
                this.createLessonQuizAnswer(0, quizIndex),
                this.createLessonQuizAnswer(1, quizIndex),
                this.createLessonQuizAnswer(2, quizIndex),
                this.createLessonQuizAnswer(3, quizIndex),
            ]),
        });
    }
    createLessonQuote(): FormGroup {
        return this.formBuilder.group({
            quoteText: [''],
        });
    }

    createLessonQuizAnswer(answerIndex: number, quizIndex: number): FormGroup {
        return this.formBuilder.group({
            id: [''],
            [`answerText${quizIndex}-${answerIndex}`]: [''],
            [`isTrueAnswer${quizIndex}`]: [-1],
            orderNo: [answerIndex],
        });
    }

    onlessonBookChange(event: Event): void {
        event.preventDefault();
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length) {
            this.selectedBooks = Array.from(input.files);
            this.trainingForm.patchValue({
                lessonBookUrl: this.selectedBooks[0],
            });
        }
    }

    onlessonVideoChange(event: Event): void {
        event.preventDefault();
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length) {
            this.selectedVideos = Array.from(input.files);
            this.trainingForm.patchValue({
                lessonVideoUrl: this.selectedVideos[0],
            });
        }
    }

    onlessonScreenSaverChange(event: Event, index: number) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length) {
            const file = input.files[0];
            const screenSaverArray = this.trainingForm.get('trainingLessonScreenSavers') as FormArray;
            screenSaverArray.at(index).patchValue({ screenSaverUrl: file });
            this.isScreenSaverUploadedFile[index] = true;
        }
    }

    isScreenSaverUploaded(index: number): boolean {
        return this.isScreenSaverUploadedFile[index] || false;
    }

    isWallpaperUploaded(index: number): boolean {
        return this.isWallpaperUploadedFile[index] || false;
    }

    onlessonWallpaperChange(event: Event, index: number) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length) {
            const file = input.files[0];
            const wallpaperArray = this.trainingForm.get('trainingLessonWallpapers') as FormArray;

            wallpaperArray.at(index).patchValue({ wallpaperUrl: file });
            this.isWallpaperUploadedFile[index] = true;
        }
    }

    removeLessonScreenSaver(index: number): void {
        if (index !== 0) {
            this.trainingLessonScreenSavers.removeAt(index);
            this.isScreenSaverUploadedFile.splice(index, 1);
        }
    }

    removelessonWallpaper(index: number): void {
        if (index !== 0) {
            this.trainingLessonWallpapers.removeAt(index);
            this.isWallpaperUploadedFile.splice(index, 1);
        }
    }

    addlessonWallpaper(): void {
        this.trainingLessonWallpapers.push(this.createlessonWallpaper());
    }

    addLessonScreenSaver(): void {
        this.trainingLessonScreenSavers.push(this.createLessonScreenSaver());
    }

    removeLessonQuote(index: number): void {
        if (index !== 0) {
            this.trainingLessonQuotes.removeAt(index);
        }
    }

    addLessonQuote(): void {
        this.trainingLessonQuotes.push(this.createLessonQuote());
    }

    removeLessonQuiz(index: number): void {
        if (index !== 0) {
            this.trainingLessonQuizzes.removeAt(index);
        }
    }

    addLessonQuiz(): void {
        const quizIndex = this.trainingLessonQuizzes.length;
        const quizFormGroup = this.createLessonQuizzes(quizIndex);

        const quizAnswersArray = quizFormGroup.get('quizAnswers') as FormArray;
        while (quizAnswersArray.length) {
            quizAnswersArray.removeAt(0);
        }

        for (let i = 0; i < 4; i++) {
            quizAnswersArray.push(this.createLessonQuizAnswer(i, quizIndex));
        }

        this.trainingLessonQuizzes.push(quizFormGroup);
    }

    hasAtLeastTwoAnswers(quizGroup: AbstractControl): boolean {
        const answers = quizGroup.get('quizAnswers') as FormArray;
        const filledAnswers = answers.controls.filter((control) => control.get('answerText')?.value.trim() !== '');
        return filledAnswers.length >= 2;
    }

    hasOneTrueAnswer(quizGroup: AbstractControl): boolean {
        const answers = quizGroup.get('quizAnswers') as FormArray;
        const trueAnswers = answers.controls.filter((control) => control.get('isTrueAnswer')?.value === true);
        return trueAnswers.length === 1;
    }

    ngOnDestroy(): void {
        this.subs.unsubscribe();
    }
}