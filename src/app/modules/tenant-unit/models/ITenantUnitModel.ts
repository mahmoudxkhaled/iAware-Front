import { IUserModel } from "../../user/models/IUserModel";

export interface ITenantUnitModel{
    id: string;
    unitName : string;
    isActive? : boolean;
    showInLeaderboard : boolean;
    users? : IUserModel[]
}