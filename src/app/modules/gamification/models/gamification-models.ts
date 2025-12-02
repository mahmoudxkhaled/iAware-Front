// export interface IGame {
//     id: number;
//     name: string;
//     questionCount: number;
//     languageId: string;
//     isActive: boolean;
//     imageUrl: string;
//     description: string;
//     layoutUrl: string;
// }
export interface IGame {
    id: number;
    name: string;
    imageUrl: string;
    layoutUrl?: string;
    questionCount: number;
    isActive: boolean;
    autoNextAllowed: boolean;
    previousAllowed: boolean;
    gameLanguages: IGameLanguage[];
    description?: string; // Optional field
    isExpanded : boolean    
}

export interface IGameLanguage {
    id: string;
    name: string;
    languageId: string;
    languageName: string;
    layoutUrl?: string; // Optional field
    description?: string; // Optional field
    instruction?: string; // Optional field
    backgroundInstruction?: string; // Optional field
    isActive: boolean;
    gameLanguageQuestions: IGameLanguageQuestion[];
}

export interface IGameLanguageQuestion {
    id: string;
    questionText: string;
    questionBackgroundUrl?: string; // Optional field
    questionDifficultyLevel: number;
    gameLanguageId: string;
    isActive: boolean;
    gameLanguageQuestionAnswers: IGameLanguageQuestionAnswer[];
}

export interface IGameLanguageQuestionAnswer {
    id: string;
    answerText: string;
    answerIcon?: string; // Optional field
    isTrueAnswer: boolean;
    orderNo: number;
}

// export interface IGetGameQuestion {
//     id: string;
//     questionText: string;
//     questionBackgroundUrl?: string;
//     questionDifficultyLevel: number;
//     gameLanguageId: string;
//     isActive: boolean;
//     gameLanguageQuestionAnswers: IGameLanguageQuestionAnswer[];
// }

// export interface IGameLanguageQuestionAnswer {
//     id: string;
//     answerText: string;
//     answerIcon?: string;
//     isTrueAnswer: boolean;
//     orderNo: number;
// }

// export interface IGameLanguage {
//     id: string; // Unique identifier for the language
//     name: string; // Name of the language
//     description?: string; // Optional description for the language
//     layoutUrl?: string; // Optional layout URL for the game in that language
//     questionCount: number; // Number of questions available in this language
//     gameQuestions: IGameQuestion[]; // Array of questions associated with this language
// }

// export interface IGameQuestion {
//     id: string; // Unique identifier for the question
//     questionText: string; // The text of the question
//     questionDifficultyLevel: number;
//     gameQuestionAnswers: IGameQuestionAnswer[]; // Array of answers associated with the question
//     isActive: boolean; // Indicates if the question is active
// }

// export interface IGameQuestionAnswer {
//     id: string; // Unique identifier for the answer
//     answerText: string; // The text of the answer
//     isTrueAnswer: boolean; // Indicates if the answer is correct
//     orderNo: number;
// }

export enum GameEnum {
    GameType1 = 1,
    GameType2 = 2,
    GameType3 = 3,
    GameType4 = 4,
    GameType5 = 5,
    GameType6 = 6,
    GameType7 = 7,
    GameType8 = 8,
    GameType9 = 9,
    GameType10 = 10,
    GameType11 = 11,
    GameType12 = 12,
    GameType13 = 13,
    GameType14 = 14,
    GameType15 = 15,
    GameType16 = 16,
    GameType17 = 17,
}
