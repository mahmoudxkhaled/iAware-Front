export interface ISystemEmailActivity {
    id?: number;
    emailSubject?: string;
    emailBody?: string;
    isActive: boolean;
    systemEmailId?:string;
    systemEmailActivityLanguages?:any[];
}