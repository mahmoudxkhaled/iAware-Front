import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { SystemEmailService } from '../../services/system-email.service';
import { ISystemEmail } from '../../models/ISystemEmail';
import { Table } from 'primeng/table';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslationService } from 'src/app/core/Services/translation.service';
import { MenuItem, MessageService } from 'primeng/api';
import { TableLoadingService } from 'src/app/core/Services/table-loading.service';
import { IPaginationModel } from 'src/app/core/Dtos/IPaginationModel';

@Component({
    selector: 'app-system-emails-listing',
    templateUrl: './system-emails-listing.component.html',
    styleUrl: './system-emails-listing.component.scss',
})
export class SystemEmailListingComponent implements OnInit, OnDestroy {
    tableLoadingSpinner: boolean = true;
    unsubscribe: Subscription[] = [];
    deleteDialog: boolean = false;
    editeDialog: boolean = false;
    addDialog: boolean = false;
    activationDialog: boolean = false;
    domainEmails: ISystemEmail[] = [];
    currentSelected: ISystemEmail = {
        id: '',
        senderUserName: '',
        senderDisplayName: '',
        senderEmail: '',
        senderEmailPassword: '',
        outgoingServer: '',
        outgoingServerPort: 0,
        enableSSL: false,
    };
    addForm: FormGroup;
    editForm: FormGroup;
    menuItems: MenuItem[] = [];
    totalRecords: number = 0;
    pagination: IPaginationModel = {
        page: 1,
        size: 10,
        searchQuery: '',
    }

    constructor(
        private apiService: SystemEmailService,
        private fb: FormBuilder,
        private messageService: MessageService,
        private translate: TranslationService,
        private tableLoadingService: TableLoadingService
    ) { }

    ngOnInit(): void {
        this.tableLoadingService.loading$.subscribe((isLoading) => {
            this.tableLoadingSpinner = isLoading;
        });
        this.assigneMenueItems();    
        this.initiateEditForm();
    }

    onLazyLoad(event: any) {
        this.pagination.page = event.first / event.rows;
        this.pagination.size = event.rows;
        this.pagination.searchQuery = event.globalFilter || '';
        this.loadAllSystemEmails();
    }

    assigneMenueItems() {
        this.menuItems = [
            {
                label: this.translate.getInstant('shared.actions.edit'),
                icon: 'pi pi-fw pi-pencil',
                command: () => this.openEditDialog(this.currentSelected),
            },
            {
                label: this.translate.getInstant('shared.actions.delete'),
                icon: 'pi pi-fw pi-trash',
                command: () => this.openDeleteDialog(this.currentSelected),
            },
        ];
    }
    loadAllSystemEmails() {
        this.tableLoadingService.show();
        const sub = this.apiService.getSystemEmails(this.pagination).subscribe({
            next: (res) => {
                this.domainEmails = res.data;
                this.totalRecords = res.totalRecords;
                this.initiateAddForm();
                this.tableLoadingService.hide();
            },
            error: (err) => { },
        });
        this.unsubscribe.push(sub);
    }

    assigneCurrentSelect(email: ISystemEmail) {
        this.currentSelected = email;
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    openEditDialog(model: ISystemEmail) {
        this.editeDialog = true;
        this.currentSelected = model;
        this.editForm.patchValue({
            senderUserName: model.senderUserName,
            senderDisplayName: model.senderDisplayName,
            senderEmail: model.senderEmail,
            senderEmailPassword: model.senderEmailPassword,
            outgoingServer: model.outgoingServer,
            outgoingServerPort: model.outgoingServerPort,
            enableSSL: model.enableSSL,
        });
    }

    openDeleteDialog(model: ISystemEmail) {
        this.deleteDialog = true;
        this.currentSelected = model;
    }

    hideAddDialog() {
        this.addDialog = false;
    }

    hideEditDialog() {
        this.editeDialog = false;
    }

    openAddDialog() {
        this.addDialog = true;
        this.initiaiteModel();
    }

    initiaiteModel() {
        this.currentSelected = {
            id: '',
            senderUserName: '',
            senderDisplayName: '',
            senderEmail: '',
            senderEmailPassword: '',
            outgoingServer: '',
            outgoingServerPort: 0,
            enableSSL: false,
        };
    }

    initiateAddForm() {
        this.addForm = this.fb.group({
            senderUserName: ['', Validators.required],
            senderDisplayName: ['', Validators.required],
            senderEmail: ['', [Validators.required]],
            senderEmailPassword: ['', Validators.required],
            outgoingServer: ['', Validators.required],
            outgoingServerPort: [0, Validators.required],
            enableSSL: [true],
        });
    }

    initiateEditForm() {
        this.editForm = this.fb.group({
            senderUserName: ['', Validators.required],
            senderDisplayName: ['', Validators.required],
            senderEmail: ['', [Validators.required, Validators.email]],
            senderEmailPassword: ['', Validators.required],
            outgoingServer: ['', Validators.required],
            outgoingServerPort: [0, Validators.required],
            enableSSL: [false],
        });
    }

    delete() {
        const sub = this.apiService.deleteSystemEmail(this.currentSelected.id!).subscribe({
            next: (res) => {
                this.loadAllSystemEmails();
                this.deleteDialog = false;
                this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'System Email Deleted', life: 3000 })
            },
            error: (error) => { },
        });
        this.unsubscribe.push(sub);
    }

    add() {
        if (this.addForm.valid) {
            const data = {
                senderUserName: this.addForm.value.senderUserName,
                senderDisplayName: this.addForm.value.senderDisplayName,
                senderEmail: this.addForm.value.senderEmail,
                senderEmailPassword: this.addForm.value.senderEmailPassword,
                outgoingServer: this.addForm.value.outgoingServer,
                outgoingServerPort: this.addForm.value.outgoingServerPort,
                enableSSL: this.addForm.value.enableSSL,
            };
            const sub = this.apiService.addSystemEmail(data).subscribe({
                next: (res) => {
                    this.addDialog = false;
                    this.loadAllSystemEmails();
                },
                error: (error) => { },
            });
            this.unsubscribe.push(sub);
        } else {
            console.error('Form is invalid');
        }
    }
    edit() {
        if (this.editForm.invalid) {
            return;
        }
        const data = {
            id: this.currentSelected.id,
            senderUserName: this.editForm.value.senderUserName,
            senderDisplayName: this.editForm.value.senderDisplayName,
            senderEmail: this.editForm.value.senderEmail,
            senderEmailPassword: this.editForm.value.senderEmailPassword,
            outgoingServer: this.editForm.value.outgoingServer,
            enableSSL: this.editForm.value.enableSSL,
            outgoingServerPort: this.editForm.value.outgoingServerPort,
        };
        const sub = this.apiService.editSystemEmail(data).subscribe({
            next: () => {
                this.editeDialog = false;
                this.loadAllSystemEmails();
            },
            error: (error) => { },
        });
        this.unsubscribe.push(sub);
    }

    ngOnDestroy(): void {
        this.unsubscribe.forEach((u) => {
            u.unsubscribe();
        });
    }
}