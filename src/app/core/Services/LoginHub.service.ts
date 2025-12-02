import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { LocalStorageService } from './local-storage.service';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { DialogService } from 'primeng/dynamicdialog';
import { SessionExpiredDialogComponent } from 'src/app/Shared/components/session-expired-dialog/session-expired-dialog.component';

@Injectable({
    providedIn: 'root',
})
export class LoginHubService {
    BASE_URL = environment.apiUrl;
    BASE_URLII = environment.apiUrlWithoutAPI;

    connectionIsEstablished = false;
    _hubConnection: signalR.HubConnection;

    constructor(private localStorage: LocalStorageService, private router: Router, private dialogService: DialogService) {
        const data = localStorage.getCurrentUserData();
        const token = data.token;
        this._hubConnection = new signalR.HubConnectionBuilder()
            .withUrl(`${this.BASE_URLII}/loginHub?token=${token}`, {
                accessTokenFactory: () => token,
            })
            .configureLogging(signalR.LogLevel.None)
            .withAutomaticReconnect()
            .build();

        this._hubConnection
            .start()
            .then(() => {
                console.log('Connection started loginHub');
            })
            .catch((err) => console.log('Error while starting connection: ' + err));

        this._hubConnection.on('ForceLogout', () => {
            this.logoutUser();
        });
    }
    
    private logoutUser() {
        this.dialogService.open(SessionExpiredDialogComponent, {
            showHeader: false,
            styleClass: 'custom-dialog',
            maskStyleClass: 'custom-backdrop',
            dismissableMask: false,
            width: '20vw',
            closable: false
        });
    }
    
    displaySessionWarning(message: string) {
        alert(message);
    }

    login() {
        this._hubConnection
            .invoke('Login')
            .then(() => console.log('Login invoked successfully'))
            .catch((err: any) => console.error('Error while invoking login:', err));
    }
}
