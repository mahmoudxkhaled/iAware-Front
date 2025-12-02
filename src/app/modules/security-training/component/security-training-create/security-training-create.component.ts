import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Observable, Subscription } from 'rxjs';

import { Table } from 'primeng/table';
import { ILanguageModel } from 'src/app/modules/language/models/ILanguageModel';
import { Router } from '@angular/router';
import { ITrainingCategoryModel } from '../../models/ISecurityTrainingCategoryModel';
import { EditorModule } from 'primeng/editor';
import { ITrainingLesson } from '../../models/ISecurityTrainingModel';
import { TrainingLessonService } from '../../services/training-lesson.service';
import { ILibraryWallpaper } from 'src/app/modules/wallpaper-libraries/models/wallpaper-libraries';
import { CheckboxChangeEvent } from 'primeng/checkbox';
import { WallpaperLibrariesService } from 'src/app/modules/wallpaper-libraries/services/wallpaper-libraries.service';
import { ScreenSaverPlatformType } from 'src/app/core/enums/ScreenSaverPlatformType';
import { TagesService } from 'src/app/modules/tages/services/tages.service';
import { ITagModel } from 'src/app/modules/tages/models/ITagModel';
import { DropdownListDataSourceService } from 'src/app/core/Services/dropdown-list-data-source.service';

@Component({
    selector: 'app-security-training-create',
    templateUrl: './security-training-create.component.html',
    styleUrl: './security-training-create.component.scss',
})
export class SecurityTrainingCreateComponent implements OnInit {
    @ViewChild('fileInput') fileInput: ElementRef;
    wallpapers: ILibraryWallpaper[];
    selectedWallpapersCount: number = 0;
    libraryWallpaperDialog = false;
    chooseWllpapersDialog = false;
    checkboxStates: { [key: string]: boolean } = {};
    selectedWallpapers: any[] = [];
    submitted: boolean = false;
    trainingLesson: ITrainingLesson;
    subs: Subscription = new Subscription();
    selectedBooks: File[] = [];
    selectedVideos: File[] = [];
    isLoading$: Observable<boolean>;
    defaultLanguage: ILanguageModel[];
    selectedLanguage: ILanguageModel;
    categories: ITrainingCategoryModel[];
    trainingForm: FormGroup;
    bookVideoUrl: string = '';

    isScreenSaverUploadedFile: boolean[] = [];
    screenSaverPlatformType: string[] = Object.values(ScreenSaverPlatformType);
    tages: ITagModel[] = [];
    isWallpaperUploadedFile: boolean[] = [];

    constructor(
        private securityTrainingService: TrainingLessonService,
        private messageService: MessageService,
        private formBuilder: FormBuilder,
        private router: Router,
        private dropdownListDataSourceService: DropdownListDataSourceService,
        private tagesAPIService: TagesService
    ) {
        this.isLoading$ = this.securityTrainingService.isLoadingSubject;
    }

    ngOnInit() {
        this.initTrainingLessonForm();

        this.subs.add(
            this.securityTrainingService.GetDefaultLanguage().subscribe((res) => {
                this.defaultLanguage = [res];
            })
        );

        this.subs.add(
            this.dropdownListDataSourceService.getTrainingCategories().subscribe((res) => {
                this.categories = res.data;
            })
        );

        this.fetchAllTages();
    }

    // loadWallpapers() {
    //     this.subs.add(
    //         this.wallServ.getAllLibraryWallpapers().subscribe((data) => {
    //             this.wallpapers = data;
    //         })
    //     );
    // }

    fetchAllTages() {
        this.subs.add(this.tagesAPIService.getAllTages().subscribe({
            next: (res) => {
                this.tages = res.data?.filter((t: ITagModel) => t.trainingAllowed);
            },
            error: (error) => {
                //this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
            }
        }))
    }

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

    getQuizAnswers(quizIndex: number): FormArray {
        return this.trainingLessonQuizzes.at(quizIndex).get('quizAnswers') as FormArray;
    }

