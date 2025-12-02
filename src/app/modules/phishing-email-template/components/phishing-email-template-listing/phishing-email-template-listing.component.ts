import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MenuItem, MessageService, SelectItem } from 'primeng/api';
import { DataView } from 'primeng/dataview';
import { PhishingEmailTemplateService } from '../../services/phishing-email-template.service';
import { Router } from '@angular/router';
import { IPhishingEmailTemplate } from '../../models/IPhishingEmailTemplate';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { IAspNetPageItemModel } from 'src/app/modules/page-management/models/IAspNetPageItemModel';
import { PermessionsService } from 'src/app/core/Services/permessions.service';
import { constants } from 'src/app/core/constatnts/constatnts';
import { TranslationService } from 'src/app/core/Services/translation.service';
import { TableLoadingService } from 'src/app/core/Services/table-loading.service';
import { UserService } from 'src/app/modules/user/services/user.service';
import { GetUser } from 'src/app/layout/app-menuProfile/app.menuprofile.component';
import { ITagModel } from 'src/app/modules/tages/models/ITagModel';
import { TagesService } from 'src/app/modules/tages/services/tages.service';
import { IPaginationModel } from 'src/app/core/Dtos/IPaginationModel';

@Component({
    selector: 'app-phishing-email-template-listing',
    templateUrl: './phishing-email-template-listing.component.html',
    styleUrl: './phishing-email-template-listing.component.scss',
})
export class PhishingEmailTemplateListingComponent implements OnInit, OnDestroy {
    tableLoadingSpinner: boolean = true;
    isIAwareTeamUser: boolean | null = null;
    user: GetUser;
    defaultPhishingTemplates: IPhishingEmailTemplate[];
    filteredDefaultPhishingTemplates: IPhishingEmailTemplate[];
    tenantPhishingTemplates: IPhishingEmailTemplate[];
    filteredTenantPhishingTemplates: IPhishingEmailTemplate[];
    pagePermessions: IAspNetPageItemModel[] = [];
    actions = constants.pageActions;
    sortOrder: number = 0;
    sortOptions: SelectItem[] = [];
    unsubscribe: Subscription[] = [];
    cardMenu: MenuItem[] = [];
    items: MenuItem[];
    sortField: string = '';
    addDialog: boolean;
    deleteDialog: boolean;
    editDialog: boolean;
    previewDialog: boolean;
    activationDialog: boolean;
    phishingTemplates: IPhishingEmailTemplate[] = [];
    currentSelected: IPhishingEmailTemplate = {
        id: '',
        emailName: '',
        phishingDomainId: '',
        phishingCategoryId: '',
        phishingEmailImageUrl: '',
        phishingEmailContentHtml: '',
        phishingEmailDescription: '',
        phishingEmailTemplateLanguageCount: 0,
        isActive: true,
        tagIds: [],
    };
    templateEditForm: FormGroup;
    defaultImageUrl: string = 'assets/images/trainingCategoryBannerImageUrl.jpg';

    ownerMenuItems: MenuItem[] = [];
    normalMenuItems: MenuItem[] = [];

    filteredPhishingTemplates: IPhishingEmailTemplate[] = []; // Filtered dataset
    allTags: ITagModel[] = []; // List of all tags

    defaultTotalRecords: number = 0;
    tenantTotalRecords: number = 0;
    defaultPagination: IPaginationModel = {
        page: 0,
        size: 9,
        searchQuery: ''
    }
    tenantPagination: IPaginationModel = {
        page: 0,
        size: 9,
        searchQuery: ''
    }

    constructor(
        private apiService: PhishingEmailTemplateService,
        private router: Router,
        private messageService: MessageService,
        private sanitizer: DomSanitizer,
        private permessionService: PermessionsService,
        private translate: TranslationService,
        private tableLoadingService: TableLoadingService,
        private userServ: UserService,
        private ref: ChangeDetectorRef,
        private tagApiService: TagesService
    ) {
        this.pagePermessions = this.permessionService.getPagePermessions(constants.pages.phishingEmailTemplates);
        this.getUserDetails();
    }

    ngOnInit(): void {
        this.tableLoadingService.loading$.subscribe((isLoading) => {
            this.tableLoadingSpinner = isLoading;
        });

        this.initiateEditForm();
        this.assigneMenueItems();
    }

    assigneMenueItems() {
        const editBtn = { label: 'Edit', icon: 'pi pi-fw pi-pencil', command: () => this.openEditDialog(this.currentSelected) };
        const deleteBtn = {
            label: this.translate.getInstant('shared.actions.delete'),
            icon: 'pi pi-fw pi-trash',
            command: () => this.openDeleteDialog(this.currentSelected),
        };

        this.ownerMenuItems = [];
        this.ownerMenuItems.push(editBtn);
        this.ownerMenuItems.push(deleteBtn);
        this.normalMenuItems = [];
        this.normalMenuItems.push(deleteBtn);
    }

    onLazyLoadDefaultTemplates(event: any) {
        this.defaultPagination.searchQuery = '';
        this.defaultPagination.page = event.first / event.rows;
        this.defaultPagination.size = event.rows;
        this.loadDefaultTemplates();
    }

    onLazyLoadTenantTemplates(event: any) {
        this.tenantPagination.searchQuery = '';
        this.tenantPagination.page = event.first / event.rows;
        this.tenantPagination.size = event.rows;
        this.loadTenantTemplates();
    }

