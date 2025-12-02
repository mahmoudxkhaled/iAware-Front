import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CloudFlareService {

  constructor(private httpClient: HttpClient) { }
  CloudFlareAccountId = "54420c1ab525f6db898a46cca426931c";
  BASE_URL = environment.apiUrl;

  // getVideoDetails(data: any): Observable<any> {
  //   const httpHeaders = new HttpHeaders({
  //     CloudFlareToken: "izX_bJ2ngAeIdZlVZaTbYc05LITFPgpQRco22j6O"
  //   });
  //   return this.httpClient.post<any>(`https://api.cloudflare.com/client/v4/accounts/${CloudFlareAccountId}/stream/${data}`, {
  //     headers: httpHeaders,
  //   });
  // }


  getVideoToken(VideoID: string): Observable<any> {
    const CloudFlareAccountId = "54420c1ab525f6db898a46cca426931c";
    const httpHeaders = new HttpHeaders({
      'X-Auth-Key': environment.CloudFlareAPIKey,
      'Authorization': environment.CloudFlareAuthorization,
      'X-Auth-Email': environment.CloudFlareEmail,
    });

    // Making the POST request to the Cloudflare API
    return this.httpClient.post<any>(`https://api.cloudflare.com/client/v4/accounts/${CloudFlareAccountId}/stream/${VideoID}/token`, {}, { headers: httpHeaders })
      .pipe(
        map(response => response.result.token)  // Extract token from the response
      );
  }





  // getVideoOTP(): Observable<any> {
  //   const httpHeaders = new HttpHeaders({
  //     'Authorization': "Apisecret tSg9o8BuinW2BjgfAj6M7Y2dEROhRleWyVSMVMG1aqzb9QnQMfXi2EJ170WTforY",
  //     'Content-Type': "application/json",
  //   });

  //   return this.httpClient.post<any>(`https://dev.vdocipher.com/api/videos/e935efa220254854a1379dcce56f4f5d/otp`, {}, { headers: httpHeaders })

  // }


  getVideoOTP(): Observable<any> {
    return this.httpClient.post<any>('https://localhost:7201/api/TrainingLesson/GetVideoOTP', {});
  }




}
