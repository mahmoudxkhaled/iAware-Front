import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { SupportCategoryService } from 'src/app/modules/support/services/support-category.service';
import { SupportNewTicketService } from '../app-services/supportNewTicket.service';
import { LocalStorageService } from 'src/app/core/Services/local-storage.service';
import { SupportMyTicketsService } from '../app-services/support-my-tickets.service';
import { DataView } from 'primeng/dataview';
import { DropdownChangeEvent } from 'primeng/dropdown';
import { IHelpCategoryTicketModel } from '../api/IHelpCategoryTicketModel';
import { PermessionsService } from 'src/app/core/Services/permessions.service';
import { IAspNetPageItemModel } from 'src/app/modules/page-management/models/IAspNetPageItemModel';
import { constants } from 'src/app/core/constatnts/constatnts';
import { NotificationHubService } from 'src/app/core/Services/NotificationHub.service';
import { ChatHubService } from 'src/app/core/Services/ChatHub.service';

@Component({
    selector: 'app-support-tabmenu',
    templateUrl: './support-tabmenu.component.html',
    styleUrl: './support-tabmenu.component.scss',
})


export class SupportTabmenuComponent implements OnInit {
    pagePermessions: IAspNetPageItemModel[] = [];
    actions = constants.pageActions;
    unsubscribe: Subscription[] = [];
    form: FormGroup;
    formForwardMyTicket: FormGroup;
    formForwardAllTicket: FormGroup;
    subjects: any[] = [];
    Categories: any[] = [];
    myTickets: any[] = [];
    allTickets: any[] = [];
    allCategories: any[] = [];
    currentMyTicketSelected: IHelpCategoryTicketModel;
    currentAllTicketSelected: IHelpCategoryTicketModel;
    selectedFile: File;
    fileUploderText: string;
    visible: boolean = false;
    visibleMyTicketChatt: boolean = false;
    visibleAllTicketChatt: boolean = false;
    isMyTicketsSelected: boolean = false;
    isAllTicketsSelected: boolean = false;
    isNewTicketSelected: boolean = true;
    isCustomSubject: boolean = false;
    forwardAllDialog: boolean = false;
    forwardMyDialog: boolean = false;
    unreadCount: number = 0;
    forwardTicketHeader: string = '';

    // ... existing properties ...
    isMyTicketsLoading: boolean = false;
    isAllTicketsLoading: boolean = false;

    get f() {
        return this.form.controls;
    }

    constructor(
        private messageService: MessageService,
        private deptService: SupportCategoryService,
        private permessionService: PermessionsService,
        private apiService: SupportNewTicketService,
        private localStorageService: LocalStorageService,
        private ref: ChangeDetectorRef,
        private myTicketsService: SupportMyTicketsService,
        private chatHubService: ChatHubService
    ) {
        this.pagePermessions = this.permessionService.getPagePermessions(constants.pages.supportTapMenue);

        this.chatHubService._hubConnection.on('ReceiveNewTicket', (newTicket: IHelpCategoryTicketModel) => {
            this.handleIncomingAllNewTicket(newTicket);
        });
    }

    handleIncomingAllNewTicket(newTicket: IHelpCategoryTicketModel) {
        this.allTickets.push(newTicket);
        this.allTickets = [...this.allTickets, newTicket];
        if (!newTicket.isRead) {
            this.unreadCount++;
        }
        this.fetchAllTickets();
        this.ref.detectChanges();
    }

    ngOnInit(): void {
        this.initForm();
        this.initForwardMyForm();
        this.initForwardAllForm();
        this.fetchCategories();
        this.fetchMyTickets();
        this.fetchAllTickets();
    }

    fetchCategories() {
        const x = this.deptService.getAllCategoriesWithSubjects().subscribe({
            next: (data) => {
                this.Categories = data.data;
            },
            error: (err) => console.error(err),
        });
        this.unsubscribe.push(x);
    }

    onCategoriesChanges(event: DropdownChangeEvent) {
        const dept = this.Categories.find((c) => {
            return c.id == event.value;
        });
        this.subjects = dept?.helpCategorySubjects;
    }

    onSubjectDropdownChange(event: DropdownChangeEvent) {
        const subject = this.subjects.find((c) => {
            return c.id == event.value;
        });
        this.isCustomSubject = subject?.isCustomSubject;
    }

    fetchMyTickets() {
        this.isMyTicketsLoading = true;
        const x = this.myTicketsService.getMyTickets().subscribe({
            next: (data) => {
                this.myTickets = data.data;
                this.isMyTicketsLoading = false;
            },
            error: (err) => {
                console.error(err);
                // this.isMyTicketsLoading = false;
            },
        });
        this.unsubscribe.push(x);
    }

    fetchAllTickets() {
        this.isAllTicketsLoading = true;
        const x = this.myTicketsService.getAllTickets().subscribe({
            next: (data) => {
                this.allTickets = data.data;
                this.isAllTicketsLoading = false;
                this.updateUnreadCount();
            },
            error: (err) => {
                console.error(err);
                // this.isAllTicketsLoading = false;
            },
        });
        this.unsubscribe.push(x);
    }

    updateUnreadCount() {
        this.unreadCount = this.allTickets.filter((ticket) => !ticket.isRead).length ?? 0;
    }

