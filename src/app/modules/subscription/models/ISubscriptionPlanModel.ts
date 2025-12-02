export interface ISubscriptionPlanModel {
    id: any;
    title: string;
    description: string;
    userPrice: number;

    durationNumber: number;
    durationType: number;

    activeDate: Date;

    roles: string[];
    defaultRole: string;
    languagesName?: string[];
    reminders: string[];
    languages: string[];
    trainingLessons: string[];
    phishingEmailTemplates: string[];

    isActive: boolean;
    isFreePlan: boolean;
    isIAwarePlan?: boolean;

    unlimitedPhishingSimulation: boolean;
    awarenessVideos: boolean;
    comicBooks: boolean;
    knowledgeQuiz: boolean;
    securityQuotesAndTips: boolean;
    awarenessEmails: boolean;
    wallpapers: boolean;
    screenSavers: boolean;
    games: boolean;
    vrGamesAndTraining: boolean;
    localization: boolean;
    onSiteDeployment: boolean;
    iawareMobileApp: boolean;
    automatedTrainingCampaigns: boolean;
    brandableContent: boolean;
    phishAlertButton: boolean;
    userProvisioningViaActiveDirectory: boolean;
    advancedReporting: boolean;
    technicalSupport: boolean;
    smartGroups: boolean;
    customizedPhishingExperience: boolean;
}
