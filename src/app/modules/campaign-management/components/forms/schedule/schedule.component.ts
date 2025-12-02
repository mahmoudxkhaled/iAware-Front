import { AfterViewChecked, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DropdownChangeEvent } from 'primeng/dropdown';
import { ILessonEmailModel } from '../../../models/ILessonEmailModel';
import { Editor } from 'ngx-editor';
import { Message, MessageService } from 'primeng/api';
import { IAddAwarenessCampaignRequest } from '../../../models/IAddAwarenessCampaignRequest';
import { CampaignManagementService } from '../../../services/campaign-management.service';
import { Table } from 'primeng/table';
import { LocalStorageService } from 'src/app/core/Services/local-storage.service';
import { IAwarenessCampaignLessonModel } from '../../../models/IAwarenessCampaignLessonModel';
import { Unsubscribable } from 'rxjs';
import { TranslationService } from 'src/app/core/Services/translation.service';
import introJs from 'intro.js';
import { TableLoadingService } from 'src/app/core/Services/table-loading.service';
import { constants } from 'src/app/core/constatnts/constatnts';
import { SystemEmailActivityService } from 'src/app/modules/system-email-activity/services/system-email-activity.service';
import { SystemEmailActivity } from 'src/app/core/enums/SystemEmailActivity';
import { DropdownListDataSourceService } from 'src/app/core/Services/dropdown-list-data-source.service';
@Component({
    selector: 'app-schedule',
    templateUrl: './schedule.component.html',
    styleUrl: './schedule.component.scss',
})
export class ScheduleComponent implements OnInit, AfterViewChecked, OnDestroy {
    tableLoadingSpinner: boolean = true;
    isConfirmLoading: boolean = false;

    lessons: any;
    campaignLessons: any;
    originalLessons: any;
    unSubscribe: Unsubscribable[] = [];
    lessonLanguages: any[] = [];
    newLessonWithLanguages: IAwarenessCampaignLessonModel;
    private _tempAwarenessCampaignLesson: IAwarenessCampaignLessonModel[] = [];
    campaingnatype: any;
    phishingTemplates: any[] = [];
    originalPhishingTemplates: any;
    groups: any;
    users: any;
    type: any;
    period: string = 'd';
    numberOfOccurrences: number = 0;
    frequencyDays: number = 0;
    frequencyInDays: number = 0;

    schedualTrainingDataEntered: any[] = [];
    schedualPhishingDataEntered: any[] = [];
    form: FormGroup;
    phishingForm: FormGroup;
    campaignTypeForm: FormGroup;
    emailContent: ILessonEmailModel = {
        emailContent: '',
        emailSubject: '',
    };
    editor: Editor;
    periods: any[];
    isScheduledTimeValid: boolean = false;
    doNotShaowScedualTrainigStepAgain: boolean = false;
    doNotShaowScedualPhishingStepAgain: boolean = false;
    campaignModel: IAddAwarenessCampaignRequest;
    editEmailTrainingLanguageDialog: boolean = false;
    trainingLessonLanguageId: string;
    validationPhishingStartTimeMessage: string;
    validationPhishingEndTimeMessage: string;
    activeLanguages: any[] = [];
    @ViewChild('dtLessons') lessonsTable: Table;
    introJS = introJs.tour();
    campaignEmailSubjects : any[] = [];
    aiRecomindationMessage = ''
    phishingDomainsEmails: any[] = [];
    domainEmails : any[] = [];

    constructor(
        private router: Router,
        private apiService: CampaignManagementService,
        private messageService: MessageService,
        private localstorageService: LocalStorageService,
        private systemEmailActivityService : SystemEmailActivityService,
        private cdr: ChangeDetectorRef,
        private translate: TranslationService,
        private dropdownListDataSourceService: DropdownListDataSourceService,
        private tableLoadingService: TableLoadingService
    ) {
        this.loadAwarenessCampaignDefaultEmails();
        this.doNotShaowScedualTrainigStepAgain = this.localstorageService.getItem('doNotShaowScedualTrainigStepAgain');
        this.doNotShaowScedualPhishingStepAgain = this.localstorageService.getItem(
            'doNotShaowScedualPhishingStepAgain'
        );
    }

