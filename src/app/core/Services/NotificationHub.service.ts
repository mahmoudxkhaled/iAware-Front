import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { LocalStorageService } from './local-storage.service';
import { notificiationDto } from 'src/app/layout/top-bar/app.topbar.component';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class NotificationHubService {
    BASE_URL = environment.apiUrl;
    BASE_URLII = environment.apiUrlWithoutAPI;
    connectionIsEstablished = false;
    _hubConnection: signalR.HubConnection;

    constructor(private localtorage: LocalStorageService) {
        const data = localtorage.getCurrentUserData();
        const token = data.token;

        this._hubConnection = new signalR.HubConnectionBuilder()
            .withUrl(`${this.BASE_URLII}/notificationhub?token=${token}`, {
                accessTokenFactory: () => token,
            })
            .configureLogging(signalR.LogLevel.None)
            .withAutomaticReconnect()
            .build();

        this._hubConnection
            .start()
            .then(() => console.log('Connection started notificationhub'))
            .catch((err) => console.log('Error while starting connection: ' + err));

        this._hubConnection.on('SendNotification', (notification: notificiationDto) => {
            console.log('message:', notification);
        });
    }

    // onNotificationReceived(msg: notificiationDto) {
    //     this._hubConnection
    //         .invoke('SendNotification', msg)
    //         .catch((err: any) => console.error('Error while sending message:', err));
    // }
}
