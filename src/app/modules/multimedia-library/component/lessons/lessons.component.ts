import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IPointSystemTransactionModel } from 'src/app/core/Dtos/IPointSystemTransactionModel';
import { PointingTypeEnum } from 'src/app/core/enums/PointingTypeEnum ';
import { IawareSharedService } from 'src/app/core/Services/iaware-shared.service';
import { ITrainingCategoryModel, TrainingCategoryLessonDto } from 'src/app/modules/security-training/models/ISecurityTrainingCategoryModel';
import { TrainingLessonService } from 'src/app/modules/security-training/services/training-lesson.service';
import { TableLoadingService } from 'src/app/core/Services/table-loading.service';
import { ITrainingLessonScreenSaver } from 'src/app/modules/security-training/models/ISecurityTrainingModel';
import { FileDownloadService } from 'src/app/core/Services/file-download.service';
import { IAspNetPageItemModel } from 'src/app/modules/page-management/models/IAspNetPageItemModel';
import { constants } from 'src/app/core/constatnts/constatnts';
import { PermessionsService } from 'src/app/core/Services/permessions.service';
import { IPaginationModel } from 'src/app/core/Dtos/IPaginationModel';

@Component({
  selector: 'app-lessons',
  templateUrl: './lessons.component.html',
  styleUrl: './lessons.component.scss'
})
export class LessonsComponent implements OnInit {

  pagePermessions: IAspNetPageItemModel[] = [];
  actions = constants.pageActions;
  @Input() categoryId?: string | null;
  bookUrl: string;
  videoUrl: string;
  defaultBannerImage: string = 'assets/images/trainingCategoryBannerImageUrl.jpg';
  category: ITrainingCategoryModel;
  downloadScreenSaversDialog: boolean = false;
  bookPreviewDialog: boolean = false;
  videoPreviewDialog: boolean = false;
  tableLoadingSpinner: boolean = true;
  isVideoCompleted: boolean = false;
  currentLessonSelected: string;
  trainingLessons: any[] = [];
  screensaversToDownload: ITrainingLessonScreenSaver[] = [];
  selectedScreensaversToDownload: string[] = [];
  originalLessons: any[] = []; // Backup of original lessons
  trainingCategoryLessons?: TrainingCategoryLessonDto[] = [];
  filteredTrainingCategoryLessons?: TrainingCategoryLessonDto[] = [];
  totalRecords: number = 0;
  trainingLessonsPagiantion: IPaginationModel = {
    page: 0,
    size: 12,
    searchQuery: ''
  };

  constructor(
    private trainServ: TrainingLessonService,
    private router: Router,
    private pointService: IawareSharedService,
    private fileDownloadService: FileDownloadService,
    private permessionService: PermessionsService,
    private tableLoadingService: TableLoadingService) {
    this.pagePermessions = this.permessionService.getPagePermessions(constants.pages.multimediaLibrary);
  }

  ngOnInit(): void {
    this.tableLoadingService.loading$.subscribe((isLoading) => {
      this.tableLoadingSpinner = isLoading;
    });

    // this.fetchCategoryWithLessons();
  }
  lazyLoadTrainingLessons(event: any) {
    this.trainingLessonsPagiantion.searchQuery = event.globalFilter || '';
    this.trainingLessonsPagiantion.page = Math.floor(event.first / event.rows);
    this.trainingLessonsPagiantion.size = event.rows;
    this.fetchCategoryWithLessons();
    this.scrollToTop();
  }

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
  fetchCategoryWithLessons() {
    this.tableLoadingService.show();
    this.trainServ.getTrainingLessonsWithPagination(this.trainingLessonsPagiantion, this.categoryId ?? null).subscribe({
      next: (res) => {
        this.trainingCategoryLessons = res.data;
        console.log('trainingCategoryLessons', this.trainingCategoryLessons);
        this.filteredTrainingCategoryLessons = res.data;
        this.totalRecords = res.totalRecords;
        // if (this.categoryId) {
        //   // Filter Data according to categoryId 
        //   const filteredTrainingLessonsByCategoryId = this.trainingCategoryLessons?.filter(c => c.trainingLessonCategoryId == this.categoryId);
        //   this.trainingCategoryLessons = filteredTrainingLessonsByCategoryId;
        //   this.filteredTrainingCategoryLessons = filteredTrainingLessonsByCategoryId;
        // }
        this.tableLoadingService.hide();
      },
      error: (error) => { }
    });
  }

  onTagFilterChanged(selectedTagIds: string[]): void {
    if (selectedTagIds.length > 0) {
      this.filteredTrainingCategoryLessons = this.trainingCategoryLessons?.filter((lesson) => {
        return lesson.tagIds?.some((tagId: string) => selectedTagIds.includes(tagId));
      });
    } else {
      this.filteredTrainingCategoryLessons = this.trainingCategoryLessons;
    }
  }

  backToCategories() {
    this.router.navigate(['/multimedia/Categories'])
  }

  openVideo(lesson: any) {
    this.videoUrl = lesson.lessonVideoUrl;
    this.currentLessonSelected = lesson.id;
    this.videoPreviewDialog = true;
  }

  openBook(lesson: any) {
    this.bookUrl = lesson.lessonBookUrl;
    this.currentLessonSelected = lesson.id;
    this.bookPreviewDialog = true;
  }

  onVideoEnded() {
    this.isVideoCompleted = true;
    const point: IPointSystemTransactionModel = {
      pointTypeId: PointingTypeEnum.CompletingAwarenessVideoORComicBook,
      referenceId: this.currentLessonSelected,
    };
    this.pointService.addPointingTransaction(point).subscribe();
  }

  handleLastPageReached() {
    const point: IPointSystemTransactionModel = {
      pointTypeId: PointingTypeEnum.CompletingAwarenessVideoORComicBook,
      referenceId: this.currentLessonSelected,
    };
    this.pointService.addPointingTransaction(point).subscribe();
  }

  getImageUrl(url: string | null): string {
    return url || this.defaultBannerImage
  }

  toggleDescription(lesson: any): void {
    lesson.isExpanded = !lesson.isExpanded;
  }

  close() {
    this.bookPreviewDialog = false;
    this.videoPreviewDialog = false;
    this.bookUrl = '';
    this.videoUrl = '';
    this.currentLessonSelected = '';
  }

  openScreensaverDialog(lesson: TrainingCategoryLessonDto): void {
    this.downloadScreenSaversDialog = true;
    this.screensaversToDownload = lesson.trainingLessonScreenSaver ?? [];
  }

  addToDownload(screenSaver: any) {
    this.fileDownloadService.downloadFile(screenSaver).subscribe();
  }

  navigateToUpgradPlane() {

  }

  hasPermission(controlKey: string): boolean {
    return this.pagePermessions.some((p) => p.controlKey === controlKey);
  }
}