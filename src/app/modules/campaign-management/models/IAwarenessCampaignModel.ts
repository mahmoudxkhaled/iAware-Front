import { IAwarenessCampaignLanguageEmailModel } from "./IAwarenessCampaignLanguageEmailModel";

export interface IAwarenessCampaignModel{
    id? : string;
    name? : string;
    usersSource? : number;
    isActive? : boolean;
    lessonIds? : string[];
    campaignType? : number;
    startDate? : Date;
    endDate? : Date;
    awarenessCampaignSimulationPhishings? : any;
    awarenessCampaignLanguageEmails : IAwarenessCampaignLanguageEmailModel[]
    users? : string[]
}