import { IADApplicationUserModel } from "./IADApplicationUserModel";
export interface IADOUsModel{
    distinguishedName : string;
    name : string;
    description : string;
    users : IADApplicationUserModel[]
}