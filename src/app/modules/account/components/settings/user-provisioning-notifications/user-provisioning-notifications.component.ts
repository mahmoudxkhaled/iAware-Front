import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AccountSettingService } from '../../../services/account-setting.service';
import { Subscription } from 'rxjs';
import { TenantModel } from '../../../models/TenantModel';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-user-provisioning-notifications',
  templateUrl: './user-provisioning-notifications.component.html',
  styleUrl: './user-provisioning-notifications.component.scss'
})
export class UserProvisioningNotificationsComponent implements OnInit, OnDestroy {
  unsubscribe: Subscription[] = [];
  form!: FormGroup;
  isBadgeEnabled: boolean = false;

  @Input() tenant : TenantModel = new TenantModel();

  get f() {
    return this.form.controls;
  }
  
  constructor(private apiService: AccountSettingService,  private messageService : MessageService) {
    this.initForm();
  }

  ngOnInit(): void {
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
    newTenant.setTenantUserProvisioningNotificationsData(result);
    const registrationSubscr = this.apiService
      .saveTenantModel(newTenant)
      .subscribe((tenant) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'User Provisioning Notifications Updated Successfullly',
          life: 2000,
      });
      });
    this.unsubscribe.push(registrationSubscr);
  }

  initForm() {
    this.form = new FormGroup({
      enableUserProvisioningNotifications: new FormControl<boolean>(false, [Validators.required]),
      timeFrame: new FormControl<string>('', [Validators.required]),
      notificationsRecipients: new FormControl<string>('', [Validators.required]),
    });
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}