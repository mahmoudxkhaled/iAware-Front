export interface ITenantManagementModel{
    id?: string;
    manager?: string;
    subscriptionPlanId?: string;
    companyName?: string;
    email?: string;
    isActive: boolean;
    isDeleted: boolean;
    licenses: number;
    expiryDate?: Date;
}