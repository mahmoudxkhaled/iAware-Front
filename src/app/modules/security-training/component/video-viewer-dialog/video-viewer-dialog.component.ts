import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-video-viewer-dialog',
  templateUrl: './video-viewer-dialog.component.html',
  styleUrl: './video-viewer-dialog.component.scss'
})
export class VideoViewerDialogComponent {
  @Input() videoUrl!: string;
  @Output() close = new EventEmitter<void>();
  visible = true;

  onHide(): void {
    this.close.emit();
  }
}
