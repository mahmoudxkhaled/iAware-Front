export interface IAwarenessCampaignSimulationPhishingScheduleUserModel{
    phishingTemplateLanguageId?: string;
    emailSendingScheduleTime?: Date;
    userName?: string;
    userEmail?: string;
    isDelivered?: boolean;
    deliveringTime?: string;
    isOpened?: boolean;
    isOpenningTime?: string;
    isLinkClicked?: boolean;
    linkClickingTime?: string;
    isQRCodeScanned?: boolean;
    qrCodeScanningTime?: string;
    isReplied?: boolean;
    replingTime?: string;
    isAttachmentOpened?: boolean;
    attachmentOpenningTime?: string;
    isMacroEnabled?: boolean;
    macroEnablingTime?: string;
    isDataEntered?: boolean;
    dataEnteringTime?: string;
    isReported?: boolean;
    reportingTime?: string;
}