    ngOnInit(): void {
        this.tableLoadingService.loading$.subscribe((isLoading) => {
            this.tableLoadingSpinner = isLoading;
        });

        this.aiRecomindationMessage = this.translate.getInstant('campaign-management.campaign-create.scedual.training.aiRecomindationMessage');

        this.periods = [
            { code: 'd', name: 'Day' },
            { code: 'm', name: 'Month' },
            { code: 'y', name: 'Year' },
        ];
        this.initialCampaignModel();
        this.initiateCampaignLanguageEmailsForm();
        this.getDataFromLocalStorage();
        this.initiateTriningForm();
        this.assigneLessonsToDT();
        this.initiatePhishingForm();
        this.fetchActivePhishingDomainsWithEmails();
        // if (this.type == 1) {
        //     if (!this.doNotShaowScedualTrainigStepAgain) {
        //         this.introJS
        //             .setOptions({
        //                 steps: [
        //                     {
        //                         element: '#awarenessCampaignScedual',
        //                         intro: 'awareness Campaign Scedual',
        //                         position: 'bottom',
        //                     },
        //                     {
        //                         element: '#awarenessCampaignEmail',
        //                         intro: 'awareness Campaign Email',
        //                         position: 'bottom',
        //                     },
        //                     {
        //                         element: '#stepLast',
        //                         intro: `
        //                     <p>Thank you for completing the onboarding process!</p>
        //                     <p><input type="checkbox" id="doNotShaowScedualTrainigStepAgain" /> <label for="doNotShaowScedualTrainigStepAgain">Don't show again</label></p>
        //                 `,
        //                         position: 'bottom',
        //                         highlightClass: 'introjs-highlight',
        //                     },
        //                 ],
        //                 nextLabel: 'Next',
        //                 prevLabel: 'Previous',
        //                 doneLabel: 'Close',
        //             })
        //             .oncomplete(() => {
        //                 const doNotShaowScedualTrainigStepAgain = document.getElementById(
        //                     'doNotShaowScedualTrainigStepAgain'
        //                 ) as HTMLInputElement;
        //                 if (doNotShaowScedualTrainigStepAgain?.checked) {
        //                     localStorage.setItem('doNotShaowScedualTrainigStepAgain', 'true');
        //                 }
        //             })
        //             .start();
        //     }
        // } else {
        //     if (!this.doNotShaowScedualPhishingStepAgain) {
        //         this.introJS
        //             .setOptions({
        //                 steps: [
        //                     {
        //                         element: '#phishingTemplates',
        //                         intro: 'Select from available phishing templates to simulate scenarios. These templates are designed to test and train users in identifying phishing attempts.',
        //                         position: 'bottom',
        //                     },
        //                     {
        //                         element: '#phishingUsers',
        //                         intro: 'Select the users who will participate in the phishing simulation. You can target specific individuals or groups for training.',
        //                         position: 'bottom',
        //                     },
        //                     {
        //                         element: '#isFrequently',
        //                         intro: 'Choose this option if you want to schedule the phishing simulation to occur repeatedly at regular intervals.',
        //                         position: 'bottom',
        //                     },
        //                     {
        //                         element: '#isImmediately',
        //                         intro: 'Select this option to start the phishing simulation immediately after saving the schedule.',
        //                         position: 'bottom',
        //                     },
        //                     {
        //                         element: '#phishingStartTime',
        //                         intro: 'Set the start time for the phishing campaign. This is when the first phishing email will be sent to the selected users.',
        //                         position: 'bottom',
        //                     },
        //                     {
        //                         element: '#phishingEndTime',
        //                         intro: 'Set the end time for the phishing campaign. After this time, no more phishing emails will be sent to users.',
        //                         position: 'bottom',
        //                     },
        //                     {
        //                         element: '#frequencyInDays',
        //                         intro: 'Specify the interval in days between phishing attempts if the campaign is set to run frequently.',
        //                         position: 'bottom',
        //                     },
        //                     {
        //                         element: '#numberOfOccurrences',
        //                         intro: 'Define how many phishing attempts will be made during the campaign. This is useful for limiting the number of emails each user will receive.',
        //                         position: 'bottom',
        //                     },
        //                     {
        //                         element: '#add',
        //                         intro: 'Click this button to add the phishing campaign to the schedule. You can review and manage all scheduled campaigns later.',
        //                         position: 'bottom',
        //                     },
        //                     {
        //                         element: '#scedualTemplateTable',
        //                         intro: 'View and manage all scheduled phishing campaigns. Here you can see details such as the template used, participants, and status.',
        //                         position: 'bottom',
        //                     },
        //                     {
        //                         element: '#stepLast',
        //                         intro: `
        //                             <p>Thank you for completing the phishing campaign setup process! You can now manage your campaigns from the schedule table.</p>
        //                             <p><input type="checkbox" id="doNotShaowScedualPhishingStepAgain" /> <label for="doNotShaowScedualPhishingStepAgain">Don't show this tour again</label></p>
        //                         `,
        //                         position: 'bottom',
        //                         highlightClass: 'introjs-highlight',
        //                     },
        //                 ],
        //                 nextLabel: 'Next',
        //                 prevLabel: 'Previous',
        //                 doneLabel: 'Close',
        //             })
        //             .oncomplete(() => {
        //                 const doNotShaowScedualPhishingStepAgain = document.getElementById(
        //                     'doNotShaowScedualPhishingStepAgain'
        //                 ) as HTMLInputElement;
        //                 if (doNotShaowScedualPhishingStepAgain?.checked) {
        //                     localStorage.setItem('doNotShaowScedualPhishingStepAgain', 'true');
        //                 }
        //             })
        //             .start();
        //     }
        // }
    }

