import { IPhishingEmailTemplate } from "./IPhishingEmailTemplate ";

export interface IPhishingCategory{
    id: string;
    name: string;
    categoryImageUrl: string;
    isActive: boolean;
    phishingEmailTemplates: IPhishingEmailTemplate[];
}