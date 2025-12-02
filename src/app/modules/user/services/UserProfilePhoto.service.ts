import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class UserProfilePhotoService {
    private userPhotoSubject = new BehaviorSubject<string>('../../assets/media/avatar.png');
    private userNameSubject = new BehaviorSubject<string>('');

    userPhoto$ = this.userPhotoSubject.asObservable();
    userName$ = this.userNameSubject.asObservable();

    setUserPhoto(photoUrl: string): void {
        this.userPhotoSubject.next(photoUrl);
    }

    setUserName(userName: string): void {
        this.userNameSubject.next(userName);
    }
}