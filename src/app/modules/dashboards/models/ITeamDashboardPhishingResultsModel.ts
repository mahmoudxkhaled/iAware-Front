export interface ITeamDashboardPhishingResultsModel{
    emailsDelivered: number;
    emailsFailures: number;
    emailsReported: number;
    emailsDeliveredPercentage : number;
    emailsFailuresPercentage : number;
    emailsReportedPercentage : number;
    teamUserRiskScore : number;
}