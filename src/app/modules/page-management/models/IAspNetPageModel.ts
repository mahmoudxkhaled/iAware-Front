import { IAspNetPageItemModel } from './IAspNetPageItemModel';

export interface IAspNetPageModel {
    id: string;
    pageNameAr: string;
    pageNameEn: string;
    applicationUrl: string;
    pageUrl: string;
    displayInMenu: string;
    fontIconCode?: string;
    helpTextAr?: string;
    helpTextEn?: string;
    orderNo: number;
    isHeading: boolean;
    isActive?: boolean;
    pageItems?: IAspNetPageItemModel[];
}
