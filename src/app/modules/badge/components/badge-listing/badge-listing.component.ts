import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Table } from 'primeng/table';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IBadgeModel } from 'src/app/modules/account/models/IBadgeModel';
import { BadgeService } from '../../services/badge.service';
import { PermessionsService } from 'src/app/core/Services/permessions.service';
import { IAspNetPageItemModel } from 'src/app/modules/page-management/models/IAspNetPageItemModel';
import { constants } from 'src/app/core/constatnts/constatnts';
import { MenuItem, MessageService } from 'primeng/api';
import { TranslationService } from 'src/app/core/Services/translation.service';
import { TableLoadingService } from 'src/app/core/Services/table-loading.service';
import { Badges } from 'src/app/core/enums/Badges';

@Component({
    selector: 'app-badge-listing',
    templateUrl: './badge-listing.component.html',
    styleUrl: './badge-listing.component.scss',
})
export class BadgeListingComponent implements OnInit, OnDestroy {
    tableLoadingSpinner: boolean = true;

    unsubscribe: Subscription[] = [];
    deleteDialog: boolean = false;
    editeDialog: boolean = false;
    activationDialog: boolean = false;
    addDialog: boolean = false;
    srcDialog: boolean = false;
    badges: IBadgeModel[] = [];
    currentSelected: IBadgeModel = {
        id: 0,
        name: '',
        descriptionName: '',
        badgeImageURL: '',
        isActive: false,
        isUserEarnedThisBadge: false,
        badgeEarnedCount: 0,
    };
    language: IBadgeModel[] = [];
    pagePermessions: IAspNetPageItemModel[] = [];
    actions = constants.pageActions;
    badgeAddForm: FormGroup;
    badgeEditForm: FormGroup;
    src: string;
    badgeImageUrl : string = '../../../../../assets/media/upload-photo.jpg';
    selectedBadgeImageFile: File | null = null;
    menuItems: MenuItem[] = [];
    badgeOptions: { label: string; value: number }[];
    constructor(
        private apiService: BadgeService,
        private permessionService: PermessionsService,
        private messageService: MessageService,
        private translate: TranslationService,
        private tableLoadingService: TableLoadingService
    ) {
        this.pagePermessions = this.permessionService.getPagePermessions(constants.pages.badge);
    }

    ngOnInit(): void {
        this.tableLoadingService.loading$.subscribe((isLoading) => {
            this.tableLoadingSpinner = isLoading;
        });

        this.menuItems = [];
        const editBtn = {
            label: this.translate.getInstant('shared.actions.edit'),
            icon: 'pi pi-fw pi-pencil',
            command: () => this.openEditDialog(this.currentSelected),
        };
        const deleteBtn = {
            label: this.translate.getInstant('shared.actions.delete'),
            icon: 'pi pi-fw pi-trash',
            command: () => this.openDeleteDialog(this.currentSelected),
        };
        if (this.hasPermission(this.actions.edit)) {
            this.menuItems.push(editBtn);
        }
        if (this.hasPermission(this.actions.delete)) {
            this.menuItems.push(deleteBtn);
        }

        this.initiateAddForm();
        this.initiateEditeForm();
        this.initializeBadgeOptions();
        this.fetchBadges();
    }

    assigneCurrentSelect(badge: IBadgeModel) {
        this.currentSelected = badge;
    }

    initializeBadgeOptions() {
        this.badgeOptions = Object.keys(Badges)
            .filter(key => isNaN(Number(key)))  // Filters out numeric keys from the enum
            .map(key => ({ label: key, value: Badges[key as keyof typeof Badges] }));
    }

    getBadgeNameById(badgeId : number):string | null {
        return this.badgeOptions.find(c => c.value == badgeId)?.label ?? null;
    }

