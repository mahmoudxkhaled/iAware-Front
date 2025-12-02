import { ITrainingAwarenessCampaignLessonsModel } from "./ITrainingAwarenessCampaignLessonsModel";

export interface ITrainingAwarenessCampaignModel {
    id?: string;
    name?: string;
    campaignType: number;
    tenantName?: string;
    isActive: boolean;
    isDeleted: boolean;
    lessons?: ITrainingAwarenessCampaignLessonsModel[];
    users?: string[];
    startDate: Date;
    endDate: Date;
  }