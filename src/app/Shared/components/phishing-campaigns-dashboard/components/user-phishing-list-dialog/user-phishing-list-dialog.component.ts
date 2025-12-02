import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CheckboxChangeEvent } from 'primeng/checkbox';
import { ExcelService } from 'src/app/core/Services/excel.service';
import { PdfService } from 'src/app/core/Services/pdf.service';
import { TableLoadingService } from 'src/app/core/Services/table-loading.service';
import { IPhishingCampaignUserModel } from 'src/app/modules/phishing-campaigns/models/IPhishingCampaignUserModel';

@Component({
  selector: 'app-user-phishing-list-dialog',
  templateUrl: './user-phishing-list-dialog.component.html',
  styleUrls: ['./user-phishing-list-dialog.component.scss']
})
export class UserPhishingListDialogComponent implements OnInit {

  @Input() phishingCampaignUsers: IPhishingCampaignUserModel[];
  @Input() filteredPhishingCampaignUsers: IPhishingCampaignUserModel[];
  @Input() dialogHeader: string;
  @Input() currentCampaignNameForReport: string;
  @Input() completedCampaignNameForReport: string;
  @Input() displayDialog: boolean;
  @Input() campaignType: 'current' | 'completed';
  @Input() userStatus: 'Reported' | 'No Action' | 'Failed';
  @Output() onHide = new EventEmitter<void>();
  
  phishingCampaignsForSelectedUser: IPhishingCampaignUserModel[] = [];
  phishingCampaignUsersSelected: IPhishingCampaignUserModel[] = [];
  checkboxStates: { [key: string]: boolean } = {};
  tableLoadingSpinner: boolean = true;
  isSelected: boolean = false;
  selectedUser: IPhishingCampaignUserModel = {
    userId: '',
    templateName: '',
    userName: '',
    userEmail: '',
    unitName : '',
    userImageUrl : '',
    name: '',
    startDate: new Date(),
    endDate: new Date(),
    isDelivered: false,
    isOpened: false,
    isLinkClicked: false,
    isQRCodeScanned: false,
    isDataEntered: false,
    isReported: false,
  };

  constructor(
    private pdfService: PdfService,
    private excelService: ExcelService,
    private tableLoadingService: TableLoadingService) {
  }

  ngOnInit(): void {
    this.tableLoadingService.loading$.subscribe((isLoading) => {
      this.tableLoadingSpinner = isLoading;
    });
  }

  downloadCSV() {
    if (this.campaignType === 'current') {
      this.downloadCurrentSelectedUsersReportAsCSV();
    } else {
      this.downloadCompletedSelectedUsersReportAsCSV();
    }
  }

  downloadPDF() {
    if (this.campaignType === 'current') {
      this.downloadCurrentSelectedUsersReportAsPDF();
    } else {
      this.downloadCompletedSelectedUsersReportAsPDF();
    }
  }

  downloadAllPDF(){
    const data = this.phishingCampaignUsers.map((w) => {
      return {
        User: `${w.userName}\n${w.userEmail}`,
        TenantUnit: w.unitName,
        Campaign: `${w.name}\n${this.formatDate(w.startDate)} - ${this.formatDate(w.endDate)}` || '',
        Template: w.templateName,
        Delivered: w.isDelivered,
        ...(this.userStatus === 'Failed' && { Opened: w.isOpened }),
        ...(this.userStatus === 'Failed' && { QRScanned: w.isQRCodeScanned }),
        ...(this.userStatus === 'Failed' && { Clicked: w.isLinkClicked }),
        ...(this.userStatus === 'Failed' && { DataEntered: w.isDataEntered }),
        ...(this.userStatus === 'Reported' && { Reported: w.isReported }),
      };
    });

    const headers = [
      { header: 'User', dataKey: 'User' },
      { header: 'Department', dataKey: 'TenantUnit' },
      { header: 'Campaign', dataKey: 'Campaign' },
      { header: 'Template', dataKey: 'Template' },
      { header: 'Delivered', dataKey: 'Delivered' },
      ...(this.userStatus === 'Failed'
        ? [
          { header: 'Opened', dataKey: 'Opened' },
          { header: 'QR Scanned', dataKey: 'QRScanned' },
          { header: 'Clicked', dataKey: 'Clicked' },
          { header: 'Data Entered', dataKey: 'DataEntered' },
        ]
        : []),
      ...(this.userStatus === 'Reported' ? [{ header: 'Reported', dataKey: 'Reported' }] : []),
    ];

    this.pdfService.exportDataToPdfVI(data, `All ${this.userStatus} Users Report`, headers);
  }