    fetchBadges() {
        this.tableLoadingService.show();
        const x = this.apiService.getAllBadges().subscribe({
            next: (response) => {
                this.tableLoadingService.hide();
                this.badges = response.data;
            },
            error: (error) => {},
        });
        this.unsubscribe.push(x);
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    navigateToCreate() {
        this.addDialog = true;
    }

    openBadgeImageDialog(src: string) {
        let diz = document.getElementById('srcDialog') as HTMLElement;
        diz.style.display = 'block';
        this.srcDialog = true;
        this.src = src;
    }

    openEditDialog(badge: IBadgeModel) {
        this.editeDialog = true;
        this.currentSelected = badge;
        this.badgeImageUrl = badge.badgeImageURL ?? this.badgeImageUrl;
        this.badgeEditForm.patchValue({
            idBadgeToEdit: badge.id,
            nameBadgeToEdit: badge.id,
            descriptionNameToEdit: badge.descriptionName
        });
    }

    openDeleteDialog(group: IBadgeModel) {
        this.deleteDialog = true;
        this.currentSelected = group;
    }

    openActivationDialog(language: IBadgeModel) {
        this.activationDialog = true;
        this.currentSelected = language;
    }

    hideAddDialog() {
        this.addDialog = false;
    }
    hideEditDialog() {
        this.editeDialog = false;
    }

    onSubmit() {
        if (this.badgeAddForm.valid) {
            const formData = new FormData();
            const badgeName = this.getBadgeNameById(this.badgeAddForm.value.nameBadgeToAdd);
            if(badgeName === null)
                return;
            formData.append('Id', this.badgeAddForm.value.nameBadgeToAdd);
            formData.append('Name', badgeName);
            formData.append('DescriptionName', this.badgeAddForm.value.descriptionNameToAdd)
            if (this.selectedBadgeImageFile) {
                formData.append('Image', this.selectedBadgeImageFile);
            }else{
                return;
            }
            this.apiService.addBadge(formData).subscribe({
                next: (res) => {
                    this.fetchBadges();
                    this.addDialog = false;
                    this.selectedBadgeImageFile = null;
                    this.badgeImageUrl = '../../../../../assets/media/upload-photo.jpg'
                    this.initiateAddForm();
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'badge added successfully',
                    });
                },
                error: (error) => {},
            });
        }
    }

    edit() {
        if (this.badgeEditForm.valid) {
            const formData = new FormData();
            const badgeName = this.getBadgeNameById(this.badgeEditForm.value.nameBadgeToEdit);
            if(badgeName === null)
                return;
            formData.append('Id', this.badgeEditForm.value.nameBadgeToEdit);
            formData.append('Name', badgeName);
            formData.append('DescriptionName', this.badgeEditForm.value.descriptionNameToEdit);
            if (this.selectedBadgeImageFile) {
                formData.append('Image', this.selectedBadgeImageFile);
            }
            
            const x = this.apiService.editBadge(formData).subscribe({
                next: (res) => {
                    this.fetchBadges();
                    this.hideEditDialog();
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'badge updated successfully',
                    });
                },
                error: (error) => {},
            });
            this.unsubscribe.push(x);
            this.selectedBadgeImageFile = null;
        }
    }

    activation(value: boolean) {
        if (value) {
            const x = this.apiService.activateBadge(this.currentSelected.id!).subscribe({
                next: (res) => {
                    this.fetchBadges();
                    this.activationDialog = false;
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'badge activated successfully',
                        life: 3000,
                    });
                },
                error: (error) => {},
            });
            this.unsubscribe.push(x);
        } else {
            const x = this.apiService.deActivateBadge(this.currentSelected.id!).subscribe({
                next: (res) => {
                    this.fetchBadges();
                    this.activationDialog = false;
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'badge deactivated successfully',
                        life: 3000,
                    });
                },
                error: (error) => {},
            });
            this.unsubscribe.push(x);
        }
    }

    delete() {
        const x = this.apiService.deleteBadge(this.currentSelected.id!).subscribe({
            next: (res) => {
                this.deleteDialog = false;
                if (res.code === 300) {
                    this.messageService.add({ severity: 'warn', summary: 'Warning', detail: res.message, life: 3000 });
                    return;
                }
                this.fetchBadges();
                this.messageService.add({
                    severity: 'success',
                    summary: 'Successful',
                    detail: 'badge deleted successfully',
                    life: 3000,
                });
            },
            error: (error) => {},
        });
        this.unsubscribe.push(x);
    }

    initiateAddForm() {
        this.badgeAddForm = new FormGroup({
            nameBadgeToAdd: new FormControl<string>('', [Validators.required]),
            descriptionNameToAdd: new FormControl<string>(''),
            imageBadgeToAdd: new FormControl<string>(''),
        });
    }

    initiateEditeForm() {
        this.badgeEditForm = new FormGroup({
            idBadgeToAdd: new FormControl<number>(0),
            nameBadgeToEdit: new FormControl<string>('', [Validators.required]),
            imageBadgeToEdit: new FormControl<string>(''),
            descriptionNameToEdit: new FormControl<string>(''),
        });
    }

    onBadgeImageToAddChange(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length) {
            const file = input.files[0];
            this.badgeAddForm.patchValue({
                imageBadgeToAdd: file,
            });
        }
    }

    onBadgeImageToEditChange(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length) {
            const file = input.files[0];
            this.badgeEditForm.patchValue({
                imageBadgeToEdit: file,
            });
        }
    }

    onUploadClick() {
        const fileInput = document.getElementById('badgeImageUrl') as HTMLInputElement;
        fileInput.click();
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length) {
            this.selectedBadgeImageFile = input.files[0];

            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.badgeImageUrl = e.target.result;
            };
            reader.readAsDataURL(this.selectedBadgeImageFile);
        }
    }

    hasPermission(controlKey: string): boolean {
        return this.pagePermessions.some((p) => p.controlKey === controlKey);
    }

    ngOnDestroy(): void {
        this.unsubscribe.forEach((u) => {
            u.unsubscribe();
        });
    }
}
