import { AfterViewInit, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AccountSettingService } from '../../../services/account-setting.service';
import { Subscription } from 'rxjs';
import { TenantModel } from '../../../models/TenantModel';
import { IBadgeModel } from '../../../models/IBadgeModel';
import { InputSwitchChangeEvent } from 'primeng/inputswitch';
import { MessageService } from 'primeng/api';
@Component({
  selector: 'app-learner-experience',
  templateUrl: './learner-experience.component.html',
  styleUrl: './learner-experience.component.scss'
})
export class LearnerExperienceComponent implements OnInit, OnDestroy {
  unsubscribe: Subscription[] = [];
  form!: FormGroup;
  isBadgeEnabled: boolean = false;
  badges: IBadgeModel[] = [];
  @Input() tenant : TenantModel = new TenantModel();
  get f() {
    return this.form.controls;
  }
  constructor(private apiService: AccountSettingService, private messageService : MessageService) {
    this.initForm();
   }
  
  ngOnInit(): void {
      Object.keys(this.f).forEach((key) => {
        if (this.tenant.hasOwnProperty(key)) {
          if (key === 'enableBadges' && this.tenant[key]){
            this.isBadgeEnabled = true;
          }
          this.form.controls[key].setValue(this.tenant[key]);
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
    newTenant.setTenantLearnerExperienceData(result);
    
    const registrationSubscr = this.apiService
      .saveTenantModel(newTenant)
      .subscribe( {
        next : (r) =>{
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Learner Experience Updated Successfullly',
            life: 2000,
        });
        },
        error : (e) =>{
          
        } 
      });
    this.unsubscribe.push(registrationSubscr);
  }

  initForm() {
    this.form = new FormGroup({
      defaultTrainingLanguage: new FormControl<string>('', [ Validators.required, Validators.minLength(3),  Validators.maxLength(100)]),
      enableOptionalTrainingCampaigns: new FormControl<boolean>(false, [Validators.required]),
      enableAIDARecomendedOptionalLearning: new FormControl<boolean>(false, [Validators.required]),
      enableBadges: new FormControl<boolean>(false, [Validators.required]),
      excludeTrainingCampaignsWithNoDueDate: new FormControl<boolean>(false, [Validators.required]),
      leaderboardType: new FormControl<string>('', [Validators.required]),
      tenantBadges: new FormControl<IBadgeModel[]>([]),
      leaderboardTimePeriod: new FormControl<string>('', [Validators.required]),
      groupsToIncludeInLeaderboard: new FormControl<string>('', [Validators.required]),
    });
  }

  enableBadge(e : InputSwitchChangeEvent){
    if(e.checked){
      this.isBadgeEnabled = true;
    }else{
      this.isBadgeEnabled = false;
    }
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}