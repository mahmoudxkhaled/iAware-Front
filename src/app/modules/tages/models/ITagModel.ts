export interface ITagModel {
    id: string;
    tagName: string;
    priorityNumber: number;
    blogAllowed: boolean;
    gameAllowed: boolean;
    newsAllowed: boolean;
    phishingAllowed: boolean;
    trainingAllowed: boolean;
    wallpaperAllowed: boolean;
    tagLanguages?: TagLanguage[];
}

export interface TagLanguage {
    tagName: string;
    languageId: string;
}