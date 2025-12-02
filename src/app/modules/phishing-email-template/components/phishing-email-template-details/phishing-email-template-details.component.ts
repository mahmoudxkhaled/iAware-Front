import {
    AfterViewChecked,
    ChangeDetectorRef,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    ViewChild,
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { finalize, Subscription } from 'rxjs';
import { PhishingEmailTemplateService } from '../../services/phishing-email-template.service';
import { IPhishingEmailTemplateLanguage } from '../../models/IPhishingEmailTemplateLanguage';
import { ILanguageModel } from 'src/app/modules/language/models/ILanguageModel';
import { MenuItem, MessageService } from 'primeng/api';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Guid } from 'guid-ts';
import { CheckboxChangeEvent } from 'primeng/checkbox';
import { allowContextMenu } from '@fullcalendar/core/internal';
import html2canvas from 'html2canvas';
import { TranslationService } from 'src/app/core/Services/translation.service';
import { TableLoadingService } from 'src/app/core/Services/table-loading.service';
import { UserService } from 'src/app/modules/user/services/user.service';
import { GetUser } from 'src/app/layout/app-menuProfile/app.menuprofile.component';
import { IAspNetPageItemModel } from 'src/app/modules/page-management/models/IAspNetPageItemModel';
import { constants } from 'src/app/core/constatnts/constatnts';
import { DropdownListDataSourceService } from 'src/app/core/Services/dropdown-list-data-source.service';
@Component({
    selector: 'app-phishing-email-template-details',
    templateUrl: './phishing-email-template-details.component.html',
    styleUrl: './phishing-email-template-details.component.scss',
})
export class PhishingEmailTemplateDetailsComponent implements OnInit, AfterViewChecked, OnDestroy {
    landingPageLink = [
        {key: 'landingPage', value :'http://{LandingPageLink}', text:"Landing Page Link (URL)"}, 
        {key: 'qrCode', value :'{QRCode}', text:"Landing Page QrCode"}
    ];

    tableLoadingSpinner: boolean = true;
    pagePermessions: IAspNetPageItemModel[] = [];

    unsubscribe: Subscription[] = [];
    phishingTemplateId: string;
    phishingTemplateLanguges: IPhishingEmailTemplateLanguage[] = [];
    addDialog: boolean = false;
    editDialog: boolean = false;
    deleteDialog: boolean = false;
    landingQRCodeVaiable = '{QRCode}';
    landingPageInstruction = `Use ${this.landingPageLink.find(c => c.key === 'landingPage')?.value} as a variable to replace it with Landing Page Link, please don't repeat variable name on your content`;
    activationDialog: boolean = false;
    previewDialog: boolean = false;
    addForm: FormGroup;
    editForm: FormGroup;
    emailImage: File[] = [];
    emailImage2: File[] = [];
    activeLanguage: ILanguageModel[] = [];
    imageUrlToAdd: string = '../../../../../assets/media/upload-photo.jpg';
    imageUrlToEdit: string = '../../../../../assets/media/upload-photo.jpg';
    urlToClone: string = '';
    selectedImageToAdd: File;
    selectedImageToEdit: File;
    inputsToCheck: any[] = [];
    selectedInputs: any[] = [];
    isConfirmed: boolean = false;
    inputChecklistEditDialog: boolean = false;
    inputChecklistAddDialog: boolean = false;
    cloneDialog: boolean = false;
    user: GetUser;
    isIAwareTeamUser: boolean = false;
    defaultImageUrl: string = 'assets/images/trainingCategoryBannerImageUrl.jpg';

    isContentChanged: boolean = false;
    originalKeysFromDB: { title: string; key: string }[] = [];
    updatedHtml: string;
    actions = constants.pageActions;

    currentSelected: IPhishingEmailTemplateLanguage = {
        id: '',
        emailName: '',
        description: '',
        languageId: '',
        languageName: '',
        isActive: false,
        isQrCodeChecked: false,
        phishingEmailImageUrl: '',
        phishingEmailInstructionHtml: '',
        phishingEmailSubject: '',
        phishingEmailContentHtml: '',
        phishingLandingPageTitle: '',
        phishingLandingPageDescription: '',
        phishingLandingPageContentHtml: '',
        phishingEmailSuccessMessageTitle: '',
        phishingEmailSuccessMessagePageHtml: '',
        phishingEmailTemplateId: '',
        phishingEmailTemplateLanguageLandingKeys: [],
    };


    ownerMenuItems: MenuItem[] = [];
    normalMenuItems: MenuItem[] = [];
    isDefaultPhishingTemplates : boolean = false;

