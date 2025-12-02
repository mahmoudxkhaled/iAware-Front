import { IUserModel } from "../../user/models/IUserModel";

export interface ITenantGroupModel {
    id: string;
    name: string;
    isActive: boolean;
    members: string[];
    users?: IUserModel[];
}