    ngAfterViewChecked(): void {
        this.cdr.detectChanges();
        this.aiTrainingRecomindation();
    }

    initialCampaignModel() {
        this.campaignModel = {
            awarenessCampaign: {
                campaignType: 0,
                name: '',
                awarenessCampaignLanguageEmails: [],
            },
            awarenessCampaignLesson: [],
            awarenessCampaignUser: [],
            awarenessCampaignSchedule: [],
            awarenessCampaignSimulationPhishing: [],
        };
    }

    loadAwarenessCampaignDefaultEmails(){
        const sub = this.systemEmailActivityService.getSystemEmailActivityById(SystemEmailActivity.CampaignAdded).subscribe({
            next: (result) => {
                this.campaignEmailSubjects = result.data.systemEmailActivityLanguages ?? [];
                this.fetchActiveLanguages();
            }
        })
        this.unSubscribe.push(sub);
    }

    getDataFromLocalStorage() {
        const dataLessons = this.localstorageService.getItem('lessons');
        const dataCampaingnaType = this.localstorageService.getItem('campaignType');
        const users = this.localstorageService.getItem('campaignUsers');
        const phishingTemplates = this.localstorageService.getItem('phishingTemplates');
        const type = this.localstorageService.getItem('type');
        const usersSource = this.localstorageService.getItem('selectUsersValue');

        if (type != null) {
            this.type = type;
        }

        if (dataLessons != null) {
            this.lessons = dataLessons;//?.filter((item: any) => item !== null && item?.isParent === false);
            this.originalLessons = this.lessons;
        }

        if (dataCampaingnaType != null) {
            this.campaingnatype = dataCampaingnaType;
        }

        if (usersSource != null) {
            this.campaingnatype.usersSource = usersSource;
        }

        if (phishingTemplates != null) {
            this.phishingTemplates = phishingTemplates;
            this.originalPhishingTemplates = phishingTemplates;
        }

        if (users != null) {
            this.users = users.filter((c: any) => !c.isParent);
        }
    }

    fetchActiveLanguages() {
        this.dropdownListDataSourceService.getActiveLanguages().subscribe({
            next: (result) => {
                this.activeLanguages = result.data;
                this.addLanguageControls();
                this.cdr.detectChanges();
            },
            error: (error) => { },
        });
    }

    fetchActivePhishingDomainsWithEmails() {
        this.apiService.getAllPhishingDomainWithEmails().subscribe({
            next: (result) => {
                this.phishingDomainsEmails = result.data;
            },
            error: (error) => { },
        });
    }

    getLanguageFormGroup(code: string): FormGroup | null {
        const languageControls = this.campaignTypeForm.get('awarenessCampaignLanguageEmails') as FormGroup;
        return languageControls.get(code) as FormGroup | null;
    }

    addLanguageControls() {
        const languageControls = this.campaignTypeForm.get('awarenessCampaignLanguageEmails') as FormGroup;

        this.activeLanguages.forEach((language) => {
            const languageFormGroup = new FormGroup({
                awarenessCampaignEmailContentHtml: new FormControl<string>(this.getCampaignEmailHtmlContent(language)),
                awarenessCampaignEmailSubject: new FormControl<string>(this.getCampaignEmailSubject(language)),
                languageId: new FormControl<string>(language.id),
            });

            languageControls.addControl(language.code, languageFormGroup);
        });
    }

    getCampaignEmailSubject(language: any): string {
        return this.campaignEmailSubjects.find(c => c.languageId === language.id)?.emailSubject ?? ''
    }
    
    getCampaignEmailHtmlContent(language: any): string {
        return this.campaignEmailSubjects.find(c => c.languageId === language.id)?.emailBody ?? ''
    }