    events: any[] = [
        { code: 'abort', value: 'onabort' },
        { code: 'autocomplete', value: 'onautocomplete' },
        { code: 'autocompleteerror', value: 'onautocompleteerror' },
        { code: 'blur', value: 'onblur' },
        { code: 'cancel', value: 'oncancel' },
        { code: 'canplay', value: 'oncanplay' },
        { code: 'canplaythrough', value: 'oncanplaythrough' },
        { code: 'change', value: 'onchange' },
        { code: 'click', value: 'onclick' },
        { code: 'close', value: 'onclose' },
        { code: 'contextmenu', value: 'oncontextmenu' },
        { code: 'copy', value: 'oncopy' },
        { code: 'cuechange', value: 'oncuechange' },
        { code: 'cut', value: 'oncut' },
        { code: 'dblclick', value: 'ondblclick' },
        { code: 'drag', value: 'ondrag' },
        { code: 'dragend', value: 'ondragend' },
        { code: 'dragenter', value: 'ondragenter' },
        { code: 'dragleave', value: 'ondragleave' },
        { code: 'dragover', value: 'ondragover' },
        { code: 'dragstart', value: 'ondragstart' },
        { code: 'drop', value: 'ondrop' },
        { code: 'durationchange', value: 'ondurationchange' },
        { code: 'emptied', value: 'onemptied' },
        { code: 'ended', value: 'onended' },
        { code: 'error', value: 'onerror' },
        { code: 'focus', value: 'onfocus' },
        { code: 'gotpointercapture', value: 'ongotpointercapture' },
        { code: 'input', value: 'oninput' },
        { code: 'invalid', value: 'oninvalid' },
        { code: 'keydown', value: 'onkeydown' },
        { code: 'keypress', value: 'onkeypress' },
        { code: 'keyup', value: 'onkeyup' },
        { code: 'load', value: 'onload' },
        { code: 'loadeddata', value: 'onloadeddata' },
        { code: 'loadedmetadata', value: 'onloadedmetadata' },
        { code: 'loadend', value: 'onloadend' },
        { code: 'loadstart', value: 'onloadstart' },
        { code: 'lostpointercapture', value: 'onlostpointercapture' },
        { code: 'mousedown', value: 'onmousedown' },
        { code: 'mouseenter', value: 'onmouseenter' },
        { code: 'mouseleave', value: 'onmouseleave' },
        { code: 'mousemove', value: 'onmousemove' },
        { code: 'mouseout', value: 'onmouseout' },
        { code: 'mouseover', value: 'onmouseover' },
        { code: 'mouseup', value: 'onmouseup' },
        { code: 'paste', value: 'onpaste' },
        { code: 'pause', value: 'onpause' },
        { code: 'play', value: 'onplay' },
        { code: 'playing', value: 'onplaying' },
        { code: 'pointercancel', value: 'onpointercancel' },
        { code: 'pointerdown', value: 'onpointerdown' },
        { code: 'pointerenter', value: 'onpointerenter' },
        { code: 'pointerleave', value: 'onpointerleave' },
        { code: 'pointermove', value: 'onpointermove' },
        { code: 'pointerout', value: 'onpointerout' },
        { code: 'pointerover', value: 'onpointerover' },
        { code: 'pointerup', value: 'onpointerup' },
        { code: 'progress', value: 'onprogress' },
        { code: 'ratechange', value: 'onratechange' },
        { code: 'reset', value: 'onreset' },
        { code: 'resize', value: 'onresize' },
        { code: 'scroll', value: 'onscroll' },
        { code: 'search', value: 'onsearch' },
        { code: 'seeked', value: 'onseeked' },
        { code: 'seeking', value: 'onseeking' },
        { code: 'select', value: 'onselect' },
        { code: 'selectstart', value: 'onselectstart' },
        { code: 'stalled', value: 'onstalled' },
        { code: 'submit', value: 'onsubmit' },
        { code: 'suspend', value: 'onsuspend' },
        { code: 'timeupdate', value: 'ontimeupdate' },
        { code: 'toggle', value: 'ontoggle' },
        { code: 'volumechange', value: 'onvolumechange' },
        { code: 'waiting', value: 'onwaiting' },
    ];

    typs: any[] = [
        { code: 'button', value: 'button' },
        { code: 'checkbox', value: 'checkbox' },
        { code: 'color', value: 'color' },
        { code: 'date', value: 'date' },
        { code: 'datetime-local', value: 'datetime-local' },
        { code: 'email', value: 'email' },
        { code: 'file', value: 'file' },
        { code: 'hidden', value: 'hidden' },
        { code: 'image', value: 'image' },
        { code: 'month', value: 'month' },
        { code: 'number', value: 'number' },
        { code: 'password', value: 'password' },
        { code: 'radio', value: 'radio' },
        { code: 'range', value: 'range' },
        { code: 'reset', value: 'reset' },
        { code: 'search', value: 'search' },
        { code: 'submit', value: 'submit' },
        { code: 'tel', value: 'tel' },
        { code: 'text', value: 'text' },
        { code: 'time', value: 'time' },
        { code: 'url', value: 'url' },
        { code: 'week', value: 'week' },
    ];
    editorOptions = { theme: 'vs-dark', language: 'javascript' };

    get phishingLandingPageInputsForAddForm(): FormArray {
        return this.addForm.get('phishingLandingPageInputs') as FormArray;
    }

    get phishingLandingPageInputsForEditForm(): FormArray {
        return this.editForm.get('phishingLandingPageInputs') as FormArray;
    }

