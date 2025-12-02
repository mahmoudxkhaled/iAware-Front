import { Component, OnDestroy, OnInit } from '@angular/core';
import { Table } from 'primeng/table';
import { EmailDomainService } from '../../services/email-domain.service';
import { IPhishingDomain } from '../../models/IPhishingDomain';
import { Subscription } from 'rxjs';
import { InputSwitchChangeEvent } from 'primeng/inputswitch';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IAspNetPageItemModel } from 'src/app/modules/page-management/models/IAspNetPageItemModel';
import { PermessionsService } from 'src/app/core/Services/permessions.service';
import { constants } from 'src/app/core/constatnts/constatnts';
import { MenuItem, MessageService } from 'primeng/api';
import { TranslationService } from 'src/app/core/Services/translation.service';
import { TableLoadingService } from 'src/app/core/Services/table-loading.service';
import { IPaginationModel } from 'src/app/core/Dtos/IPaginationModel';
@Component({
    selector: 'app-email-domains-listing',
    templateUrl: './email-domains-listing.component.html',
    styleUrl: './email-domains-listing.component.scss',
})
export class EmailDomainsListingComponent implements OnInit, OnDestroy {
    tableLoadingSpinner: boolean = true;

    domains: IPhishingDomain[] = [];
    pagePermessions: IAspNetPageItemModel[] = [];
    actions = constants.pageActions;
    unsubscribe: Subscription[] = [];
    menuItems: MenuItem[] = [];
    deleteDialog: boolean = false;
    editeDialog: boolean = false;
    activationDialog: boolean = false;
    addDialog: boolean = false;
    isLoading: boolean = false;
    domainAddForm!: FormGroup;
    domainEditForm!: FormGroup;
    currentSelected: IPhishingDomain = {
        id: '',
        domainName: '',
        isActive: false,
        phishingDomainEmailsCount: 0,
        phishingDomainEmails: [],
    };
    toggleControls: { [key: string]: FormControl } = {};

    totalRecords: number = 0;
    pagination: IPaginationModel = {
        page: 0,
        size: 10,
        searchQuery: '',
    }
    constructor(
        private apiService: EmailDomainService,
        private permessionService: PermessionsService,
        private messageService: MessageService,
        private translate: TranslationService,

        private tableLoadingService: TableLoadingService
    ) {
        this.pagePermessions = this.permessionService.getPagePermessions(constants.pages.emailDomains);
    }

    ngOnInit(): void {
        this.tableLoadingService.loading$.subscribe((isLoading) => {
            this.tableLoadingSpinner = isLoading;
        });

        this.initiateAddForm();
        this.assigneMenueItems();
        this.initiateEditeForm();
    }

    assigneCurrentSelect(domian: IPhishingDomain) {
        this.currentSelected = domian;
    }

    assigneMenueItems() {
        
        this.menuItems = [];
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
        this.menuItems = [];
        if (this.hasPermission(this.actions.edit)) {
            this.menuItems.push(editBtn);
        }
        if (this.hasPermission(this.actions.delete)) {
            this.menuItems.push(deleteBtn);
        }
    }

    onLazyLoad(event: any) {
        this.pagination.page = event.first / event.rows;
        this.pagination.size = event.rows;
        this.pagination.searchQuery = event.globalFilter || '';
        this.loadDomains();
    }

    loadDomains() {
        this.tableLoadingService.show();
        const sub = this.apiService.getPhishingDomains(this.pagination).subscribe({
            next: (res) => {
                this.domains = res.data;
                this.totalRecords = res.totalRecords;
                this.domains.forEach(domain => {
                    this.toggleControls[domain.id!] = new FormControl(domain.isActive);
                });
                this.tableLoadingService.hide();
            },
            error: (err) => {},
        });
        this.unsubscribe.push(sub);
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    navigateToCreate() {
        this.addDialog = true;
    }

    openEditDialog(domain: IPhishingDomain) {
        this.editeDialog = true;
        this.currentSelected = domain;
        this.domainEditForm.patchValue({
            domainNameToEdit: this.currentSelected.domainName,
        });
    }

    openDeleteDialog(domain: IPhishingDomain) {
        this.deleteDialog = true;
        this.currentSelected = domain;
    }

    openActivationDialog(domain: IPhishingDomain, event: InputSwitchChangeEvent) {
        this.activationDialog = true;
        this.currentSelected = domain;
    }

    onCancelActivationDialog(){
        this.activationDialog = false;
        this.toggleControls[this.currentSelected.id!].setValue(this.currentSelected.isActive);
    }

    hideDialog() {
        this.editeDialog = false;
        this.addDialog = false;
    }

    initiateAddForm() {
        this.domainAddForm = new FormGroup({
            domainNameToAdd: new FormControl<string>('', [Validators.required]),
        });
    }

    initiateEditeForm() {
        this.domainEditForm = new FormGroup({
            domainNameToEdit: new FormControl<string>('', [Validators.required]),
        });
    }

    onSubmit() {
        if (this.domainAddForm.valid) {
            const data = {
                domainName: this.domainAddForm.value.domainNameToAdd,
            };
            this.apiService.addDomain(data).subscribe({
                next: (res) => {
                    this.loadDomains();
                    this.addDialog = false;
                    this.domainAddForm.reset();
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'domain added successfully',
                    });
                },
                error: (error) => {},
            });
        }
    }

    edit() {
        if (this.domainEditForm.valid) {
            const data = {
                id: this.currentSelected.id,
                domainName: this.domainEditForm.value.domainNameToEdit,
            };
            const x = this.apiService.editDomain(data).subscribe({
                next: (res) => {
                    this.loadDomains();
                    this.hideDialog();
                    this.domainEditForm.reset();
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'domain updated successfully',
                    });
                },
                error: (error) => {},
            });
            this.unsubscribe.push(x);
        }
    }

    delete() {
        const x = this.apiService.deleteDomain(this.currentSelected.id!).subscribe({
            next: (res) => {
                this.loadDomains();
                this.deleteDialog = false;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'domain deleted successfully',
                    life: 3000,
                });
            },
            error: (error) => {},
        });
        this.unsubscribe.push(x);
    }

    activation(value: boolean) {
        if (value) {
            const x = this.apiService.activateDomain(this.currentSelected.id!).subscribe({
                next: (res) => {
                    this.loadDomains();
                    this.activationDialog = false;
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'domain activated successfully',
                        life: 3000,
                    });
                },
                error: (error) => {},
            });
            this.unsubscribe.push(x);
        } else {
            const x = this.apiService.deactivateDomain(this.currentSelected.id!).subscribe({
                next: (res) => {
                    this.loadDomains();
                    this.activationDialog = false;
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'domain deactivated successfully',
                        life: 3000,
                    });
                },
                error: (error) => {},
            });
            this.unsubscribe.push(x);
        }
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
