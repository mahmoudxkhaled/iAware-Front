export interface IADApplicationUserModel{
    name: string;
    email: string;
    samAccountName: string;
    firstName: string;
    lastName: string;
    rolesId:string[];
    groupName :string;
}