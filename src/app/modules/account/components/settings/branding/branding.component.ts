import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AccountSettingService } from '../../../services/account-setting.service';
import { Subscription } from 'rxjs';
import { TenantModel } from '../../../models/TenantModel';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-branding',
    templateUrl: './branding.component.html',
    styleUrl: './branding.component.scss',
})
export class BrandingComponent implements OnInit, OnDestroy {
    unsubscribe: Subscription[] = [];
    form!: FormGroup;
    companyLogo: File[] = [];
    isLogoIn: boolean = false;
    imageSrc: string = '';
    @Input() tenant: TenantModel = new TenantModel();

    get f() {
        return this.form.controls;
    }
    constructor(
        private apiService: AccountSettingService,
        private messageService: MessageService
    ) {
        this.initForm();
    }

    ngOnInit(): void {
        Object.keys(this.f).forEach((key) => {
            if (this.tenant.hasOwnProperty(key)) {
                if (key === 'companyLogo' && this.tenant[key]) {
                    this.isLogoIn = true;
                    this.imageSrc = this.tenant[key]!;
                }
                this.form.controls[key].setValue(this.tenant[key]);
            }
        });
    }

    saveSettings() {
        // const result: {
        //     [key: string]: string;
        // } = {};
        // Object.keys(this.f).forEach((key) => {
        //     result[key] = this.f[key].value;
        // });
        // const newTenant = new TenantModel();
        // newTenant.setTenatBrandingData(result);
        // const registrationSubscr = this.apiService
        //     .saveTenantModel(newTenant)
        //     .subscribe({
        //         next: (data) => {
        //             if (this.companyLogo?.length) {
        //                 this.apiService.saveCompanyLogo(this.companyLogo[0]).subscribe({
        //                     next: () => {
        //                         this.messageService.add({
        //                             severity: 'success',
        //                             summary: 'Successful',
        //                             detail: 'Branding Details Updated Successfullly',
        //                             life: 2000,
        //                         })
        //                     },
        //                     error: (e) => {
        //                         
        //                     }
        //                 });
        //             }
        //             this.messageService.add({
        //                 severity: 'success',
        //                 summary: 'Successful',
        //                 detail: 'Branding Details Updated Successfullly',
        //                 life: 2000,
        //             })
        //         },
        //         error: (error) => {
        //           
        //         },
        //     });
        // this.unsubscribe.push(registrationSubscr);
        if (this.companyLogo?.length) {
            this.apiService.saveCompanyLogo(this.companyLogo[0]).subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Branding Details Updated Successfullly',
                        life: 2000,
                    })
                },
                error: (e) => {
                    
                }
            });
        }
    }

    initForm() {
        this.form = new FormGroup({
            companyLogoURL: new FormControl<string>(''),
            companyLogo: new FormControl<string>(''),
            brandColor: new FormControl<string>(''),
            brandCertificate: new FormControl<string>(''),
        });
    }

    onlessonBookChange(event: Event): void {
        event.preventDefault();
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length) {
            this.companyLogo = Array.from(input.files);
        }
    }

    ngOnDestroy() {
        this.unsubscribe.forEach((sb) => sb.unsubscribe());
    }
}
