export interface IUserModel {
    id?: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    userName?: string;
    email: string;
    tenantGroupId?: string;
    profilePhotoPath?: string;
    password?: string;
    roleId?: string[];
    roles?: string[];
    tenantUnitId?: string;
    tenantUnitName?: string;
    groupsIds?:string[];
    groupsNames?:string[];
    theme?: string;
    isActive?: boolean;
    languageId?: string;
    timeZone?: string;
    phoneNumber?: string;
    isDefaultTenantUser?: boolean;
    isEmailConfirmed?: boolean;
    createdAt?: Date;
    rankingNumber? : string;
}

export function initializeUserModel(): IUserModel {
    return {
        id: '', // or undefined if you prefer
        firstName: '',
        lastName: '',
        name: '',
        email: '',
        tenantGroupId: '',
        profilePhotoPath: '',
        password: '',
        roleId: [],
        roles: [],
        tenantUnitId: '',
        tenantUnitName: '',
        groupsIds: [],
        groupsNames: [],
        theme: '',
        isActive: false,
        languageId: '',
        timeZone: '',
        phoneNumber: '',
        isDefaultTenantUser: false,
        isEmailConfirmed: false,
        createdAt: undefined,
        rankingNumber : ''
    };
}