  async downloadAllCSV(){
    const data = this.phishingCampaignUsers.map((w) => {
      return {
        User: w.userName,
        UserEmail: w.userEmail,
        TenantUnit: w.unitName,
        Campaign: w.name,
        CampaignStartDate: this.formatDate(w.startDate),
        CampaignEndDate: this.formatDate(w.endDate),
        Template: w.templateName,
        Delivered: w.isDelivered,
        ...(this.userStatus === 'Failed' && { Opened: w.isOpened ? '✔️' : '' }),
        ...(this.userStatus === 'Failed' && { QRScanned: w.isQRCodeScanned ? '✔️' : '' }),
        ...(this.userStatus === 'Failed' && { Clicked: w.isLinkClicked ? '✔️' : '' }),
        ...(this.userStatus === 'Failed' && { DataEntered: w.isDataEntered }),
        ...(this.userStatus === 'Reported' && { Reported: w.isReported ? '✔️' : '' }),
      };
    });

    const headers = [
      { header: 'User', dataKey: 'User' },
      { header: 'Department', dataKey: 'TenantUnit' },
      { header: 'Campaign', dataKey: 'Campaign' },
      { header: 'Template', dataKey: 'Template' },
      { header: 'Delivered', dataKey: 'Delivered' },
      ...(this.userStatus === 'Failed'
        ? [
          { header: 'Opened', dataKey: 'Opened' },
          { header: 'QR Scanned', dataKey: 'QRScanned' },
          { header: 'Clicked', dataKey: 'Clicked' },
          { header: 'Data Entered', dataKey: 'DataEntered' },
        ]
        : []),
      ...(this.userStatus === 'Reported' ? [{ header: 'Reported', dataKey: 'Reported' }] : []),
    ];

    await this.excelService.exportExcelVI(data, `All ${this.userStatus} Users Report`, headers);
  }

  addToSelected(user: IPhishingCampaignUserModel) {
    this.checkboxStates[user.userId] = true;
    const allUserTemplates = this.phishingCampaignsForSelectedUser.filter(c => c.userId == user.userId)
    this.phishingCampaignUsersSelected.push(...allUserTemplates);
  }

  removeFromSelected(user: IPhishingCampaignUserModel) {
    this.checkboxStates[user.userId] = false;
    this.phishingCampaignUsersSelected = this.phishingCampaignUsersSelected.filter((w) => w.userId !== user.userId);
  }

  toggleSelection(wall: any) {
    if (this.checkboxStates[wall.id]) {
      this.removeFromSelected(wall);
    } else {
      this.addToSelected(wall);
    }
  }

  addToselected(event: any, wall: any) {
    if (event.checked) {
      this.addToSelected(wall);
    } else {
      this.removeFromSelected(wall);
    }
  }

  addAllSelected(event: CheckboxChangeEvent) {
    if (event.checked) {
      this.phishingCampaignUsersSelected = [];
      this.phishingCampaignsForSelectedUser.forEach((w) => {
        this.checkboxStates[w.userId] = true;
        this.phishingCampaignUsersSelected.push(w);
      });
    } else {
      this.phishingCampaignsForSelectedUser.forEach((w) => {
        this.checkboxStates[w.userId] = false;
        this.phishingCampaignUsersSelected = this.phishingCampaignUsersSelected.filter(
          (c) => c.userId !== w.userId
        );
      });
    }
  }
  
