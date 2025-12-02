export interface IBadgeModel{
    id: number;
    name: string;
    descriptionName?: string;
    badgeImageURL?: string;
    isActive : boolean;
    isUserEarnedThisBadge: boolean;
    badgeEarnedCount: number;
}