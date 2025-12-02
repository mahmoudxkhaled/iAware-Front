import { ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Table } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { ILanguageModel } from 'src/app/modules/language/models/ILanguageModel';
import { IAspNetPageItemModel } from 'src/app/modules/page-management/models/IAspNetPageItemModel';
import { finalize, Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TableLoadingService } from 'src/app/core/Services/table-loading.service';
import { ITagModel } from 'src/app/modules/tages/models/ITagModel';
import { NewsCategoryLanguageService } from '../../services/news-category-language.service';
import { NewsCategoryService } from '../../services/news-category.service';
import { INewsCategory, INewsCategoryLanguage } from '../../models/INews';
@Component({
  selector: 'app-news-category-edit',
  templateUrl: './news-category-edit.component.html',
  styleUrl: './news-category-edit.component.scss'
})
export class NewsCategoryEditComponent implements OnInit, OnDestroy {

  @Input() cat: INewsCategory | null = null;
  tableLoadingSpinner: boolean = true;
  subs: Subscription = new Subscription();

  mainCategory: INewsCategory;
  catLanguage: INewsCategoryLanguage;

  activeLanguages: ILanguageModel[] = [];
  pagePermessions: IAspNetPageItemModel[] = [];
  defaultLanguage: ILanguageModel[] = [];
  tags: ITagModel[] = [];
  selectedTagIds: string[] = [];


  imageUrl: string = '../../../../../assets/media/upload-photo.jpg';

  catId: string;

  selectedLanguageId: string | null = null;

  addNewArticleLanguageForm: FormGroup;
  editNewsCategoryArticleLanguageForm: FormGroup;
  addNewsCategoryLanguageForm: FormGroup;

  selectedTabIndex: number = 0;


  activeTabIndex: number = 0;

  selectedCategoryImage: File | null = null;

  addNewCategoryLanguageDialog: boolean;
  switchActivationCategoryLanguageDialog: boolean = false;

