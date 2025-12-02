import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CompanyProfileImageService {

  private companyPhotoSubject = new BehaviorSubject<string>('../../assets/images/companyDefaultLogo.png');

  companyPhoto$ = this.companyPhotoSubject.asObservable();

  setCompanyPhoto(photoUrl: string): void {
      this.companyPhotoSubject.next(photoUrl);
  }
}