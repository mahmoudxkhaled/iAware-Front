import { AfterViewChecked, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Table, TableLazyLoadEvent, TableRowSelectEvent } from 'primeng/table';
import { UserService } from '../../services/user.service';
import { IUserModel } from '../../models/IUserModel';
import { Observable, Subscription } from 'rxjs';
import { MessageService, MenuItem, TreeNode } from 'primeng/api';
import { AbstractControl, FormControl, FormGroup, Validators, ValidationErrors } from '@angular/forms';
import { RoleService } from 'src/app/modules/role/services/role.service';
import { IAspNetPageItemModel } from 'src/app/modules/page-management/models/IAspNetPageItemModel';
import { PermessionsService } from 'src/app/core/Services/permessions.service';
import { ILanguageModel } from 'src/app/modules/language/models/ILanguageModel';
import { IRoleModel } from '../../models/IRoleModel';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { TrainingLessonService } from 'src/app/modules/security-training/services/training-lesson.service';
import { EcncryptionService } from 'src/app/core/Services/ecncryption.service';
import { FileDownloadService } from 'src/app/core/Services/file-download.service';
import * as CryptoJS from 'crypto-js';
import { ExcelService } from 'src/app/core/Services/excel.service';
import { IUsersExcelModel } from '../../models/IUsersExcelModel';
import { IUserExcelModel } from '../../models/IUserExcelModel';
import { constants } from 'src/app/core/constatnts/constatnts';
import { AdSyncService } from 'src/app/core/Services/ad-sync.service';
import { IADOUsModel } from '../../models/IADOUsModel';
import { IADApplicationUserModel } from '../../models/IADApplicationUserModel';
import { TranslationService } from 'src/app/core/Services/translation.service';
import { Router } from '@angular/router';
import { IExcelAnalysis, InvalidRecords, IUniqueRecordsFromExcel } from '../../models/IExcelAnalysis';
import { ITenantUnitModel } from 'src/app/modules/tenant-unit/models/ITenantUnitModel';
import { PdfService } from 'src/app/core/Services/pdf.service';
import { TableLoadingService } from 'src/app/core/Services/table-loading.service';
import { IPaginationModel } from 'src/app/core/Dtos/IPaginationModel';
import { DropdownListDataSourceService } from 'src/app/core/Services/dropdown-list-data-source.service';

const ENCRYPT_KEY = 'Ya)RH*qy6~7d-v&}mwr24G';
const IV = CryptoJS.enc.Hex.parse('1234567890ABCDEF');
@Component({
    selector: 'app-user-listing',
    templateUrl: './user-listing.component.html',
    styleUrl: './user-listing.component.scss',
})
export class UserListingComponent implements OnInit, AfterViewChecked, OnDestroy {
    tableLoadingSpinner: boolean = true;

    users: IUserModel[] = [];
    userToggleControls: { [key: string]: FormControl } = {};
    deletedUsers: IUserModel[] = [];
    currentUserSelected: IUserModel = {
        email: '',
        firstName: '',
        lastName: '',
        password: '',
        roleId: [],
        roles: [],
        theme: '',
        languageId: '',
        isDefaultTenantUser: false,
        isActive: false,
    };
    unsubscribe: Subscription[] = [];
    usersFromADToSelectFromThem: IADOUsModel[] = [];
    deleteUserDialog: boolean = false;
    editeUserDialog: boolean = false;
    addUserDialog: boolean = false;
    activationUserDialog: boolean = false;
    isADBtnEnabled: boolean = false;
    userDialog: boolean = false;
    disapleAllBtns: boolean = false;
    adUsersDialog: boolean = false;
    excelUsersDialog: boolean = false;
    openConfirmBtn: boolean = false;
    showDuplicatedRecords = false;
    showInvalidRecords = false;
    excelUsersTreeDialog = false;
    userForm!: FormGroup;
    roles: any[] = [];
    pagePermessions: IAspNetPageItemModel[] = [];
    actions = constants.pageActions;
    selectedFile: File;
    userAddForm!: FormGroup;
    UserModel!: IUserModel;
    rolesToAdd: IRoleModel[] = [];
    languages: ILanguageModel[] = [];
    menuItems: MenuItem[] = [];
    visible: boolean = false;
    progress: number = 0;
    interval: any = null;
    usersForExcel: IUsersExcelModel;
    groups: any[] = [];
    files: TreeNode[] = [];
    excelUsersTree: TreeNode[] = [];
    selectedADUsersToInsert: TreeNode[] = [];
    selectedExcelTreeToInsert: TreeNode[] = [];
    selectedExcelUsersToInsert: TreeNode[] = [];
    adHeaderText: string = '';
    excelHeaderText: string = '';
    validNumberOfLicence: number = 0;
    finalADusersToInserts: IADApplicationUserModel[] = [];
    finalExcelusersToInserts: IUserExcelModel[] = [];
    excelusersReturnedToSelect: IUserExcelModel[] = [];
    tenantUnits: ITenantUnitModel[] = [];
    analysisData: IExcelAnalysis | null;
    isLoading$: Observable<boolean>;
    excelUsersFinalStep: string = 'Final Step';

