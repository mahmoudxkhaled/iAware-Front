import { IAwarenessCampaignStatisticsLessonModel } from "./IAwarenessCampaignStatisticsLessonModel";
import { IAwarenessTrainingCampaignUserCompletionActivityModel } from "./IAwarenessTrainingCampaignUserCompletionActivityModel";

export interface IAwarenessCampaignStatisticsModel {
    campaignName?: string;
    campaignStatus?: string;
    compelationPercentage: number;
    startDate: Date;
    endDate: Date;
    usersCount: number;
    numberOfDays: number;
    durationString:string;
    awarenessCampaignStatisticsLessons?: IAwarenessCampaignStatisticsLessonModel[];
    awarenessTrainingCampaignUserCompletionActivity? : IAwarenessTrainingCampaignUserCompletionActivityModel
}