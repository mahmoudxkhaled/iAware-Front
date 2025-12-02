export interface IAwarenessCampaignSimulationPhishingModel{
    phishingEmailTemplateId : string;
    phishingEmailTemplateName : string;
    phishingStartTime : Date;
    isFrequently : boolean;
    frequencyDays : number;
    numberOfOccurrences? : number;
    phishingEndTime : Date;
    users : string[];
}