    totalRecords: number = 0;
    deletedUsersTotalRecords: number = 0;
    pagination: IPaginationModel = {
        page: 0,
        size: 10,
        searchQuery: ''
    };

    deletedUsersPagination: IPaginationModel = {
        page: 0,
        size: 10,
        searchQuery: ''
    };

    constructor(
        private apiService: UserService,
        private messageService: MessageService,
        private roleService: RoleService,
        private permessionService: PermessionsService,
        private authService: AuthService,
        private trainingServ: TrainingLessonService,
        private encryptService: EcncryptionService,
        private dropdownListDataSourceService: DropdownListDataSourceService,
        private downloadService: FileDownloadService,
        private excelService: ExcelService,
        private cdr: ChangeDetectorRef,
        private adSyncService: AdSyncService,
        private translate: TranslationService,
        private router: Router,
        private pdfService: PdfService,
        private tableLoadingService: TableLoadingService
    ) {
        this.pagePermessions = this.permessionService.getPagePermessions(constants.pages.users);
        this.isLoading$ = this.adSyncService.isLoadingSubject;
    }

    ngAfterViewChecked(): void {
        this.cdr.detectChanges();
    }

    @ViewChild('dt') _usersTable: Table;

    ngOnInit() {
        this.tableLoadingService.loading$.subscribe((isLoading) => {
            this.tableLoadingSpinner = isLoading;
        });

        const editBtn = {
            label: this.translate.getInstant('user.user-listing.actions.editUser'),
            icon: 'pi pi-fw pi-user-edit',
            command: () => this.openEditUserDialog(this.currentUserSelected),
        };
        const deleteBtn = {
            label: this.translate.getInstant('user.user-listing.actions.delete'),
            icon: 'pi pi-fw pi-trash',
            command: () => this.openDeleteUserDialog(this.currentUserSelected),
        };
        this.menuItems = [];
        if (this.hasPermission(this.actions.edit)) {
            this.menuItems.push(editBtn);
        }
        if (this.hasPermission(this.actions.delete)) {
            this.menuItems.push(deleteBtn);
        }

        this.initiateForm();
        this.fetchRoles();
        this.fetchLanguages();
        this.isADDataCompleted();
        this.fetchTenantValidLisence();
    }

    navigateToUserDashboard(user: IUserModel) {
        this.router.navigate([`users/userDetail/${user?.id}`]);
    }

    assigneCurrentSelect(user: IUserModel) {
        this.currentUserSelected = user;
    }

    checkIfNumberOfUsersInTenantSubscriptionPlane() {
        const sub = this.apiService.CheckTenantUsersLicence().subscribe({
            next: (res) => {
                this.disapleAllBtns = res.data;
            },
            error: (err) => { },
        });
        this.unsubscribe.push(sub);
    }

    lazyLoadUsers(event: any) {
        this.pagination.searchQuery = event.globalFilter || '';
        this.pagination.page = event.first / event.rows;
        this.pagination.size = event.rows;
        this.fetchUsers();
    }


    lazyLoadDeletedUsers(event: any) {
        this.deletedUsersPagination.searchQuery = event.globalFilter || '';
        this.deletedUsersPagination.page = event.first / event.rows;
        this.deletedUsersPagination.size = event.rows;
        this.fetchDeletedUsers();
    }

