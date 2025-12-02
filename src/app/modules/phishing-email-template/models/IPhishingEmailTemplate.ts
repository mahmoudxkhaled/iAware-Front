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
    isLocked?: boolean;
    canEdit?: boolean;
    tagIds: string[]; // List of tags associated with the template
}