    saveTrainingLesson() {
        this.submitted = true;

        const formData = new FormData();
        formData.append('Name', this.trainingForm.value.name);
        formData.append('Description', this.trainingForm.value.description);
        formData.append('TrainingLessonCategoryId', this.trainingForm.value.trainingLessonCategoryId);
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
        const tagges = this.trainingForm.value.lessonTages;
        if (tagges && tagges.length > 0) {
            tagges.forEach((tag: any, index: number) => {
                formData.append(`LessonTages[${index}]`, tag);
            });
        }

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

        this.selectedWallpapers.forEach((wallpaper) => {
            formData.append('LessonWallpapersIds', wallpaper.id);
        });

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

        this.securityTrainingService.addTrainingLesson(formData).subscribe({
            next: (response: any) => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Security Training Created',
                    life: 3000,
                });
                this.router.navigate(['/Security-Training/Security-Training-List']);
            },
            error: (error: any) => {
                console.error('Error:', error);
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

    initTrainingLessonForm(): void {
        this.trainingForm = this.formBuilder.group({
            name: ['', Validators.required],
            description: ['', Validators.required],
            trainingLessonCategoryId: ['', Validators.required],
            lessonLanguageId: [this.defaultLanguage, Validators.required],
            lessonBookUrl: [''],
            lessonVideoUrl: [''],
            lessonAwarenessEmailSubject: [''],
            lessonAwarenessEmailContentHtml: [''],
            trainingLessonScreenSavers: this.formBuilder.array([this.createLessonScreenSaver()]),
            trainingLessonWallpapers: [''],
            lessonTages: [[]],
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

    createLessonQuizAnswer(answerIndex: number, quizIndex: number): FormGroup {
        return this.formBuilder.group({
            id: [''],
            [`answerText${quizIndex}-${answerIndex}`]: [''],
            [`isTrueAnswer${quizIndex}`]: [-1],
            orderNo: [answerIndex],
        });
    }

    createLessonQuote(): FormGroup {
        return this.formBuilder.group({
            quoteText: [''],
        });
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

    initTrainingLesson() {
        this.trainingLesson = {
            id: '',
            name: '',
            description: '',
            trainingLessonCategoryName: '',
            trainingLessonCategoryId: '',
            trainingLessonsLanguages: [],
            isActive: true,
            lessonsCount: 0,
            wallpapersCount: 0,
            tages: []
        };
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

    //#region Wallpapers

    addToSelected(wall: any) {
        this.checkboxStates[wall.id] = true;
        this.selectedWallpapers.push(wall);
    }

    removeFromSelected(wall: any) {
        this.checkboxStates[wall.id] = false;
        this.selectedWallpapers = this.selectedWallpapers.filter((w) => w.id !== wall.id);
    }
    toggleSelection(wall: any) {
        if (this.checkboxStates[wall.id]) {
            this.removeFromSelected(wall);
        } else {
            this.addToSelected(wall);
        }
        this.selectedWallpapersCount = this.selectedWallpapers.length;
    }
    addToselected(event: any, wall: any) {
        if (event.checked) {
            this.addToSelected(wall);
        } else {
            this.removeFromSelected(wall);
        }
        this.selectedWallpapersCount = this.selectedWallpapers.length;
    }

    // BacktoWallapapersGallery() {
    //     this.loadWallpapers();
    //     this.libraryWallpaperDialog = false;
    // }

    CreateWallpaper() {
        this.libraryWallpaperDialog = true;
    }

    confirmWallpaperSelected() {
        this.chooseWllpapersDialog = false;
    }
    declineWallpaperSelected() {
        this.chooseWllpapersDialog = false;
    }
    // openWallpapers() {
    //     this.loadWallpapers();

    //     this.chooseWllpapersDialog = true;
    // }

    //#endregion

    ngOnDestroy(): void {
        this.subs.unsubscribe();
    }
}