    fetchUsers() {
        this.tableLoadingService.show();

        const sub = this.apiService.getAllUsers(this.pagination).subscribe({
            next: (res) => {
                this.users = res.data;
                this.totalRecords = res.totalRecords;
                this.users?.forEach(user => {
                    this.userToggleControls[user.id!] = new FormControl(user.isActive);
                });
            },
            error: (err) => { },
            complete: () => {
                this.checkIfNumberOfUsersInTenantSubscriptionPlane();
                this.tableLoadingService.hide();
            },
        });
        this.unsubscribe.push(sub);
    }

    fetchDeletedUsers() {
        this.tableLoadingService.show();

        const sub = this.apiService.getAllDeletedUsers(this.deletedUsersPagination).subscribe({
            next: (res) => {
                this.deletedUsers = res.data;
                this.deletedUsersTotalRecords = res.totalRecords;
            },
            error: (err) => { },
            complete: () => {
                this.tableLoadingService.hide();
                this.checkIfNumberOfUsersInTenantSubscriptionPlane();
            },
        });
        this.unsubscribe.push(sub);
    }

    returnUserDeleted(userId: string) {
        if (userId) {
            this.apiService.returnDeletedUser(userId).subscribe({
                next: (res) => {
                    if (res.code === 300) {
                        this.messageService.add({
                            severity: 'warn',
                            summary: 'Warning',
                            detail: res.message,
                        });
                    } else {
                        this.fetchDeletedUsers();
                        this.fetchUsers();
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: 'User un deleted successfully',
                        });
                    }
                },
                error: (err) => { },
            })
        }
    }

    fetchTenantUnits() {
        const sub = this.dropdownListDataSourceService.getTenantUnits().subscribe({
            next: (res) => {
                this.tenantUnits = res.data;
            },
            error: (err) => { },
        });
        this.unsubscribe.push(sub);
    }

    fetchTenantValidLisence() {
        const sub = this.apiService.getTenantValidLicence().subscribe({
            next: (res) => {
                this.validNumberOfLicence = res.data;
            },
            error: (err) => { },
        });
    }

    fetchGroups() {
        const sub = this.dropdownListDataSourceService.getTenantGroups().subscribe({
            next: (response) => {
                this.groups = response.data;
            },
            error: (error) => { },
        });
        this.unsubscribe.push(sub);
    }

    openEditUserDialog(user: IUserModel) {
        this.editeUserDialog = true;
        this.fetchGroups();
        this.fetchTenantUnits();
        this.apiService.getUserWithRole(user.id!).subscribe({
            next: (res) => {
                this.currentUserSelected = res.data;
                this.userForm.patchValue({
                    id: this.currentUserSelected.id,
                    firstName: this.currentUserSelected.firstName,
                    lastName: this.currentUserSelected.lastName,
                    email: this.currentUserSelected.email,
                    groupsIds: this.currentUserSelected.groupsIds,
                    languageId: this.currentUserSelected.languageId,
                    tenantUnitId: this.currentUserSelected.tenantUnitId,
                });
            },
            error: (error) => { },
        });
    }

    openDeleteUserDialog(user: IUserModel) {
        this.deleteUserDialog = true;
        this.currentUserSelected = user;
    }

    openActivationDialog(user: IUserModel) {
        this.activationUserDialog = true;
        this.currentUserSelected = user;
    }

    onCancelActivationDialog() {
        this.activationUserDialog = false;
        this.userToggleControls[this.currentUserSelected.id!].setValue(this.currentUserSelected.isActive);
    }

    hideDialog() {
        this.editeUserDialog = false;
        this.addUserDialog = false;
        this.deleteUserDialog = false;
        this.clearExcelInput();
    }

    editeUser() {
        this.currentUserSelected.firstName = this.userForm.value.firstName;
        this.currentUserSelected.lastName = this.userForm.value.lastName;
        this.currentUserSelected.groupsIds = this.userForm.value.groupsIds;
        this.currentUserSelected.languageId = this.userForm.value.languageId;
        this.currentUserSelected.tenantUnitId = this.userForm.value.tenantUnitId;
        const sub = this.apiService.updateUser(this.currentUserSelected).subscribe({
            next: (res) => {
                this.fetchUsers();
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'User updated successfully',
                });
                this.hideDialog();
            },
        });
    }

    activation(value: boolean) {
        if (value) {
            // TO Do For Activate User
            const sub = this.apiService.activeUser(this.currentUserSelected.id!).subscribe({
                next: (res) => {
                    this.fetchUsers();
                    this.activationUserDialog = false;
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'user activated successfully',
                        life: 3000,
                    });
                },
                error: (error) => { },
            });
            this.unsubscribe.push(sub);
        } else {
            // TO Do For Deactivate User
            const sub = this.apiService.deActiveUser(this.currentUserSelected.id!).subscribe({
                next: (res) => {
                    this.fetchUsers();
                    this.activationUserDialog = false;
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Successful',
                        detail: 'user deactivated successfully',
                        life: 3000,
                    });
                },
                error: (error) => { },
            });
            this.unsubscribe.push(sub);
        }
    }

    confirmDelete() {
        const sub = this.apiService.deleteUser(this.currentUserSelected.id!).subscribe({
            next: (res) => {
                if (res.code !== 300) {
                    this.fetchUsers();
                }

                this.deleteUserDialog = false;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'user deleted successfully',
                    life: 3000,
                });
            },
            error: (error) => { },
        });
        this.unsubscribe.push(sub);
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    navigateToCreateUsers() {
        this.addUserDialog = true;
        this.initiateUserForm();
        this.fetchGroups();
        this.fetchTenantUnits();
    }

    fetchLanguages() {
        const sub = this.dropdownListDataSourceService.getActiveLanguages().subscribe((res) => {
            this.languages = res.data;
        });
        this.unsubscribe.push(sub);
    }

    fetchRoles() {
        const sub = this.roleService.getRoles().subscribe({
            next: (res) => {
                this.roles = res;
                this.rolesToAdd = res;
            },
            error: (err) => { },
        });
        this.unsubscribe.push(sub);
    }

    initiateForm() {
        this.userForm = new FormGroup({
            firstName: new FormControl<string>('', Validators.required),
            lastName: new FormControl<string>('', Validators.required),
            languageId: new FormControl<string>('', [Validators.required]),
            groupsIds: new FormControl<string[]>([]),
            tenantUnitId: new FormControl<string>(''),
        });
    }

    hasPermission(controlKey: string): boolean {
        return this.pagePermessions.some((p) => p.controlKey === controlKey);
    }

    initiateUserForm() {
        this.userAddForm = new FormGroup({
            firstName: new FormControl<string>('', [Validators.required]),
            lastName: new FormControl<string>('', [Validators.required]),
            // userName: new FormControl<string>('', [Validators.required, Validators.pattern(constants.usernameRegex), noConsecutivePeriods ]),
            email: new FormControl<string>('', [Validators.email, Validators.required]),
            groupsIds: new FormControl<string[]>([]),
            languageId: new FormControl<string>('', [Validators.required]),
            tenantUnitId: new FormControl<string>(''),
            isActive: new FormControl<boolean>(false),
        });
    }

    noConsecutivePeriods(control: FormControl) {
        const value = control.value;
        if (value && value.includes('..')) {
            return { consecutivePeriods: true };
        }
        return null;
    }

    onSubmit() {
        this.UserModel = {
            firstName: this.userAddForm.value.firstName?.trim(),
            lastName: this.userAddForm.value.lastName?.trim(),
            // userName: this.userAddForm.value.userName?.trim(),
            email: this.userAddForm.value.email?.trim(),
            languageId: this.userAddForm.value.languageId,
            isActive: this.userAddForm.value.isActive,
            roleId: this.roles?.map((c: any) => {
                return c.id;
            }),
            groupsIds: this.userAddForm.value.groupsIds?.map((c: any) => {
                return c.id;
            }),
            tenantUnitId: this.userAddForm.value.tenantUnitId,
        };
        const sub = this.authService.addNewUser(this.UserModel).subscribe({
            next: (res) => {
                if (res.code === 200) {
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Warning',
                        detail: 'Duplication Not Accepted, this user already exist please provide uniqe email address',
                        life: 3000,
                    });
                } else if (res.code === 300) {
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Warning',
                        detail: 'you have not more licence to add new users',
                        life: 3000,
                    });
                } else {
                    this.addUserDialog = false;
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'User added successfully',
                        life: 3000,
                    });
                    this.sendVerificationAndResetPasswordEmailToUsers([res.data]);
                    this.fetchUsers();
                }
            },
        });
        this.unsubscribe.push(sub);
    }

    sendVerificationAndResetPasswordEmailToUsers(users: IUserModel[]) {
        const sub = this.apiService.sendVerificationEmailToListOfUsers(users).subscribe();
        this.unsubscribe.push(sub);
    }

    async dowenloadExcelSample() {
        this.downloadService.downloadFileFromAssets('Excel', 'User List Sample.xlsx');
    }

    async exportExcel() {
        const filteredData = this.users.map((c) => {
            return {
                Email: c.email,
                FirstName: c.firstName,
                LastName: c.lastName,
                Langugae: this.getLanguageNameByLanguageId(c.languageId!),
                Roles: c.roles?.join(', '),
                PhoneNumber: c.phoneNumber,
                OrganizationUnit: c.tenantUnitName,
            };
        });
        await this.excelService.exportExcel(filteredData, 'Active Users List');
    }

    async exportDeletedExcel() {
        const filteredData = this.deletedUsers.map((c) => {
            return {
                Email: c.email,
                FirstName: c.firstName,
                LastName: c.lastName,
                Langugae: this.getLanguageNameByLanguageId(c.languageId!),
                Roles: c.roles?.join(', '),
                PhoneNumber: c.phoneNumber,
                OrganizationUnit: c.tenantUnitName,
            };
        });
        await this.excelService.exportExcel(filteredData, 'Deleted Users List');
    }

    async importData(file: any) {
        const data = await this.excelService.importExcel(file);
        if (data) {
            const usersList: IUserExcelModel[] = data.map((c) => {
                return {
                    email: c?.email,
                    firstName: c?.firstname,
                    lastName: c?.lastname,
                    phoneNumber: c?.phonenumber?.toString(),
                    department: c?.department,
                    roleIds: this.roles?.map((c) => {
                        return c.id;
                    }),
                };
            });
            this.usersForExcel = {
                users: usersList,
            };

            // Logic To Analyze Excel Data
            this.analysisData = this.analyzeExcelData(usersList, file);
        }
        this.cdr.detectChanges();
    }

    analyzeExcelData(usersList: IUserExcelModel[], file: File): IExcelAnalysis {
        const totalRecords = usersList.length;

        const emailSet = new Set();
        const duplicatedRecords: IUserExcelModel[] = [];
        const uniqueRecordsByOU: { [key: string]: IUserExcelModel[] } = {};
        const invalidRecords: InvalidRecords[] = [];
        const ouMap: { [key: string]: number } = {}; // For OU analysis
        usersList?.forEach((user) => {
            let isValid = true;
            let reasons: string[] = [];

            // Validation firstName
            if (this.isNullOrEmpty(user.firstName)) {
                reasons.push('Invalid First Name');
                isValid = false;
            }

            // lastName
            if (this.isNullOrEmpty(user.lastName)) {
                reasons.push('Invalid Last Name');
                isValid = false;
            }

            // Validate email
            if (!user.email || !this.isValidEmail(user.email)) {
                reasons.push('Invalid Email');
                isValid = false;
            }

            // Validate phone number
            if (!user.phoneNumber || !this.isValidPhoneNumber(user.phoneNumber)) {
                reasons.push('Invalid Phone Number');
                isValid = false;
            }

            // Track user by OU
            const departmentName = user.department;
            if (departmentName) {
                if (!uniqueRecordsByOU[departmentName]) {
                    uniqueRecordsByOU[departmentName] = [];
                }

                if (isValid) {
                    if (emailSet.has(user.email)) {
                        duplicatedRecords.push(user);
                    } else {
                        emailSet.add(user.email);
                        uniqueRecordsByOU[departmentName].push(user);

                        // Count users for OU analysis
                        if (ouMap[departmentName]) {
                            ouMap[departmentName]++;
                        } else {
                            ouMap[departmentName] = 1;
                        }
                    }
                }
            }

            if (!isValid) {
                invalidRecords.push({ ...user, reason: reasons });
            }
        });

        // Convert unique records by OU to array format
        const uniqueRecords: IUniqueRecordsFromExcel[] = Object.keys(uniqueRecordsByOU).map((department) => ({
            department,
            uniqueUsers: uniqueRecordsByOU[department],
        }));

        // Convert ouMap to an array of objects for easier consumption
        const ouAnalysis = Object.keys(ouMap).map((department) => ({
            department,
            userCount: ouMap[department],
        }));

        const uniqueRecordsNumber = uniqueRecords.reduce((sum, ouGroup) => sum + ouGroup.uniqueUsers.length, 0);

        const fileName = file.name;
        const fileSize = this.formatFileSize(file.size); // Convert file size to readable format

        return {
            totalRecords,
            duplicatedRecords: duplicatedRecords.length,
            duplicatedRecordsList: duplicatedRecords,
            uniqueRecordsNumber,
            uniqueRecords, // Grouped unique records by OU
            fileName,
            fileSize,
            ouAnalysis, // OU analysis (number of users per OU)
            invalidRecords: invalidRecords.length, // Count of invalid records
            invalidRecordsList: invalidRecords, // List of invalid records with reasons
        };
    }

    isValidPhoneNumber(phoneNumber: string): boolean {
        const phonePattern = /^(?=.{4,15}$)(?:\+1)?[\s()-.]?\d{1,3}[\s()-.]?\d{1,4}[\s()-.]?\d{0,4}$/;
        return phonePattern.test(phoneNumber);
    }

    formatFileSize(sizeInBytes: number): string {
        const kb = 1024;
        const mb = kb * 1024;

        if (sizeInBytes >= mb) {
            return sizeInBytes / mb + ' MB';
        } else {
            return sizeInBytes / kb + ' KB';
        }
    }

    isNullOrEmpty(value: string | null | undefined): boolean {
        return !value || value.trim() === '';
    }

    isValidEmail(email: string): boolean {
        const emailPattern =
            /^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)\s*$/;
        return emailPattern.test(email);
    }

    toggleDuplicatedRecords() {
        this.showInvalidRecords = false;
        this.showDuplicatedRecords = !this.showDuplicatedRecords;
    }

    toggleInvalidRecords() {
        this.showDuplicatedRecords = false;
        this.showInvalidRecords = !this.showInvalidRecords;
    }

    confirmImportData() {
        this.closeFn();
        this.excelUsersTreeDialog = true;
        this.excelUsersTree =
            this.analysisData?.uniqueRecords?.map((parent) => ({
                key: parent.department,
                label: parent.department,
                selectable: parent.uniqueUsers.length > 0 ? true : false,
                children: parent.uniqueUsers?.map((user) => ({
                    key: user.email,
                    label: `${user.firstName} ${user.lastName}`,
                    leaf: true,
                })),
            })) ?? [];
    }

    onUploadFileClick() {
        const fileInput = document.getElementById('excelFile') as HTMLInputElement;
        fileInput.click();
    }

    closeFn() {
        this.messageService.clear();
    }

    onUploadComplete(event: any) {
        const input = event.target as HTMLInputElement;
        // this.showConfirm();
        if (input.files && input.files.length) {
            this.selectedFile = input.files[0];
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.cdr.detectChanges();
            };
            reader.readAsDataURL(this.selectedFile);
            input.value = '';
        }
        this.analysisData = null;
        this.importData(this.selectedFile);
    }

    clearExcelInput() {
        const fileInput = document.getElementById('excelFile') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
            this.analysisData = null;
        }
    }

    getLanguageNameByLanguageId(id: string): string | undefined {
        if (!id) return undefined;
        const language = this.languages.find((c) => c.id === id);
        return language?.name;
    }

    getRolesIdsFromRolesNames(rolesNames: string[]): string[] {
        const result = rolesNames?.map((roleName) => {
            const role = this.roles.find((c) => c.name?.toLowerCase() === roleName?.toLowerCase());
            return role?.id;
        });
        return result;
    }

    syncADUsers() {
        this.adSyncService.syncADUsers().subscribe({
            next: (res) => {
                if (res.code === 300) {
                    // So there we should make admin to chose users must be in iAwareDB
                    this.usersFromADToSelectFromThem = res.data;
                    this.validNumberOfLicence = +res.message;
                    if (this.validNumberOfLicence === 0) {
                        this.messageService.add({
                            severity: 'warn',
                            summary: 'Warning',
                            detail: `you have #${res.message} licence, so you can't add more users`,
                            life: 3000,
                        });
                        return;
                    }
                    this.files = this.usersFromADToSelectFromThem.map((parent) => ({
                        key: parent.name,
                        label: parent.name,
                        selectable: parent.users.length > 0 ? true : false,
                        children: parent.users.map((user) => ({
                            key: user.samAccountName,
                            label: user.name,
                            leaf: true,
                            parentName: parent.name,
                        })),
                    }));
                    this.adHeaderText = `Choose Users Based On OUs NOT THAT YOU HAVE ONLY #${res.message} LICENCE`;
                    this.adUsersDialog = true;
                } else {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Users synchronized successfully',
                        life: 3000,
                    });
                    this.addUserDialog = false;
                    this.fetchUsers();
                }
            },
        });
    }

    isADDataCompleted() {
        const sub = this.apiService.isADDataCompleted().subscribe({
            next: (re) => {
                this.isADBtnEnabled = re.isSuccess ? true : false;
            },
        });
        this.unsubscribe.push(sub);
    }

    InsertFinalADUsers() {
        this.finalADusersToInserts = this.selectedADUsersToInsert
            ?.filter((c) => c.leaf)
            ?.map((d: any) => {
                return {
                    samAccountName: d.key,
                    name: d.label,
                    groupName: d?.parentName,
                } as IADApplicationUserModel;
            });

        if (this.finalADusersToInserts.length === 0) {
            return;
        }

        if (this.finalADusersToInserts.length > this.validNumberOfLicence) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: `Please You Have ONLY #${this.validNumberOfLicence}, So Don't Select More Than Your Licence`,
                life: 3000,
            });
            return;
        }

        this.finalADusersToInserts.forEach((u) => {
            u.rolesId = this.roles?.map((c: any) => {
                return c.id;
            });
        });

        this.adUsersDialog = false;
        this.selectedADUsersToInsert = [];
        this.adSyncService.insertFinalADUsers(this.finalADusersToInserts).subscribe({
            next: (re) => {
                if (re.code === 200) {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Users synchronized successfully',
                        life: 3000,
                    });
                    this.sendVerificationAndResetPasswordEmailToUsers(re.data);
                    this.fetchUsers();
                    this.addUserDialog = false;
                } else if (re.code === 201) {
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Success',
                        detail: 'Duplication Not Accepted',
                        life: 3000,
                    });
                }
            },
            error: (e) => { },
        });
    }

    InsertFinalExcelUsers() {
        // First Get The Children
        this.selectedExcelTreeToInsert = this.selectedExcelTreeToInsert.filter((c) => c.leaf);
        if (this.selectedExcelTreeToInsert?.length > this.validNumberOfLicence) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: `Please You Have ONLY #${this.validNumberOfLicence}, So Don't Select More Than Your Licence`,
                life: 3000,
            });
            return;
        }

        // Second Get Orignal Rows From Uniqe Rows

        const originalUniaRecords = this.analysisData?.uniqueRecords?.flatMap((c) => c.uniqueUsers) ?? [];
        const finalUsersToInserts = originalUniaRecords.filter((user) =>
            this.selectedExcelTreeToInsert.some((selected) => selected.key === user.email)
        );

        this.usersForExcel = {
            users: finalUsersToInserts,
        };

        this.addUsersFromExcel(this.usersForExcel);
        this.excelUsersTreeDialog = false;
    }

    addUsersFromExcel(data: IUsersExcelModel) {
        const sub = this.apiService.addUserList(data).subscribe({
            next: (res) => {
                if (res.code === 201) {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Users added successfully',
                        life: 3000,
                    });
                    this.clearExcelInput();
                    this.addUserDialog = false;
                    this.fetchUsers();
                    this.sendVerificationAndResetPasswordEmailToUsers(res.data);
                } else if (res.code === 200) {
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Success',
                        detail: 'Duplication Not Accepted',
                        life: 3000,
                    });
                } else if (res.code === 204) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Something Wrong Happend',
                        life: 3000,
                    });
                } else if (res.code === 300) {
                    this.validNumberOfLicence = +res.message;
                    this.excelUsersFinalStep = `You Have Only ${res.message} licence can add`;
                    if (this.validNumberOfLicence !== 0) this.confirmImportData();
                    else
                        this.messageService.add({
                            severity: 'warn',
                            summary: 'Warning',
                            detail: `you have #${res.message} licence, so you can't add more users`,
                            life: 3000,
                        });
                } else {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: res.message, life: 3000 });
                }
            },
            error: (e) => { },
        });
        this.unsubscribe.push(sub);
    }

    ngOnDestroy(): void {
        this.unsubscribe.forEach((u) => {
            u.unsubscribe();
        });
    }
}