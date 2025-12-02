import { AfterViewChecked, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Validators } from 'ngx-editor';
import { MenuItem, MessageService } from 'primeng/api';
import { finalize, Subscription } from 'rxjs';
import { constants } from 'src/app/core/constatnts/constatnts';
import { ApiResult } from 'src/app/core/Dtos/ApiResult';
import { PermessionsService } from 'src/app/core/Services/permessions.service';
import { TableLoadingService } from 'src/app/core/Services/table-loading.service';
import { TranslationService } from 'src/app/core/Services/translation.service';
import { ILanguageModel } from 'src/app/modules/language/models/ILanguageModel';
import { IAspNetPageItemModel } from 'src/app/modules/page-management/models/IAspNetPageItemModel';
import { TrainingLessonService } from 'src/app/modules/security-training/services/training-lesson.service';
import { ITagModel } from 'src/app/modules/tages/models/ITagModel';
import { INewsCategoryArticle } from '../../models/INews';
import { NewsCategoryArticleService } from '../../services/news-category-article.service';
import { DropdownListDataSourceService } from 'src/app/core/Services/dropdown-list-data-source.service';
@Component({
  selector: 'app-news-category-article-list',
  templateUrl: './news-category-article-list.component.html',
  styleUrl: './news-category-article-list.component.scss'
})
export class NewsCategoryArticleListComponent implements OnInit, AfterViewChecked, OnDestroy {

  tableLoadingSpinner: boolean = true;
  subs: Subscription = new Subscription();

  actions = constants.pageActions;
  editNewsCategoryArticleDialog: boolean = false;
  addNewsCategoryArticleDialog: boolean = false;
  deletionNewsCategoryArticleDialog: boolean = false;
  switchActivationNewsCategoryArticleDialog: boolean = false;

  NewsCategoryArticleId: string

  submitted: boolean = false;

  pagePermessions: IAspNetPageItemModel[] = [];
  defaultLanguage: ILanguageModel[] = [];
  newsCategoryArticles: INewsCategoryArticle[] = [];
  tags: ITagModel[] = [];
  selectedTagIds: string[] = []; // Holds the selected tag IDs

  newsCategoryArticle: INewsCategoryArticle;
  selectedLanguage: ILanguageModel;

  editNewsCategoryArticleForm: FormGroup;
  addNewsCategoryArticleForm: FormGroup;

  selectedCategoryImage: File | null = null;


  imageUrl: string = '../../../../../assets/media/upload-photo.jpg';

  activeLanguages: ILanguageModel[] = []
  menuItems: MenuItem[] = [];

  sortField: string = '';

  selectedArticle: INewsCategoryArticle | null = null;



  constructor(
    private trainingServ: TrainingLessonService,
    private newsServ: NewsCategoryArticleService,
    private messageService: MessageService,
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private ref: ChangeDetectorRef,
    private permessionService: PermessionsService,
    private translate: TranslationService,
    private tableLoadingService: TableLoadingService,
    private dropdownListDataSourceService: DropdownListDataSourceService
  ) {
    this.pagePermessions = this.permessionService.getPagePermessions(constants.pages.newsCategoryArticle);
    this.initNewsCategoryArticleModelAndForm();
    this.getEnglishLanguageForAddForm()
  }

  ngAfterViewChecked(): void {
    this.ref.detectChanges();
  }

  ngOnInit() {
    this.route.params.subscribe((params) => {
      const id = params['id'];
      this.NewsCategoryArticleId = id;
      this.loadArticlesByCategory();
      this.loadAllTages()
    });

    this.tableLoadingService.loading$.subscribe((isLoading) => {
      this.tableLoadingSpinner = isLoading;
    });


    const editBtn = {
      label: this.translate.getInstant('shared.actions.edit'),
      icon: 'pi pi-fw pi-pencil',
      command: () => this.editNewsCategoryArticle(this.newsCategoryArticle),
    };
    const deleteBtn = {
      label: this.translate.getInstant('shared.actions.delete'),
      icon: 'pi pi-fw pi-trash',
      command: () => this.deleteNewsCategoryArticle(this.newsCategoryArticle),
    };


    this.menuItems = [];
    this.menuItems.push(deleteBtn);
    this.menuItems.push(editBtn);

  }

