import { IPhishingDomainEmail } from './IPhishingDomainEmail';

export interface IPhishingDomain {
    id: string;
    domainName: string;
    isActive: boolean;
    phishingDomainEmailsCount : number;
    phishingDomainEmails: IPhishingDomainEmail[];
}
