// export interface ISubscriptionTenantInvoice {
//     id: string;
//     subscriptionPlanId: string;
//     subscriptionPlanName?: string;
//     tenantId: string;
//     tenantName?: string;
//     price: number;
//     issueDate?: Date;
//     startDate?: Date;
//     endDate?: Date;
//     durationByDays: number;
//     isActive: boolean;
//     insertedUserId?: string;
//     activationTime?: Date;
//     deletedUserId?: string;
//     canEdit?: boolean;
// }

// export interface ITenantSubscriptionInvoice {
//     id: string;
//     price: number;
//     issueDate?: Date;
//     startDate?: Date;
//     endDate?: Date;
//     durationByDays: number;
//     subscriptionPlanId: string;
//     subscriptionPlanName?: string;
//     tenantId: string;
//     isActive: boolean;
//     canEdit: boolean;
//     tenantName?: string;
//     paymentRequests?: ITenantSubscriptionInvoicePaymentRequest[];
//     payments?: ISubscriptionTenantInvoicePayment[];
//     payment?: ISubscriptionTenantInvoicePayment;
// }

export interface ITenantSubscriptionInvoice {
    id: string;
    tenantSubscriptionRequestId: string;
    subscriptionPlanId: string;
    subscriptionPlanPriceId: string;
    userCount: number;

    issueDate?: Date;
    startDate?: Date;
    endDate?: Date;
    totalAmount: number;
    remainingAmount: number;

    isPaid: boolean;
    TransferReferenceKey: string;
    TransferPaymentNote: string;
    isAccountingConfirmation: boolean;

    subscriptionPlanName?: string;
    subscriptionTypeName?: string;
    tenantId: string;
    isActive: boolean;
    canEdit: boolean;
    tenantName?: string;
    payments?: ITenantSubscriptionInvoicePayment[];
    payment?: ITenantSubscriptionInvoicePayment;
}

export interface ITenantSubscriptionInvoicePaymentRequest {
    id: string;
    requestTime: Date;
    requestAmount?: number;
    requestReferenceKey: string;
    requestReferenceImageUrl: string;
    requestPaymentNote: string;
    isConfirmed: boolean;
    confirmationUserId?: string;
    confirmationTime?: Date;
    subscriptionTenantInvoiceId: string;
    tenantId: string;
    canEdit?: boolean;
    payment?: ITenantSubscriptionInvoicePayment;
}

export interface ITenantSubscriptionInvoicePayment {
    id: string;
    paidAmount: number;
    paymentTime: Date;
    paymentReferenceKey: string;
    paymentType: string;
    subscriptionTenantInvoicePaymentRequestId: string;
    subscriptionTenantInvoiceId: string;
    tenantId: string;
}

export interface ICreateSubscriptionTenantInvoicePaymentRequestDto {
    requestAmount: number;
    requestReferenceKey: string;
    requestReferenceImageUrl?: string;
    requestPaymentNote: string;
    subscriptionTenantInvoiceId?: string;
}

export interface IRemainingAmountOfSubscriptionTenantInvoiceDto {
    id: string;
    subscriptionPlanId: string;
    subscriptionPlanName?: string;
    userCount: number;
    userPrice: number;
    totalAmount: number;
    totalPayments: number;
    remainingAmount: number;
}