  submitted: boolean = false;
  constructor(
    private messageService: MessageService,
    private catLangServ: NewsCategoryLanguageService,
    private catServ: NewsCategoryService,
    private ref: ChangeDetectorRef,
    private tableLoadingService: TableLoadingService,
    private formBuilder: FormBuilder
  ) {
    this.initNewsCategoryArticleLanguage();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['cat'] && this.cat) {
      this.catId = this.cat.id;
      this.loadnewsCategoryLanguages();
      this.imageUrl = this.cat.imageUrl ?? '../../../../../assets/media/upload-photo.jpg';
    }
  }

  ngOnInit() {
    this.tableLoadingService.loading$.subscribe((isLoading) => {
      this.tableLoadingSpinner = isLoading;
    });
  }

  loadnewsCategoryLanguages() {
    this.tableLoadingService.show();
    this.catLangServ
      .getAllNewsCategoryLanguagesByCategoryId(this.catId)
      .pipe(
        finalize(() => {
          this.getActiveLanguageForAddForm();
          this.tableLoadingService.hide();
        })
      )
      .subscribe((response) => {
        this.mainCategory = response.data;
        console.log(response.data)
        if (!this.mainCategory.newsCategoryLanguages) {
          this.mainCategory.newsCategoryLanguages = [];
        }
      });
  }


  assigneCurrentSelect(NewsCategory: INewsCategory) {
    this.mainCategory = NewsCategory;
  }

  getActiveLanguageForAddForm() {
    this.catLangServ.getAllLanguagesWithoutFilters().subscribe({
      next: (res) => {
        this.activeLanguages = res.data;
        this.defaultLanguage = this.activeLanguages.filter((c) => c.code === 'en');

        if (this.mainCategory) {
          // Create a set of existing language IDs, including the main cat's language ID
          const existingLanguageIds = new Set([
            ...this.mainCategory.newsCategoryLanguages?.map((c) => c.languageId) || [], // fallback to empty array if undefined
            this.mainCategory.languageId
          ]);

          // Filter out languages that already exist in the main cat or its categories
          this.activeLanguages = this.activeLanguages.filter(
            (language) => !existingLanguageIds.has(language.id)
          );
        }
      },
      error: (err) => { console.error('Error fetching active languages:', err); },
    });
  }

  //#region Edit Main Category

  saveEditMainCategory() {
    this.submitted = true;
    const formData = new FormData();

    formData.append('Id', this.mainCategory.id);
    formData.append('Title', this.mainCategory.title);

    const ArticleImageFile = this.selectedCategoryImage;
    if (ArticleImageFile) {
      formData.append('ImageUrl', ArticleImageFile, ArticleImageFile.name);
    }

    formData.forEach((value, key) => {
      console.log(`${key}: ${value}`);
    });

    this.subs.add(
      this.catServ.editNewsCategory(formData).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Successfully',
            detail: 'Main Category Edited Successfully',
            life: 3000,
          });
          this.ref.detectChanges();
        },
      })
    );
  }
  //#endregion

  //#region Activation Category Language

  switchCategoryLanguageActivation(catLanguage: INewsCategoryLanguage) {
    this.switchActivationCategoryLanguageDialog = true;
    this.catLanguage = { ...catLanguage };
  }

  declineCategoryLanguageActivation() {
    this.switchActivationCategoryLanguageDialog = false;
    this.loadnewsCategoryLanguages();
    this.ref.detectChanges();
  }

  confirmCategoryLanguageActivation() {
    this.toggleArticleLanguageActivation(this.catLanguage);
  }

  toggleArticleLanguageActivation(catLanguage: INewsCategoryLanguage) {
    if (catLanguage.isActive) {
      this.subs.add(
        this.catLangServ
          .deactivateNewsCategoryLanguage(catLanguage.id)
          .pipe(
            finalize(() => {
              this.loadnewsCategoryLanguages();
              this.ref.detectChanges();
              this.switchActivationCategoryLanguageDialog = false;
            })
          )
          .subscribe(() => {
            this.messageService.add({
              severity: 'success',
              summary: 'Successfully',
              detail: 'Category Language Deactivated',
              life: 3000,
            });
          })
      );
    } else {
      this.subs.add(
        this.catLangServ
          .activateNewsCategoryLanguage(catLanguage.id)
          .pipe(
            finalize(() => {
              this.loadnewsCategoryLanguages();
              this.ref.detectChanges();
              this.switchActivationCategoryLanguageDialog = false;
            })
          )
          .subscribe(() => {
            this.messageService.add({
              severity: 'success',
              summary: 'Successfully',
              detail: 'Category Language Activated',
              life: 3000,
            });
          })
      );
    }
  }

  //#endregion


  //#region Delete Category Language

  deleteCategoryLanguageDialog: boolean = false;
  deleteCategoryLanguage(catLanguage: INewsCategoryLanguage) {
    this.catLanguage = { ...catLanguage };
    this.deleteCategoryLanguageDialog = true;
  }
  declineCategoryLanguageDeletion() {
    this.deleteCategoryLanguageDialog = false;
  }

  confirmCategoryLanguageDeletion() {
    console.log('this.catLanguage.id', this.catLanguage.id)
    this.subs.add(
      this.catLangServ
        .deleteNewsCategoryLanguageById(this.catLanguage.id)
        .pipe(
          finalize(() => {
            this.loadnewsCategoryLanguages();
            this.ref.detectChanges();
            this.deleteCategoryLanguageDialog = false;
          })
        )
        .subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Info',
              detail: 'Category Language Deleted Successfully',
              life: 3000,
            });
          },
        })
    );
  }

  //#endregion



  //#region Add New Category Language

  addNewCategoryLanguage() {
    this.initNewsCategoryArticleForm()
    this.imageUrl = '../../../../../assets/media/upload-photo.jpg';
    this.addNewCategoryLanguageDialog = true;
  }
  declineAddNewCategoryLanguage() {
    this.addNewCategoryLanguageDialog = false;
  }
  saveAddNewCategoryLanguage() {
    this.submitted = true;
    if (this.addNewsCategoryLanguageForm.valid) {
      const formData = new FormData();

      formData.append('Title', this.addNewsCategoryLanguageForm.value.title);
      formData.append('LanguageId', this.addNewsCategoryLanguageForm.value.languageId);
      formData.append('NewsCategoryId', this.catId);

      const articleImageFile = this.selectedCategoryImage;
      console.log(articleImageFile);
      if (articleImageFile) {
        formData.append('ImageUrl', articleImageFile, articleImageFile.name);
      }

      this.subs.add(
        this.catLangServ.addNewsCategoryLanguage(formData).pipe(finalize(() => {
          this.loadnewsCategoryLanguages();
          this.addNewCategoryLanguageDialog = false;

        })).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Successfully',
              detail: 'Category Added Successfully',
              life: 3000,
            });
            this.initNewsCategoryArticleForm()
            this.ref.detectChanges();
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
  //#endregion

  //#region Edit Category Language
  saveEditCategoryLanguage(catLanguage: INewsCategoryLanguage) {
    this.submitted = true;

    const formData = new FormData();

    formData.append('Id', catLanguage.id);
    formData.append('Title', catLanguage.title);
    formData.append('LanguageId', catLanguage.languageId);
    formData.append('NewsCategoryId', this.catId);

    const articleImageFile = this.selectedCategoryImage;
    console.log(articleImageFile);
    if (articleImageFile) {
      formData.append('ImageUrl', articleImageFile, articleImageFile.name);
    }

    this.subs.add(
      this.catLangServ.editNewsCategoryLanguage(formData).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Successfully',
            detail: 'Category Language Edited Successfully',
            life: 3000,
          });
          this.ref.detectChanges();
        },
        error: (err) => {
          console.error('Error editing cat language:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'An error occurred while updating the cat language',
            life: 3000,
          });
        },
      })
    );
  }

  //#endregion

  //#region Helpers


  initNewsCategoryArticleLanguage() {
    this.cat = {
      id: '',
      title: '',
      imageUrl: '',
      isActive: true,
      languageId: '',
      languageName: '',
      newsCategoryLanguages: [],
    };
  }


  initNewsCategoryArticleForm() {
    this.addNewsCategoryLanguageForm = this.formBuilder.group({
      title: '',
      imageUrl: '',
      writerName: '',
      articleDetailHtml: '',
      description: '',
      languageId: '',
      newsCategoryId: '',
      isActive: 'true',
    });


    this.editNewsCategoryArticleLanguageForm = this.formBuilder.group({
      id: '',
      title: '',
      imageUrl: '',
      languageId: '',
      newsCategoryId: '',
      isActive: 'true',
    });
  }


  // A unified function for selecting the image
  triggerImageUpload(catLanguage?: any, isMainImage: boolean = false, isNewLanguageDialog: boolean = false): void {
    // Determine which input field to trigger
    const fileInput = document.getElementById(
      isMainImage ? 'CategoryMainImage' :
        isNewLanguageDialog ? 'NewCategoryLanguageImage' :
          'CategoryLanguageImage'
    ) as HTMLInputElement;

    fileInput.click();
    // Set the selectedLanguageId only if it's not the main image and not in the new language dialog
    if (!isMainImage && !isNewLanguageDialog) {
      this.selectedLanguageId = catLanguage?.id || null;
    }
  }


  handleImageSelection(event: Event, isMainImage: boolean = false, isNewLanguageDialog: boolean = false): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.selectedCategoryImage = input.files[0];
      const reader = new FileReader();

      reader.onload = (e: any) => {
        if (isMainImage) {
          // For main image
          this.mainCategory.imageUrl = e.target.result;
          console.log('Main Image URL:', this.mainCategory.imageUrl);
        } else {
          // For language image or new language dialog
          if (isNewLanguageDialog) {
            // Handle image for the new language dialog
            this.imageUrl = e.target.result;
            console.log('New Language Image URL:', this.imageUrl);
          } else {
            // Handle language-specific image
            const language = this.mainCategory.newsCategoryLanguages?.find(
              (lang: any) => lang.id === this.selectedLanguageId
            );
            if (language) {
              language.imageUrl = e.target.result;
              console.log(`Language Image URL for ${language.id}:`, language.imageUrl);
            }
          }
        }
        this.ref.detectChanges();
      };

      reader.readAsDataURL(this.selectedCategoryImage); // Read the file as a Data URL
    }
  }

  // Get the image URL for the language or main image
  getImageUrl(languageId: string, mainImage: boolean = false): string {
    if (mainImage) {
      console.log(this.mainCategory)
      return this.mainCategory.imageUrl ?? '../../../../../assets/media/upload-photo.jpg';
    } else {
      const language = this.mainCategory?.newsCategoryLanguages?.find(
        (lang: any) => lang.id === languageId
      );
      console.log(this.mainCategory?.newsCategoryLanguages)

      console.log(language)

      return language?.imageUrl ?? '../../../../../assets/media/upload-photo.jpg';
    }
  }


  hasPermission(controlKey: string): boolean {
    return this.pagePermessions.some((p) => p.controlKey === controlKey);
  }
  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  //#endregion



}

