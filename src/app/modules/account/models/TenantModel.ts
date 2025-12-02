import { IBadgeModel } from "./IBadgeModel";

export class TenantModel{
    id?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    language?: string;
    currency?: string;
    country?: string;
    companyName?: string;
    timeZone?: string;
    email?: string;
    isActive?: boolean;
    isDeleted?: boolean;
    deletedTime?: Date;
    insertedTime?: Date;
    insertedUserId?: string;
    deletedUserId?: string;
    activationUserId?: string;
    activationTime?: Date;
    deActivationTime?: Date;
    organizationName?: string;
    streetAddress1?: string;
    streetAddress2?: string;
    suiteNumber?: number;
    city?: string;
    state?: string;
    zipeCode?: number;
    extention?: string;
    bussinessHoursFrom?: Date;
    bussinessHoursTo?: Date;
    bussinessDayes?: string;
    defaultAdminConsoleLanguage?: string;
    dateTimeFormate?: string;
    companyLogoURL?: string;
    companyLogo?: string;
    brandColor?: string;
    brandCertificate?: string;
    enableUserProvisioning?: boolean;
    testMode?: boolean;
    showGroupAdmin?: boolean;
    adISyncToken?: string;
    adPassword?:string;
    adUserName?:string;
    adDomainName?:string;
    adDomainNameExtention?:string;
    ipAddress?:string;
    enableUserProvisioningNotifications?: boolean;
    timeFrame?: string;
    notificationsRecipients?: string;
    adminSessionTimeout?: number;
    userSessionTimeout?: number;
    minimumPasswordLength?: number;
    requireMFA?: string;
    rememberTrustedDevice?: boolean;
    rememberDeviceFor?: number;
    defaultPhishingLanguage?: string;
    enableContentSurveysForAllNewTrainingCampaigns?: boolean;
    enableDirectLinksInTrainingNotifications?: boolean;
    defaultTrainingLanguage?: string;
    enableOptionalTrainingCampaigns?: boolean;
    enableAIDARecomendedOptionalLearning?: boolean;
    enableBadges?: boolean;
    leaderboardType?: string;
    leaderboardTimePeriod?: string;
    groupsToIncludeInLeaderboard?: string;
    excludeTrainingCampaignsWithNoDueDate?: boolean;
    enableSAMLSSO?: boolean;
    disableNonSMALLoginsForAllUsers?: boolean;
    allowAdminswMFAToByPassSMALLogin?: boolean;
    allowAccountCreationFromSAMLLogin?: boolean;
    idPSSOTargetURL?: string;
    sha_1?: boolean;
    sha_256?: boolean;
    signUpAuthnRequest?: boolean;
    enableSPAuthnRequesExpirationNotifications?: boolean;
    samlNotificationRecipients?: string;
    currentAuthnRequestCertificate?: string;
    currentAuthnRequestCertificateValidFrom?: Date;
    currentAuthnRequestCertificateValidTo?: Date;
    entityId?: string;
    ssoSignInURL?: string;
    ssoSignOutURL?: string;
    ssoCallbackURL?: string;
    smalId?: string;
    metadataURL?: string;
    bypassSSOLoginURL?: string
    tenantBadges? : IBadgeModel[]
    [key: string]: any;

