export interface ISystemEmail {
    id: string;
    senderUserName: string;
    senderDisplayName: string;
    senderEmail: string;
    senderEmailPassword: string;
    outgoingServer: string;
    outgoingServerPort: number;
    enableSSL: boolean;
  }