import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';

@Component({
    selector: 'app-pdf-viewer-dialog',
    templateUrl: './pdf-viewer-dialog.component.html',
    styleUrls: ['./pdf-viewer-dialog.component.scss'],
})
export class PdfViewerDialogComponent implements OnChanges {
    @Input() pdfUrl!: string;
    @Output() close = new EventEmitter<void>();
    visible = true;

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['pdfUrl']) {
            this.logPdfUrl();
        }
    }

    onHide(): void {
        this.visible = false;
        this.close.emit();
        this.logPdfUrl();
    }

    private logPdfUrl(): void {
    }
}
