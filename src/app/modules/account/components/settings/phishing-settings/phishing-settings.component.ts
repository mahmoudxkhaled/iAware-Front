import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AccountSettingService } from '../../../services/account-setting.service';
import { Subscription } from 'rxjs';
import { TenantModel } from '../../../models/TenantModel';
import { MessageService } from 'primeng/api';
import { ILanguageModel } from 'src/app/modules/language/models/ILanguageModel';
import { DropdownListDataSourceService } from 'src/app/core/Services/dropdown-list-data-source.service';
@Component({
  selector: 'app-phishing-settings',
  templateUrl: './phishing-settings.component.html',
  styleUrl: './phishing-settings.component.scss'
})
export class PhishingSettingsComponent implements OnInit, OnDestroy {
  unsubscribe: Subscription[] = [];
  form!: FormGroup;
  isBadgeEnabled: boolean = false;
  languagesList: ILanguageModel[] = []
  @Input() tenant : TenantModel = new TenantModel();
  get f() {
    return this.form.controls;
  }
  constructor(private apiService: AccountSettingService, private messageService : MessageService, private dropdownListDataSourceService: DropdownListDataSourceService) {
    this.initForm();
   }

  ngOnInit(): void {

    this.dropdownListDataSourceService.getActiveLanguages().subscribe(res => {
      this.languagesList = res.data;
    })

      Object.keys(this.f).forEach((key) => {
        if (this.tenant.hasOwnProperty(key)) {
          this.form.controls[key].setValue(this.tenant[key]);
        }
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
    newTenant.setTenantPhishingSettingsData(result);
    const registrationSubscr = this.apiService
      .saveTenantModel(newTenant)
      .subscribe((tenant) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Phishing Settings Updated Successfullly',
          life: 2000,
      });
      });
    this.unsubscribe.push(registrationSubscr);
  }

  initForm() {
    this.form = new FormGroup({
      defaultPhishingLanguage: new FormControl<string>('', [Validators.required]),
    });
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}