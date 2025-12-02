import { IPhishingEmailTemplate } from "../../phishing-email-template/models/IPhishingEmailTemplate";

export interface IPhishingCategoryLanguage {
    id: string;
    name: string;
    categoryBannerUrl: string;
    categoryDescription: string;
    categoryPageContentHtml: string;
    languageId: string;
    languageName: string;
    phishingCategoryId: string;
    isActive: boolean;
    phishingCategoryName: string;
    canEdit?: boolean;
    phishingEmailTemplates?:IPhishingEmailTemplate[];
}