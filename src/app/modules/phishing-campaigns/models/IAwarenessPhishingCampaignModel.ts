export interface IAwarenessPhishingCampaignModel{
    campaignId?: string;
    campaignName?: string;
    campaignStartDate: Date;
    campaignEndDate: Date;
    templateName?: string;
    templateStatus?: string;
    templatePhishingStartDate: Date;
    templatePhishingEndDate: Date;
}