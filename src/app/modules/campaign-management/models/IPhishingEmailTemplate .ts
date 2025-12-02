export interface IPhishingEmailTemplate {
    id: string;
    emailName: string;
    phishingDomainId: string;
    phishingCategoryId: string;
    phishingEmailImageUrl: string;
    phishingEmailContentHtml: string;
    phishingEmailDescription: string;
    phishingEmailTemplateLanguageCount: number;
    isActive: boolean;
    canEdit?: boolean;
}
