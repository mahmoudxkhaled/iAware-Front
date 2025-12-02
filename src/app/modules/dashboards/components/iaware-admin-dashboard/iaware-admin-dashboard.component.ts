import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import { ExcelService } from 'src/app/core/Services/excel.service';
import { TranslationService } from 'src/app/core/Services/translation.service';
import { ITenantManagementModel } from '../../models/ITenantManagementModel';
import { DropdownChangeEvent } from 'primeng/dropdown';
import { Table } from 'primeng/table';
import { TableLoadingService } from 'src/app/core/Services/table-loading.service';
import { Observable, Subscription } from 'rxjs';
import { IawareDashboardService } from '../../services/iaware-dashboard.service';
import { ITenantStatisticsModel } from '../../models/ITenantStatisticsModel';

@Component({
  selector: 'app-iaware-admin-dashboard',
  templateUrl: './iaware-admin-dashboard.component.html',
  styleUrl: './iaware-admin-dashboard.component.scss'
})
export class IAwareAdminDashboardComponent implements OnInit, OnDestroy {
  tableLoadingSpinner: boolean = true;
  isLoading$: Observable<boolean>;
  menuItems: MenuItem[] = [];
  currentUserSelected: ITenantManagementModel = {
    id: '',
    manager: '',
    subscriptionPlanId: '',
    companyName: '',
    email: '',
    isActive: false,
    isDeleted: false,
    licenses: 0,
    expiryDate: new Date
  };
  unsubscribe: Subscription[] = [];
  subscriptions: any[] = [];
  status: any[] = ['All', 'Active', 'Inactive']
  activeClients: ITenantManagementModel[] = [];
  deletedClients: ITenantManagementModel[] = [];
  filteredActiveClients: ITenantManagementModel[] = [];
  filteredDeletedClients: ITenantManagementModel[] = [];
  activationUserDialog: boolean = false;
  deleteUserDialog: boolean = false;
  unDeleteUserDialog: boolean = false;
  subscriptionFilter: string;
  statusFilter: string;
  tenantsStatistics: ITenantStatisticsModel = {
    totalClients: 0,
    activeClients: 0,
    expiringSubscriptions: 0
  };

  constructor(private excelService: ExcelService,
    private translate: TranslationService,
    private tableLoadingService: TableLoadingService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef,
    private apiService: IawareDashboardService) {
    this.isLoading$ = this.apiService.isLoadingSubject;
  }

  ngOnInit(): void {
    this.tableLoadingService.loading$.subscribe((isLoading) => {
      this.tableLoadingSpinner = isLoading;
    });

    this.initializeActions();
    this.fetchAllTenants();
    this.fetchTenantsStatistics();
    this.fetchSupscriptionPlans();
  }

  initializeActions() {
    this.menuItems = [];

    // const editBtn = {
    //   label: this.translate.getInstant('shared.actions.edit'),
    //   icon: 'fa fa-fw fa-edit m-1',
    //   command: () => this.openEditUserDialog(this.currentUserSelected),
    // };

    const deleteBtn = {
      label: this.translate.getInstant('shared.actions.delete'),
      icon: 'fa fa-fw fa-trash m-1',
      command: () => this.openDeleteUserDialog(this.currentUserSelected),
    };

    // this.menuItems.push(editBtn);
    this.menuItems.push(deleteBtn);
  }

  assigneCurrentSelect(client: any) {
    this.currentUserSelected = client;
  }

  fetchSupscriptionPlans() {
    const sub = this.apiService.getAllSupscriptionPlans().subscribe({
      next: (res) => {
        this.subscriptions = [{ id: 'All', title: 'All' } as any, ...res.data];
      },
      error: (err) => { },
    });
    this.unsubscribe.push(sub);
  }

  fetchAllTenants() {
    this.statusFilter = '';
    this.subscriptionFilter = '';
    this.tableLoadingService.show();
    const sub = this.apiService.getAllTenants().subscribe({
      next: (res) => {
        const allTenanats = res.data as ITenantManagementModel[];
        const activeClients = allTenanats.filter(c => !c.isDeleted);
        const deletedClients = allTenanats.filter(c => c.isDeleted);
        this.activeClients = activeClients;
        this.deletedClients = deletedClients;
        this.filteredActiveClients = activeClients;
        this.filteredDeletedClients = deletedClients;
        this.tableLoadingService.hide();
      },
      error: (err) => { },
    });
    this.unsubscribe.push(sub);
  }

  fetchTenantsStatistics() {
    const sub = this.apiService.getTenantsStatistics().subscribe({
      next: (res) => {
        this.tenantsStatistics = res.data;
      },
      error: (err) => { },
    });
    this.unsubscribe.push(sub);
  }

