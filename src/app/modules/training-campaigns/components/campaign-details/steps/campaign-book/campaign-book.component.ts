import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { PdfViewerComponent } from 'ng2-pdf-viewer';
import { IPointSystemTransactionModel } from 'src/app/core/Dtos/IPointSystemTransactionModel';
import { PointingTypeEnum } from 'src/app/core/enums/PointingTypeEnum ';
import { IawareSharedService } from 'src/app/core/Services/iaware-shared.service';
import { LocalStorageService } from 'src/app/core/Services/local-storage.service';
import { TableLoadingService } from 'src/app/core/Services/table-loading.service';
import { TranslationService } from 'src/app/core/Services/translation.service';
import { CampaignService } from 'src/app/modules/training-campaigns/services/campaign.service';

@Component({
  selector: 'app-campaign-book',
  templateUrl: './campaign-book.component.html',
  styleUrl: './campaign-book.component.scss'
})

export class CampaignBookComponent implements OnInit, OnDestroy {

  scedualUserId: string;
  bookUrl: string;
  lessonId: string;
  campaignId: string;
  isLastPage: boolean = false;
  isPdfOnePage: boolean = false;
  currentPage: number = 1;
  tableLoadingSpinner: boolean = true;
  pageTitle: string;
  @ViewChild(PdfViewerComponent) pdf?: PdfViewerComponent;

  constructor(private router: Router, 
    private localStorageService: LocalStorageService, 
    private apiService: CampaignService, 
    private pointService: IawareSharedService, 
    private tableLoadingService: TableLoadingService,
    private translate : TranslationService
  ) { }

  ngOnInit(): void {
    this.tableLoadingService.loading$.subscribe((isLoading) => { this.tableLoadingSpinner= isLoading; });
    this.tableLoadingService.show();
    this.bookUrl = this.localStorageService.getItem('bookURL');
    this.lessonId = this.localStorageService.getItem('lessonId');
    this.campaignId = this.localStorageService.getItem('campaignId');
    this.scedualUserId = this.localStorageService.getItem('scedualUserId');

    if (this.pdf?.pdfViewer.pagesCount === this.currentPage) {
      this.isPdfOnePage = true;
      this.isLastPage = true;
    }
    
    this.tableLoadingService.hide();
    window.scrollTo({
      top: 310,
      behavior: 'smooth'
    });

    // this.pageTitle = this.translate.getInstant('campaign.campaignDetails.steps.bookTitle'); //`You're currently reading the book. If you prefer watching the video, <a  class="dynamic-link" style="cursor: pointer; font-size: medium; font-weight: 500" data-path="/training-campaign/${this.scedualUserId}/${this.campaignId}/video">click here</a> to watch the video`;
    const bookTitle = this.translate.getInstant('campaign.campaignDetails.steps.bookTitle');
    console.log(bookTitle);
    this.pageTitle = bookTitle.replace('[scedualUserId]', this.scedualUserId).replace('[campaignId]', this.campaignId);
  }

  onPreviuosPageClick() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  onNextPageClick() {
    if (this.pdf && this.pdf?.pdfViewer.pagesCount > this.currentPage) {
      this.currentPage++;
    }

    if (this.pdf?.pdfViewer.pagesCount === this.currentPage) {
      this.isLastPage = true;
    }
  }

  nextPage() {
    if (this.isLastPage && this.lessonId) {
      this.apiService.updateScedualUserUpdateBookViewingTime(this.scedualUserId).subscribe({
        next: () => {
          this.localStorageService.setItem('isBookViewed', this.isLastPage);
          this.router.navigate([`training-campaign/${this.lessonId}/${this.campaignId}/quiz`]);
        },
        error: (e) => {
          console.log(e)
        }
      })
    }
  }

  handleLastPageReached() {
    this.isLastPage = true;
    const point: IPointSystemTransactionModel = {
      pointTypeId: PointingTypeEnum.CompletingAwarenessVideoORComicBook,
      referenceId: this.lessonId,
      campaignId: this.campaignId
    }
    this.pointService.addPointingTransaction(point).subscribe()
  }

  navigateToVideo() {
    this.router.navigate([`training-campaign/${this.lessonId}/${this.campaignId}/video`]);
  }

  prevPage() {
    this.router.navigate([`training-campaign/${this.lessonId}/${this.campaignId}/video`]);
  }

  ngOnDestroy(): void {

  }
}