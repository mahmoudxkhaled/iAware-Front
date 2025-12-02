import { AfterViewChecked, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ISystemEmailActivity } from '../../models/ISystemEmailActivity';
import { Subscription } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MenuItem, MessageService } from 'primeng/api';
import { SystemEmailActivityService } from '../../services/system-email-activity.service';
import { TranslationService } from 'src/app/core/Services/translation.service';
import { TableLoadingService } from 'src/app/core/Services/table-loading.service';
import { Table } from 'primeng/table';
import { SystemEmailService } from 'src/app/modules/system-email-domains/services/system-email.service';
import { ISystemEmail } from 'src/app/modules/system-email-domains/models/ISystemEmail';
import { getSystemEmailActivitiesAsDropdownOptions } from 'src/app/core/enums/SystemEmailActivity';
import { InputSwitchChangeEvent } from 'primeng/inputswitch';
import { SharedDataService } from 'src/app/core/Services/shared-data.service';
import { IawareSharedService } from 'src/app/core/Services/iaware-shared.service';
import { DropdownListDataSourceService } from 'src/app/core/Services/dropdown-list-data-source.service';
import { IPaginationModel } from 'src/app/core/Dtos/IPaginationModel';
interface SystemEmailActivityForm {
  id?: FormControl<number | null>;
  emailSubject: FormControl<string | null>;
  emailBody: FormControl<string | null>;
  systemEmailId: FormControl<string | null>;
  systemEmailActivityLanguages: FormGroup;
}

@Component({
  selector: 'app-system-email-activity-listing',
  templateUrl: './system-email-activity-listing.component.html',
  styleUrls: ['./system-email-activity-listing.component.scss']
})
export class SystemEmailActivityListingComponent implements AfterViewChecked, OnInit, OnDestroy {
  tableLoadingSpinner: boolean = true;
  unsubscribe: Subscription[] = [];
  deleteDialog: boolean = false;
  editeDialog: boolean = false;
  activationDialog: boolean = false;
  addDialog: boolean = false;
  systemEmailActivities: ISystemEmailActivity[] = [];
  currentSelected: ISystemEmailActivity = {
    id: 0,
    emailSubject: '',
    emailBody: '',
    isActive: false,
    systemEmailId: '',
    systemEmailActivityLanguages: []
  };
  addForm: FormGroup<SystemEmailActivityForm>;
  editForm: FormGroup<SystemEmailActivityForm>;
  systemEmails: ISystemEmail[] = [];
  systemEmailActivitiesDropdown: any[] = getSystemEmailActivitiesAsDropdownOptions();
  toggleControls: { [key: number]: FormControl<boolean | null> } = {};
  activeLanguages: any[] = [];

  totalRecords: number = 0;
  pagibation: IPaginationModel = {
    page: 0,
    size: 10,
    searchQuery: '',
  };

  constructor(
    private apiService: SystemEmailActivityService,
    private fb: FormBuilder,
    private dropdownListDataSourceService: DropdownListDataSourceService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef,
    private translate: TranslationService,
    private systemEmailService: SystemEmailService,
    private tableLoadingService: TableLoadingService
  ) {
    this.addForm = this.createSystemEmailActivityForm();
    this.editForm = this.createSystemEmailActivityForm();
  }

  ngAfterViewChecked(): void {
    this.cdr.detectChanges();
  }

  onLazyLoad(event: any) {
    this.pagibation.page = event.first / event.rows;
    this.pagibation.size = event.rows;
    this.pagibation.searchQuery = event.globalFilter || '';
    this.loadSystemEmailActivities();
  }

  ngOnInit(): void {
    this.tableLoadingService.loading$.subscribe((isLoading) => {
      this.tableLoadingSpinner = isLoading;
    });
    this.loadActiveLanguages();
    this.loadAllSystemEmails();
  }

  loadSystemEmailActivities() {
    this.tableLoadingService.show();
    const sub = this.apiService.getSystemEmailActivities(this.pagibation).subscribe({
      next: (res) => {
        this.systemEmailActivities = res.data;
        this.totalRecords = res.totalRecords;
        this.toggleControls = {};
        this.systemEmailActivities.forEach(activity => {
          if (activity.id) {
            this.toggleControls[activity.id] = new FormControl(activity.isActive);
          }
        });
        this.tableLoadingService.hide();
      },
      error: (err) => {
        this.tableLoadingService.hide();
        this.messageService.add({
          severity: 'error',
          summary: this.translate.getInstant('shared.errors.error'),
          detail: this.translate.getInstant('system-email-activity.loadError'),
          life: 3000
        });
      },
    });
    this.unsubscribe.push(sub);
  }