    constructor(){
        this.id = '',
        this.firstName = '',
        this.lastName = '',
        this.phone = '',
        this.language = '',
        this.currency = '',
        this.country = '',
        this.companyName = '',
        this.timeZone = '',
        this.email = '',
        this.deletedTime = new Date,
        this.insertedTime = new Date,
        this.activationTime = new Date,
        this.deActivationTime = new Date,
        this.suiteNumber = null!,
        this.zipeCode = null!,
        this.bussinessHoursFrom = new Date,
        this.bussinessHoursTo =  new Date,
        this.adminSessionTimeout = null!,
        this.userSessionTimeout = null!,
        this.minimumPasswordLength =  null!,
        this.rememberDeviceFor =  null!,
        this.isDeleted =  null!,
        this.isActive =  null!,
        this.enableUserProvisioning =  null!,
        this.testMode =  null!,
        this.showGroupAdmin =  null!,
        this.enableUserProvisioningNotifications =  null!,
        this.rememberTrustedDevice =  null!,
        this.enableContentSurveysForAllNewTrainingCampaigns =  null!,
        this.enableDirectLinksInTrainingNotifications =  null!,
        this.enableOptionalTrainingCampaigns =  null!,
        this.enableAIDARecomendedOptionalLearning = null!,
        this.enableBadges = null!,
        this.excludeTrainingCampaignsWithNoDueDate =  null!,
        this.enableSAMLSSO = null!,
        this.disableNonSMALLoginsForAllUsers = null!,
        this.allowAdminswMFAToByPassSMALLogin = null!,
        this.allowAccountCreationFromSAMLLogin = null!,
        this.sha_1 = null!,
        this.sha_256 = null!,
        this.signUpAuthnRequest = null!,
        this.enableSPAuthnRequesExpirationNotifications =  null!,
        this.currentAuthnRequestCertificateValidFrom = new Date,
        this.currentAuthnRequestCertificateValidTo =  new Date,
        this.insertedUserId = '',
        this.deletedUserId = '',
        this.activationUserId = '',
        this.organizationName = '',
        this.streetAddress1 = '',
        this.streetAddress2 = '',
        this.city = '',
        this.state = '',
        this.extention = '',
        this.bussinessDayes = '',
        this.defaultAdminConsoleLanguage = '',
        this.dateTimeFormate = '',
        this.companyLogoURL = '',
        this.companyLogo = '',
        this.brandColor = '',
        this.brandCertificate = '',
        this.adISyncToken = '',
        this.adPassword = '',
        this.adUserName = '',
        this.adDomainName = '',
        this.adDomainNameExtention = '',
        this.ipAddress = '',
        this.timeFrame = '',
        this.notificationsRecipients = '',
        this.requireMFA = '',
        this.defaultPhishingLanguage = '',
        this.defaultTrainingLanguage = '',
        this.leaderboardType = '',
        this.leaderboardTimePeriod = '',
        this.groupsToIncludeInLeaderboard = '',
        this.idPSSOTargetURL = '',
        this.samlNotificationRecipients = '',
        this.currentAuthnRequestCertificate = '',
        this.entityId = '',
        this.ssoSignInURL = '',
        this.ssoSignOutURL = '',
        this.ssoCallbackURL = '',
        this.smalId = '',
        this.metadataURL = '',
        this.bypassSSOLoginURL = '',
        this.organizationName = '',
        this.tenantBadges = null!
    }
    setTenatPersonalData(_tenant: unknown){
        const tenant = _tenant as TenantModel;
        this.firstName = tenant.firstName;
        this.lastName = tenant.lastName;
        this.companyName = tenant.companyName;
        this.language = tenant.language;
        this.currency = tenant.currency;
        this.phone  = tenant.phone;
        this.country = tenant.country;
        this.timeZone = tenant.timeZone;
    }
    setTenatEmail(_tenant: unknown){
        const tenant = _tenant as TenantModel;
        this.email = tenant.email;
    }
    setTenatOrganizationData(_tenant: unknown){
        const tenant = _tenant as TenantModel;
        this.organizationName = tenant.organizationName;
        this.streetAddress1 = tenant.streetAddress1;
        this.streetAddress2 = tenant.streetAddress2;
        this.suiteNumber = tenant.suiteNumber;
        this.city = tenant.city;
        this.state = tenant.state;
        this.zipeCode = tenant.zipeCode;
        this.extention = tenant.extention;
        this.bussinessHoursFrom = tenant.bussinessHoursFrom;
        this.bussinessHoursTo = tenant.bussinessHoursTo;
        this.bussinessDayes = tenant.bussinessDayes;
        this.defaultAdminConsoleLanguage = tenant.defaultAdminConsoleLanguage;
        this.dateTimeFormate = tenant.dateTimeFormate;
    }
    setTenatBrandingData(_tenant: unknown){
        const tenant = _tenant as TenantModel;
        this.brandCertificate = tenant.brandCertificate
        this.brandColor = tenant.brandColor
        this.companyLogo = tenant.companyLogo
        this.companyLogoURL = tenant.companyLogoURL
    }
    setTenantUserProvisioningData(_tenant: unknown){
        const tenant = _tenant as TenantModel;
        this.testMode = tenant.testMode;
        this.enableUserProvisioning = tenant.enableUserProvisioning;
    }
    setTenantADSettingsData(_tenant: unknown){
        const tenant = _tenant as TenantModel;
        this.adISyncToken = tenant.adISyncToken;
        this.showGroupAdmin = tenant.showGroupAdmin;
        this.adPassword = tenant.adPassword;
        this.adUserName = tenant.adUserName;
        this.adDomainName = tenant.adDomainName;
        this.ipAddress = tenant.ipAddress;
        this.adDomainNameExtention = tenant.adDomainNameExtention;
    }
    setTenantUserProvisioningNotificationsData(_tenant: unknown){
        const tenant = _tenant as TenantModel;
        this.enableUserProvisioningNotifications = tenant.enableUserProvisioningNotifications;
        this.timeFrame = tenant.timeFrame;
        this.notificationsRecipients = tenant.notificationsRecipients;
    }
    setTenantUserSettingsData(_tenant: unknown){
        const tenant = _tenant as TenantModel;
        this.rememberDeviceFor = tenant.rememberDeviceFor;
        this.rememberTrustedDevice = tenant.rememberTrustedDevice;
        this.adminSessionTimeout = tenant.adminSessionTimeout;
        this.userSessionTimeout = tenant.userSessionTimeout;
        this.minimumPasswordLength = tenant.minimumPasswordLength;
        this.requireMFA = tenant.requireMFA;
    }
    setTenantPhishingSettingsData(_tenant: unknown){
        const tenant = _tenant as TenantModel;
        this.defaultPhishingLanguage = tenant.defaultPhishingLanguage;
    }
    setTenantTrainingSettingsData(_tenant: unknown){
        const tenant = _tenant as TenantModel;
        this.enableContentSurveysForAllNewTrainingCampaigns = tenant.enableContentSurveysForAllNewTrainingCampaigns;
        this.enableDirectLinksInTrainingNotifications = tenant.enableDirectLinksInTrainingNotifications;
    }
    setTenantLearnerExperienceData(_tenant: unknown){
        const tenant = _tenant as TenantModel;
        this.enableOptionalTrainingCampaigns = tenant.enableOptionalTrainingCampaigns;
        this.enableAIDARecomendedOptionalLearning = tenant.enableAIDARecomendedOptionalLearning;
        this.enableBadges = tenant.enableBadges;
        this.excludeTrainingCampaignsWithNoDueDate = tenant.excludeTrainingCampaignsWithNoDueDate;
        this.leaderboardType = tenant.leaderboardType;
        this.leaderboardTimePeriod = tenant.leaderboardTimePeriod;
        this.groupsToIncludeInLeaderboard = tenant.groupsToIncludeInLeaderboard;
        this.tenantBadges = tenant.tenantBadges;
        this.defaultTrainingLanguage = tenant.defaultTrainingLanguage
    }
    setTenantAccountIntegrationData(_tenant: unknown){
        const tenant = _tenant as TenantModel;
        this.enableSAMLSSO = tenant.enableSAMLSSO
        this.disableNonSMALLoginsForAllUsers = tenant.disableNonSMALLoginsForAllUsers
        this.allowAccountCreationFromSAMLLogin = tenant.allowAccountCreationFromSAMLLogin
        this.allowAdminswMFAToByPassSMALLogin = tenant.allowAdminswMFAToByPassSMALLogin
        this.sha_1 = tenant.sha_1
        this.sha_256 = tenant.sha_256
        this.signUpAuthnRequest = tenant.signUpAuthnRequest
        this.enableSPAuthnRequesExpirationNotifications = tenant.enableSPAuthnRequesExpirationNotifications
        this.idPSSOTargetURL = tenant.idPSSOTargetURL
        this.samlNotificationRecipients = tenant.samlNotificationRecipients
        this.currentAuthnRequestCertificate = tenant.currentAuthnRequestCertificate
        this.entityId = tenant.entityId
        this.ssoSignInURL = tenant.ssoSignInURL
        this.ssoSignOutURL = tenant.ssoSignOutURL
        this.ssoCallbackURL = tenant.ssoCallbackURL
        this.smalId = tenant.smalId
        this.metadataURL = tenant.metadataURL
        this.bypassSSOLoginURL = tenant.bypassSSOLoginURL
        this.currentAuthnRequestCertificateValidFrom = tenant.currentAuthnRequestCertificateValidFrom
        this.currentAuthnRequestCertificateValidTo = tenant.currentAuthnRequestCertificateValidTo
    }
}