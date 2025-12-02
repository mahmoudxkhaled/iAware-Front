export interface ILibraryBackground {
    id: string;
    backgroundImageUrl: string;
    backgroundImageThumbnailUrl: string;
    canEdit?: boolean;
    isActive: boolean;
}
export interface ILibraryLanguageCharacter {
    id: string;
    characterName: string;
    characterImageUrl: string;
    characterImageThumbnailUrl: string;
    languageId: string;
    languageName: string;
    isActive: boolean;
    canEdit?: boolean;
}

export interface ILibraryLanguageQuote {
    id: string;
    quoteText: string;
    languageId: string;
    languageName: string;
    isActive: boolean;
    canEdit?: boolean;
}

export interface ILibraryWallpaper {
    id: string;
    wallpaperTitle: string;
    wallpaperQuote: string;
    wallpaperImageUrl: string;
    wallpaperImageThumbnailUrl: string;
    wallpaperBackgroundImage: string;
    wallpaperCharacterImage: string;
    isActive: boolean;
    libraryWallpaperLanguages: ILibraryWallpaperLanguage[];
    canEdit?: boolean;
    checked?: boolean; // Add this property
    wallpaperLanguagesCount?: number;
    LanguagesName?: string[];
    tages?: string[];
}

export interface ILibraryWallpaperLanguage {
    id: string;
    isActive: boolean;
    wallpaperTitle: string;
    languageId: string;
    languageName: string;
    libraryWallpaperId: string;
    libraryBackgroundId: string;
    libraryBackground?: ILibraryBackground;
    libraryLanguageCharacterId: string;
    libraryLanguageQuoteId: string;
    wallpaperImageUrl: string;
    wallpaperImageThumbnailUrl: string;
    wallpaperQuote: string;
    wallpaperBackgroundImage: string;
    wallpaperCharacterImage: string;
    canEdit?: boolean;
}
