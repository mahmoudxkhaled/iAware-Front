export interface IPhishingCampaignUserModel{
    userId: string;
    templateName: string;
    userName: string;
    userEmail: string;
    unitName : string;
    userImageUrl : string;
    name:string;
    startDate: Date;
    endDate: Date;
    isDelivered: boolean;
    isOpened: boolean;
    isLinkClicked: boolean;
    isQRCodeScanned: boolean;
    isDataEntered: boolean;
    isReported: boolean;
}