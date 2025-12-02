export interface IUserPhishingCampaignsTemplates{
    campaignId: string;
    campaignName: string;
    campaignStartDate:Date;
    campaignEndDate: Date;
    phishingEmailTemplateName?: string;
    isDelivered: boolean;
    deliveringTime?: Date;
    isOpened: boolean;
    isOpeningTime?: Date;
    isLinkClicked: boolean;
    linkClickingTime?: Date;
    isQRCodeScanned: boolean;
    qrCodeScanningTime?: Date;
    isReplied: boolean;
    replyingTime?: Date;
    isAttachmentOpened: boolean;
    attachmentOpeningTime?: Date;
    isMacroEnabled: boolean;
    macroEnablingTime?: Date;
    isDataEntered: boolean;
    dataEnteringTime?: Date;
    isReported: boolean;
    reportingTime?: Date;
}