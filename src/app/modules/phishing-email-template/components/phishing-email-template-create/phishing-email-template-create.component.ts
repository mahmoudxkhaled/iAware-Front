import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Toolbar } from 'ngx-editor';
import { ILanguageModel } from 'src/app/modules/language/models/ILanguageModel';
import { PhishingEmailTemplateService } from '../../services/phishing-email-template.service';
import { PhishingCategoryService } from 'src/app/modules/phishing-category/services/phishing-category.service';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { Guid } from 'guid-ts';
import { CheckboxChangeEvent } from 'primeng/checkbox';
import { TagesService } from 'src/app/modules/tages/services/tages.service';
import { ITagModel } from 'src/app/modules/tages/models/ITagModel';
import { EmailDomainService } from 'src/app/modules/phishing-email-domains/services/email-domain.service';
import { DropdownListDataSourceService } from 'src/app/core/Services/dropdown-list-data-source.service';
import { Subscription } from 'rxjs';
declare var $: any;

@Component({
    selector: 'app-phishing-email-template-create',
    templateUrl: './phishing-email-template-create.component.html',
    styleUrl: './phishing-email-template-create.component.scss',
})
export class PhishingEmailTemplateCreateComponent implements OnInit, OnDestroy {
    landingPageLink = [
        { key: 'landingPage', value: 'http://{LandingPageLink}', text: "Landing Page Link (URL)" },
        { key: 'qrCode', value: '{QRCode}', text: "Landing Page QrCode" }
    ];
    landingPageInstruction = `Use ${this.landingPageLink.find(c => c.key === 'landingPage')?.value} as a variable to replace it with Landing Page Link, please don't repeat variable name on your content`;
    toolbar: Toolbar = [
        ['bold', 'italic'],
        ['underline', 'strike'],
        ['code', 'blockquote'],
        ['ordered_list', 'bullet_list'],
        [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
        ['link', 'image'],
        ['text_color', 'background_color'],
        ['align_left', 'align_center', 'align_right', 'align_justify'],
    ];
    form: FormGroup;
    emailImage: File[] = [];
    defaultLanguage: ILanguageModel[] = [];
    subscriptions: Subscription[] = [];
    categories: any[] = [];
    domains: any[] = [];
    emailImageToAdd: string = '../../../../../assets/media/upload-photo.jpg';
    urlToClone: string = '';
    selectedImageToAdd: File;
    inputsToCheck: any[] = [];
    selectedInputs: any[] = [];
    isConfirmed: boolean = false;
    cloneDialog: boolean = false;

    events: any[] = [
        { code: 'abort', value: 'abort' },
        { code: 'autocomplete', value: 'autocomplete' },
        { code: 'autocompleteerror', value: 'autocompleteerror' },
        { code: 'blur', value: 'blur' },
        { code: 'cancel', value: 'cancel' },
        { code: 'canplay', value: 'canplay' },
        { code: 'canplaythrough', value: 'canplaythrough' },
        { code: 'change', value: 'change' },
        { code: 'click', value: 'click' },
        { code: 'close', value: 'close' },
        { code: 'contextmenu', value: 'contextmenu' },
        { code: 'copy', value: 'copy' },
        { code: 'cuechange', value: 'cuechange' },
        { code: 'cut', value: 'cut' },
        { code: 'dblclick', value: 'dblclick' },
        { code: 'drag', value: 'drag' },
        { code: 'dragend', value: 'dragend' },
        { code: 'dragenter', value: 'dragenter' },
        { code: 'dragleave', value: 'dragleave' },
        { code: 'dragover', value: 'dragover' },
        { code: 'dragstart', value: 'dragstart' },
        { code: 'drop', value: 'drop' },
        { code: 'durationchange', value: 'durationchange' },
        { code: 'emptied', value: 'emptied' },
        { code: 'ended', value: 'ended' },
        { code: 'error', value: 'error' },
        { code: 'focus', value: 'focus' },
        { code: 'gotpointercapture', value: 'gotpointercapture' },
        { code: 'input', value: 'input' },
        { code: 'invalid', value: 'invalid' },
        { code: 'keydown', value: 'keydown' },
        { code: 'keypress', value: 'keypress' },
        { code: 'keyup', value: 'keyup' },
        { code: 'load', value: 'load' },
        { code: 'loadeddata', value: 'loadeddata' },
        { code: 'loadedmetadata', value: 'loadedmetadata' },
        { code: 'loadend', value: 'loadend' },
        { code: 'loadstart', value: 'loadstart' },
        { code: 'lostpointercapture', value: 'lostpointercapture' },
        { code: 'mousedown', value: 'mousedown' },
        { code: 'mouseenter', value: 'mouseenter' },
        { code: 'mouseleave', value: 'mouseleave' },
        { code: 'mousemove', value: 'mousemove' },
        { code: 'mouseout', value: 'mouseout' },
        { code: 'mouseover', value: 'mouseover' },
        { code: 'mouseup', value: 'mouseup' },
        { code: 'paste', value: 'paste' },
        { code: 'pause', value: 'pause' },
        { code: 'play', value: 'play' },
        { code: 'playing', value: 'playing' },
        { code: 'pointercancel', value: 'pointercancel' },
        { code: 'pointerdown', value: 'pointerdown' },
        { code: 'pointerenter', value: 'pointerenter' },
        { code: 'pointerleave', value: 'pointerleave' },
        { code: 'pointermove', value: 'pointermove' },
        { code: 'pointerout', value: 'pointerout' },
        { code: 'pointerover', value: 'pointerover' },
        { code: 'pointerup', value: 'pointerup' },
        { code: 'progress', value: 'progress' },
        { code: 'ratechange', value: 'ratechange' },
        { code: 'reset', value: 'reset' },
        { code: 'resize', value: 'resize' },
        { code: 'scroll', value: 'scroll' },
        { code: 'search', value: 'search' },
        { code: 'seeked', value: 'seeked' },
        { code: 'seeking', value: 'seeking' },
        { code: 'select', value: 'select' },
        { code: 'selectstart', value: 'selectstart' },
        { code: 'stalled', value: 'stalled' },
        { code: 'submit', value: 'submit' },
        { code: 'suspend', value: 'suspend' },
        { code: 'timeupdate', value: 'timeupdate' },
        { code: 'toggle', value: 'toggle' },
        { code: 'volumechange', value: 'volumechange' },
        { code: 'waiting', value: 'waiting' },
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

    tages: ITagModel[] = [];
    inputChecklistDialog: boolean = false;

    constructor(
        private router: Router,
        private fb: FormBuilder,
        private ref: ChangeDetectorRef,
        private tagesAPIService: TagesService,
        private messageService: MessageService,
        private apiService: PhishingEmailTemplateService,
        private dropdownListDataSourceService: DropdownListDataSourceService,
    ) {
        this.initiateForm();
    }

    ngOnInit(): void {
        this.getDefaultLanguage();
        this.loadPhishingDomains();
        this.loadPhishingCategories()
        this.fetchAllTages();
        this.ref.detectChanges();
    }

    fetchAllTages() {
        this.tagesAPIService.getAllTages().subscribe({
            next: (res) => {
                this.tages = res.data?.filter((t: ITagModel) => t.phishingAllowed);
            },
            error: (error) => {
                //this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message });
            }
        })
    }

    loadPhishingCategories() {
        const sub = this.dropdownListDataSourceService.getPhishingCategories().subscribe((res) => {
            this.categories = res.data;
        });
        this.subscriptions.push(sub);
    }

    loadPhishingDomains() {

        const sub = this.dropdownListDataSourceService.getPhishingDomains().subscribe((c) => {
            this.domains = c.data;
        });
        this.subscriptions.push(sub);
    }

    getDefaultLanguage() {
        this.apiService.getDefaultLanguage().subscribe({
            next: (res) => {
                this.defaultLanguage = [res.data];
            },
            error: (err) => { },
        });
    }

    initiateForm() {
        this.form = this.fb.group({
            emailName: ['', [Validators.required]],
            emailImage: [''],
            description: ['', [Validators.required]],
            emailInstruction: [''],
            phishingEmailSubject: [''],
            phishingEmailContent: [''],
            phishingEmailSuccessMessageTitle: [''],
            phishingEmailSuccessMessagePageHtml: [''],
            landingPageTitle: [''],
            phishingEmailTemplateTages: [[]],
            landingPageDescription: [''],
            landingPageContentHtml: [''],
            languageId: ['', [Validators.required]],
            phishingCategoryId: ['', [Validators.required]],
            isQrCodeChecked: [false],
            phishingDomainId: ['', [Validators.required]],
            phishingLandingPageInputs: this.fb.array([this.createPhishingLandingPageInputGroup()]),
        });
    }

    addPhishingEmailTemplate() {
        if (!this.isConfirmed) {
            this.showChecklist();
            return;
        }

        const formData = this.createFormData();

        const sub = this.apiService.addPhishingEmailTemplate(formData).subscribe({
            next: (r) => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Phishing Template Created',
                    life: 3000,
                });
                this.selectedInputs = [];

                setTimeout(() => {
                    this.router.navigate(['/phishing-templates']);
                }, 1000);
            },
            error: (e) => { },
        });
        this.subscriptions.push(sub);
    }

    onChange(event: Event) {
        event.preventDefault();
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length) {
            this.emailImage = Array.from(input.files);
            this.form.patchValue({
                emailImage: this.emailImage[0],
            });
        }
    }

    get phishingLandingPageInputs(): FormArray {
        return this.form.get('phishingLandingPageInputs') as FormArray;
    }
    get phishingLandingPageInpuValues(): any {
        return this.form.get('phishingLandingPageInputs')?.value;
    }

    addPhishingLandingPageInput() {
        this.phishingLandingPageInputs.push(this.createPhishingLandingPageInputGroup());
    }

    createPhishingLandingPageInputGroup(): FormGroup {
        return this.fb.group({
            phishingLandingPageInputKey: [Guid.newGuid().toString()],
            phishingLandingPageInputType: [''],
            phishingLandingPageInputTitle: [''],
            phishingLandingPageInputEvent: [''],
        });
    }

    removePhishingLandingPageInput(index: number) {
        if (index !== 0) {
            this.phishingLandingPageInputs.removeAt(index);
        }
    }

    createFormData(): FormData {
        const formData = new FormData();

        // Append form data fields
        formData.append('EmailName', this.form.value.emailName);
        formData.append('PhishingDomainId', this.form.value.phishingDomainId);
        formData.append('PhishingCategoryId', this.form.value.phishingCategoryId);
        formData.append('PhishingEmailImageUrl', this.selectedImageToAdd);
        formData.append('LanguageId', this.form.value.languageId);
        formData.append('Description', this.form.value.description);
        formData.append('PhishingEmailInstructionHtml', this.form.value.emailInstruction);
        formData.append('PhishingEmailSubject', this.form.value.phishingEmailSubject);
        formData.append('PhishingEmailContentHtml', this.form.value.phishingEmailContent);
        formData.append('PhishingLandingPageTitle', this.form.value.landingPageTitle);
        formData.append('PhishingLandingPageDescription', this.form.value.landingPageDescription);
        formData.append('PhishingEmailSuccessMessageTitle', this.form.value.phishingEmailSuccessMessageTitle);
        formData.append('IsQrCodeChecked', this.form.value.isQrCodeChecked);
        const tagges = this.form.value.phishingEmailTemplateTages;
        if (tagges && tagges.length > 0) {
            tagges.forEach((tag: any, index: number) => {
                formData.append(`PhishingEmailTemplateTages[${index}]`, tag);
            });
        }

        const parser = new DOMParser();
        const doc = parser.parseFromString(this.form.value.landingPageContentHtml, 'text/html');
        const inputs = doc.querySelectorAll('input,button');

        const eventMapping: { [key: string]: string } = {
            checkbox: 'change',
            radio: 'change',
            select: 'change',
            text: 'change',
            button: 'click',
            submit: 'click',
        };

        let inputIndex = 0;
        let buttonCounter = 0; // Counter for buttons

        inputs.forEach((input, index) => {
            const type = input.tagName.toLowerCase() === 'button' ? 'button' : input.getAttribute('type') || 'text';
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

                // Append the matching input data to FormData
                formData.append(`PhishingEmailTemplateLanguageKeys[${inputIndex}].PhishingLandingPageInputKey`, key);
                formData.append(
                    `PhishingEmailTemplateLanguageKeys[${inputIndex}].PhishingLandingPageInputType`,
                    type.toLowerCase()
                );
                formData.append(
                    `PhishingEmailTemplateLanguageKeys[${inputIndex}].PhishingLandingPageInputTitle`,
                    title
                );
                formData.append(
                    `PhishingEmailTemplateLanguageKeys[${inputIndex}].PhishingLandingPageInputEvent`,
                    event.toLowerCase()
                );
                inputIndex++;
            } else {
                console.warn(`No match found for title: ${title} | Type: ${type}`);
            }
        });

        const updatedHtml = doc.documentElement.outerHTML;
        formData.append('PhishingLandingPageContentHtml', updatedHtml);

        return formData;
    }

    showChecklist() {
        const parser = new DOMParser();
        const doc = parser.parseFromString(this.form.value.landingPageContentHtml, 'text/html');
        const inputs = doc.querySelectorAll('input, button');

        let buttonCounter = 0; // Counter for numbering buttons

        this.inputsToCheck = Array.from(inputs)
            .filter((input: any) => {
                const inputType = input.getAttribute('type') || 'text';
                return inputType !== 'hidden'; // Exclude hidden inputs
            })
            .map((input: any, index) => {
                const type = input.tagName.toLowerCase() === 'button' ? 'button' : input.getAttribute('type') || 'text';
                if (type === 'button') {
                    buttonCounter++;
                }
                const title = this.generateTitle(input, type, index, buttonCounter);

                return {
                    key: Guid.newGuid().toString(),
                    type: type,
                    title: title,
                };
            });

        this.isConfirmed = false;
        this.inputChecklistDialog = true;
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

    confirmChecklist() {
        this.isConfirmed = true;
        this.inputChecklistDialog = false;
        this.addPhishingEmailTemplate();
    }

    cancelChecklist() {
        this.selectedInputs = [];
        this.inputChecklistDialog = false;
        this.isConfirmed = false;
    }

    onImageSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length) {
            this.selectedImageToAdd = input.files[0];

            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.emailImageToAdd = e.target.result;
                this.ref.detectChanges();
            };
            reader.readAsDataURL(this.selectedImageToAdd);
        }
    }

    onUploadImageClick() {
        const fileInput = document.getElementById('emailImage') as HTMLInputElement;
        fileInput.click();
    }

    getCopyText(data: any): string {
        return `data-${data.phishingLandingPageInputTitle}="${data.phishingLandingPageInputKey}"`;
    }

    copylandingPageLinkText() {
        this.copyToClipboard('landingPage');
    }

    copylandingPageQRCodeText() {
        this.copyToClipboard('qrCode');
    }

    getTextCopiedValue(value: string): string {
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

    cloneTemplate() {
        const formData = new FormData();
        formData.append('Url', this.urlToClone);
        this.messageService.add({
            severity: 'warn',
            summary: 'Successful',
            detail: 'Processing your request. This might take a few seconds.',
            life: 2000,
        });
        const sub = this.apiService.cloneTemplate(formData).subscribe({
            next: (r) => {
                this.cloneDialog = false;
                this.form.patchValue({
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
        this.subscriptions.push(sub);
    }

    openCloningDialog() {
        this.cloneDialog = true
        this.inputChecklistDialog = false;
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }
}