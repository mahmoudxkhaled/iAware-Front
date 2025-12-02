import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { IHelpCategoryTicketActivitiesModel } from 'src/app/layout/api/IHelpCategoryTicketActivitiesModel';
import { LocalStorageService } from './local-storage.service';
import { IHelpCategoryModel } from 'src/app/layout/api/IHelpCategoryModel';
import { IHelpCategoryTicketModel } from 'src/app/layout/api/IHelpCategoryTicketModel';
import { environment } from 'src/environments/environment';

export interface messagehub {
    reply: string;
    languageId?: string;
    helpDepartmentTicketId: string;
    senderId: string;
    receiverId: string;
}

@Injectable({
    providedIn: 'root',
})
export class ChatHubService {
    BASE_URL = environment.apiUrl;
    BASE_URLII = environment.apiUrlWithoutAPI;

    connectionIsEstablished = false;
    _hubConnection: signalR.HubConnection;

    constructor(private localtorage: LocalStorageService) {
        const data = localtorage.getCurrentUserData();
        const token = data.token;

        this._hubConnection = new signalR.HubConnectionBuilder()
            .withUrl(`${this.BASE_URLII}/chathub?token=${token}`, {
                accessTokenFactory: () => token,
            })
            .configureLogging(signalR.LogLevel.None)
            .withAutomaticReconnect()
            .build();

        this._hubConnection
            .start()
            .then(() => console.log('Connection started chathub'))
            .catch((err) => console.log('Error while starting connection: ' + err));

        this._hubConnection.on('ReceiveMessageOnJoinRoom', (message: string, messageTime: string) => {
            console.log('message:', message);
            console.log('messageTime:', messageTime);
        });

        this._hubConnection.on('ReceiveMessageOnDisconnect', (message: string, messageTime: string) => {
            console.log('message:', message);
            console.log('messageTime:', messageTime);
        });

        this._hubConnection.on('ReceiveMessageOnLeaveRoom', (message: string, messageTime: string) => {
            console.log('message:', message);
            console.log('messageTime:', messageTime);
        });

        this._hubConnection.on('ConnectedUser', (users: any) => {
            console.log('NoOfUsersInChat:', users);
        });
    }

    public async joinRoom(UserId: string, GroupId: string) {
        console.log(UserId, GroupId);
        return this._hubConnection.invoke('JoinRoom', { UserId, GroupId });
    }

    sendMessage(msg: IHelpCategoryTicketActivitiesModel) {
        this._hubConnection
            .invoke('SendMessage', msg)
            .catch((err: any) => console.error('Error while sending message:', err));
    }

    sendNewTicket(notifi: any) {
        this._hubConnection
            .invoke('sendNewTicket', notifi)
            .catch((err: any) => console.error('Error while sending message:', err));
    }
}
