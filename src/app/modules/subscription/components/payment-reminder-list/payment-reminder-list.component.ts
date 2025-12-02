import { Component, OnInit } from '@angular/core';
import { MessageService, ConfirmationService, MenuItem } from 'primeng/api';
import { IPaymentReminderSettingModel } from '../../models/IPaymentReminderSettingModel';
import { PaymentReminderSettingsService } from '../../services/payment-reminder.service';
import { Subscription } from 'rxjs/internal/Subscription';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiError } from 'src/app/core/Dtos/ApiError';
import { Table } from 'primeng/table';
import { PermessionsService } from 'src/app/core/Services/permessions.service';
import { IAspNetPageItemModel } from 'src/app/modules/page-management/models/IAspNetPageItemModel';
import { constants } from 'src/app/core/constatnts/constatnts';
import { TranslationService } from 'src/app/core/Services/translation.service';
import { finalize } from 'rxjs';

@Component({
    selector: 'app-payment-reminder-list',
    templateUrl: './payment-reminder-list.component.html',
    styleUrls: ['./payment-reminder-list.component.scss'],
    providers: [MessageService, ConfirmationService],
})
export class PaymentReminderListComponent implements OnInit {
    pagePermessions: IAspNetPageItemModel[] = [];
    actions = constants.pageActions;
    reminderDialog: boolean = false;
    activationDialog: boolean = false;
    deleteReminderDialog: boolean = false;
    deleteRemindersDialog: boolean = false;
    reminders: IPaymentReminderSettingModel[] = [];
    reminder: IPaymentReminderSettingModel = {} as IPaymentReminderSettingModel;
    selectedReminders: IPaymentReminderSettingModel[] = [];
    submitted: boolean = false;
    cols: any[] = [];
    private subs: Subscription = new Subscription();
    reminderForm: FormGroup;
    menuItems: MenuItem[] = [];
    constructor(
        private reminderService: PaymentReminderSettingsService,
        private messageService: MessageService,
        private formBuilder: FormBuilder,
        private permessionService: PermessionsService,
        private translate: TranslationService
    ) {
        this.pagePermessions = this.permessionService.getPagePermessions(constants.pages.paymentReminder);
    }

    ngOnInit() {
        this.loadReminders();
        this.initReminder();
        this.initFormModels();
        this.cols = [
            { field: 'title', header: this.translate.getInstant('subscription.payment-reminder-list.fields.title') },
            { field: 'message', header: this.translate.getInstant('subscription.payment-reminder-list.fields.message') },
            { field: 'subject', header: this.translate.getInstant('subscription.payment-reminder-list.fields.subject') },
        ];
        this.menuItems = [];
        const editBtn = {
            label: this.translate.getInstant('shared.actions.edit'),
            icon: 'pi pi-fw pi-pencil',
            command: () => this.editReminder(this.reminder),
        };
        const deleteBtn = {
            label: this.translate.getInstant('shared.actions.delete'),
            icon: 'pi pi-fw pi-trash',
            command: () => this.deleteReminder(this.reminder),
        };

        if (this.hasPermission(this.actions.edit)) {
            this.menuItems.push(editBtn);
        }
        if (this.hasPermission(this.actions.delete)) {
            this.menuItems.push(deleteBtn);
        }


    }

    assigneCurrentSelect(reminder: IPaymentReminderSettingModel) {
        this.reminder = reminder;
    }

    loadReminders() {
        this.subs.add(
            this.reminderService.getAllPaymentReminderSettings().subscribe((data) => {
                this.reminders = data;
            })
        );
    }

    openNew() {
        this.initReminder();
        this.initFormModels();
        this.submitted = false;
        this.reminderDialog = true;
    }

    toggleActive(reminder: IPaymentReminderSettingModel) {
        if (reminder.isActive) {
            this.deactivateReminder(reminder);
        } else {
            this.activateReminder(reminder);
        }
    }
    
    activateReminder(reminder: IPaymentReminderSettingModel) {
        this.subs.add(
            this.reminderService.activatePaymentReminderSettings(reminder.id?.toString()).subscribe((result) => {
                if (result.isSuccess) {
                    this.handleReminderUpdate(reminder);
                    this.messageService.add({
                        severity:'success',
                        summary: this.translate.getInstant('shared.messages.success'),
                        detail: "reminder activated successfully",
                    })
                }
            })
        );
    }
    
    deactivateReminder(reminder: IPaymentReminderSettingModel) {
        this.subs.add(
            this.reminderService.dectivatePaymentReminderSettings(reminder.id?.toString()).subscribe((result) => {
                if (result.isSuccess) {
                    this.handleReminderUpdate(reminder);
                    this.messageService.add({
                        severity:'success',
                        summary: this.translate.getInstant('shared.messages.success'),
                        detail: "reminder deactivated successfully",
                    })
                }
            })
        );
    }
    