  loadAllSystemEmails() {
    const sub = this.dropdownListDataSourceService.getAllSystemEmails().subscribe({
      next: (res) => {
        this.systemEmails = res.data;
      },
      error: (err) => { },
    });
    this.unsubscribe.push(sub);
  }

  loadActiveLanguages() {
    this.dropdownListDataSourceService.getActiveLanguages().subscribe({
      next: (result) => {
        this.activeLanguages = result.data;
        this.addLanguageControlsToForm(this.addForm);
        this.cdr.detectChanges();
      },
      error: (error) => { },
    });
  }

  private createLanguageFormGroup(language: any): FormGroup {
    return this.fb.group({
      emailBody: [this.currentSelected?.systemEmailActivityLanguages?.find(l => l.languageId === language.id)?.emailBody || ''],
      emailSubject: [this.currentSelected?.systemEmailActivityLanguages?.find(l => l.languageId === language.id)?.emailSubject || ''],
      languageId: [language.id]
    });
  }

  private createSystemEmailActivityForm(): FormGroup<SystemEmailActivityForm> {
    const formControls: SystemEmailActivityForm = {
      id: new FormControl(this.currentSelected.id || 0, Validators.required),
      emailSubject: new FormControl(this.currentSelected.emailSubject || '', Validators.required),
      emailBody: new FormControl(this.currentSelected.emailBody || '', Validators.required),
      systemEmailId: new FormControl(this.currentSelected.systemEmailId || '', Validators.required),
      systemEmailActivityLanguages: new FormGroup({})
    };
    return new FormGroup<SystemEmailActivityForm>(formControls);
  }

  private addLanguageControlsToForm(form: FormGroup<SystemEmailActivityForm>): void {
    const languageControls = form.get('systemEmailActivityLanguages') as FormGroup;
    this.activeLanguages.forEach((language) => {
      languageControls.addControl(language.code, this.createLanguageFormGroup(language));
    });
  }

  private resetForm(form: FormGroup<SystemEmailActivityForm>): void {
    form.reset();
    const languageControls = form.get('systemEmailActivityLanguages') as FormGroup;
    Object.keys(languageControls.controls).forEach(key => {
      languageControls.removeControl(key);
    });
    this.addLanguageControlsToForm(form);
  }

  getLanguageFormGroupAddForm(code: string): FormGroup | null {
    const languageControls = this.addForm.get('systemEmailActivityLanguages') as FormGroup;
    return languageControls.get(code) as FormGroup | null;
  }

  getLanguageFormGroupEditForm(code: string): FormGroup | null {
    const languageControls = this.editForm.get('systemEmailActivityLanguages') as FormGroup;
    return languageControls.get(code) as FormGroup | null;
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  openEditDialog(model: ISystemEmailActivity) {
    this.currentSelected = model;
    this.resetForm(this.editForm);
    this.editForm.patchValue(model);
    this.addLanguageControlsToForm(this.editForm);
    this.editForm.get('id')?.disable();
    this.editeDialog = true;
  }

  openDeleteDialog(model: ISystemEmailActivity) {
    this.deleteDialog = true;
    this.currentSelected = { ...model };
  }

  openAddDialog() {
    this.addDialog = true;
    this.currentSelected = this.initiaiteModel();
    this.resetForm(this.addForm);
  }

  openActivationDialog(domain: ISystemEmailActivity, event: InputSwitchChangeEvent) {
    this.activationDialog = true;
    this.currentSelected = domain;
    if (this.currentSelected.id && this.toggleControls[this.currentSelected.id]) {
      this.toggleControls[this.currentSelected.id].setValue(this.currentSelected.isActive, { emitEvent: false });
    }
  }

  hideAddDialog() {
    this.addDialog = false;
  }

  hideEditDialog() {
    this.editeDialog = false;
  }

  onCancelActivationDialog() {
    this.activationDialog = false;
    if (this.currentSelected.id && this.toggleControls[this.currentSelected.id]) {
      this.toggleControls[this.currentSelected.id].setValue(this.currentSelected.isActive!, { emitEvent: false });
    }
  }

  initiaiteModel(): ISystemEmailActivity {
    return {
      id: 0,
      emailSubject: '',
      emailBody: '',
      isActive: false,
      systemEmailId: '',
      systemEmailActivityLanguages: []
    };
  }

  private handleFormSubmission(form: FormGroup<SystemEmailActivityForm>, isEdit: boolean = false): void {
    if (form.invalid) {
      form.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: this.translate.getInstant('shared.errors.warning'),
        detail: this.translate.getInstant('system-email-activity.invalidForm'),
        life: 3000
      });
      return;
    }

