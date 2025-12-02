import { IUserModel } from "../../user/models/IUserModel";

export interface IRoleModel {
    id: string;
    name: string;
    created_at?: string;
    updated_at?: string;
    permissionsCount: number;
    users: IUserModel[];
    usersCount: number;
    isActive:boolean;
    isTenantRole:boolean;
    isTenantAdministratorRole:boolean;
    permessions : string[]
  }