    loadDefaultTemplates() {
        this.tableLoadingService.show();
        this.apiService.getDefaultPhishingAllTemplates(this.defaultPagination).subscribe({
            next: (res) => {
                this.defaultPhishingTemplates = res.data;
                this.filteredDefaultPhishingTemplates = this.defaultPhishingTemplates;
                this.defaultTotalRecords = res.totalRecords;
                this.tableLoadingService.hide();
            }
        });

    }

    loadTenantTemplates() {
        this.tableLoadingService.show();
        this.apiService.getTenantPhishingAllTemplates(this.tenantPagination).subscribe({
            next: (res) => {
                this.tenantPhishingTemplates = res.data;
                this.filteredTenantPhishingTemplates = this.tenantPhishingTemplates;
                this.tenantTotalRecords = res.totalRecords;
                this.tableLoadingService.hide();
            }
        })
    }
    
    loadTags() {
        this.tagApiService.getAllTages().subscribe((res) => {
            this.allTags = res.data?.filter((t: ITagModel) => t.phishingAllowed);
        });
    }

    onTagFilterChanged(selectedtagIds: string[]) {
        if (selectedtagIds.length > 0) {
            // Filter system templates based on selected tags
            const filteredDefaultTemplates = this.defaultPhishingTemplates.filter((template) => {
                const matches = template.tagIds.some((tagId) => selectedtagIds.includes(tagId));
                if (!matches) {
                    console.log('Excluded System Template:', template); // Log excluded templates
                }
                return matches; // Include templates that match the filter
            });

            // Filter tenant templates based on selected tags
            const filteredTenantTemplates = this.tenantPhishingTemplates.filter((template) => {
                const matches = template.tagIds.some((tagId) => selectedtagIds.includes(tagId));
                if (!matches) {
                    console.log('Excluded Tenant Template:', template); // Log excluded templates
                }
                return matches; // Include templates that match the filter
            });

            // Update filtered templates
            this.filteredDefaultPhishingTemplates = filteredDefaultTemplates;
            this.filteredTenantPhishingTemplates = filteredTenantTemplates;

        } else {
            this.filteredDefaultPhishingTemplates = this.defaultPhishingTemplates
            this.filteredTenantPhishingTemplates = this.tenantPhishingTemplates
        }
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

    assigneCurrentSelect(template: IPhishingEmailTemplate) {
        this.currentSelected = template;
    }

    onFilter(dv: DataView, event: Event) {
        dv.filter((event.target as HTMLInputElement).value);
    }

    createPhishingTemplate() {
        this.router.navigate(['/phishing-templates/create']);
    }

    openEditDialog(model: IPhishingEmailTemplate) {
        console.log(model);
        this.editDialog = true;
        this.loadTags();
        this.currentSelected = model;
        this.templateEditForm.patchValue({
            tages: this.currentSelected.tagIds
        });
    }

    openActivationDialog(model: IPhishingEmailTemplate) {
        this.activationDialog = true;
        this.currentSelected = model;
    }

    openDeleteDialog(model: IPhishingEmailTemplate) {
        this.deleteDialog = true;
        this.currentSelected = model;
    }

    openPreviewDialog(model: IPhishingEmailTemplate) {
        this.previewDialog = true;
        this.currentSelected = model;
    }

    delete() {
        this.apiService.deletePhishingTemplate(this.currentSelected.id).subscribe({
            next: (r) => {
                this.deleteDialog = false;
                this.loadDefaultTemplates();
                this.loadTenantTemplates();
                this.messageService.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Phishing Template Deleted',
                    life: 3000,
                });
            },
            error: (e) => { },
        });
    }

    edit() {
        this.apiService
            .updatePhishingTemplate(this.currentSelected.id, this.templateEditForm.value.emailName, this.templateEditForm.value.tages)
            .subscribe({
                next: (r) => {
                    this.editDialog = false;
                    this.loadDefaultTemplates();
                    this.loadTenantTemplates();
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Phishing Template Updated',
                        life: 3000,
                    });
                },
                error: (e) => { },
            });
    }

    hideDialog() {
        this.addDialog = false;
        this.editDialog = false;
        this.deleteDialog = false;
    }

    initiateEditForm() {
        this.templateEditForm = new FormGroup({
            // emailName: new FormControl<string>('', Validators.required),
            tages: new FormControl<string[]>([]),
        });
    }

    activation(value: boolean) {
        if (value) {
            // TO Do For Activate
            const x = this.apiService.activatePhishingTemplate(this.currentSelected.id!).subscribe({
                next: (res) => {
                    this.ngOnInit();
                    this.activationDialog = false;
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Phishing Template Updated',
                        life: 3000,
                    });
                },
                error: (error) => { },
            });
            this.unsubscribe.push(x);
        } else {
            // TO Do For Deactivate
            const x = this.apiService.deactivatePhishingTemplate(this.currentSelected.id!).subscribe({
                next: (res) => {
                    this.ngOnInit();
                    this.activationDialog = false;
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Phishing Template Updated',
                        life: 3000,
                    });
                },
                error: (error) => { },
            });
            this.unsubscribe.push(x);
        }
    }

    getSafeHtml(): SafeHtml {
        return this.sanitizer.bypassSecurityTrustHtml(this.currentSelected.phishingEmailContentHtml!);
    }

    hasPermission(controlKey: string): boolean {
        return this.pagePermessions.some((p) => p.controlKey === controlKey);
    }

    ngOnDestroy(): void {
        this.unsubscribe.forEach((x) => x.unsubscribe());
    }
}