    get phishingLandingPageInpuAddValues(): any {
        return this.addForm.get('phishingLandingPageInputs')?.value;
    }

    get phishingLandingPageInpuEditValues(): any {
        return this.currentSelected.phishingEmailTemplateLanguageLandingKeys;
    }

    constructor(
        private route: ActivatedRoute,
        private messageService: MessageService,
        private fb: FormBuilder,
        private apiService: PhishingEmailTemplateService,
        private ref: ChangeDetectorRef,
        private sanitizer: DomSanitizer,
        private cdr: ChangeDetectorRef,
        private translate: TranslationService,
        private tableLoadingService: TableLoadingService,
        private userServ: UserService,
        private dropdownListDataSourceService: DropdownListDataSourceService
    ) {
        this.initiateEditForm();
    }

    @ViewChild('previewContent') previewContent!: ElementRef;

    imageSrc: string | ArrayBuffer | null = '';

    ngOnInit(): void {
        this.getUserDetails();

        this.tableLoadingService.loading$.subscribe((isLoading) => {
            this.tableLoadingSpinner = isLoading;
        });

        this.editForm.get('landingPageContentHtml')?.valueChanges.subscribe((value) => {
            this.isContentChanged = true;
        });

        const x = this.route.params.subscribe((params) => {
            this.phishingTemplateId = params['id'];
            this.isDefaultPhishingTemplates = params['where'] && params['where'] === 'defaultPhishingTemplates';
            
            this.getPhishingTemplateEmailLanguages(this.phishingTemplateId);
        });


        const deafultBtn = {
            label: this.translate.getInstant('shared.actions.defaultInSystem'),
            icon: 'pi pi-fw pi-minus-circle',
            command: () => '',
        };
        const previewtBtn = {
            label: this.translate.getInstant('shared.actions.preview'),
            icon: 'pi pi-fw pi-eye',
            command: () => this.openPreviewDialog(this.currentSelected),
        };
        const editBtn = {
            label: this.translate.getInstant('shared.actions.edit'),
            icon: 'pi pi-fw pi-pencil',
            command: () => this.openEditDialog(this.currentSelected),
        };

        const deleteBtn = {
            label: this.translate.getInstant('shared.actions.delete'),
            icon: 'pi pi-fw pi-trash',
            command: () => this.openDeleteDialog(this.currentSelected),
        };



        this.unsubscribe.push(x);

        this.ownerMenuItems = [];

        this.ownerMenuItems.push(editBtn);
        this.ownerMenuItems.push(deleteBtn);
        this.ownerMenuItems.push(previewtBtn);



        this.normalMenuItems = [];
        this.normalMenuItems.push(deafultBtn);
        this.normalMenuItems.push(previewtBtn);




    }
    getUserDetails() {
        this.userServ.getUserDetails().subscribe((res) => {
            this.user = res.data;

            if (this.user.iAwareTeam) {
                this.isIAwareTeamUser = true;
            } else {
                this.isIAwareTeamUser = false;
            }
        });
    }

    ngAfterViewChecked(): void {
        this.cdr.detectChanges();
    }

    assigneCurrentSelect(template: IPhishingEmailTemplateLanguage) {
        this.currentSelected = template;
    }

    getPhishingTemplateEmailLanguages(id: string) {
        this.tableLoadingService.show();

        const x = this.apiService.getAllPhishingTemplateLanguages(id).subscribe({
            next: (data) => {
                this.phishingTemplateLanguges = data.data;
                this.tableLoadingService.hide();
            },
            error: (error) => {
                console.error(error);
            },
        });
        this.unsubscribe.push(x);
    }

    getActiveLanguageForAddForm() {
        this.dropdownListDataSourceService.getActiveLanguages().subscribe({
            next: (res) => {
                this.activeLanguage = res.data;
                const p = this.phishingTemplateLanguges.map((c) => c.languageId);
                this.activeLanguage = this.activeLanguage.filter((c) => !p.includes(c.id));
            },
            error: (err) => { },
        });
    }

    getActiveLanguageForEditForm() {
        this.dropdownListDataSourceService.getActiveLanguages().subscribe({
            next: (res) => {
                this.activeLanguage = res.data;
                const currentLanguage = this.activeLanguage.find((lang) => lang.id === this.currentSelected.languageId);
                if (currentLanguage) {
                    const p = this.phishingTemplateLanguges.map((c) => c.languageId);
                    this.activeLanguage = this.activeLanguage.filter((c) => !p.includes(c.id));
                    this.activeLanguage = [...this.activeLanguage, currentLanguage];
                }
                if (this.isEnglishSelected()) {
                    this.editForm.get('languageId')?.disable();
                } else {
                    this.editForm.get('languageId')?.enable();
                }
            },
            error: (err) => { },
        });
    }

    hideDialog() {
        this.isConfirmed = false;
        this.addDialog = false;
        this.editDialog = false;
        this.deleteDialog = false;
    }

    addPhishingLandingPageInputForAddForm() {
        this.phishingLandingPageInputsForAddForm.push(this.createPhishingLandingPageInputGroupForAddForm());
    }

