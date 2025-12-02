import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AccountSettingService } from '../../../services/account-setting.service';
import { Subscription } from 'rxjs';
import { TenantModel } from '../../../models/TenantModel';
import { MessageService } from 'primeng/api';
import { EcncryptionService } from 'src/app/core/Services/ecncryption.service';

@Component({
    selector: 'app-ad-settings',
    templateUrl: './ad-settings.component.html',
    styleUrl: './ad-settings.component.scss',
})
export class ADSettingsComponent implements OnInit, OnDestroy {
    unsubscribe: Subscription[] = [];
    form!: FormGroup;
    tenant : TenantModel;
    // @Input() tenant: TenantModel = new TenantModel();

    get f() {
        return this.form.controls;
    }
    constructor(
        private apiService: AccountSettingService,
        private messageService: MessageService,
        private encryptService : EcncryptionService
    ) {
        this.initForm();
    }

    ngOnInit(): void {
        this.fetchTernant();
    }

    fetchTernant(){
        const x = this.apiService.getCurrentTenant().subscribe({
            next:(res)=>{
                this.tenant = res;
                Object.keys(this.f).forEach((key) => {
                    if (this.tenant.hasOwnProperty(key)) {
                        if (key === 'adPassword' && this.tenant[key]){
                            // decrypt ad password and assigne it 
                            const decryptedPass = this.encryptService.decryptText(this.tenant[key]!);
                            this.form.controls[key].setValue(decryptedPass);
                        }else{
                            this.form.controls[key].setValue(this.tenant[key]);
                        }
                    }
                });
            },
            error:(e) =>{}
        })
    }

    saveSettings() {
        const result: {
            [key: string]: string;
        } = {};
        Object.keys(this.f).forEach((key) => {
            if (key === 'adPassword' && this.f[key].value){
                const encryptedPass = this.encryptService.encryptText(this.f[key].value);
                result[key] = encryptedPass;
            }else{
                result[key] = this.f[key].value;
            }
        });
        const newTenant = new TenantModel();
        newTenant.setTenantADSettingsData(result);
        const registrationSubscr = this.apiService
            .saveTenantModel(newTenant)
            .subscribe((tenant) => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'Active Directory Settings Updated Successfullly',
                    life: 2000,
                });
            });
        this.unsubscribe.push(registrationSubscr);
    }

    initForm() {
        this.form = new FormGroup({
            showGroupAdmin: new FormControl<boolean>(false),
            adISyncToken: new FormControl<string>(''),
            adPassword: new FormControl<string>('', [Validators.required]),
            adUserName: new FormControl<string>('', [Validators.required]),
            adDomainName: new FormControl<string>('', [Validators.required]),
            ipAddress: new FormControl<string>('', [Validators.required]),
            adDomainNameExtention: new FormControl<string>('', [Validators.required]),
        });
    }

    ngOnDestroy() {
        this.unsubscribe.forEach((sb) => sb.unsubscribe());
    }
}