    initiateCampaignLanguageEmailsForm() {
        this.campaignTypeForm = new FormGroup({
            awarenessCampaignLanguageEmails: new FormGroup({}),
        });
    }

    initiateTriningForm() {
        this.form = new FormGroup({
            awarenessCampaignLessonId: new FormControl<string>('', [Validators.required]),
            users: new FormControl<string[]>(
                this.users?.map((usr: any) => usr.id),
                [Validators.required]
            ),
            scheduledTime: new FormControl<Date>(new Date(), [Validators.required]),
        });
    }

    assigneLessonsToDT() {
        this.tableLoadingService.show();

        const startDate = new Date(this.campaingnatype?.startDate);
        const endDate = new Date(this.campaingnatype?.endDate);

        // Calculate the total number of days (inclusive)
        const differenceInTime = endDate.getTime() - startDate.getTime();
        const totalDays = Math.ceil(differenceInTime / (1000 * 3600 * 24)) + 1;

        // Get the number of lessons
        const numberOfLessons = this.lessons?.length || 0;

        // Calculate the interval in days between each lesson
        const intervalDays = Math.floor(totalDays / numberOfLessons);
        this.campaignLessons = this.lessons?.map((l: any, index: number) => {
            // Calculate the scheduled time for each lesson
            const scheduledTime = new Date(startDate.getTime());
            scheduledTime.setDate(startDate.getDate() + index * intervalDays);
            return {
                awarenessCampaignLessonName: this.getLessonName(l?.id),
                awarenessCampaignLessonId: l?.id,
                scheduledTime: this.formatDateTimeLocal(scheduledTime),
                users: this.users.map((u: any) => u?.id),
            };
        });
        this.tableLoadingService.hide();
    }

    aiTrainingRecomindation() {
        this.lessonsTable?.value.forEach((c) => {
            const element = document.getElementById(c.awarenessCampaignLessonId) as HTMLInputElement;
            if (element) {
                const formattedStartDate = this.formatDateTimeLocal(c.scheduledTime);
                element.value = formattedStartDate;
            }
        });
    }

    sanitizeId(id: string): string {
        return `${id.replace(/[^a-zA-Z0-9\-_]/g, '')}`;
    }

    formatDateTimeLocal(datee: Date): string {
        const date = new Date(datee);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;
        return formattedDate;
    }

    setScheduledTimeInDOM(sanitizedId: string, scheduledTime: Date) {
        const element = document.querySelector(`.${sanitizedId}`) as HTMLInputElement;
        if (element) {
            element.value = this.formatDateTimeLocal(scheduledTime);
        }
    }

    getUniqeUsers(usersData: any) {
        const idMap = new Map<string, any>();
        const ids = usersData?.map((x: any) => {
            return x.id;
        });
        usersData.forEach((item: any) => {
            if (idMap.has(item.id)) {
                const existingItem = idMap.get(item.id);
                if (!existingItem.tenantGroupId && item.tenantGroupId) {
                    idMap.set(item.id, item);
                }
            } else {
                idMap.set(item.id, item);
            }
        });

        const uniqueArray = Array.from(idMap.values());
        this.users = uniqueArray;
    }

    addUniqueUsers(u: any[]) {
        if (!this.users) {
            this.users = [];
        }
        const existingUserIds = new Set(this.users.map((user: any) => user.id));
        const newUsers = u.filter((user) => !existingUserIds.has(user.id));
        this.users = this.users.concat(newUsers);
    }

    prevPage() {
        this.router.navigate(['campaign-management/create/campaign-build']);
    }

    setPeriod(event: DropdownChangeEvent) {
        this.period = event.value;
        this.calculateFrequency();
    }

    initiatePhishingForm() {
        this.phishingForm = new FormGroup({
            phishingEmailTemplateId: new FormControl<string>('', [Validators.required]),
            users: new FormControl<string[]>(
                this.users?.map((usr: any) => usr.id),
                [Validators.required]
            ),
            phishingDomainEmailId : new FormControl<string>('', [Validators.required]),
            phishingStartTime: new FormControl<Date>(this.campaingnatype?.startDate),
            phishingEndTime: new FormControl<Date>(this.campaingnatype?.startDate),
            isFrequently: new FormControl<boolean>(true),
            frequencyDays: new FormControl<number>(0),
            numberOfOccurrences: new FormControl<number>(0),
        });
    }

