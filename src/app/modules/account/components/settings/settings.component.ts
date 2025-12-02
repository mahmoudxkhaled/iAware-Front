import { Component, OnInit } from '@angular/core';
import { AccountSettingService } from '../../services/account-setting.service';
import { TenantModel } from '../../models/TenantModel';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent{
  tenantModel : TenantModel = new TenantModel();
  isTenantLoaded : boolean = false;
  constructor(private apiService: AccountSettingService) {
    this.apiService.getCurrentTenant().subscribe((res) => {
      this.tenantModel = res;
      this.isTenantLoaded = true;
    });

  }
}
