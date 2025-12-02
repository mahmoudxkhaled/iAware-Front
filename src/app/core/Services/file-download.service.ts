import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as saveAs from 'file-saver';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
@Injectable({
    providedIn: 'root',
})
export class FileDownloadService {
    BASE_URL = environment.apiUrl;

    constructor(private http: HttpClient) {}

    downloadFileFromBackend(fileSrc: string) {
        this.http.get(fileSrc, { responseType: 'blob' }).subscribe((blob) => {
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileSrc.substring(fileSrc.lastIndexOf('/') + 1);
            link.click();
            window.URL.revokeObjectURL(url);
        });
    }

    downloadFileFromBackends(fileSrc: string) {
        this.http.get(fileSrc, { responseType: 'blob' }).subscribe((blob) => {
            const fileName = fileSrc.substring(fileSrc.lastIndexOf('/') + 1);
            saveAs(blob, fileName);
        });
    }

    downloadFileFromAssets(folderName: string, fileName: string) {
        const link = document.createElement('a');
        link.setAttribute('href', `assets/${folderName}/${fileName}`);
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    downloadFile(filePath: string): Observable<void> {
        // Ensure filePath is relative (remove any base URL)
        const relativeFilePath = filePath.replace(/^https?:\/\/[^\/]+\/?/, ''); // Removes the base URL
        const url = `${this.BASE_URL}/ToDo/download/${relativeFilePath}`;

        return this.http
            .get(url, {
                responseType: 'blob',
            })
            .pipe(
                map((blob) => {
                    const fileName = relativeFilePath.split('/').pop() || 'downloadedFile';
                    saveAs(blob, fileName);
                })
            );
    }
}
