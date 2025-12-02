import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { EmailDomainService } from '../../services/email-domain.service';
import { ActivatedRoute } from '@angular/router';
import { IPhishingDomainEmail } from '../../models/IPhishingDomainEmail';
import { Table } from 'primeng/table';
import { IPhishingDomain } from '../../models/IPhishingDomain';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslationService } from 'src/app/core/Services/translation.service';
import { MenuItem, MessageService } from 'primeng/api';
import { TableLoadingService } from 'src/app/core/Services/table-loading.service';
import { IPaginationModel } from 'src/app/core/Dtos/IPaginationModel';

@Component({
    selector: 'app-email-domains-details',
    templateUrl: './email-domains-details.component.html',
    styleUrl: './email-domains-details.component.scss',
})
export class EmailDomainsDetailsComponent implements OnInit, OnDestroy {
    tableLoadingSpinner: boolean = true;

    unsubscribe: Subscription[] = [];
    deleteDialog: boolean = false;
    editeDialog: boolean = false;
    addDialog: boolean = false;
    activationDialog: boolean = false;
    phishingDomainId: string;
    currentDomain: IPhishingDomain = {
        domainName: '',
        id: '',
        isActive: false,
        phishingDomainEmailsCount: 0,
        phishingDomainEmails: [],
    };
    domainEmails: IPhishingDomainEmail[] = [];
    domainName = '';
    currentSelected: IPhishingDomainEmail = {
        id: '',
        senderUserName: '',
        senderDisplayName: '',
        senderEmail: '',
        senderEmailPassword: '',
        outgoingServer: '',
        outgoingServerPort: 0,
        enableSSL: false,
        phishingDomainId: '',
        phishingDomainName: '',
    };
    addForm: FormGroup;
    editForm: FormGroup;
    menuItems: MenuItem[] = [];
    subscriptions: Subscription[] = [];
    
    totalRecords: number = 0;
    pagination: IPaginationModel = {
        page: 0,
        size: 10,
        searchQuery: '',
    }

    constructor(
        private apiService: EmailDomainService,
        private route: ActivatedRoute,
        private fb: FormBuilder,
        private translate: TranslationService,
        private messageService: MessageService,
        private tableLoadingService: TableLoadingService
    ) {
        const sub = this.route.params.subscribe((params) => {
            this.phishingDomainId = params['id'];
        });
        this.unsubscribe.push(sub);
    }

    ngOnInit(): void {
        this.tableLoadingService.loading$.subscribe((isLoading) => {
            this.tableLoadingSpinner = isLoading;
        });
        this.assigneMenuItems();
        this.initiateEditForm();
    }

    assigneMenuItems() {
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

    onLazyLoad(event: any) {
        this.pagination.page = event.first / event.rows;
        this.pagination.size = event.rows;
        this.pagination.searchQuery = event.globalFilter || '';
        this.loadDomainEmails();
    }

    loadDomainEmails() {
        this.tableLoadingService.show();
        const sub = this.apiService.getDomainById(this.phishingDomainId, this.pagination).subscribe({
            next: (res) => {
                this.domainEmails = res.data;
                this.totalRecords = res.totalRecords;
                this.initiateAddForm();
                this.tableLoadingService.hide();
            },
            error: (err) => {},
        });
        this.unsubscribe.push(sub);
    }

    assigneCurrentSelect(email: IPhishingDomainEmail) {
        this.currentSelected = email;
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    openEditDialog(model: IPhishingDomainEmail) {
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

    openDeleteDialog(model: IPhishingDomainEmail) {
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
            phishingDomainId: '',
            phishingDomainName: '',
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
        const sub = this.apiService.deleteDomainEmail(this.currentSelected.id!).subscribe({
            next: (res) => {
                this.ngOnInit();
                this.deleteDialog = false;
                this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Email Domain Deleted', life: 3000 })
            },
            error: (error) => {},
        });
        this.unsubscribe.push(sub);
    }

    add() {
        if (this.addForm.valid) {
            const data = {
                senderUserName: this.addForm.value.senderUserName,
                senderDisplayName: this.addForm.value.senderDisplayName,
                senderEmail: `${this.addForm.value.senderEmail}${this.domainName}`,
                senderEmailPassword: this.addForm.value.senderEmailPassword,
                outgoingServer: this.addForm.value.outgoingServer,
                outgoingServerPort: this.addForm.value.outgoingServerPort,
                enableSSL: this.addForm.value.enableSSL,
                phishingDomainId: this.phishingDomainId,
            };
            const sub = this.apiService.addDomainEmail(data).subscribe({
                next: (res) => {
                    this.addDialog = false;
                    this.ngOnInit();
                    this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Email Domain Added', life: 3000 })
                },
                error: (error) => {},
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
            phishingDomainId: this.phishingDomainId,
        };
        const sub = this.apiService.editDomainEmail(data).subscribe({
            next: () => {
                this.editeDialog = false;
                this.ngOnInit();
                this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Email Domain Updated', life: 3000 })
            },
            error: (error) => {},
        });
        this.unsubscribe.push(sub);
    }

    ngOnDestroy(): void {
        this.unsubscribe.forEach((u) => {
            u.unsubscribe();
        });
    }
}