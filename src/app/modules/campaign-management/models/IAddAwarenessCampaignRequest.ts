import { IAwarenessCampaignLessonModel } from "./IAwarenessCampaignLessonModel";
import { IAwarenessCampaignLessonScheduleModel } from "./IAwarenessCampaignLessonScheduleModel";
import { IAwarenessCampaignModel } from "./IAwarenessCampaignModel";
import { IAwarenessCampaignSimulationPhishingModel } from "./IAwarenessCampaignSimulationPhishingModel";
import { IAwarenessCampaignUserModel } from "./IAwarenessCampaignUserModel";

export interface IAddAwarenessCampaignRequest{
    awarenessCampaign : IAwarenessCampaignModel;
    awarenessCampaignLesson : IAwarenessCampaignLessonModel[];
    awarenessCampaignUser : IAwarenessCampaignUserModel[];
    awarenessCampaignSchedule : IAwarenessCampaignLessonScheduleModel[];
    awarenessCampaignSimulationPhishing : IAwarenessCampaignSimulationPhishingModel[];
}