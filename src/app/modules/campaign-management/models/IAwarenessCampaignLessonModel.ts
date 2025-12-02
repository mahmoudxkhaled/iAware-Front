import { IAwarenessCampaignLessonLanguageEmailModel } from "./IAwarenessCampaignLessonLanguageEmailModel";

export interface IAwarenessCampaignLessonModel{
    trainingLessonId : string;
    awarenessCampaignLessonLanguageEmails : IAwarenessCampaignLessonLanguageEmailModel[]
}