    addPhishingLandingPageInputForEditForm() {
        this.phishingLandingPageInputsForEditForm.push(this.createNewPhishingLandingPageInputGroupForEditForm());
    }

    createPhishingLandingPageInputGroupForAddForm(): FormGroup {
        return this.fb.group({
            phishingLandingPageInputKey: [Guid.newGuid().toString()],
            phishingLandingPageInputType: [''],
            phishingLandingPageInputTitle: [''],
            phishingLandingPageInputEvent: [''],
        });
    }

    createPhishingLandingPageInputGroupForEditForm(input: any = {}): FormGroup {
        return this.fb.group({
            id: [input.id || ''],
            phishingLandingPageInputKey: [
                { value: input.phishingLandingPageInputKey || Guid.newGuid().toString().toString(), disabled: true },
            ],
            phishingLandingPageInputType: [{ value: input.phishingLandingPageInputType || '', disabled: true }],
            phishingLandingPageInputTitle: [{ value: input.phishingLandingPageInputTitle || '', disabled: true }],
            phishingLandingPageInputEvent: [{ value: input.phishingLandingPageInputEvent || '', disabled: true }],
        });
    }

    createNewPhishingLandingPageInputGroupForEditForm(): FormGroup {
        return this.fb.group({
            id: [''],
            phishingLandingPageInputKey: [Guid.newGuid().toString().toString()],
            phishingLandingPageInputType: [''],
            phishingLandingPageInputTitle: [''],
            phishingLandingPageInputEvent: [''],
        });
    }

    removePhishingLandingPageInputForAddForm(index: number) {
        if (index !== 0) {
            this.phishingLandingPageInputsForAddForm.removeAt(index);
        }
    }

    removePhishingLandingPageInputForEditForm(index: number) {
        if (index !== 0) {
            this.phishingLandingPageInputsForEditForm.removeAt(index);
        }
    }

    openDeleteDialog(model: IPhishingEmailTemplateLanguage) {
        this.deleteDialog = true;
        this.currentSelected = model;
    }

    addToCheckList(event: CheckboxChangeEvent, model: any) {
        if (event.checked) {
            this.selectedInputs.push(model);
        } else {
            const index = this.selectedInputs.indexOf(model);
            if (index !== -1) {
                this.selectedInputs.splice(index, 1);
            }
        }
    }

    cancelChecklist() {
        this.selectedInputs = [];
        this.inputChecklistEditDialog = false;
        this.inputChecklistAddDialog = false;
        this.isConfirmed = false;
    }

    //#region Add Form

    createPhishingTemplateEmail() {
        this.isConfirmed = false;
        this.addDialog = true;
        this.initiateAddForm();
        this.getActiveLanguageForAddForm();
    }
    initiateAddForm() {
        this.addForm = this.fb.group({
            emailName: ['', [Validators.required]],
            emailImage: [''],
            description: ['', [Validators.required]],
            emailInstruction: [''],
            phishingEmailSubject: [''],
            phishingEmailContent: [''],
            phishingEmailSuccessMessageTitle: [''],
            phishingEmailSuccessMessagePageHtml: [''],
            phishingEmailFailureMessageTitle: [''],
            phishingEmailFailureMessagePageHtml: [''],
            landingPageTitle: [''],
            landingPageDescription: [''],
            landingPageContentHtml: [''],
            isQrCodeChecked: [false],
            languageId: ['', [Validators.required]],
            phishingLandingPageInputs: this.fb.array([this.createPhishingLandingPageInputGroupForAddForm()]),
        });
    }

