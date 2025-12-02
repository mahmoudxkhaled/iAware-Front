import { AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService, TreeNode } from 'primeng/api';
import { CampaignManagementService } from '../../../services/campaign-management.service';
import introJs from 'intro.js';
import { TableLoadingService } from 'src/app/core/Services/table-loading.service';
import { finalize, Subscription } from 'rxjs';
import { TreeLazyLoadEvent } from 'primeng/tree';
import { IPaginationModel } from 'src/app/core/Dtos/IPaginationModel';
import { CheckboxChangeEvent } from 'primeng/checkbox';
import { LocalStorageService } from 'src/app/core/Services/local-storage.service';

@Component({
    selector: 'app-lessons',
    templateUrl: './lessons.component.html',
    styleUrl: './lessons.component.scss',
})
export class LessonsComponent implements OnInit, AfterViewInit, AfterViewChecked, OnDestroy {
    tableLoadingSpinner: boolean = true;

    data: TreeNode[] = [];
    subscriptions: Subscription[] = [];
    selectedLessons: any[] = [];
    childerens: TreeNode[] = [];
    introJS = introJs.tour();
    doNotShaowLessonsStepsAgain: boolean = false;
    defaultBannerImage: string = 'assets/images/trainingCategoryBannerImageUrl.jpg';
    checkboxStates: { [key: string]: boolean } = {};
    lessons: any[] = [];
    totalRecords: number = 0;
    pagination: IPaginationModel = {
        page: 0,
        size: 9,
        searchQuery: '',
    };

    constructor(
        private router: Router,
        private apiService: CampaignManagementService,
        private messageService: MessageService,
        private localStorageService: LocalStorageService,
        private tableLoadingService: TableLoadingService,
        private cdr: ChangeDetectorRef
    ) { }

    ngAfterViewChecked(): void {
        this.cdr.detectChanges();
    }

    ngAfterViewInit(): void {
        setTimeout(() => {
            this.checkIfDataInLocalStorage();
        }, 1);
    }

    ngOnInit() {
        this.tableLoadingService.loading$.subscribe((isLoading) => {
            this.tableLoadingSpinner = isLoading;
        });

        // if (!this.doNotShaowLessonsStepsAgain) {
        //     this.introJS.setOptions({
        //       steps: [
        //         {
        //           element: '#lessons',
        //           intro: 'lessons',
        //           position: 'bottom'
        //         }
        //       ],
        //       nextLabel: 'Next',
        //       prevLabel: 'Previous',
        //       doneLabel: 'Close'
        //     }).start();
        //   }
        // this.fetchLessons();
    }

    onLazyLoad(event: any) {
        this.pagination.page = event.first / event.rows;
        this.pagination.size = event.rows;
        this.pagination.searchQuery = '';
        this.fetchLessons();
    }

    fetchLessons() {
        this.tableLoadingService.show();
        const sub = this.apiService
            .getTrainingLessonsInSubscriptionForCampaign(this.pagination).subscribe({
                next: (res) => {
                    this.lessons = res.data;
                    this.totalRecords = res.totalRecords;
                },
                error: (error) => { },
                complete: () => {
                    this.tableLoadingService.hide();
                }
            });
        this.subscriptions.push(sub);
    }

    checkIfLessonsOnLocalStorage(source: TreeNode[]) {
        let data = localStorage.getItem('lessons');
        if (data !== null) {
            this.selectedLessons = [];
            this.childerens = [];
            const less = JSON.parse(data);
            const parents = source.filter((z) => z.children !== null);
            source.forEach((z) => {
                if (z.children) {
                    this.childerens.push(...z.children);
                }
            });

            const existingParents = parents?.filter((item) =>
                less
                    .map((x: any) => {
                        return x?.id;
                    })
                    .includes(item.key)
            );
            const existingChilderen = this.childerens?.filter((item) =>
                less
                    .map((x: any) => {
                        return x?.id;
                    })
                    .includes(item.key)
            );

            this.selectedLessons.push(...existingParents);
            this.selectedLessons.push(...existingChilderen);
        }
    }

    checkIfDataInLocalStorage(): any[] {
        const lessons = this.localStorageService.getItem('lessons');
        this.selectedLessons = lessons ? lessons : [];
        this.checkboxStates = {};
        lessons?.forEach((template: any) => {
            if (template?.id) {
                this.checkboxStates[template.id] = true;
            }
        });
        return lessons ? lessons : [];
    }

    getCircularReplacer() {
        const seen = new WeakSet();
        return (key: string, value: any) => {
            if (typeof value === 'object' && value !== null) {
                if (seen.has(value)) {
                    return; // Circular reference found, skip key
                }
                seen.add(value);
            }
            return value;
        };
    }

    addToselected(event: CheckboxChangeEvent, model: any) {
        if (event.checked) {
            this.selectedLessons.push(model);
        } else {
            this.selectedLessons = this.selectedLessons.filter((c) => {
                return c.id != model.id;
            });
        }
    }

    toggleSelection(template: any) {
        this.checkboxStates[template.id] = !this.checkboxStates[template.id];
        this.addToselected({ checked: this.checkboxStates[template.id] }, template);
    }

    nextPage() {
        if (this.selectedLessons) {
            const data = this.selectedLessons.map((x) => {
                return {
                    id: x.id,
                    name: x.name,
                    emailHtmlContent: x.lessonAwarenessEmailContentHtml,
                    emailSubject: x.lessonAwarenessEmailSubject,
                };
            });
            localStorage.setItem('lessons', JSON.stringify(data));
            this.messageService.add({
                severity: 'success',
                summary: 'Info',
                detail: `you select ${data?.length} lessons to scedual`,
                life: 3000,
            });
            this.router.navigate(['campaign-management/create/schedule']);
        }
    }

    prevPage() {
        this.router.navigate(['campaign-management/create/type']);
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    }
}