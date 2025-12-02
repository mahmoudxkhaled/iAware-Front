import { ITrainingLessonScreenSaver } from "./ISecurityTrainingModel";

export interface ITrainingCategoryModel {
    id: string;
    name: string;
    description: string;
    isActive: boolean;
    trainingCategoryImageUrl: string;
    trainingCategoryBannerImageUrl: string;
    LessonsCount: number;
    lessons: GetTrainingLessonDto[];
    trainingCategoryLessons?: TrainingCategoryLessonDto[]
}

export interface GetTrainingLessonDto {
    id: string;
    name: string;
    description: string;
    trainingLessonCategoryName: string;
    trainingLessonCategoryId: string;
    lessonsCount: number;
    isActive: boolean;
    tagIds: string[]

}

export interface TrainingCategoryLessonDto {
    id: string;
    name?: string;
    description?: string;
    lessonBookUrl?: string;
    lessonBookImageUrl?: string;
    lessonVideoImageUrl?: string;
    lessonVideoUrl?: string;
    insertedTime?: Date;
    isCovered: boolean;
    trainingLessonScreenSaver?: ITrainingLessonScreenSaver[];
    isExpanded: boolean;
    tagIds: string[];
    trainingLessonCategoryId?: string;
}