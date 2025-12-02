export interface ITrainingLessonQuizAnswer {
    id: string;
    answerText: string;
    isTrueAnswer: boolean;
    orderNo: number;
}

export interface ITrainingLessonQuiz {
    id: string;
    quizText: string;
    isActive: boolean;
    trainingLessonQuizAnswers: ITrainingLessonQuizAnswer[];
}

export interface ITrainingLessonQuote {
    id: string;
    quoteText: string;
    isActive: boolean;
}

export interface ITrainingLessonScreenSaver {
    id: string;
    screenSaverTitle: string;
    screenSaverPlatform: string;
    screenSaverUrl: string;
    orderNo: number;
    NumberOfWallpapers: number;
}

export interface ITrainingLessonWallpaper {
    id: string;
    wallpaperTitle: string;
    wallpaperUrl: string;
    orderNo: number;
}

export interface ITrainingLessonsLanguage {
    id: string;
    name: string;
    description: string;
    category?: string;
    languageName: string;
    languageId: string;
    lessonBookUrl: string;
    lessonBookImageUrl: string;
    lessonVideoUrl: string;
    lessonVideoImageUrl: string;
    lessonAwarenessEmailSubject: string;
    lessonAwarenessEmailContentHtml: string;
    trainingLessonQuizzes: ITrainingLessonQuiz[];
    trainingLessonScreenSavers: ITrainingLessonScreenSaver[];
    trainingLessonWallpapers: ITrainingLessonWallpaper[];
    trainingLessonQuotes: ITrainingLessonQuote[];
    isActive: boolean;
    numberOfWallpapers?: number;
}

export interface ITrainingLesson {
    id: string;
    name: string;
    description: string;
    trainingLessonCategoryName: string;
    trainingLessonCategoryId: string;
    trainingLessonsLanguages: ITrainingLessonsLanguage[];
    lessonsCount: number;
    wallpapersCount: number;
    isActive: boolean;
    tages : string[]
}

export interface ITrainingLessonCategory {
    id: string;
    name: string;
    description: string;
    isActive: boolean;
    lessons: ITrainingLesson[];
    lessonsCount: number;
    isExpanded: boolean;
}

export interface ITrainingLessonCategoryLanguages {
    id: string;
    name: string;
    description: string;
    languageId: string;
    languageName: string;
    isActive: boolean;
    trainingCategoryImageUrl: string;
    trainingCategoryBannerImageUrl: string;
}