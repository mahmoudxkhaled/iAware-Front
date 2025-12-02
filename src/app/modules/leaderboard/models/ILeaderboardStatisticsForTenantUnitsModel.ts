import { IRankedTenantUnitsModel } from "./IRankedTenantUnitsModel";

export interface ILeaderboardStatisticsForTenantUnitsModel{
    rankedTenantUnits : IRankedTenantUnitsModel[];
    topThreeRankedTenantUnits : IRankedTenantUnitsModel[];
}