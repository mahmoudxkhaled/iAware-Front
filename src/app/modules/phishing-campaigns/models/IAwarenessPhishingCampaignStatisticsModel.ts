import { IAwarenessCampaignSimulationPhishingTemplateModel } from "./IAwarenessCampaignSimulationPhishingTemplateModel";
import { IAwarenessCampaignSimulationPhishingTopClickersModel } from "./IAwarenessCampaignSimulationPhishingTopClickersModel";
import { IAwarenessPhishingCampaignStatisticsChartDataModel } from "./IAwarenessPhishingCampaignStatisticsChartDataModel";

export interface IAwarenessPhishingCampaignStatisticsModel{
  campaignName: string;
  campaignStatus: string;
  compelationPercentage: number;
  startDate: string;
  endDate: string;
  failures: number;
  recipients: number;
  usersCount: number;
  awarenessCampaignSimulationPhishingTemplates: IAwarenessCampaignSimulationPhishingTemplateModel[];
  awarenessCampaignSimulationPhishingTopClickers: IAwarenessCampaignSimulationPhishingTopClickersModel[];
  awarenessPhishingCampaignStatisticsChartData : IAwarenessPhishingCampaignStatisticsChartDataModel
}