  assigneCurrentSelect(NewsCategoryArticle: INewsCategoryArticle) {
    this.newsCategoryArticle = NewsCategoryArticle;
  }

  getEnglishLanguageForAddForm() {
    this.dropdownListDataSourceService.getActiveLanguages().subscribe({
      next: (res) => {
        this.activeLanguages = res.data;
        const englishLanguage = this.activeLanguages.find((x) => x.code === 'en');

        if (englishLanguage) {
          this.defaultLanguage.push(englishLanguage);
        }
      },
    });
  }

  loadAllTages() {
    this.subs.add(
      this.newsServ.getAllTages().subscribe({
        next: (res) => {
          this.tags = res.data?.filter((t: ITagModel) => t.newsAllowed);
        },

      })
    );
  }

  loadArticlesByCategory() {
    this.tableLoadingService.show();
    this.subs.add(
      this.newsServ.getArticlesByCategoryId(this.NewsCategoryArticleId).subscribe((data) => {
        this.newsCategoryArticles = data.data;
        console.log(this.newsCategoryArticles)
        this.ref.detectChanges();
        this.tableLoadingService.hide();
      })
    );
  }

  //#region Add Training Lesson

  addNewsCategoryArticle() {
    this.initNewsCategoryArticleModelAndForm();
    this.imageUrl = '../../../../../assets/media/upload-photo.jpg';
    this.selectedCategoryImage = null;
    this.addNewsCategoryArticleDialog = true;
  }


