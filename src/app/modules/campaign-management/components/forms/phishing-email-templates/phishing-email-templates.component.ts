import { AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CampaignManagementService } from '../../../services/campaign-management.service';
import { LocalStorageService } from 'src/app/core/Services/local-storage.service';
import { CheckboxChangeEvent } from 'primeng/checkbox';
import { MessageService } from 'primeng/api';
import introJs from 'intro.js';
import { TableLoadingService } from 'src/app/core/Services/table-loading.service';
import { finalize, Subscription } from 'rxjs';
import { GetUser } from 'src/app/layout/app-menuProfile/app.menuprofile.component';
import { UserService } from 'src/app/modules/user/services/user.service';
import { IPhishingEmailTemplate } from '../../../models/IPhishingEmailTemplate ';
import { IPaginationModel } from 'src/app/core/Dtos/IPaginationModel';
interface expandedRows {
    [key: string]: boolean;
}

@Component({
    selector: 'app-phishing-email-templates',
    templateUrl: './phishing-email-templates.component.html',
    styleUrl: './phishing-email-templates.component.scss',
})
export class PhishingEmailTemplatesComponent implements OnInit, AfterViewInit, AfterViewChecked, OnDestroy {
    tableLoadingSpinner: boolean = true;
    isIAwareTeamUser: boolean = false;
    user: GetUser;
    defaultPhishingTemplates: IPhishingEmailTemplate[] = [];
    tenantPhishingTemplates: IPhishingEmailTemplate[] = [];
    unsubscribe: Subscription[] = [];
    phishingTemplates: any[] = [];
    selectedTemplates: any[] = [];
    expandedRows: expandedRows = {};
    isExpanded: boolean = false;
    doNotShaowTemplatesStepsAgain: boolean = false;
    checkboxStates: { [key: string]: boolean } = {};
    introJS = introJs.tour();

    defaultTotalRecords : number = 0;
    tenantTotalRecords : number = 0;
    defaultPagination : IPaginationModel = {
        page:0,
        size:9,
        searchQuery:''
    }
    tenantPagination : IPaginationModel = {
        page:0,
        size:9,
        searchQuery:''
    }

    constructor(
        private router: Router,
        private apiService: CampaignManagementService,
        private localStorageService: LocalStorageService,
        private messageService: MessageService,
        private tableLoadingService: TableLoadingService,
        private userServ: UserService,
        private cdr: ChangeDetectorRef
    ) {
        this.getUserDetails();
    }

    ngAfterViewChecked(): void {
        this.cdr.detectChanges();
    }

    ngAfterViewInit(): void {
        setTimeout(() => {
            this.checkIfDataInLocalStorage();
        }, 1);
    }

    ngOnInit(): void {
        this.tableLoadingService.loading$.subscribe((isLoading) => {
            this.tableLoadingSpinner = isLoading;
        });

        // if(!this.doNotShaowTemplatesStepsAgain){
        //   this.introJS.setOptions({
        //     steps: [
        //       {
        //         element: '#templates',
        //         intro: 'temlates',
        //         position: 'bottom'
        //       }
        //     ],
        //     nextLabel: 'Next',
        //     prevLabel: 'Previous',
        //     doneLabel: 'Close'
        //   }).start();
        // }
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

    onLazyLoadDefaultTemplates(event: any){
        this.defaultPagination.searchQuery = '';
        this.defaultPagination.page = event.first / event.rows;
        this.defaultPagination.size = event.rows;
        this.loadDefaultTemplates();
    }

    onLazyLoadTenantTemplates(event: any){
        this.tenantPagination.searchQuery = '';
        this.tenantPagination.page = event.first / event.rows;
        this.tenantPagination.size = event.rows;
        this.loadTenantTemplates();
    }

    loadDefaultTemplates(){
        this.tableLoadingService.show();
        const sub = this.apiService.getDefaultPhishingAllTemplatesForCampaign(this.defaultPagination).subscribe({
            next: (res) => {
                this.defaultPhishingTemplates = res.data;
                this.defaultTotalRecords = res.totalRecords;
                this.tableLoadingService.hide();
            }
        });
        this.unsubscribe.push(sub);
    }

    loadTenantTemplates(){
        this.tableLoadingService.show();
        const sub = this.apiService.getTenantPhishingAllTemplatesForCampaign(this.tenantPagination).subscribe({
            next: (res) => {
                this.tenantPhishingTemplates = res.data;
                this.tenantTotalRecords = res.totalRecords;
                this.tableLoadingService.hide();
            }
        })
        this.unsubscribe.push(sub);
    }

    checkIfDataInLocalStorage(): any[] {
        const templates = this.localStorageService.getItem('phishingTemplates');
        this.selectedTemplates = templates ? templates : [];
        this.checkboxStates = {};
        templates?.forEach((template: any) => {
            if (template?.id) {
                this.checkboxStates[template.id] = true;
            }
        });
        return templates ? templates : [];
    }

    nextPage() {
        if (this.selectedTemplates) {
            this.messageService.add({
                severity: 'success',
                summary: 'Info',
                detail: `you select ${this.selectedTemplates?.length} templates to scedual`,
                life: 3000,
            });
            this.localStorageService.setItem('phishingTemplates', this.selectedTemplates);
            this.router.navigate(['campaign-management/create/schedule']);
        }
    }

    prevPage() {
        this.router.navigate(['campaign-management/create/type']);
    }

    expandAll() {
        if (!this.isExpanded) {
            this.phishingTemplates.forEach((template) =>
                template && template.name ? (this.expandedRows[template.name] = true) : ''
            );
        } else {
            this.expandedRows = {};
        }
        this.isExpanded = !this.isExpanded;
    }

    addToselected(event: CheckboxChangeEvent, model: any) {
        if (event.checked) {
            this.selectedTemplates.push(model);
        } else {
            this.selectedTemplates = this.selectedTemplates.filter((c) => {
                return c.id != model.id;
            });
        }
    }
    
    toggleSelection(template: any) {
        this.checkboxStates[template.id] = !this.checkboxStates[template.id];
        this.addToselected({ checked: this.checkboxStates[template.id] }, template);
    }

    ngOnDestroy(): void {
        this.unsubscribe.forEach((subscription) => subscription.unsubscribe());
    }
}