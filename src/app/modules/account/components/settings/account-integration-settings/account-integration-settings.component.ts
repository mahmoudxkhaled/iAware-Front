import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { IBadgeModel } from '../../../models/IBadgeModel';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AccountSettingService } from '../../../services/account-setting.service';
import { Subscription } from 'rxjs';
import { TenantModel } from '../../../models/TenantModel';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-account-integration-settings',
    templateUrl: './account-integration-settings.component.html',
    styleUrl: './account-integration-settings.component.scss',
})
export class AccountIntegrationSettingsComponent implements OnInit, OnDestroy {
    badges: IBadgeModel[] = [];
    form!: FormGroup;
    unsubscribe: Subscription[] = [];
    @Input() tenant: TenantModel = new TenantModel();

    get f() { return this.form.controls; }

    constructor(private apiService: AccountSettingService, private messageService: MessageService) {
        this.initForm();
    }

    ngOnInit(): void {
        Object.keys(this.f).forEach((key) => {
            if (this.tenant.hasOwnProperty(key)) {
                if (
                    key === 'currentAuthnRequestCertificateValidTo' ||
                    key === 'currentAuthnRequestCertificateValidFrom'
                ) {
                    //let d = moment(this.tenant[key]).format('MM/DD/YYYY');
                    //this.form.controls[key].setValue(d);
                } else {
                    this.form.controls[key].setValue(this.tenant[key]);
                }
            }
        });

        this.apiService.getAllBadgesTenant().subscribe((res) => {
            this.badges = res.data;
        });
    }

    saveSettings() {
        const result: {
            [key: string]: string;
        } = {};
        Object.keys(this.f).forEach((key) => {
            result[key] = this.f[key].value;
        });
        const newTenant = new TenantModel();
        
        newTenant.setTenantAccountIntegrationData(result);
        
        const registrationSubscr = this.apiService
            .saveTenantModel(newTenant)
            .subscribe({
                next: (tenant) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Account Integration Settings Updated Successfullly',
                        life: 2000,
                    });
                },
                error: (error) => {},
            });
        this.unsubscribe.push(registrationSubscr);
    }

    initForm() {
        this.form = new FormGroup({
            enableSAMLSSO: new FormControl<boolean>(false, [
                Validators.required,
            ]),
            disableNonSMALLoginsForAllUsers: new FormControl<boolean>(false, [
                Validators.required,
            ]),
            allowAdminswMFAToByPassSMALLogin: new FormControl<boolean>(false, [
                Validators.required,
            ]),
            allowAccountCreationFromSAMLLogin: new FormControl<boolean>(false, [
                Validators.required,
            ]),
            sha_1: new FormControl<boolean>(false, [Validators.required]),
            sha_256: new FormControl<boolean>(false, [Validators.required]),
            signUpAuthnRequest: new FormControl<boolean>(false, [
                Validators.required,
            ]),
            enableSPAuthnRequesExpirationNotifications:
                new FormControl<boolean>(false, [Validators.required]),
            idPSSOTargetURL: new FormControl<string>('', [Validators.required]),
            samlNotificationRecipients: new FormControl<string>('', [
                Validators.required,
            ]),
            currentAuthnRequestCertificate: new FormControl<string>('', [
                Validators.required,
            ]),
            entityId: new FormControl<string>('', [Validators.required]),
            ssoSignInURL: new FormControl<string>('', [Validators.required]),
            ssoSignOutURL: new FormControl<string>('', [Validators.required]),
            ssoCallbackURL: new FormControl<string>('', [Validators.required]),
            smalId: new FormControl<string>('', Validators.required),
            metadataURL: new FormControl<string>('', [Validators.required]),
            bypassSSOLoginURL: new FormControl<string>('', [
                Validators.required,
            ]),
            currentAuthnRequestCertificateValidFrom: new FormControl<Date>(
                new Date(),
                [Validators.required]
            ),
            currentAuthnRequestCertificateValidTo: new FormControl<Date>(
                new Date(),
                [Validators.required]
            ),
        });
    }

    ngOnDestroy() {
        this.unsubscribe.forEach((sb) => sb.unsubscribe());
    }
}