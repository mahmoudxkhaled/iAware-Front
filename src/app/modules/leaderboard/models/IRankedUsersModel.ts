export interface IRankedUsersModel{
    rankingNo: number;
    userId: string;
    userName: string;
    userImageUrl: string;
    userPoints: number;
    isUnique : boolean;
}