    addNewPhishingTemplateLanguage() {
        if (this.isConfirmed === false) {
            this.showChecklistCreateForm();
            return;
        }

        const formData = this.createAddFormData();
        this.apiService
            .addPhishingEmailTemplateLanguage(formData)
            .pipe(
                finalize(() => {
                    this.addDialog = false;
                    this.isConfirmed = false;
                })
            )
            .subscribe({
                next: (r) => {
                    this.ref.detectChanges();
                    this.getPhishingTemplateEmailLanguages(this.phishingTemplateId);
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Phishing Template Language Created',
                        life: 3000,
                    });
                },
                error: (e) => { },
            });
    }

    showChecklistCreateForm() {
        const parser = new DOMParser();
        const doc = parser.parseFromString(this.addForm.value.landingPageContentHtml, 'text/html');
        const inputs = doc.querySelectorAll('input, button');

        let buttonCounter = 0; // Initialize button counter

        this.inputsToCheck = Array.from(inputs)
            .filter((input: any) => {
                // Exclude inputs with type hidden
                const type = input.getAttribute('type') || 'text';
                return type !== 'hidden';
            })
            .map((input: any, index: number) => {
                const type = input.tagName.toLowerCase() === 'button' ? 'button' : input.getAttribute('type') || 'text';

                if (type === 'button') {
                    buttonCounter++;
                }
                // Use generateTitle method for title generation
                const title = this.generateTitle(input, type, index, buttonCounter);

                return {
                    key: Guid.newGuid().toString(),
                    type: type,
                    title: title,
                };
            });

        this.inputChecklistAddDialog = true;
    }

    createAddFormData(): FormData {
        const formData = new FormData();

        // Append form data fields
        formData.append('EmailName', this.addForm.value.emailName);
        formData.append('PhishingEmailImageUrl', this.selectedImageToAdd);
        formData.append('Description', this.addForm.value.description);
        formData.append('PhishingEmailInstructionHtml', this.addForm.value.emailInstruction);
        formData.append('PhishingEmailSubject', this.addForm.value.phishingEmailSubject);
        formData.append('PhishingEmailContentHtml', this.addForm.value.phishingEmailContent);
        formData.append('PhishingEmailSuccessMessageTitle', this.addForm.value.phishingEmailSuccessMessageTitle);
        formData.append('PhishingEmailSuccessMessagePageHtml', this.addForm.value.phishingEmailSuccessMessagePageHtml);
        formData.append('PhishingLandingPageTitle', this.addForm.value.landingPageTitle);
        formData.append('PhishingLandingPageDescription', this.addForm.value.landingPageDescription);
        formData.append('LanguageId', this.addForm.value.languageId);
        formData.append('PhishingEmailTemplateId', this.phishingTemplateId);
        formData.append('IsQrCodeChecked', this.addForm.value.isQrCodeChecked);

        //#region bind the keys and modify the HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(this.addForm.value.landingPageContentHtml, 'text/html');
        const inputs = doc.querySelectorAll('input, button');

        const eventMapping: { [key: string]: string } = {
            checkbox: 'change',
            radio: 'change',
            select: 'change',
            text: 'input',
            button: 'click',
            submit: 'click',
        };

        let InputIndex = 0;
        let buttonCounter = 0; // Initialize button counter

        inputs.forEach((input, index) => {
            const type = input.tagName.toLowerCase() === 'button' ? 'button' : input.getAttribute('type') || 'text';

            // Use generateTitle method for title generation
            if (type === 'button') {
                buttonCounter++;
            }
            const title = this.generateTitle(input, type, index, buttonCounter);

            const selectedInput = this.selectedInputs.find(
                (selected) => selected.title === title && selected.type === type
            );

            if (selectedInput) {
                const key = selectedInput.key;
                const event = eventMapping[type.toLowerCase()] || 'input';

                input.setAttribute(`data-${title}`, key);

                formData.append(
                    `PhishingEmailTemplateLanguageLandingKeys[${InputIndex}].PhishingLandingPageInputKey`,
                    key
                );
                formData.append(
                    `PhishingEmailTemplateLanguageLandingKeys[${InputIndex}].PhishingLandingPageInputType`,
                    type.toLowerCase()
                );
                formData.append(
                    `PhishingEmailTemplateLanguageLandingKeys[${InputIndex}].PhishingLandingPageInputTitle`,
                    title.toLowerCase()
                );
                formData.append(
                    `PhishingEmailTemplateLanguageLandingKeys[${InputIndex}].PhishingLandingPageInputEvent`,
                    event.toLowerCase()
                );
                InputIndex++;
            }
        });

        const updatedHtml = doc.documentElement.outerHTML;

        formData.append('PhishingLandingPageContentHtml', updatedHtml);

        //#endregion

        return formData;
    }

    generateTitle(input: any, type: string, index: number, buttonCounter: number): string {
        let title =
            input.getAttribute('id') ||
            input.getAttribute('placeholder') ||
            input.getAttribute('name') ||
            input.getAttribute('class');

        if (type === 'button' && input.getAttribute('type') === 'submit') {
            // Use buttonCounter in the title and increment it first
            title = `Button ${buttonCounter}-Submit`;
        } else if (!title && type === 'button') {
            title = `Button ${buttonCounter}`;
        } else if (!title) {
            title = `Input ${index + 1}`;
        }

        return title.replace(/[^a-zA-Z0-9]+/g, '').toLowerCase();
    }

    confirmChecklistCreateForm() {
        this.isConfirmed = true;
        this.inputChecklistAddDialog = false;
        this.addNewPhishingTemplateLanguage();
    }

    //#endregion

    //#region Edit Form

    openEditDialog(model: IPhishingEmailTemplateLanguage) {
        this.editDialog = true;
        this.currentSelected = model;
        this.imageUrlToEdit = model.phishingEmailImageUrl ? model.phishingEmailImageUrl : this.imageUrlToEdit;
        this.getActiveLanguageForEditForm();
        this.setEditFormValues(model);
    }

    setEditFormValues(model: IPhishingEmailTemplateLanguage) {
        this.editForm.patchValue({
            emailName: model.emailName,
            emailImage: model.phishingEmailImageUrl,
            description: model.description,
            emailInstruction: model.phishingEmailInstructionHtml,
            phishingEmailSubject: model.phishingEmailSubject,
            phishingEmailContent: model.phishingEmailContentHtml,
            phishingEmailSuccessMessageTitle: model.phishingEmailSuccessMessageTitle,
            phishingEmailSuccessMessagePageHtml: model.phishingEmailSuccessMessagePageHtml,
            landingPageTitle: model.phishingLandingPageTitle,
            landingPageDescription: model.phishingLandingPageDescription,
            landingPageContentHtml: model.phishingLandingPageContentHtml,
            languageId: model.languageId,
            isQrCodeChecked: model.isQrCodeChecked,
        });

        this.originalKeysFromDB = model.phishingEmailTemplateLanguageLandingKeys.map((key) => {
            return {
                key: key.phishingLandingPageInputKey,
                title: key.phishingLandingPageInputTitle,
            };
        });

        const landingPageInputs = this.editForm.get('phishingLandingPageInputs') as FormArray;
        if (model.phishingEmailTemplateLanguageLandingKeys.length > 0) {
            landingPageInputs.clear();
        }

        model.phishingEmailTemplateLanguageLandingKeys.forEach((input) => {
            landingPageInputs.push(this.createPhishingLandingPageInputGroupForEditForm(input));
        });
    }

    confirmChecklistEditForm() {
        this.isConfirmed = true;
        this.isContentChanged = false;
        this.inputChecklistEditDialog = false;
        this.editPhishingTemplateLanguage();
    }

    showChecklistEditForm() {
        // Parse the current HTML content
        const parser = new DOMParser();
        const doc = parser.parseFromString(this.editForm.value.landingPageContentHtml, 'text/html');
        const inputs = doc.querySelectorAll('input, button');

        const currentKeys: string[] = [];
        const inputsInCheckList: any[] = [];

        // Extract the original keys and titles from the stored data
        const existingKeysMap = new Map(this.originalKeysFromDB.map((keyObj) => [keyObj.key, keyObj.title]));

        let buttonCounter = 0;

        inputs.forEach((input, index) => {
            const type = input.tagName.toLowerCase() === 'button' ? 'button' : input.getAttribute('type') || 'text';

            if (type === 'hidden') {
                return;
            }

            if (type === 'button') {
                // Increment the buttonCounter first
                buttonCounter++;
            }
            // Now generate the title
            const title = this.generateTitle(input, type, index, buttonCounter);
            const key =
                Array.from(input.attributes).find((attr) => attr.name.startsWith('data-'))?.value ||
                Guid.newGuid().toString();

            const isExisting = existingKeysMap.has(key);

            currentKeys.push(key);

            inputsInCheckList.push({
                key,
                type,
                title,
                checked: isExisting,
                disabled: isExisting,
            });
        });

        // Validate that original keys are still present
        if (!this.validateOriginalKeys()) {
            return;
        }

        this.inputsToCheck = inputsInCheckList;
        this.isConfirmed = false;
        this.inputChecklistEditDialog = true;
    }

    validateOriginalKeys(): boolean {
        // Parse the current HTML content
        const parser = new DOMParser();
        const doc = parser.parseFromString(this.editForm.value.landingPageContentHtml, 'text/html');
        const inputs = doc.querySelectorAll('input, button');

        const currentKeys: { title: string; key: string }[] = [];

        let buttonCounter = 0;

        // Extract keys and titles from the current content
        inputs.forEach((input, index) => {
            const tagName = input.tagName.toLowerCase();
            const type = tagName === 'button' ? 'button' : input.getAttribute('type') || 'text';

            // Exclude inputs with type hidden
            if (type === 'hidden') {
                return;
            }

            if (type === 'button') {
                buttonCounter++;
            }
            // Use generateTitle to get the title
            const title = this.generateTitle(input, type, index, buttonCounter);

            const attributes = Array.from(input.attributes);
            attributes.forEach((attr) => {
                if (attr.name.startsWith('data-')) {
                    currentKeys.push({ title: attr.name.replace('data-', ''), key: attr.value });
                }
            });
        });

        // Create a Map for the current keys with titles for easier comparison
        const currentKeysMap = new Map(currentKeys.map(({ key, title }) => [key, title]));

        // Check for missing or altered original keys
        const missingOrAlteredKeys = this.originalKeysFromDB.filter((obj) => {
            const currentTitle = currentKeysMap.get(obj.key)?.toLowerCase();
            return !currentTitle || currentTitle !== obj.title.toLowerCase();
        });

        // Generate detailed missing or altered keys info
        const missingKeysDetails = missingOrAlteredKeys
            .map((obj) => {
                return `data-${obj.title.toLowerCase()} = "${obj.key}"`;
            })
            .join('<br>');

        // If there are any missing or altered keys, return false and show a validation error
        if (missingOrAlteredKeys.length > 0) {
            this.messageService.add({
                key: 'missingKeysToast',
                severity: 'error',
                summary: 'Validation Failed',
                detail: `<strong class="margin-bottom:10px">Original keys can't be removed or altered:</strong> <br>${missingKeysDetails}`,
                life: 3000,
            });
            return false;
        }

        return true;
    }

    editPhishingTemplateLanguage() {
        if (this.isContentChanged) {
            this.showChecklistEditForm();
            return;
        }
        const formData = this.createEditFormData();

        this.apiService.editPhishingEmailTemplateLanguage(formData).subscribe({
            next: (r) => {
                this.editDialog = false;
                this.ref.detectChanges();
                this.getPhishingTemplateEmailLanguages(this.phishingTemplateId);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Phishing Template Language Updated',
                    life: 3000,
                });
            },
            error: (e) => { },
        });
        this.selectedInputs = [];
    }

    createEditFormData(): FormData {
        const formData = new FormData();

        // Append basic form data fields
        formData.append('Id', this.currentSelected.id);
        formData.append('EmailName', this.editForm.value.emailName);
        formData.append('PhishingEmailImageUrl', this.selectedImageToEdit);
        formData.append('Description', this.editForm.value.description);
        formData.append('PhishingEmailInstructionHtml', this.editForm.value.emailInstruction);
        formData.append('PhishingEmailSubject', this.editForm.value.phishingEmailSubject);
        formData.append('PhishingEmailContentHtml', this.editForm.value.phishingEmailContent);
        formData.append('PhishingEmailSuccessMessageTitle', this.editForm.value.phishingEmailSuccessMessageTitle);
        formData.append('PhishingEmailSuccessMessagePageHtml', this.editForm.value.phishingEmailSuccessMessagePageHtml);
        formData.append('PhishingLandingPageTitle', this.editForm.value.landingPageTitle);
        formData.append('PhishingLandingPageDescription', this.editForm.value.landingPageDescription);
        formData.append('IsQrCodeChecked', this.editForm.value.isQrCodeChecked);
        formData.append('LanguageId', this.currentSelected.languageId!);

        //#region Bind the keys and modify the HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(this.editForm.value.landingPageContentHtml, 'text/html');
        const inputs = doc.querySelectorAll('input, button');

        const eventMapping: { [key: string]: string } = {
            checkbox: 'change',
            radio: 'change',
            select: 'change',
            text: 'input',
            button: 'click',
            submit: 'click',
        };

        let inputIndex = 0;
        let buttonCounter = 1; // Counter for buttons

        // Loop through the DOM inputs and the inputsToCheck list
        inputs.forEach((input, index) => {
            const type = input.tagName.toLowerCase() === 'button' ? 'button' : input.getAttribute('type') || 'text';

            // Generate the title using the generateTitle method
            const title = this.generateTitle(input, type, index, buttonCounter);

            // Increment buttonCounter if it's a button
            if (type === 'button') {
                buttonCounter++;
            }

            // Attempt to find a matching input in inputsToCheck
            const matchingInput = this.inputsToCheck.find((inputToCheck) => {
                return inputToCheck.title === title && inputToCheck.type === type;
            });

            if (matchingInput && matchingInput.checked && !matchingInput.disabled) {
                const key = matchingInput.key;
                const event = eventMapping[type.toLowerCase()] || 'input';

                // Set the key in the input element as a data attribute
                input.setAttribute(`data-${title}`, key);

                // Append the data to FormData
                formData.append(
                    `PhishingEmailTemplateLanguageLandingKeys[${inputIndex}].PhishingLandingPageInputKey`,
                    key
                );
                formData.append(
                    `PhishingEmailTemplateLanguageLandingKeys[${inputIndex}].PhishingLandingPageInputType`,
                    type.toLowerCase()
                );
                formData.append(
                    `PhishingEmailTemplateLanguageLandingKeys[${inputIndex}].PhishingLandingPageInputTitle`,
                    title.toLowerCase()
                );
                formData.append(
                    `PhishingEmailTemplateLanguageLandingKeys[${inputIndex}].PhishingLandingPageInputEvent`,
                    event.toLowerCase()
                );
                inputIndex++;
            }
        });

        // Get the updated HTML content with the keys included
        const updatedHtml = doc.documentElement.outerHTML;

        // Append the modified HTML to the FormData
        formData.append('PhishingLandingPageContentHtml', updatedHtml);

        //#endregion

        return formData;
    }

    initiateEditForm() {
        this.editForm = this.fb.group({
            emailName: ['', [Validators.required]],
            emailImage: [''],
            description: ['', [Validators.required]],
            emailInstruction: [''],
            phishingEmailSubject: [''],
            phishingEmailContent: [''],
            phishingEmailSuccessMessageTitle: [''],
            phishingEmailSuccessMessagePageHtml: [''],
            landingPageTitle: [''],
            landingPageDescription: [''],
            landingPageContentHtml: [''],
            languageId: ['', [Validators.required]],
            isQrCodeChecked: [false],
            phishingLandingPageInputs: this.fb.array([this.createPhishingLandingPageInputGroupForEditForm()]),
        });
    }

    //#endregion

    openActivationDialog(model: IPhishingEmailTemplateLanguage) {
        this.activationDialog = true;
        this.currentSelected = model;
    }

    openPreviewDialog(model: IPhishingEmailTemplateLanguage) {
        this.previewDialog = true;
        this.currentSelected = model;
        this.generateImage();
    }

    generateImage() {
        // Create a new div element
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute'; // Ensure it doesn't affect the layout
        tempDiv.style.left = '-9999px'; // Hide it off-screen

        // Set the inner HTML of the div
        tempDiv.innerHTML = this.currentSelected.phishingLandingPageContentHtml
            ? this.currentSelected.phishingLandingPageContentHtml
            : '';

        // Append the div to the body
        document.body.appendChild(tempDiv);

        // Wait for the content to be rendered
        setTimeout(() => {
            html2canvas(tempDiv)
                .then((canvas) => {
                    this.imageSrc = canvas.toDataURL('image/png');

                    // Remove the temporary div
                    document.body.removeChild(tempDiv);
                })
                .catch((error) => {
                    console.error('Error generating image:', error); // Handle any errors
                    document.body.removeChild(tempDiv);
                });
        }, 0);
    }

    isEnglishSelected(): boolean {
        const selectedLanguageId = this.editForm.get('languageId')?.value;
        const selectedLanguage = this.activeLanguage.find((lang) => lang.id === selectedLanguageId);
        return selectedLanguage?.isDefaultLanguage ? true : false;
    }

    delete() {
        this.apiService.deletePhishingTemplateLanguage(this.currentSelected.id).subscribe({
            next: (r) => {
                this.deleteDialog = false;
                this.getPhishingTemplateEmailLanguages(this.phishingTemplateId);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Phishing Template Language Deleted',
                    life: 3000,
                });
            },
            error: (e) => { },
        });
    }

    activation(value: boolean) {
        if (value) {
            // TO Do For Activate
            const x = this.apiService.activatePhishingTemplateLanguage(this.currentSelected.id!).subscribe({
                next: (res) => {
                    this.ngOnInit();
                    this.activationDialog = false;
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Phishing Template Language Updated',
                        life: 3000,
                    });
                },
                error: (error) => { },
            });
            this.unsubscribe.push(x);
        } else {
            // TO Do For Deactivate
            const x = this.apiService.deactivatePhishingTemplateLanguage(this.currentSelected.id!).subscribe({
                next: (res) => {
                    this.ngOnInit();
                    this.activationDialog = false;
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Phishing Template Language Updated',
                        life: 3000,
                    });
                },
                error: (error) => { },
            });
            this.unsubscribe.push(x);
        }
    }

    onUploadImageToEditClick() {
        const fileInput = document.getElementById('imagetoedit') as HTMLInputElement;
        fileInput.click();
    }

    onUploadImageToAddClick() {
        const fileInput = document.getElementById('imagetoadd') as HTMLInputElement;
        fileInput.click();
    }

    onImageToEditSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length) {
            this.selectedImageToEdit = input.files[0];

            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.imageUrlToEdit = e.target.result;
                this.ref.detectChanges();
            };
            reader.readAsDataURL(this.selectedImageToEdit);
        }
    }

    onImageToAddSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length) {
            this.selectedImageToAdd = input.files[0];

            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.imageUrlToAdd = e.target.result;
                this.ref.detectChanges();
            };
            reader.readAsDataURL(this.selectedImageToAdd);
        }
    }

    getSafeHtml(): SafeHtml {
        return this.sanitizer.bypassSecurityTrustHtml(this.currentSelected.phishingLandingPageContentHtml!);
    }

    getCopyText(data: any): string {
        return `data-${data.phishingLandingPageInputTitle}="${data.phishingLandingPageInputKey}"`;
    }

    copyText(data: any) {
        const copyData = `data-${data.phishingLandingPageInputTitle}="${data.phishingLandingPageInputKey}"`;
        navigator.clipboard.writeText(copyData);
        this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: `you copied : ${copyData}`,
            life: 2000,
        });
    }

    copylandingPageLinkText() {
        this.copyToClipboard('landingPage');
    }
    
    copylandingPageQRCodeText() {
        this.copyToClipboard('qrCode');
    }
    
    getTextCopiedValue(value : string): string {
        return this.landingPageLink.find(c => c.key === value)?.text ?? '';
    }

    copyToClipboard(key: string) {
        const link = this.landingPageLink.find(c => c.key === key)?.value;
        if (link) {
            navigator.clipboard.writeText(link);
            this.messageService.add({
                severity: 'success',
                summary: 'Successful',
                detail: `You copied: ${this.landingPageLink.find(c => c.key === key)?.text}`,
                life: 2000,
            });
        } else {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: `Failed to find a link for key: ${key}`,
                life: 2000,
            });
        }
    } 

    cloneTemplate() {
        const formData = new FormData();
        formData.append('Url', this.urlToClone);
        this.messageService.add({
            severity: 'warn',
            summary: 'Successful',
            detail: 'Processing your request. This might take a few seconds.',
            life: 2000,
        });
        this.apiService.cloneTemplate(formData).subscribe({
            next: (r) => {
                this.cloneDialog = false;
                this.addForm.patchValue({
                    landingPageContentHtml: r.data,
                });
                this.urlToClone = '';
                this.messageService.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Cloned Done Successfully',
                    life: 2000,
                });
            },
            error: (e) => { },
        });
    }
    hasPermission(controlKey: string): boolean {
        return this.pagePermessions.some((p) => p.controlKey === controlKey);
    }
    ngOnDestroy(): void {
        this.unsubscribe.forEach((u) => {
            u.unsubscribe();
        });
    }
}