    this.tableLoadingService.show();
    if (isEdit) {
      form.get('id')?.enable();
    }

    const formValue = form.value;
    const data: any = {
      id: formValue.id,
      emailSubject: formValue.emailSubject || '',
      emailBody: formValue.emailBody || '',
      systemEmailId: formValue.systemEmailId || '',
      systemEmailActivityLanguages: Object.values(
        formValue?.systemEmailActivityLanguages || {}
      )
        .filter((c: any) => c.emailBody && c.emailSubject)
        .map((c: any) => ({
          emailBody: c.emailBody,
          emailSubject: c.emailSubject,
          languageId: c.languageId,
        })) || []
    };

    const apiCall = isEdit
      ? this.apiService.editSystemEmailActivity(data)
      : this.apiService.addSystemEmailActivity(data);

    const sub = apiCall.subscribe({
      next: (res) => {
        this.tableLoadingService.hide();
        if (isEdit) {
          this.onCancelEditDialog();
        } else {
          this.onCancelAddDialog();
        }
        this.loadSystemEmailActivities();
        this.messageService.add({
          severity: 'success',
          summary: this.translate.getInstant('shared.success.success'),
          detail: this.translate.getInstant(`system-email-activity.${isEdit ? 'edit' : 'add'}Success`),
          life: 3000
        });
      },
      error: (err) => {
        this.tableLoadingService.hide();
        const errorMessage = err?.error?.message || this.translate.getInstant(`system-email-activity.${isEdit ? 'edit' : 'add'}Error`);
        this.messageService.add({
          severity: 'error',
          summary: this.translate.getInstant('shared.errors.error'),
          detail: errorMessage,
          life: 3000
        });
      },
    });
    this.unsubscribe.push(sub);
  }

  add(): void {
    this.handleFormSubmission(this.addForm);
  }

  edit(): void {
    this.handleFormSubmission(this.editForm, true);
  }

  onCancelAddDialog() {
    this.addDialog = false;
    this.currentSelected = this.initiaiteModel();
    this.resetForm(this.addForm);
    this.cdr.detectChanges();
  }

  onCancelEditDialog() {
    this.editeDialog = false;
    this.currentSelected = this.initiaiteModel();
    this.resetForm(this.editForm);
    this.cdr.detectChanges();
  }

  activation(value: boolean) {
    if (value) {
      const sub = this.apiService.activateSystemEmailActivity(this.currentSelected.id!).subscribe({
        next: (res) => {
          this.loadSystemEmailActivities();
          this.activationDialog = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'email activated successfully',
            life: 3000,
          });
        },
        error: (error) => { },
      });
      this.unsubscribe.push(sub);
    } else {
      const sub = this.apiService.deactivateSystemEmailActivity(this.currentSelected.id!).subscribe({
        next: (res) => {
          this.loadSystemEmailActivities();
          this.activationDialog = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'email deactivated successfully',
            life: 3000,
          });
        },
        error: (error) => { },
      });
      this.unsubscribe.push(sub);
    }
  }

  delete() {
    const sub = this.apiService.deleteSystemActivityEmail(this.currentSelected.id!).subscribe({
      next: () => {
        this.deleteDialog = false;
        this.loadSystemEmailActivities();
        this.messageService.add({
          severity: 'success',
          summary: this.translate.getInstant('shared.success.success'),
          detail: this.translate.getInstant('system-email-activity.deleteSuccess'),
          life: 3000
        });
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: this.translate.getInstant('shared.errors.error'),
          detail: this.translate.getInstant('system-email-activity.deleteError'),
          life: 3000
        });
      },
    });
    this.unsubscribe.push(sub);
  }

  ngOnDestroy(): void {
    this.unsubscribe.forEach((u) => u.unsubscribe());
  }
}