    readTicket(id: string) {
        const x = this.myTicketsService.readHelpDepartmentTicket(id).subscribe(() => {
            this.allTickets = this.allTickets.map((ticket) => {
                if (ticket.id === id) {
                    ticket.isRead = true;
                }
                return ticket;
            });

            this.updateUnreadCount();
        });
        this.unsubscribe.push(x);
    }

    initForm() {
        this.form = new FormGroup({
            helpCategoryId: new FormControl<string>('', [Validators.required]),
            subjectId: new FormControl<string>('', [Validators.required]),
            customSubject: new FormControl<string>(''),
            requestDetails: new FormControl<string>('', [Validators.required]),
            file: new FormControl<string>(''),
        });
    }

    initForwardMyForm() {
        this.formForwardMyTicket = new FormGroup({
            helpCategoryId: new FormControl<string>('', [Validators.required]),
            helpCategoryTicketId: new FormControl<string>('', [Validators.required]),
        });
    }

    initForwardAllForm() {
        this.formForwardAllTicket = new FormGroup({
            helpCategoryId: new FormControl<string>('', [Validators.required]),
            helpCategoryTicketId: new FormControl<string>('', [Validators.required]),
        });
    }
    createFormData(): FormData {
        const formData = new FormData();
        const userData = this.localStorageService.getItem('userData');

        formData.append('HelpCategoryId', this.form.value.helpCategoryId);
        formData.append('CustomSubject', this.form.value.customSubject);
        formData.append('RequestDetail', this.form.value.requestDetails);
        formData.append('LanguageId', userData?.language);
        formData.append('HelpCategorySubjectId', this.form.value.subjectId);

        if (this.selectedFile) {
            formData.append('File', this.selectedFile);
        }
        return formData;
    }
    onSubmit() {
        const formData = this.createFormData();
        const x = this.apiService.addNewTicket(formData).subscribe({
            next: (data) => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Ticket Created Successfully',
                    detail: `your ticket created successfully Ticket No #${data.data.ticketNo}`,
                });
                this.fetchMyTickets();
                this.initForm();
                this.switchToMyTickets();

                this.chatHubService.sendNewTicket(data.data);
            },
            error: (err) => {

            },
        });
        this.unsubscribe.push(x);
    }

    onUploadFileClick() {
        const fileInput = document.getElementById('ticketFile') as HTMLInputElement;
        fileInput.click();
    }

    onFileSelected(event: any) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length) {
            this.selectedFile = input.files[0];
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.ref.detectChanges();
            };
            reader.readAsDataURL(this.selectedFile);
            this.fileUploderText = `${this.selectedFile.name} - ${this.selectedFile.size} bytes`;
        }
    }

    switchToMyTickets() {
        this.isNewTicketSelected = false;
        this.isMyTicketsSelected = true;
        this.isAllTicketsSelected = false;
    }

    onSupportClick() {
        this.visible = true;
    }

    myTicketsSelected(event: any) {
        this.isMyTicketsSelected = true;
        this.isAllTicketsSelected = false;
        this.isNewTicketSelected = false;
    }

    onGlobalFilter(table: DataView, event: Event) {
        table.filter((event.target as HTMLInputElement).value, 'contains');
    }

    onGlobalFilterII(table: DataView, event: Event) {
        table.filter((event.target as HTMLInputElement).value, 'contains');
    }

    currentMyTicketClicked(ticket: IHelpCategoryTicketModel) {
        this.visibleMyTicketChatt = true;
        this.currentMyTicketSelected = ticket;
        this.readTicket(ticket.id);
    }

    currentMyTicketClickedToForward(ticket: IHelpCategoryTicketModel) {
        this.forwardTicketHeader = `Forward Ticket #${ticket.ticketNo}`;
        this.forwardMyDialog = true;
        this.formForwardMyTicket.patchValue({
            helpCategoryTicketId: ticket.id,
        });
    }

    currentAllTicketClickedToForward(ticket: IHelpCategoryTicketModel) {
        this.forwardTicketHeader = `Forward Ticket #${ticket.ticketNo}`;
        this.forwardAllDialog = true;
        this.formForwardAllTicket.patchValue({
            helpCategoryTicketId: ticket.id,
        });
    }

    currentAllTicketClicked(ticket: IHelpCategoryTicketModel) {
        this.visibleAllTicketChatt = true;
        this.currentAllTicketSelected = ticket;
        this.readTicket(ticket.id);
    }

    onSubmitMyForward() {
        const x = this.apiService.forwardTicketToAnotherCategory(this.formForwardMyTicket.value).subscribe({
            next: (response) => {
                this.forwardMyDialog = false;
                this.fetchMyTickets();
                this.messageService.add({
                    severity: 'success',
                    summary: 'Ticket Forwared Successfully',
                    detail: `ticket with #${response.data.ticketNo} forwared successfully`,
                });
            },
            error: (err) => {

            },
        });
        this.unsubscribe.push(x);
    }

    onSubmitAllForward() {
        const x = this.apiService.forwardTicketToAnotherCategory(this.formForwardAllTicket.value).subscribe({
            next: (response) => {
                this.forwardAllDialog = false;
                this.fetchAllTickets();
                this.messageService.add({
                    severity: 'success',
                    summary: 'Ticket Forwared Successfully',
                    detail: `ticket with #${response.data.ticketNo} forwared successfully`,
                });
            },
            error: (err) => {

            },
        });
        this.unsubscribe.push(x);
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
