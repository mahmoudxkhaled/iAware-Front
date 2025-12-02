export enum SystemEmailActivity {
    SendCampaignLessonEmail = 1,
    ForgetPassword,
    ResetPassword,
    VerificationCode,
    DeleteTenant,
    ActivateTenant,
    DeactivateTenant,
    CampaignAdded,
    CampaignDeleted,
    CampaignActivated,
    CampaignDeactivated,
    CampaignUpdated,
    RenewSubscription,
    RefundSubscription,
    ConfirmSubscription,
    UpgradeSubscription,
    GetSubscriptionDemo,
    RemainingBillSubscription,
    DowngradeSubscription,
    IncreaseUsersSubscription,
    DecreaseUsersSubscription,
    iAwarePasswordCreation,
}

export function getSystemEmailActivitiesAsDropdownOptions() {
    return Object.keys(SystemEmailActivity)
        .filter(key => isNaN(Number(key)))
        .map(key => ({
            id: SystemEmailActivity[key as keyof typeof SystemEmailActivity],
            label: key
        }));
}