    onSubmit() {
        const schedualObject = this.form.value;
        const isIn = this.schedualTrainingDataEntered.find(
            (s) =>
                s.scheduledTime === schedualObject?.scheduledTime &&
                s.awarenessCampaignLessonId === schedualObject.awarenessCampaignLessonId &&
                s.users === schedualObject.users
        );
        if (!isIn) {
            this.onChangeEndDate(this.form.value?.scheduledTime);
            if (this.isScheduledTimeValid) {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Info',
                    detail: `you select ${schedualObject?.users?.length} user to scedual`,
                    life: 3000,
                });
                const data = {
                    awarenessCampaignLessonName: this.getLessonName(this.form.value.awarenessCampaignLessonId),
                    awarenessCampaignLessonId: this.form.value.awarenessCampaignLessonId,
                    scheduledTime: this.form.value.scheduledTime,
                    users: this.form.value.users,
                };
                this.schedualTrainingDataEntered.push(data);
                this.lessons = this.lessons.filter((c: any) => {
                    return c?.id !== data?.awarenessCampaignLessonId;
                });
            }
        } else {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'duplication not accepted',
            });
        }
    }

    onSubmitPhishingForm() {
        const schedualObject = this.phishingForm.value;
        const isIn = this.schedualPhishingDataEntered.find(
            (s) => s.phishingEmailTemplateId === schedualObject?.phishingEmailTemplateId
        );
        if (!isIn) {
            this.messageService.add({
                severity: 'success',
                summary: 'Info',
                detail: `you select ${schedualObject?.users?.length} user to scedual`,
                life: 3000,
            });
            const data = {
                phishingEmailTemplateId: this.phishingForm.value.phishingEmailTemplateId,
                phishingEmailTemplateName: this.getTemplateName(this.phishingForm.value.phishingEmailTemplateId),
                users: this.phishingForm.value.users,
                phishingStartTime: this.phishingForm.value.phishingStartTime,
                phishingEndTime: this.phishingForm.value.phishingEndTime,
                isFrequently: this.phishingForm.value.isFrequently,
                frequencyDays: this.phishingForm.value.frequencyDays,
                numberOfOccurrences: this.numberOfOccurrences,
                phishingDomainEmailId : this.phishingForm.value.phishingDomainEmailId
            };
            this.schedualPhishingDataEntered.push(data);
            this.phishingTemplates = this.phishingTemplates.filter((c: any) => {
                return c?.id !== data?.phishingEmailTemplateId;
            });
        } else {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'duplication not accepted',
            });
        }

        this.numberOfOccurrences = 0;
        this.initiatePhishingForm();
    }

    onSelectPhishingTemplate(event : DropdownChangeEvent){
        const selectedPhishingTemplateDomainId = this.phishingTemplates.find((template: any) => template.id === event.value).phishingDomainId;
        if(selectedPhishingTemplateDomainId){
            const domainEmails = this.phishingDomainsEmails.find((domain: any) => domain.id === selectedPhishingTemplateDomainId);
            this.domainEmails = domainEmails.phishingDomainEmails ?? [];
        }
    }

    getLessonName(data: string): string {
        const lesson = this.lessons.find((lesson: any) => lesson.id === data);
        return lesson?.name;
    }

    getTemplateName(data: string): string {
        const template = this.phishingTemplates.find((template: any) => template.id === data);
        return template ? template.emailName : '';
    }

    getUsersName(data: string[]): string {
        const names = data
            .map((id: any) => this.users.find((user: any) => user.id === id))
            .filter((user) => user !== undefined)
            .map((user) => user!.name);

        return names.join(', ');
    }

    onLessonChange(event: DropdownChangeEvent) {
        this.apiService.getEmailByTrainingLessonId(event.value).subscribe({
            next: (res) => {
                this.emailContent = res.data;
                this.form.patchValue({
                    lessonScheduleEmailSubject: this.emailContent.emailSubject,
                    lessonScheduleEmailContentHtml: this.emailContent.emailContent,
                });
            },
            error: (error) => { },
        });
    }

    openEditEmail(lesson: any) {
        this.editEmailTrainingLanguageDialog = true;
        this.trainingLessonLanguageId = lesson.awarenessCampaignLessonId;
        this.fetchTrainingLessonLanguages(lesson.awarenessCampaignLessonId);
    }

    fetchTrainingLessonLanguages(trainingLessonLanguageId: string) {
        const isIn = this._tempAwarenessCampaignLesson.find((c) => c.trainingLessonId == trainingLessonLanguageId);
        if (isIn?.awarenessCampaignLessonLanguageEmails) {
            this.lessonLanguages = isIn?.awarenessCampaignLessonLanguageEmails.map((c) => {
                return {
                    id: c.id,
                    name: c.name,
                    languageId: c.languageId,
                    lessonAwarenessEmailContentHtml: c.trainingLessonEmailContentHtml,
                    lessonAwarenessEmailSubject: c.trainingLessonEmailSubject,
                };
            });
            this.newLessonWithLanguages = {
                trainingLessonId: trainingLessonLanguageId,
                awarenessCampaignLessonLanguageEmails: this.lessonLanguages.map((c) => {
                    return {
                        id: c.id,
                        name: c?.name,
                        trainingLessonEmailContentHtml: c?.lessonAwarenessEmailContentHtml,
                        trainingLessonEmailSubject: c?.lessonAwarenessEmailSubject,
                        languageId: c?.languageId,
                        isObjectEdited: c?.isObjectEdited,
                    };
                }),
            };
        } else {
            const x = this.apiService.getTrainingLessonLangaugesByParentId(trainingLessonLanguageId).subscribe({
                next: (res) => {
                    this.lessonLanguages = res.data;
                    this.newLessonWithLanguages = {
                        trainingLessonId: trainingLessonLanguageId,
                        awarenessCampaignLessonLanguageEmails: this.lessonLanguages.map((c) => {
                            return {
                                id: c.id,
                                name: c?.name,
                                trainingLessonEmailContentHtml: c?.lessonAwarenessEmailContentHtml,
                                trainingLessonEmailSubject: c?.lessonAwarenessEmailSubject,
                                languageId: c?.languageId,
                                isObjectEdited: false,
                            };
                        }),
                    };
                },
                error: (error) => { },
            });
        }
    }

    saveEditEmail() {
        this.newLessonWithLanguages.awarenessCampaignLessonLanguageEmails.forEach((c) => {
            this.updateLessonLanguages(c);
        });
        this.updateTempCampaignLesson();
        this.editEmailTrainingLanguageDialog = false;
    }

    updateTempCampaignLesson() {
        if (this._tempAwarenessCampaignLesson.length > 0) {
            const campaignLesson = this._tempAwarenessCampaignLesson.find(
                (c) => c.trainingLessonId == this.newLessonWithLanguages.trainingLessonId
            );
            if (!campaignLesson) {
                this._tempAwarenessCampaignLesson.push(this.newLessonWithLanguages);
            } else {
                this._tempAwarenessCampaignLesson = this._tempAwarenessCampaignLesson.filter((c) => {
                    return c.trainingLessonId != this.newLessonWithLanguages.trainingLessonId;
                });
                this._tempAwarenessCampaignLesson.push(this.newLessonWithLanguages);
            }
        } else {
            this._tempAwarenessCampaignLesson.push(this.newLessonWithLanguages);
        }
    }

    updateLessonLanguages(item: any) {
        const editedItem = this.lessonLanguages.find((newItem) => newItem.id == item.id);
        const originalItem = this.newLessonWithLanguages.awarenessCampaignLessonLanguageEmails.find(
            (origItem) => origItem.id == item.id
        );

        if (editedItem && originalItem) {
            const isSubjectEdited = editedItem.lessonAwarenessEmailSubject != originalItem.trainingLessonEmailSubject;
            const isContentEdited =
                editedItem.lessonAwarenessEmailContentHtml != originalItem.trainingLessonEmailContentHtml;
            originalItem.isObjectEdited = isSubjectEdited || isContentEdited;
            if (originalItem.isObjectEdited) {
                originalItem.trainingLessonEmailContentHtml = editedItem.lessonAwarenessEmailContentHtml;
                originalItem.trainingLessonEmailSubject = editedItem.lessonAwarenessEmailSubject;
            }
        }
    }

    confirm() {
        this.campaignModel.awarenessCampaign.campaignType = this.campaingnatype?.type;
        this.campaignModel.awarenessCampaign.name = this.campaingnatype?.name;
        this.campaignModel.awarenessCampaign.startDate = this.campaingnatype?.startDate;
        this.campaignModel.awarenessCampaign.endDate = this.campaingnatype?.endDate;
        this.campaignModel.awarenessCampaign.usersSource = this.campaingnatype?.usersSource;

        this.campaignModel.awarenessCampaign.awarenessCampaignLanguageEmails = Object.values(
            this.campaignTypeForm.value?.awarenessCampaignLanguageEmails || {}
        )
            .filter((c: any) => c.awarenessCampaignEmailContentHtml && c.awarenessCampaignEmailSubject)
            .map((c: any) => ({
                awarenessCampaignEmailContentHtml: c.awarenessCampaignEmailContentHtml,
                awarenessCampaignEmailSubject: c.awarenessCampaignEmailSubject,
                languageId: c.languageId,
            }));

        this.campaignModel.awarenessCampaignUser = this.users?.map((i: any) => {
            return { userId: i?.id, tenantGroupId: i?.tenantGroupId };
        });

        if (this.type == 1) {
            this.campaignModel.awarenessCampaignSchedule = this.lessonsTable._value?.map((x) => {
                return {
                    trainingLessonId: x.awarenessCampaignLessonId,
                    scheduledTime: x.scheduledTime,
                    users: x?.users,
                };
            });
            if (this._tempAwarenessCampaignLesson.length == 0) {
                this.campaignModel.awarenessCampaignLesson = this.lessonsTable._value?.map((x) => {
                    return { trainingLessonId: x.awarenessCampaignLessonId, awarenessCampaignLessonLanguageEmails: [] };
                });
            } else {
                // take all in _tempAwarenessCampaignLesson
                this.campaignModel.awarenessCampaignLesson = this._tempAwarenessCampaignLesson;

                // check is campaign lesson table containe lesson not in _tempAwarenessCampaignLesson to add them
                const lessonIds = this.campaignModel.awarenessCampaignLesson.map((c) => c.trainingLessonId);
                const newLessons = this.lessonsTable._value.filter(
                    (c) => !lessonIds.includes(c.awarenessCampaignLessonId)
                );
                newLessons.forEach((c) => {
                    this.campaignModel.awarenessCampaignLesson.push({
                        trainingLessonId: c.awarenessCampaignLessonId,
                        awarenessCampaignLessonLanguageEmails: [],
                    });
                });
            }
        }

        if (this.type == 2) {
            this.campaignModel.awarenessCampaignSimulationPhishing = this.schedualPhishingDataEntered.map((c) => {
                return {
                    phishingEmailTemplateId: c.phishingEmailTemplateId,
                    phishingEmailTemplateName: c.phishingEmailTemplateName,
                    phishingStartTime: c.phishingStartTime,
                    isFrequently: c.isFrequently,
                    frequencyDays: c.frequencyDays,
                    phishingEndTime: c.phishingEndTime,
                    users: c.users,
                    numberOfOccurrences: c?.numberOfOccurrences,
                    phishingDomainEmailId : c?.phishingDomainEmailId
                };
            });
        }

        const sub = this.apiService.addCampaign(this.campaignModel).subscribe({
            next: (r) => {
                if (r.isSuccess) {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'campaign Created Successfully',
                        life: 3000,
                    });
                    setTimeout(() => {
                        const data = ['campaignType', 'lessons', 'type', 'campaignUsers', 'phishingTemplates'];
                        data.forEach((c) => {
                            this.localstorageService.removeItem(c);
                        });
                        this.router.navigate(['campaign-management']);
                    }, 1000);
                }
            },
            error: (e) => { },
        });
        this.unSubscribe.push(sub);
    }

    calculateFrequency() {
        let daysPerPeriod: number;
        switch (this.period) {
            case 'm':
                daysPerPeriod = 30;
                break;
            case 'd':
                daysPerPeriod = 1;
                break;
            case 'y':
                daysPerPeriod = 365;
                break;
            default:
                daysPerPeriod = 0;
        }

        this.frequencyDays = this.numberOfOccurrences * daysPerPeriod;
        this.phishingForm.value.frequencyDays = this.frequencyDays;
    }

    onChangeEndDate(event: any) {
        let schedualDate = new Date(event);
        let campaignStartDate = new Date(this.campaingnatype?.startDate);
        let campaignEndDate = new Date(this.campaingnatype?.endDate);

        this.isScheduledTimeValid = schedualDate >= campaignStartDate && schedualDate <= campaignEndDate;
        if (!this.isScheduledTimeValid) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'please select valid data according to start data and end data for this campaign',
                life: 3000,
            });
        }
    }

    onChangephishingStartTime(event: any) {
        let schedualDate = new Date(event);
        let campaignStartDate = new Date(this.campaingnatype?.startDate);
        let campaignEndDate = new Date(this.campaingnatype?.endDate);

        schedualDate.setHours(0, 0, 0, 0);
        campaignStartDate.setHours(0, 0, 0, 0);
        campaignEndDate.setHours(0, 0, 0, 0);

        this.isScheduledTimeValid = schedualDate >= campaignStartDate && schedualDate <= campaignEndDate;
        if (!this.isScheduledTimeValid) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'please select valid data according to start data and end data for this campaign',
                life: 3000,
            });
        }
    }

    onLessenScedualTimeChanged(event: any, lesson: any) {
        this.isScheduledTimeValid =
            event.target.value >= this.campaingnatype?.startDate && event.target.value <= this.campaingnatype?.endDate;
        if (!this.isScheduledTimeValid) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'please select valid data according to start data and end data for this campaign',
                life: 3000,
            });
        }
    }

    getUsersScedualedWithLessonId(): any[] {
        const data = this.schedualTrainingDataEntered.map((c) => {
            return { awarenessCampaignLessonScheduleId: c.awarenessCampaignLessonId, users: c.users };
        });
        const transformedArray: any = [];
        data.forEach((item) => {
            if (item.users) {
                item.users.forEach((userId: any) => {
                    transformedArray.push({
                        awarenessCampaignLessonScheduleId: item.awarenessCampaignLessonScheduleId,
                        userId: userId,
                    });
                });
            }
        });

        return transformedArray;
    }

    hideEditEmailDialog() {
        this.editEmailTrainingLanguageDialog = false;
    }

    deleteFromPhishingTable(model: any) {
        this.schedualPhishingDataEntered = this.schedualPhishingDataEntered.filter((c) => {
            return c.phishingEmailTemplateId !== model.phishingEmailTemplateId;
        });
        const item = this.originalPhishingTemplates.find((c: any) => c.id == model.phishingEmailTemplateId);
        this.phishingTemplates.push(item);
    }

    deleteFromTrainingTable(model: any) {
        this.schedualTrainingDataEntered = this.schedualTrainingDataEntered.filter((c) => {
            return c.awarenessCampaignLessonId !== model.awarenessCampaignLessonId;
        });
        const item = this.originalLessons.find((c: any) => c.id == model.awarenessCampaignLessonId);
        this.lessons.push(item);
    }

    onTimeChange(event: any, changedField: string) {
        const selectedDate = new Date(event.target.value);
        const campaignStartDate = new Date(this.campaingnatype?.startDate);
        const campaignEndDate = new Date(this.campaingnatype?.endDate);

        let control = this.phishingForm.get(changedField);
        let isValid = true;

        if (changedField === 'phishingStartTime') {
            // Validate start time
            if (selectedDate < campaignStartDate || selectedDate > campaignEndDate) {
                isValid = false;
                control?.setErrors({ invalid: true });
            } else {
                control?.setErrors(null);
            }
        } else if (changedField === 'phishingEndTime') {
            // Validate end time
            if (selectedDate < campaignStartDate || selectedDate > campaignEndDate) {
                isValid = false;
                control?.setErrors({ invalid: true });
            } else {
                control?.setErrors(null);
            }
        }

        // Show validation message if the date is invalid
        if (!isValid) {
            this.displayInvalidDateMessage(changedField);
        } else {
            this.clearInvalidDateMessage(changedField);
        }
    }

    displayInvalidDateMessage(field: string) {
        let message = '';
        if (field === 'phishingStartTime') {
            message = this.translate.getInstant(
                'campaign-management.campaign-create.scedual.phishing.validations.validationPhishingStartTimeMessage'
            );
            this.validationPhishingStartTimeMessage = message;
        } else if (field === 'phishingEndTime') {
            message = this.translate.getInstant(
                'campaign-management.campaign-create.scedual.phishing.validations.validationPhishingEndTimeMessage'
            );
            this.validationPhishingEndTimeMessage = message;
        }
    }

    clearInvalidDateMessage(field: string) {
        if (field == 'phishingStartTime') {
            this.validationPhishingStartTimeMessage = '';
        } else {
            this.validationPhishingEndTimeMessage = '';
        }
    }

    calculateOccurrences() {
        const startDate = new Date(this.phishingForm.value.phishingStartTime);
        const endDate = new Date(this.phishingForm.value.phishingEndTime);
        const frequency = this.phishingForm.value.frequencyDays;
        if (startDate && endDate && frequency > 0) {
            const timeDifference = endDate.getTime() - startDate.getTime();
            const daysDifference = timeDifference / (1000 * 3600 * 24) + 1;
            this.numberOfOccurrences = Math.floor(daysDifference / frequency);
        } else {
            this.numberOfOccurrences = 0;
        }
    }

    ngOnDestroy(): void {
        this.unSubscribe.forEach((u) => {
            u.unsubscribe();
        });
    }
}