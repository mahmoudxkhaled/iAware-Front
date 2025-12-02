export interface IUserDashboardPhishingResultsModel{
    emailsDelivered: number;
    emailsFailures: number;
    emailsReported: number;
    emailsDeliveredPercentage : number;
    emailsFailuresPercentage : number;
    emailsReportedPercentage : number;
    personalUserRiskScore : number;
}