export interface IAwarenessCampaignTrainingModel{
    campaignName?: string;
    campaignId?: string;
    campaignProgressPercentage: number;
    campaignStartDate?: Date;
    campaignEndDate?: Date;
    id?: string;
    trainingLessonId?: string;
    contentName?: string;
    lessonVideoUrl?: string;
    lessonVideoImageUrl?: string;
    lessonBookUrl?: string;
    lessonBookImageUrl?: string;
    joiningDate?: Date;
    contentStarted: boolean;
    timeSpent?: Date;
    timeLeft?: Date;
    score?: number;
    status?: string;
    certificateImageUrl? : string
}