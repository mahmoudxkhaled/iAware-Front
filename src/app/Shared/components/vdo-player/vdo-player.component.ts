import { AfterViewInit, Component, Input, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { finalize } from 'rxjs';
import { VdoPlayerService } from 'src/app/core/Services/vdo-player.service';
import { CommonModule } from '@angular/common';
import { IPointSystemTransactionModel } from 'src/app/core/Dtos/IPointSystemTransactionModel';
import { PointingTypeEnum } from 'src/app/core/enums/PointingTypeEnum ';
import { IawareSharedService } from 'src/app/core/Services/iaware-shared.service';
import { MultimediaService } from 'src/app/modules/multimedia-library/services/multimedia.service';

declare var VdoPlayer: any;

@Component({
  selector: 'app-vdo-player',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vdo-player.component.html',
  styleUrls: ['./vdo-player.component.scss'],
})
export class VdoPlayerComponent implements OnInit, AfterViewInit, OnDestroy {
  
  isVideoCompleted: boolean = false;
  lessonId: string;

  @Input() videoId: string = '';
  @Output() videoCompleted = new EventEmitter<boolean>();  // Output event emitter

  otp: string | null = null;
  playbackInfo: string | null = null;
  videoUrl: SafeResourceUrl | null = null;
  private player: any;
  private trackingIntervalId: any;


  constructor(
    private multiMediaServ: MultimediaService,
    private pointService: IawareSharedService,
    private vdoServ: VdoPlayerService,
    private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    window.addEventListener('beforeunload', () => this.trackUserVideoProgress());
    this.vdoServ.getVideoCredentials(this.videoId)
      .pipe(
        finalize(() => {
          if (this.otp && this.playbackInfo) {
            const videoUrl = `https://player.vdocipher.com/v2/?otp=${this.otp}&playbackInfo=${this.playbackInfo}`;
            this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(videoUrl);
            console.log('Video URL set:', videoUrl);
          }
        })
      )
      .subscribe(
        (token) => {
          this.otp = token.data.otp;
          this.playbackInfo = token.data.playbackInfo;
        },
        (error) => {
          console.error('Error fetching video credentials:', error);
        }
      );
  }

  ngAfterViewInit() {
    this.initializePlayer();
  }

  private initializePlayer() {
    const intervalId = setInterval(() => {
      if (this.videoUrl && document.querySelector('iframe')) {
        const iframe = document.querySelector('iframe') as HTMLIFrameElement;
        // Destroy existing player instance if already initialized
        this.destroyPlayer();
        this.player = new VdoPlayer(iframe);
        this.setupPlayerEvents();
        clearInterval(intervalId);
      }
    }, 100);
  }

  private setupPlayerEvents() {
    this.player.video.addEventListener('play', () => {
      console.log('Video is playing');
    });

    this.player.video.addEventListener('ended', () => {
      console.log('Video is ended');
      this.onVideoEnded()
      this.videoCompleted.emit(true);  // Emit the event when video ends
    });

    // Set up elements for displaying both Total Played and Total Covered times
    const tpEl = document.querySelector("#tp") as HTMLElement;
    const tcEl = document.querySelector("#tc") as HTMLElement;

    this.trackingIntervalId = setInterval(() => {
      this.player.api.getTotalPlayed()
        .then((tp: number) => {
          if (tpEl) {
            tpEl.innerHTML = `Total Played(s): ${tp}`;
            console.log(`Total Played(s): ${tp}`);

          }
        })
        .catch((err: any) => {
          console.error('Error getting total played time:', err);
        });

      this.player.api.getTotalCovered()
        .then((tc: number) => {
          if (tcEl) {
            tcEl.innerHTML = `Total Covered(s): ${tc}`;
            console.log(`Total Covered(s): ${tc}`);

          }
        })
        .catch((err: any) => {
          console.error('Error getting total covered time:', err);
        });
    }, 1000);
  }

  private destroyPlayer() {
    if (this.player) {
      console.log('Destroying player instance...');

      // Remove event listeners (if any were added manually)
      if (this.player.video) {
        this.player.video.removeEventListener('play', this.onVideoPlay);
        this.player?.video?.removeEventListener('ended', () => this.videoCompleted.emit(true));

      }

      // Clear player reference to help with garbage collection
      this.player = null;
    }

    // Clear the interval tracking Total Played and Total Covered
    if (this.trackingIntervalId) {
      clearInterval(this.trackingIntervalId);
      this.trackingIntervalId = null;
    }

    // Reset UI display values
    const tpEl = document.querySelector("#tp") as HTMLElement;
    const tcEl = document.querySelector("#tc") as HTMLElement;
    if (tpEl) tpEl.innerHTML = `Total Played(s): 0`;
    if (tcEl) tcEl.innerHTML = `Total Covered(s): 0`;
  }

  private onVideoPlay = () => {
    console.log('Video is playing');
  }

  private totalWatchTime: number = 0; // Accumulates total watch time

  onVideoEnded() {
    const point: IPointSystemTransactionModel = {
      pointTypeId: PointingTypeEnum.CompletingAwarenessVideoORComicBook,
      referenceId: this.lessonId,
    };
    this.pointService.addPointingTransaction(point).subscribe();
  }


  onCloseVideoPreviewDialog() {
    // Fetch the covered time when the dialog is closed
    this.player.api.getTotalCovered()
      .then((totalCovered: number) => {
        this.totalWatchTime += totalCovered;  // Accumulate total watch time
        console.log(`Total Covered Time: ${totalCovered}`);
        this.trackUserVideoProgress();        // Send progress to backend
      })
      .catch((error: any) => {
        console.error('Error fetching Total Covered time:', error);
      });
  }

  trackUserVideoProgress() {
    if (this.totalWatchTime > 0) {  // Check if totalWatchTime is greater than 0
      const videoWatchingDetails = {
        VideoId: this.videoId,
        TotalWatchedTimeBySeconds: this.totalWatchTime,
      };

      this.multiMediaServ.trackUserVideoProgress(videoWatchingDetails).subscribe(
        (response) => {
          console.log('Tracking data sent successfully', response);
          this.totalWatchTime = 0;  // Reset after sending
        },
        (error) => {
          console.error('Error sending tracking data', error);
        }
      );
    } else {
      console.log('No video progress to track. Skipping tracking.');
    }
  }

  ngOnDestroy(): void {
    this.onCloseVideoPreviewDialog()
    this.destroyPlayer(); // Clean up player and intervals when component is destroyed
    window.removeEventListener('beforeunload', this.trackUserVideoProgress);
  }
}