  downloadCurrentSelectedUsersReportAsPDF() {
    const data = this.phishingCampaignsForSelectedUser.map((w) => {
      return {
        User: `${w.userName}\n${w.userEmail}`,
        TenantUnit: w.unitName,
        Campaign: `${w.name}\n${this.formatDate(w.startDate)} - ${this.formatDate(w.endDate)}` || '',
        Template: w.templateName,
        Delivered: w.isDelivered,
        ...(this.userStatus === 'Failed' && { Opened: w.isOpened }),
        ...(this.userStatus === 'Failed' && { QRScanned: w.isQRCodeScanned }),
        ...(this.userStatus === 'Failed' && { Clicked: w.isLinkClicked }),
        ...(this.userStatus === 'Failed' && { DataEntered: w.isDataEntered }),
        ...(this.userStatus === 'Reported' && { Reported: w.isReported }),
      };
    });

    const headers = [
      { header: 'User', dataKey: 'User' },
      { header: 'Department', dataKey: 'TenantUnit' },
      { header: 'Campaign', dataKey: 'Campaign' },
      { header: 'Template', dataKey: 'Template' },
      { header: 'Delivered', dataKey: 'Delivered' },
      ...(this.userStatus === 'Failed'
        ? [
          { header: 'Opened', dataKey: 'Opened' },
          { header: 'QR Scanned', dataKey: 'QRScanned' },
          { header: 'Clicked', dataKey: 'Clicked' },
          { header: 'Data Entered', dataKey: 'DataEntered' },
        ]
        : []),
      ...(this.userStatus === 'Reported' ? [{ header: 'Reported', dataKey: 'Reported' }] : []),
    ];

    this.pdfService.exportDataToPdfVI(data, `${this.selectedUser.userName} ${this.userStatus} Report`, headers);
  }

  async downloadCurrentSelectedUsersReportAsCSV() {
    const data = this.phishingCampaignsForSelectedUser.map((w) => {
      return {
        User: w.userName,
        UserEmail: w.userEmail,
        TenantUnit: w.unitName,
        Campaign: w.name,
        CampaignStartDate: this.formatDate(w.startDate),
        CampaignEndDate: this.formatDate(w.endDate),
        Template: w.templateName,
        Delivered: w.isDelivered,
        ...(this.userStatus === 'Failed' && { Opened: w.isOpened ? '✔️' : '' }),
        ...(this.userStatus === 'Failed' && { QRScanned: w.isQRCodeScanned ? '✔️' : '' }),
        ...(this.userStatus === 'Failed' && { Clicked: w.isLinkClicked ? '✔️' : '' }),
        ...(this.userStatus === 'Failed' && { DataEntered: w.isDataEntered ? '✔️' : '' }),
        ...(this.userStatus === 'Reported' && { Reported: w.isReported ? '✔️' : '' }),
      };
    });

    const headers = [
      { header: 'User', dataKey: 'User' },
      { header: 'Department', dataKey: 'TenantUnit' },
      { header: 'Campaign', dataKey: 'Campaign' },
      { header: 'Template', dataKey: 'Template' },
      { header: 'Delivered', dataKey: 'Delivered' },
      ...(this.userStatus === 'Failed'
        ? [
          { header: 'Opened', dataKey: 'Opened' },
          { header: 'QR Scanned', dataKey: 'QRScanned' },
          { header: 'Clicked', dataKey: 'Clicked' },
          { header: 'Data Entered', dataKey: 'DataEntered' },
        ]
        : []),
      ...(this.userStatus === 'Reported' ? [{ header: 'Reported', dataKey: 'Reported' }] : []),
    ];

    await this.excelService.exportExcelVI(data, `${this.selectedUser.userEmail} ${this.userStatus} Report`, headers);
  }

