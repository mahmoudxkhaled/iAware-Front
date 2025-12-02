import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { ITrainingLessonCategory } from 'src/app/modules/security-training/models/ISecurityTrainingModel';
import { MultimediaService } from '../../services/multimedia.service';
import { TableLoadingService } from 'src/app/core/Services/table-loading.service';

@Component({
    selector: 'app-training-category-library',
    templateUrl: './training-category-library.component.html',
    styleUrl: './training-category-library.component.scss',
})
export class TrainingCategoryVideosComponent implements OnInit {
    tableLoadingSpinner: boolean = true;
    trainingCategories: ITrainingLessonCategory[];
    defaultBannerImage: string = 'assets/images/trainingCategoryBannerImageUrl.jpg';
    subs: Subscription = new Subscription();

    constructor(
        private ref: ChangeDetectorRef,
        private router: Router,
        private multiMediaServ: MultimediaService,
        private tableLoadingService: TableLoadingService
    ) { }

    ngOnInit(): void {
        this.tableLoadingService.loading$.subscribe((isLoading) => {
            this.tableLoadingSpinner = isLoading;
        });

        this.loadCategoriesForSub();
    }

    getImageUrl(url: string | null): string {
        return url || this.defaultBannerImage
    }

    loadCategoriesForSub() {
        this.tableLoadingService.show();

        this.subs.add(
            this.multiMediaServ.getAllTrainingLessonCategoriesForMultiMedia().subscribe((data) => {
                this.trainingCategories = data.data;

                this.ref.detectChanges();
                this.tableLoadingService.hide();
            })
        );
    }

    navigateToVideos(catId: string, catName: string) {
        this.router.navigate([`/multimedia/Videos/${catId}/${catName}`]);
    }

    navigateToBooks(catId: string, catName: string) {
        this.router.navigate([`/multimedia/ComicBooks/${catId}/${catName}`]);
    }

    navigateToDetail(): void {
        this.router.navigateByUrl('/apps/blog/detail');
    }

    toggleDescription(category: any): void {
        category.isExpanded = !category.isExpanded;
    }
    navigateToLessons(cat: any) {
        if (cat.lessonsCount > 0) {
            this.router.navigate([`/multimedia/Lessons/${cat.id}`]);
        }
    }
}