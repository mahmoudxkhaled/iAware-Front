import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AccountSettingService } from '../../../services/account-setting.service';
import { Subscription } from 'rxjs';
import { TenantModel } from '../../../models/TenantModel';
import { ICurrency } from '../../../models/Currency';
import { ITimeZone } from '../../../models/ITimeZone';
import { ILanguageModel } from 'src/app/modules/language/models/ILanguageModel';
import { ICountryModel } from '../../../models/ICountryModel';
import { MessageService } from 'primeng/api';
import { TranslationService } from 'src/app/core/Services/translation.service';
import { CompanyProfileImageService } from '../../../services/company-profile-image.service';
import { DropdownListDataSourceService } from 'src/app/core/Services/dropdown-list-data-source.service';

@Component({
  selector: 'app-profile-details',
  templateUrl: './profile-details.component.html',
  styleUrl: './profile-details.component.scss',
})
export class ProfileDetailsComponent implements OnInit, OnDestroy {

  currencies: ICurrency[] = [
    { code: "USD", name: "USD - USA dollar" }
  ];

  companyLogoeUrl: string = '../../../../../assets/images/companyDefaultLogo.png';
  selectedFile: File | null = null;
  timeZonesList: ITimeZone[] = [];
  languagesList: ILanguageModel[] = []
  countriesList: ICountryModel[] = []

  unsubscribe: Subscription[] = [];
  form!: FormGroup;
  isBadgeEnabled: boolean = false;
  fileError: string | null = null;

  @Input() tenant: TenantModel = new TenantModel();

  get f() {
    return this.form.controls;
  }

  get companyName() {
    return this.form.get('companyName');
  }

  constructor(private apiService: AccountSettingService
    , private translate: TranslationService
    , private companyProfileImageService: CompanyProfileImageService
    , private messageService: MessageService
    , private dropdownListDataSourceService: DropdownListDataSourceService) {
    this.initForm();
  }

  ngOnInit(): void {
    this.getTimeZones();
    this.getLanguages();
    this.getCountries();
    Object.keys(this.f).forEach((key) => {
      if (this.tenant.hasOwnProperty(key)) {
        if (key === 'companyLogo' && this.tenant[key]) {
          this.companyLogoeUrl = this.tenant[key]! ?? this.companyLogoeUrl;
        }
        this.form.controls[key].setValue(this.tenant[key])
      }
    })
  }

  getTimeZones() {
    const sub = this.dropdownListDataSourceService.getAllTimeZones().subscribe(res => {
      this.timeZonesList = res.data;
    })
    this.unsubscribe.push(sub);
  }

  getLanguages() {
    const sub = this.dropdownListDataSourceService.getActiveLanguages().subscribe(res => {
      this.languagesList = res.data;
    })
    this.unsubscribe.push(sub);
  }

  getCountries() {
    const sub = this.dropdownListDataSourceService.getCountries().subscribe(res => {
      this.countriesList = res.data;
    })
    this.unsubscribe.push(sub);
  }

  initForm() {
    this.form = new FormGroup({
      firstName: new FormControl<string>(''),
      lastName: new FormControl<string>(''),
      phone: new FormControl<string>(''),
      companyLogo: new FormControl<string>(''),
      companyName: new FormControl<string>('', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        Validators.pattern(/^[A-Za-z\u0600-\u06FF]+(?: [A-Za-z\u0600-\u06FF]+)*$/) // Prevents multiple spaces
      ]),
      timeZone: new FormControl<string>('', [Validators.required]),
      currency: new FormControl<string>(''),
      country: new FormControl<string>(''),
      language: new FormControl<string>('', [Validators.required]),
    },
    );
  }

  trimAndUpdateField(fieldName: string): void {
    const control = this.form.get(fieldName);
    if (control) {
      // Remove extra spaces and trim leading/trailing spaces
      let cleanedValue = control.value.replace(/\s+/g, ' ').trim();

      // Remove any non-letter characters except spaces
      cleanedValue = cleanedValue.replace(/[^A-Za-z\u0600-\u06FF ]/g, '');

      // Limit length to 50 characters dynamically
      if (cleanedValue.length > 51) {
        cleanedValue = cleanedValue.substring(0, 50);
      }

      control.setValue(cleanedValue, { emitEvent: false });
    }
  }

  saveSettings() {
    const result: {
      [key: string]: string;
    } = {};
    Object.keys(this.f).forEach((key) => {
      result[key] = this.f[key].value;
    });
    const newTenant = new TenantModel();
    newTenant.setTenatPersonalData(result);
    const registrationSubscr = this.apiService
      .saveTenantModel(newTenant)
      .subscribe((tenant) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Profile Detailes Updated Successfullly',
          life: 2000,
        });
      });
    this.unsubscribe.push(registrationSubscr);
  }

  saveCompanyLogo() {
    if (this.selectedFile) {
      this.apiService.saveCompanyLogo(this.selectedFile).subscribe({
        next: (response) => {
          this.companyProfileImageService.setCompanyPhoto(response.data.companyLogo);
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Company Logo Updated Successfullly',
            life: 2000,
          })
        },
        error: (e) => {

        }
      });
    }
  }

  onUploadClick() {
    const fileInput = document.getElementById('companyLogoeUrl') as HTMLInputElement;
    fileInput.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length) {
      const file = input.files[0];

      // Allowed image MIME types
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        this.fileError = this.translate.getInstant('user.user-tenant-profile.profileImagevalidation.allowedTypes');
        input.value = ""; // Reset file input
        return;
      }

      // Validate file size (limit to 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        this.fileError = this.translate.getInstant('user.user-tenant-profile.profileImagevalidation.allowedSize');;
        input.value = "";
        return;
      }

      // File is valid, proceed with processing
      this.fileError = null;
      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.companyLogoeUrl = e.target.result;
      };
      reader.readAsDataURL(this.selectedFile);
      this.saveCompanyLogo();
    }
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
    this.selectedFile = null;
  }
}