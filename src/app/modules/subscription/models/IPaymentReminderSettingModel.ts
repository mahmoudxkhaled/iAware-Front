

export interface IPaymentReminderSettingModel {
    id: string;
    title: string;
    subject: string;
    message: string;
    beforePayCount: number;
    isActive: boolean;
  }