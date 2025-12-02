export interface INotificationType {
    id: string;
    notificationTypeEnumId: number;
    title: string;
    notificationMessage: string;
    redirectPageUrl: string;
    notificationLogoUrl: string;
    notificationIcon: string;
    notificationParameterKey1: string;
    notificationParameterKey2: string;
    languageId: string;
    notificationTypeLanguages: INotificationTypeLanguage[];
    isActive?: boolean;
}

export interface INotificationTypeLanguage {
    id: string;
    title: string;
    notificationMessage: string;
    languageId: string;
    notificationTypeId: string;
    isActive?: boolean;
}

export interface INotificationTypeTransaction {
    id: string;
    senderUserId: string;
    recieverUserId: string;
    isRead: boolean;
}