    handleReminderUpdate(reminder: IPaymentReminderSettingModel) {
        this.updateRemindersInList(reminder);
        this.reminders = [...this.reminders]; // Trigger change detection
        this.loadReminders();
        this.activationDialog = false;
    }

    editReminder(reminder: IPaymentReminderSettingModel) {
        this.reminder = { ...reminder };
        this.reminderForm.patchValue(reminder);
        this.reminderDialog = true;
    }

    deleteSelectedReminders() {
        this.deleteRemindersDialog = true;
    }

    deleteReminder(reminder: IPaymentReminderSettingModel) {
        this.deleteReminderDialog = true;
        this.reminder = { ...reminder };
    }

    confirmDeleteSelected() {
        this.deleteRemindersDialog = false;
        let deletedCount = 0;
        this.selectedReminders.forEach((reminder) => {
            this.subs.add(
                this.reminderService.deletePaymentReminderSettings(reminder.id).subscribe({
                    next: (response) => {
                        deletedCount++;
                        this.loadReminders();
                    },
                    error: (err) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Failed to delete reminder',
                            life: 3000,
                        });
                    },
                    complete: () => {
                        if (deletedCount === this.selectedReminders.length) {
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Successful',
                                detail: `${deletedCount} Reminder(s) Deleted`,
                                life: 3000,
                            });
                            this.selectedReminders = [];
                        }
                    },
                })
            );
        });
    }

    confirmDelete() {
        this.deleteReminderDialog = false;
        this.subs.add(
            this.reminderService.deletePaymentReminderSettings(this.reminder.id).subscribe({
                next: (response) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'Reminder Deleted',
                        life: 3000,
                    });
                    this.loadReminders();
                    this.reminders = [...this.reminders];
                    this.deleteReminderDialog = false;
                },
                error: (err) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to delete reminder',
                        life: 3000,
                    });
                },
            })
        );
        this.reminder = {} as IPaymentReminderSettingModel;
    }

    openActivationDialog(reminder : IPaymentReminderSettingModel){
        this.reminder = reminder;
        this.activationDialog = true;
    }

    hideDialog() {
        this.reminderDialog = false;
        this.submitted = false;
        this.initReminder();
        this.initFormModels();
    }

    saveReminder() {
        this.submitted = true;
        if (this.reminderForm.valid) {
            if (this.reminderForm.value.id && this.reminderForm.value.id !== '') {
                this.reminderService.EditPaymentReminderSettings(this.reminderForm.value).subscribe({
                    next: () => {
                        this.loadReminders();
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Reminder Updated',
                            life: 3000,
                        });
                        this.updateRemindersInList(this.reminderForm.value);
                        this.reminders = [...this.reminders];
                        this.reminderDialog = false;
                    },
                    error: (err) => {
                        this.handleError(err);
                    },
                });
            } else {
                this.reminderService.createPaymentReminderSettings(this.reminderForm.value).subscribe({
                    next: () => {
                        this.loadReminders();
                        this.reminders.push(this.reminderForm.value);
                        this.reminders = [...this.reminders];
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Successful',
                            detail: 'Reminder Created',
                            life: 3000,
                        });
                        this.reminderDialog = false;
                    },
                    error: (err) => {
                        this.handleError(err);
                    },
                });
            }
            this.reminderDialog = false;
        } else {
            
        }
    }

    handleError(err: any) {
        let errorMessage = 'An error occurred. Please try again.';
        if (err.error && err.error.message) {
            errorMessage = err.error.message;
        } else if (err.error && err.error.errorList && err.error.errorList.length > 0) {
            errorMessage = err.error.errorList.map((error: ApiError) => error.message).join(', ');
        }

        this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: errorMessage,
            life: 3000,
        });
    }

    updateRemindersInList(updatedReminder: IPaymentReminderSettingModel) {
        const index = this.reminders.findIndex((reminder) => reminder.id === updatedReminder.id);
        if (index !== -1) {
            this.reminders[index] = updatedReminder;
        }
    }

    findIndexById(id: string): number {
        return this.reminders.findIndex((reminder) => reminder.id === id);
    }

    private initFormModels(): void {
        this.reminderForm = this.formBuilder.group({
            id: [''],
            title: ['', [Validators.required, Validators.minLength(3)]],
            subject: ['', [Validators.required, Validators.minLength(3)]],
            message: ['', [Validators.required, Validators.minLength(3)]],
            beforePayCount: [0, [Validators.required]],
            isActive: false,
        });
    }

    initReminder() {
        this.reminder = {
            id: '',
            title: '',
            subject: '',
            message: '',
            beforePayCount: 0,
            isActive: false,
        };
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    hasPermission(controlKey: string): boolean {
        return this.pagePermessions.some(p => p.controlKey === controlKey);
    }

    ngOnDestroy(): void {
        this.subs.unsubscribe();
    }
}