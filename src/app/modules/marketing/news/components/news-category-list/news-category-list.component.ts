import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Validators } from 'ngx-editor';
import { MenuItem, MessageService, SelectItem } from 'primeng/api';
import { Subscription } from 'rxjs';
import { constants } from 'src/app/core/constatnts/constatnts';
import { PermessionsService } from 'src/app/core/Services/permessions.service';
import { TableLoadingService } from 'src/app/core/Services/table-loading.service';
import { TranslationService } from 'src/app/core/Services/translation.service';
import { ILanguageModel } from 'src/app/modules/language/models/ILanguageModel';
import { IAspNetPageItemModel } from 'src/app/modules/page-management/models/IAspNetPageItemModel';
import { TrainingLessonService } from 'src/app/modules/security-training/services/training-lesson.service';
import { NewsCategoryService } from '../../services/news-category.service';
import { INewsCategory } from '../../models/INews';
import { DropdownListDataSourceService } from 'src/app/core/Services/dropdown-list-data-source.service';
@Component({
  selector: 'app-news-category-list',
  templateUrl: './news-category-list.component.html',
  styleUrl: './news-category-list.component.scss'
})
export class NewsCategoryListComponent implements OnInit, OnDestroy {



  tableLoadingSpinner: boolean = true;
  subs: Subscription = new Subscription();
  submitted: boolean = false;

  actions = constants.pageActions;
  editNewsCategoryDialog: boolean = false;
  addNewsCategoryDialog: boolean = false;
  deletionNewsCategoryDialog: boolean = false;

  selectedCategory: INewsCategory | null = null;


  pagePermessions: IAspNetPageItemModel[] = [];
  defaultLanguage: ILanguageModel[] = [];
  newsCategories: INewsCategory[] = [];

  newsCategory: INewsCategory;
  selectedLanguage: ILanguageModel;
  countOfActiveLanguages: Number;

  addNewsCategoryForm: FormGroup;

  selectedCategoryImage: File | null = null;

  activeLanguages: ILanguageModel[] = []

  imageUrl: string = '../../../../../assets/media/upload-photo.jpg';

  menuItems: MenuItem[] = [];

  constructor(
    private trainingServ: TrainingLessonService,
    private newsServ: NewsCategoryService,
    private messageService: MessageService,
    private formBuilder: FormBuilder,
    private router: Router,
    private ref: ChangeDetectorRef,
    private permessionService: PermessionsService,
    private translate: TranslationService,
    private tableLoadingService: TableLoadingService,
    private dropdownListDataSourceService: DropdownListDataSourceService
  ) {
    this.pagePermessions = this.permessionService.getPagePermessions(constants.pages.newsCategory);
    this.initNewsCategoryFormAndModel();
    this.getEnglishLanguageForAddForm()

  }


  ngOnInit() {
    this.tableLoadingService.loading$.subscribe((isLoading) => {
      this.tableLoadingSpinner = isLoading;
    });

    this.loadnewsCategories();
    this.initNewsCategoryFormAndModel();

    const editBtn = {
      label: this.translate.getInstant('shared.actions.edit'),
      icon: 'pi pi-fw pi-pencil',
      command: () => this.editNewsCategory(this.newsCategory),
    };
    const deleteBtn = {
      label: this.translate.getInstant('shared.actions.delete'),
      icon: 'pi pi-fw pi-trash',
      command: () => this.deleteNewsCategory(this.newsCategory),
    };

    this.menuItems = [];
    this.menuItems.push(editBtn);
    this.menuItems.push(deleteBtn);

  }


  assigneCurrentSelect(newsCategory: INewsCategory) {
    this.newsCategory = newsCategory;
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


  loadnewsCategories() {
    this.tableLoadingService.show();
    this.subs.add(
      this.newsServ.getAllNewsCategories().subscribe((data) => {
        this.newsCategories = data.data;
        this.ref.detectChanges();
        this.tableLoadingService.hide();
      })
    );
  }



  //#region Add News Category

  saveAddNewsCategory() {
    this.submitted = true;
    if (this.addNewsCategoryForm.valid) {
      const formData = new FormData();
      formData.append('Title', this.addNewsCategoryForm.value.title);
      formData.append('LanguageId', this.addNewsCategoryForm.value.languageId);

      const categoryImageFile = this.selectedCategoryImage;
      if (categoryImageFile) {
        formData.append('ImageUrl', categoryImageFile, categoryImageFile.name);
      }

      this.subs.add(
        this.newsServ.addNewsCategory(formData).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'News Category Updated',
              life: 3000,
            });
            this.loadnewsCategories();
            this.ref.detectChanges();
            this.initNewsCategoryFormAndModel();
            this.addNewsCategoryDialog = false;
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


  declineAddNewsCategoryDialog() {
    this.submitted = false;
    this.initNewsCategoryFormAndModel();
    this.addNewsCategoryDialog = false;
  }

  //#endregion

  //#region Edit News Category 
  editNewsCategory(newsCategory: INewsCategory) {
    this.selectedCategory = newsCategory;
    this.editNewsCategoryDialog = true;
  }

  declineEditNewsCategory() {
    this.submitted = false;
    this.editNewsCategoryDialog = false;
  }

  //#endregion


  //#region Deletion

  deleteNewsCategory(NewsCategory: INewsCategory) {
    this.deletionNewsCategoryDialog = true;
    this.newsCategory = { ...NewsCategory };
  }
  confirmDeletion() {
    this.deletionNewsCategoryDialog = false;
    this.subs.add(
      this.newsServ.deleteNewsCategoryById(this.newsCategory.id).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Successfully',
            detail: response.message,
            life: 3000,
          });
          this.loadnewsCategories();
          this.ref.detectChanges();
          this.initNewsCategoryFormAndModel();
          this.deletionNewsCategoryDialog = false;
        },
      })
    );
  }

  declineDeletion() {
    this.deletionNewsCategoryDialog = false;
    this.initNewsCategoryFormAndModel();
  }

  //#endregion

  navigateToNewsCategoryArticles(id: string) {
    this.router.navigate([`/marketing/news/news-article-list/${id}`])
  }

  initNewsCategoryFormAndModel() {

    this.newsCategory = {
      id: '',
      title: '',
      imageUrl: '',
      languageName: '',
      languageId: '',
      isActive: false,
    };

    const defaultLanguage = this.activeLanguages?.find((x: any) => x.code === 'en');
    this.addNewsCategoryForm = this.formBuilder.group({
      title: ['', Validators.required],
      imageUrl: [null],
      languageId: [defaultLanguage ? defaultLanguage.id : ''],
    });
  }


  CreateNewsCategory() {
    this.addNewsCategoryDialog = true;
    this.initNewsCategoryFormAndModel();

    this.imageUrl = '../../../../../assets/media/upload-photo.jpg';
    this.selectedCategoryImage = null;
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