  saveAddNewsCategoryArticle() {
    this.submitted = true;

    if (this.addNewsCategoryArticleForm.valid) {
      const formData = new FormData();
      formData.append('ArticleTitle', this.addNewsCategoryArticleForm.value.articleTitle);
      formData.append('LanguageId', this.addNewsCategoryArticleForm.value.languageId);
      formData.append('PublishingDate', this.addNewsCategoryArticleForm.value.publishingDate);
      formData.append('WriterName', this.addNewsCategoryArticleForm.value.writerName);
      formData.append('ArticleText', this.addNewsCategoryArticleForm.value.articleText);
      formData.append('Description', this.addNewsCategoryArticleForm.value.description);
      formData.append('NewsCategoryId', this.NewsCategoryArticleId);

      this.addNewsCategoryArticleForm.value.tags.forEach((tagId: string) => {
        formData.append('TagIds', tagId);
      });

      const categoryImageFile = this.selectedCategoryImage;
      console.log(categoryImageFile);
      if (categoryImageFile) {
        formData.append('ImageUrl', categoryImageFile, categoryImageFile.name);
      }

      this.subs.add(
        this.newsServ.addNewsCategoryArticle(formData).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'News Category Article Added',
              life: 3000,
            });
            this.loadArticlesByCategory();
            this.ref.detectChanges();
            this.initNewsCategoryArticleModelAndForm();
            this.addNewsCategoryArticleDialog = false;
          },
        })
      );
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Fill all fields please',
        life: 3000,
      });
    }
  }

  declineAddNewsCategoryArticleDialog() {
    this.submitted = false;
    this.initNewsCategoryArticleModelAndForm();
    this.addNewsCategoryArticleDialog = false;
  }
  //#endregion


  //#region Edit Training Lesson

  editNewsCategoryArticle(NewsCategoryArticle: INewsCategoryArticle) {
    this.selectedArticle = NewsCategoryArticle;
    this.editNewsCategoryArticleDialog = true;
  }
  formatDate(dateString: string | Date): string {
    if (!dateString) return '';

    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }

  declineEditNewsCategoryArticle() {
    this.submitted = false;
    this.initNewsCategoryArticleModelAndForm();
    this.editNewsCategoryArticleDialog = false;
  }

  //#endregion

  //#region Deletion

  deleteNewsCategoryArticle(NewsCategoryArticle: INewsCategoryArticle) {
    this.deletionNewsCategoryArticleDialog = true;
    this.newsCategoryArticle = { ...NewsCategoryArticle };
  }
  confirmDeletion() {
    this.deletionNewsCategoryArticleDialog = false;
    this.subs.add(
      this.newsServ.deleteNewsCategoryArticleById(this.newsCategoryArticle.id).subscribe({
        next: (response: ApiResult) => {
          if (response.code !== 406) {
            this.messageService.add({
              severity: 'success',
              summary: 'Successfully',
              detail: response.message,
              life: 3000,
            });
            this.loadArticlesByCategory();
            this.ref.detectChanges();
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Cannot delete because there are News category languages associated with this News category',
              life: 5000,
            });
            this.loadArticlesByCategory();
            this.ref.detectChanges();
          }
        },
      })
    );
    this.initNewsCategoryArticleModelAndForm();
    this.deletionNewsCategoryArticleDialog = false;
  }
  declineDeletion() {
    this.deletionNewsCategoryArticleDialog = false;
    this.initNewsCategoryArticleModelAndForm();
  }

  //#endregion

  //#region Activation
  switchActivation(NewsCategoryArticle: INewsCategoryArticle) {
    this.switchActivationNewsCategoryArticleDialog = true;
    this.newsCategoryArticle = { ...NewsCategoryArticle };
  }

  declineActivation() {
    this.switchActivationNewsCategoryArticleDialog = false;
    this.initNewsCategoryArticleModelAndForm();
    this.loadArticlesByCategory();
  }

  confirmtActivation() {
    this.toggleActivation(this.newsCategoryArticle);
  }

  toggleActivation(NewsCategoryArticle: INewsCategoryArticle) {
    if (NewsCategoryArticle.isActive) {
      this.subs.add(
        this.newsServ.deactivateNewsCategoryArticle(NewsCategoryArticle.id).subscribe(() => {
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'News Category Deactivated',
            life: 3000,
          });
          this.loadArticlesByCategory();
          this.ref.detectChanges();
        })
      );
    } else {
      this.subs.add(
        this.newsServ.activateNewsCategoryArticle(NewsCategoryArticle.id).subscribe(() => {
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'News Category Activated',
            life: 3000,
          });
          this.loadArticlesByCategory();
          this.ref.detectChanges();
        })
      );
    }
    this.initNewsCategoryArticleModelAndForm();
    this.switchActivationNewsCategoryArticleDialog = false;
  }

  //#endregion

  navigateToNewsCategoryArticleArticles(CategoryId: string) {
    this.router.navigate(['news-article-list', CategoryId]);
  }

  initNewsCategoryArticleModelAndForm() {

    this.newsCategoryArticle = {
      id: '',
      articleText: '',
      newsCategoryArticleLanguages: [],
      articleTitle: '',
      imageUrl: '',
      writerName: '',
      description: '',
      publishingDate: '',
      languageId: '',
      languageName: '',
      newsCategoryId: '',
      newsCategoryArticleTags: [],
      tagIds: [],
      isActive: false,
    };

    const defaultLanguage = this.activeLanguages?.find((x: any) => x.code === 'en');
    this.addNewsCategoryArticleForm = this.formBuilder.group({
      articleTitle: ['', Validators.required],
      imageUrl: [''],
      writerName: '',
      articleText: '',
      description: '',
      publishingDate: [new Date().toISOString().split('T')[0]],  // Convert Date to a valid string format (yyyy-mm-dd)
      languageId: [defaultLanguage ? defaultLanguage.id : ''],
      newsCategoryId: '',
      tags: [[], Validators.required],  // FormControl for tags (array of selected tag IDs)
      isActive: 'true',
    });
  }






  triggerImageUpload() {
    const fileInput = document.getElementById('myCategoryImage') as HTMLInputElement;
    fileInput.click();
  }

  handleImageSelection(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.selectedCategoryImage = input.files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imageUrl = e.target.result;
        this.ref.detectChanges();
      };
      reader.readAsDataURL(this.selectedCategoryImage);
    }
  }



  hasPermission(controlKey: string): boolean {
    return this.pagePermessions.some((p) => p.controlKey === controlKey);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

}