  downloadCompletedSelectedUsersReportAsPDF() {
    const data = this.phishingCampaignsForSelectedUser.map((w) => {
      return {
        User: `${w.userName}\n${w.userEmail}`,
        TenantUnit: w.unitName,
        Campaign: `${w.name}\n${this.formatDate(w.startDate)} - ${this.formatDate(w.endDate)}` || '',
        Template: w.templateName,
        Delivered: w.isDelivered,
        ...(this.userStatus === 'Failed' && { Opened: w.isOpened }),
        ...(this.userStatus === 'Failed' && { QRScanned: w.isQRCodeScanned }),
        ...(this.userStatus === 'Failed' && { Clicked: w.isLinkClicked }),
        ...(this.userStatus === 'Failed' && { DataEntered: w.isDataEntered }),
        ...(this.userStatus === 'Reported' && { Reported: w.isReported }),
      };
    });

    const headers = [
      { header: 'User', dataKey: 'User' },
      { header: 'Department', dataKey: 'TenantUnit' },
      { header: 'Campaign', dataKey: 'Campaign' },
      { header: 'Template', dataKey: 'Template' },
      { header: 'Delivered', dataKey: 'Delivered' },
      ...(this.userStatus === 'Failed'
        ? [
          { header: 'Opened', dataKey: 'Opened' },
          { header: 'QR Scanned', dataKey: 'QRScanned' },
          { header: 'Clicked', dataKey: 'Clicked' },
          { header: 'Data Entered', dataKey: 'DataEntered' },
        ]
        : []),
      ...(this.userStatus === 'Reported' ? [{ header: 'Reported', dataKey: 'Reported' }] : []),
    ];

    this.pdfService.exportDataToPdfVI(data, `${this.selectedUser.userName} ${this.userStatus} Report`, headers);
  }

  async downloadCompletedSelectedUsersReportAsCSV() {
    const data = this.phishingCampaignsForSelectedUser.map((w) => {
      return {
        User: w.userName,
        UserEmail: w.userEmail,
        TenantUnit: w.unitName,
        Campaign: w.name,
        CampaignStartDate: this.formatDate(w.startDate),
        CampaignEndDate: this.formatDate(w.endDate),
        Template: w.templateName,
        Delivered: w.isDelivered,
        ...(this.userStatus === 'Failed' && { Opened: w.isOpened ? '✔️' : '' }),
        ...(this.userStatus === 'Failed' && { QRScanned: w.isQRCodeScanned ? '✔️' : '' }),
        ...(this.userStatus === 'Failed' && { Clicked: w.isLinkClicked ? '✔️' : '' }),
        ...(this.userStatus === 'Failed' && { DataEntered: w.isDataEntered }),
        ...(this.userStatus === 'Reported' && { Reported: w.isReported ? '✔️' : '' }),
      };
    });

    const headers = [
      { header: 'User', dataKey: 'User' },
      { header: 'Department', dataKey: 'TenantUnit' },
      { header: 'Campaign', dataKey: 'Campaign' },
      { header: 'Template', dataKey: 'Template' },
      { header: 'Delivered', dataKey: 'Delivered' },
      ...(this.userStatus === 'Failed'
        ? [
          { header: 'Opened', dataKey: 'Opened' },
          { header: 'QR Scanned', dataKey: 'QRScanned' },
          { header: 'Clicked', dataKey: 'Clicked' },
          { header: 'Data Entered', dataKey: 'DataEntered' },
        ]
        : []),
      ...(this.userStatus === 'Reported' ? [{ header: 'Reported', dataKey: 'Reported' }] : []),
    ];

    await this.excelService.exportExcelVI(data, `${this.selectedUser.userName} ${this.userStatus} Report`, headers);
  }

  formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Intl.DateTimeFormat('en-US', options).format(new Date(date));
  }

  selectUser(user: IPhishingCampaignUserModel) {
    this.selectedUser = user;
    this.checkboxStates = {};
    this.phishingCampaignUsers.forEach(user => {
    this.checkboxStates[user.userId] = false;
    });
    this.isSelected = false;
    this.phishingCampaignsForSelectedUser = []
    this.phishingCampaignsForSelectedUser = this.phishingCampaignUsers.filter(u => u.userId == user.userId)
  }

  handleHideAndClearSelections(): void {
    this.filteredPhishingCampaignUsers = [];
    this.phishingCampaignUsersSelected = [];
    this.checkboxStates = {};
    this.onHide.emit();
  }
}