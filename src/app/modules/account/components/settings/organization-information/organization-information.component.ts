import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AccountSettingService } from '../../../services/account-setting.service';
import { Subscription } from 'rxjs';
import { TenantModel } from '../../../models/TenantModel';
import { MessageService } from 'primeng/api';
import { ILanguageModel } from 'src/app/modules/language/models/ILanguageModel';
import { DropdownListDataSourceService } from 'src/app/core/Services/dropdown-list-data-source.service';

@Component({
    selector: 'app-organization-information',
    templateUrl: './organization-information.component.html',
    styleUrl: './organization-information.component.scss',
})
export class OrganizationInformationComponent implements OnInit, OnDestroy {
    unsubscribe: Subscription[] = [];
    languagesList: ILanguageModel[] = [];
    form!: FormGroup;
    isBadgeEnabled: boolean = false;
    @Input() tenant: TenantModel = new TenantModel();
    get f() {
        return this.form.controls;
    }
    constructor(private apiService: AccountSettingService, private messageService: MessageService
        , private  dropdownListDataSourceService : DropdownListDataSourceService) {
        this.initForm();
    }

    ngOnInit(): void {
        this.getActiveLanguages();
        Object.keys(this.f).forEach((key) => {
            if (this.tenant.hasOwnProperty(key)) {
                this.form.controls[key].setValue(this.tenant[key]);
            }
        });
    }

    getActiveLanguages(){
        const sub = this.dropdownListDataSourceService.getActiveLanguages().subscribe((res) => {
            this.languagesList = res.data;
        });
        this.unsubscribe.push(sub);
    }

    saveSettings() {
        const result: {
            [key: string]: string;
        } = {};
        Object.keys(this.f).forEach((key) => {
            result[key] = this.f[key].value;
        });
        const newTenant = new TenantModel();
        newTenant.setTenatOrganizationData(result);
        const registrationSubscr = this.apiService.saveTenantModel(newTenant).subscribe((tenant) => {
            this.messageService.add({
                severity: 'success',
                summary: 'Successful',
                detail: 'Organization Details Updated Successfullly',
                life: 2000,
            });
        });
        this.unsubscribe.push(registrationSubscr);
    }

    initForm() {
        this.form = new FormGroup({
            organizationName: new FormControl<string>(''),
            streetAddress1: new FormControl<string>('', [Validators.maxLength(100)]),
            streetAddress2: new FormControl<string>('', [Validators.maxLength(100)]),
            suiteNumber: new FormControl<number>(0),
            city: new FormControl<string>(''),
            state: new FormControl<string>(''),
            zipeCode: new FormControl<number>(0),
            extention: new FormControl<string>(''),
            bussinessHoursFrom: new FormControl<Date>(new Date()),
            bussinessHoursTo: new FormControl<Date>(new Date()),
            bussinessDayes: new FormControl<string>(''),
            defaultAdminConsoleLanguage: new FormControl<string>(''),
            dateTimeFormate: new FormControl<string>(''),
        });
    }

    ngOnDestroy() {
        this.unsubscribe.forEach((sb) => sb.unsubscribe());
    }
}
