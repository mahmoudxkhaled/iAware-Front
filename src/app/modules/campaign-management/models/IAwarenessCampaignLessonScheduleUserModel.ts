import { IAwarenessCampaignLessonScheduleModel } from "./IAwarenessCampaignLessonScheduleModel";

export interface IAwarenessCampaignLessonScheduleUserModel{
    awarenessCampaignLessonScheduleId? : string
    userId? : string;
    awarenessCampaignSchedule : IAwarenessCampaignLessonScheduleModel;
    lessonViewingTime? : Date;
    bookViewingTime? : Date;
    videoViewingTime? : Date;
    awarenessEmailRecievingTime? : Date;
    awarenessEmailLessonClickingTime? : Date;
    screenSaverViewingTime? : Date;
    wallpaperViewingTime? : Date;
    quoteViewingTime? : Date;
    quizViewingTime? : Date;
}