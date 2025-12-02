export interface IUserCampaignsDashboard{
    campaignId : string
    campaignName : string
    contentName?: string;
    joiningDate?: Date;
    contentStarted: boolean;
    timeSpent?: Date;
    timeLeft?: Date;
    score?: number;
    status?: string;
}