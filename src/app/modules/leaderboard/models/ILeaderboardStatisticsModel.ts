import { IRankedUsersModel } from './IRankedUsersModel';

export interface ILeaderboardStatisticsModel {
    rankedUsers: IRankedUsersModel[];
    topThreeRankedUsers: IRankedUsersModel[];
}