  openActivationDialog(client: ITenantManagementModel) {
    this.activationUserDialog = true;
    this.currentUserSelected = client;
  }

  openEditUserDialog(client: ITenantManagementModel) {
    // Need Wgat to do
  }

  openDeleteUserDialog(client: ITenantManagementModel) {
    this.currentUserSelected = client
    this.deleteUserDialog = true;
  }

  openUnDeletedClientDialog(client: ITenantManagementModel) {
    this.currentUserSelected = client
    this.unDeleteUserDialog = true;
  }

  onSubscriptionFilterChange(event: DropdownChangeEvent) {
    this.statusFilter = this.statusFilter || 'All'; // Ensure statusFilter is initialized
    this.subscriptionFilter = event.value;
    this.applyFilters();
  }

  onStatusFilterChange(event: DropdownChangeEvent) {
    this.statusFilter = event.value;
    this.applyFilters();
  }

  applyFilters() {
    let filteredActive = this.activeClients;
    let filteredDeleted = this.deletedClients;

    // Apply subscription filter if not "All"
    if (this.subscriptionFilter && this.subscriptionFilter !== 'All') {
      filteredActive = filteredActive.filter(client => client.subscriptionPlanId === this.subscriptionFilter);
      filteredDeleted = filteredDeleted.filter(client => client.subscriptionPlanId === this.subscriptionFilter);
    }

    // Apply status filter (only affects active clients)
    if (this.statusFilter && this.statusFilter !== 'All') {
      filteredActive = filteredActive.filter(client =>
        this.statusFilter === 'Active' ? client.isActive : !client.isActive
      );
    }

    // Assign results back
    this.filteredActiveClients = filteredActive;
    this.filteredDeletedClients = filteredDeleted;
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  getsubscriptionPlanById(subscriptionPlanId: string): string {
    return this.subscriptions.find(c => c.id === subscriptionPlanId)?.title ?? '';
  }

  activation(value: boolean) {
    if (value) {
      // TO Do For Activate User
      const sub = this.apiService.activeTenant(this.currentUserSelected.id!).subscribe({
        next: (res) => {
          this.fetchAllTenants();
          this.fetchTenantsStatistics();
          this.activationUserDialog = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'tenanat activated successfully',
            life: 3000,
          });
        },
        error: (error) => { },
      });
      this.unsubscribe.push(sub);
    } else {
      // TO Do For Deactivate User
      const sub = this.apiService.deActiveTenant(this.currentUserSelected.id!).subscribe({
        next: (res) => {
          this.fetchAllTenants();
          this.fetchTenantsStatistics();
          this.activationUserDialog = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'tenanat deactivated successfully',
            life: 3000,
          });
        },
        error: (error) => { },
      });
      this.unsubscribe.push(sub);
    }
  }

  confirmDelete() {
    const sub = this.apiService.deleteTenant(this.currentUserSelected.id!).subscribe({
      next: (res) => {
        if (res.code !== 300) {
          this.fetchAllTenants();
          this.fetchTenantsStatistics();
        }

        this.deleteUserDialog = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'client deleted successfully',
          life: 3000,
        });
      },
      error: (error) => { },
    });
    this.unsubscribe.push(sub);
  }

  async exportActiveExcel() {
    const filteredData = this.activeClients.map((c) => {
      return {
        Email: c.email,
        Manager: c.manager,
        Subscription_Plan: this.getsubscriptionPlanById(c.subscriptionPlanId!),
        Company_Name: c.companyName,
        Is_Active: c.isActive,
        Licenses: c.licenses,
        Expiry_Date: c.expiryDate
      };
    });
    await this.excelService.exportExcel(filteredData, 'iAware Active Clients');
  }

  async exportDeletedExcel() {
    const filteredData = this.deletedClients.map((c) => {
      return {
        Email: c.email,
        Manager: c.manager,
        Subscription_Plan: this.getsubscriptionPlanById(c.subscriptionPlanId!),
        Company_Name: c.companyName,
        Is_Active: c.isActive,
        Licenses: c.licenses,
        Expiry_Date: c.expiryDate
      };
    });
    await this.excelService.exportExcel(filteredData, 'iAware Active Clients');
  }

  closeDialogs() {
    this.deleteUserDialog = false;
    this.activationUserDialog = false;
    this.fetchAllTenants();
    this.cdr.detectChanges();
  }

  unDeletedClient() {
    const sub = this.apiService.unDeleteTenant(this.currentUserSelected.id!).subscribe({
      next: (res) => {
        this.unDeleteUserDialog = false;
        this.fetchAllTenants();
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'client returned successfully',
          life: 3000,
        });
      },
      error: (error) => { },
    });
    this.unsubscribe.push(sub);
  }

  ngOnDestroy(): void {
    this.unsubscribe.forEach((u) => {
      u.unsubscribe();
    });
  }
}