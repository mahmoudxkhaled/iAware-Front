import { IAwarenessCampaignSimulationPhishingScedualUserModel } from "./IAwarenessCampaignSimulationPhishingScedualUserModel";

export interface IAwarenessCampaignSimulationPhishingScedualModel{
    phishingStartTime : Date;
    isFrequently : boolean;
    phishingEndTime : Date;
    frequencyDays : number;
    awarenessCampaignSimulationPhishingScheduleUsers : IAwarenessCampaignSimulationPhishingScedualUserModel[]
}