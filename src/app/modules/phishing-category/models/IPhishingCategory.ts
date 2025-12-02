import { IPhishingCategoryLanguage } from './IPhishingCategoryLanguage';

export interface IPhishingCategory {
    id: string;
    name: string;
    categoryImageUrl: string;
    isActive: boolean;
    phishingCategoryLanguages: IPhishingCategoryLanguage[];
    canEdit?: boolean
}
