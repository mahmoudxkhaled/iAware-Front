import { IAwarenessCampaignSimulationPhishingFailuresByDayModel } from "./IAwarenessCampaignSimulationPhishingFailuresByDayModel";
import { IAwarenessCampaignSimulationPhishingScheduleDataOverviewModel } from "./IAwarenessCampaignSimulationPhishingScheduleDataOverviewModel";
import { IAwarenessCampaignSimulationPhishingScheduleUserModel } from "./IAwarenessCampaignSimulationPhishingScheduleUserModel";

export interface IAwarenessCampaignSimulationPhishingTemplateModel{
  id: string;
  phishingEmailTemplateName: string;
  phishingEmailTemplateStatus: string;
  phishingEmailTemplateId: string;
  phishPronePercentage : number;
  phishingStartTime : Date;
  phishingEndTime : Date;
  awarenessCampaignSimulationPhishingScheduleUsers: IAwarenessCampaignSimulationPhishingScheduleUserModel[];
  awarenessCampaignSimulationPhishingScheduleDataOverview: IAwarenessCampaignSimulationPhishingScheduleDataOverviewModel;
  awarenessCampaignSimulationPhishingFailuresByDay :IAwarenessCampaignSimulationPhishingFailuresByDayModel
}