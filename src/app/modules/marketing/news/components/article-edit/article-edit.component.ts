import { ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Table } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { ILanguageModel } from 'src/app/modules/language/models/ILanguageModel';
import { IAspNetPageItemModel } from 'src/app/modules/page-management/models/IAspNetPageItemModel';
import { finalize, Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TableLoadingService } from 'src/app/core/Services/table-loading.service';
import { ITagModel } from 'src/app/modules/tages/models/ITagModel';
import { NewsCategoryArticleLanguageService } from '../../services/news-category-article-language.service';
import { NewsCategoryArticleService } from '../../services/news-category-article.service';
import { INewsCategoryArticle, INewsCategoryArticleLanguage } from '../../models/INews';
@Component({
  selector: 'app-article-edit',
  templateUrl: './article-edit.component.html',
  styleUrl: './article-edit.component.scss'
})
export class ArticleEditComponent implements OnInit, OnChanges, OnDestroy {

  @Input() article: INewsCategoryArticle | null = null;
  tableLoadingSpinner: boolean = true;
  subs: Subscription = new Subscription();

  mainArticle: INewsCategoryArticle;
  articleLanguage: INewsCategoryArticleLanguage;

  activeLanguages: ILanguageModel[] = [];
  pagePermessions: IAspNetPageItemModel[] = [];
  defaultLanguage: ILanguageModel[] = [];
  tags: ITagModel[] = [];
  selectedTagIds: string[] = [];


  imageUrl: string = '../../../../../assets/media/upload-photo.jpg';

  articleId: string;

  selectedLanguageId: string | null = null;

  addNewArticleLanguageForm: FormGroup;
  editNewsCategoryArticleLanguageForm: FormGroup;
  addNewsCategoryArticleLanguageForm: FormGroup;

  activeTabIndex: number = 0;

  selectedArticleImage: File | null = null;

  addNewArticleLanguageDialog: boolean;
  switchActivationArticleLanguageDialog: boolean = false;

  submitted: boolean = false;
  constructor(
    private messageService: MessageService,
    private articleLangServ: NewsCategoryArticleLanguageService,
    private articleServ: NewsCategoryArticleService,
    private ref: ChangeDetectorRef,
    private tableLoadingService: TableLoadingService,
    private formBuilder: FormBuilder
  ) {
    this.initNewsCategoryArticleLanguage();
  }


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['article'] && this.article) {
      this.articleId = this.article.id;
      this.loadnewsCategoryArticleLanguages();
      this.imageUrl = this.article.imageUrl ?? '../../../../../assets/media/upload-photo.jpg';
    }
  }
  ngOnInit() {
    this.tableLoadingService.loading$.subscribe((isLoading) => {
      this.tableLoadingSpinner = isLoading;
    });
    this.loadAllTages()

  }

  loadnewsCategoryArticleLanguages() {
    this.tableLoadingService.show();
    this.articleLangServ
      .getAllNewsCategoryArticleLanguagesByArticleId(this.articleId)
      .pipe(
        finalize(() => {
          this.getActiveLanguageForAddForm();
          this.tableLoadingService.hide();

        })
      )
      .subscribe((response) => {
        this.mainArticle = response.data;
        console.log(response.data)
        if (!this.mainArticle.newsCategoryArticleLanguages) {
          this.mainArticle.newsCategoryArticleLanguages = [];
        }
        this.mainArticle.publishingDate = this.formatDate(this.mainArticle.publishingDate);
        this.selectedTagIds = this.mainArticle.tagIds;
      });
  }

  formatDate(dateString: string | Date): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }

  getActiveLanguageForAddForm() {
    this.articleLangServ.getAllLanguagesWithoutFilters().subscribe({
      next: (res) => {
        this.activeLanguages = res.data;
        this.defaultLanguage = this.activeLanguages.filter((c) => c.code === 'en');

        if (this.mainArticle) {
          // Create a set of existing language IDs, including the main article's language ID
          const existingLanguageIds = new Set([
            ...this.mainArticle.newsCategoryArticleLanguages?.map((c) => c.languageId) || [], // fallback to empty array if undefined
            this.mainArticle.languageId
          ]);

          // Filter out languages that already exist in the main article or its categories
          this.activeLanguages = this.activeLanguages.filter(
            (language) => !existingLanguageIds.has(language.id)
          );
        }
      },
      error: (err) => { console.error('Error fetching active languages:', err); },
    });
  }

  loadAllTages() {
    this.subs.add(
      this.articleServ.getAllTages().subscribe({
        next: (res) => {
          this.tags = res.data?.filter((t: ITagModel) => t.newsAllowed);
        },

      })
    );
  }


  //#region Edit Main Article

  saveEditMainArticle() {
    this.submitted = true;
    const formData = new FormData();

    formData.append('Id', this.mainArticle.id);
    formData.append('ArticleTitle', this.mainArticle.articleTitle);
    formData.append('WriterName', this.mainArticle.writerName);
    formData.append('ArticleText', this.mainArticle.articleText);
    formData.append('Description', this.mainArticle.description);
    formData.append('ArticleTitle', this.mainArticle.articleTitle);
    formData.append('PublishingDate', this.mainArticle.publishingDate);

    const uniqueTagIds = [...new Set(this.selectedTagIds)];  // Remove duplicates using a Set
    uniqueTagIds.forEach((tagId: string) => {
      formData.append('TagIds', tagId);
    });


    const ArticleImageFile = this.selectedArticleImage;
    if (ArticleImageFile) {
      formData.append('ImageUrl', ArticleImageFile, ArticleImageFile.name);
    }

    this.subs.add(
      this.articleServ.editNewsCategoryArticle(formData).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Main Article Edited Successfully',
            life: 3000,
          });
          this.loadnewsCategoryArticleLanguages();
          this.ref.detectChanges();
        },
      })
    );
  }
  //#endregion

  //#region Activation Article Language

  switchArticleLanguageActivation(articleLanguage: INewsCategoryArticleLanguage) {
    this.switchActivationArticleLanguageDialog = true;
    this.articleLanguage = { ...articleLanguage };
  }

  declineArticleLanguageActivation() {
    this.switchActivationArticleLanguageDialog = false;
    this.loadnewsCategoryArticleLanguages();
    this.ref.detectChanges();
  }

  confirmArticleLanguageActivation() {
    this.toggleArticleLanguageActivation(this.articleLanguage);
  }

  toggleArticleLanguageActivation(articleLanguage: INewsCategoryArticleLanguage) {
    if (articleLanguage.isActive) {
      this.subs.add(
        this.articleLangServ
          .deactivateNewsCategoryArticleLanguage(articleLanguage.id)
          .pipe(
            finalize(() => {
              this.loadnewsCategoryArticleLanguages();
              this.ref.detectChanges();
              this.switchActivationArticleLanguageDialog = false;
            })
          )
          .subscribe(() => {
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'Article Language Deactivated',
              life: 3000,
            });
          })
      );
    } else {
      this.subs.add(
        this.articleLangServ
          .activateNewsCategoryArticleLanguage(articleLanguage.id)
          .pipe(
            finalize(() => {
              this.loadnewsCategoryArticleLanguages();
              this.ref.detectChanges();
              this.switchActivationArticleLanguageDialog = false;
            })
          )
          .subscribe(() => {
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'Article Language Activated',
              life: 3000,
            });
          })
      );
    }
  }

  //#endregion


  //#region Delete Article Language

  deleteArticleLanguageDialog: boolean = false;
  deleteArticleLanguage(articleLanguage: INewsCategoryArticleLanguage) {
    this.articleLanguage = { ...articleLanguage };
    this.deleteArticleLanguageDialog = true;
  }
  declineArticleLanguageDeletion() {
    this.deleteArticleLanguageDialog = false;
  }

  confirmArticleLanguageDeletion() {
    console.log('this.articleLanguage.id', this.articleLanguage.id)
    this.subs.add(
      this.articleLangServ
        .deleteNewsCategoryArticleLanguageById(this.articleLanguage.id)
        .pipe(
          finalize(() => {
            this.loadnewsCategoryArticleLanguages();
            this.ref.detectChanges();
            this.deleteArticleLanguageDialog = false;
          })
        )
        .subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Info',
              detail: 'Article Language Deleted Successfully',
              life: 3000,
            });
          },
        })
    );
  }

  //#endregion



  //#region Add New Article Language

  addNewArticleLanguage() {
    this.initNewsCategoryArticleForm()
    this.imageUrl = '../../../../../assets/media/upload-photo.jpg';
    this.addNewArticleLanguageDialog = true;
  }
  declineAddNewArticleLanguage() {
    this.addNewArticleLanguageDialog = false;
  }
  saveAddNewArticleLanguage() {
    this.submitted = true;
    if (this.addNewsCategoryArticleLanguageForm.valid) {
      const formData = new FormData();

      formData.append('ArticleTitle', this.addNewsCategoryArticleLanguageForm.value.articleTitle);
      formData.append('WriterName', this.addNewsCategoryArticleLanguageForm.value.writerName);
      formData.append('ArticleText', this.addNewsCategoryArticleLanguageForm.value.articleText);
      formData.append('Description', this.addNewsCategoryArticleLanguageForm.value.description);
      formData.append('LanguageId', this.addNewsCategoryArticleLanguageForm.value.languageId);
      formData.append('NewsCategoryArticleId', this.articleId);

      const articleImageFile = this.selectedArticleImage;
      console.log(articleImageFile);
      if (articleImageFile) {
        formData.append('ImageUrl', articleImageFile, articleImageFile.name);
      }

      this.subs.add(
        this.articleLangServ.addNewsCategoryArticleLanguage(formData).pipe(finalize(() => {
          this.loadnewsCategoryArticleLanguages();
          this.addNewArticleLanguageDialog = false;

        })).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'Article Added Successfully',
              life: 3000,
            });
            // this.initNewsCategoryArticleForm()
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

  //#region Edit Article Language
  saveEditArticleLanguage(articleLanguage: INewsCategoryArticleLanguage) {
    this.submitted = true;

    const formData = new FormData();

    formData.append('Id', articleLanguage.id);
    formData.append('ArticleTitle', articleLanguage.articleTitle);
    formData.append('WriterName', articleLanguage.writerName);
    formData.append('ArticleText', articleLanguage.articleText);
    formData.append('Description', articleLanguage.description);
    formData.append('LanguageId', articleLanguage.languageId);
    formData.append('NewsCategoryArticleId', this.articleId);

    const articleImageFile = this.selectedArticleImage;
    console.log(articleImageFile);
    if (articleImageFile) {
      formData.append('ImageUrl', articleImageFile, articleImageFile.name);
    }

    this.subs.add(
      this.articleLangServ.editNewsCategoryArticleLanguage(formData).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Article Language Edited Successfully',
            life: 3000,
          });
          this.ref.detectChanges();
        },
        error: (err) => {
          console.error('Error editing article language:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'An error occurred while updating the article language',
            life: 3000,
          });
        },
      })
    );
  }

  //#endregion

  //#region Helpers


  initNewsCategoryArticleLanguage() {
    this.article = {
      id: '',
      articleTitle: '',
      imageUrl: '',
      isActive: true,
      languageId: '',
      newsCategoryId: '',
      writerName: '',
      languageName: '',
      articleText: '',
      description: '',
      publishingDate: '',
      tagIds: [],
      newsCategoryArticleLanguages: [],

    };
  }


  initNewsCategoryArticleForm() {
    this.addNewsCategoryArticleLanguageForm = this.formBuilder.group({
      articleTitle: '',
      imageUrl: '',
      writerName: '',
      articleText: '',
      description: '',
      languageId: '',
      newsCategoryId: '',
      isActive: 'true',
    });


    this.editNewsCategoryArticleLanguageForm = this.formBuilder.group({
      id: '',
      articleTitle: '',
      imageUrl: '',
      writerName: '',
      articleText: '',
      description: '',
      publishingDate: new Date(),
      languageId: '',
      newsCategoryId: '',
      isActive: 'true',
    });
  }


  // A unified function for selecting the image
  triggerImageUpload(articleLanguage?: any, isMainImage: boolean = false, isNewLanguageDialog: boolean = false): void {
    // Determine which input field to trigger
    const fileInput = document.getElementById(
      isMainImage ? 'ArticleMainImage' :
        isNewLanguageDialog ? 'NewArticleLanguageImage' :
          'ArticleLanguageImage'
    ) as HTMLInputElement;

    fileInput.click();
    // Set the selectedLanguageId only if it's not the main image and not in the new language dialog
    if (!isMainImage && !isNewLanguageDialog) {
      this.selectedLanguageId = articleLanguage?.id || null;
    }
  }


  handleImageSelection(event: Event, isMainImage: boolean = false, isNewLanguageDialog: boolean = false): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.selectedArticleImage = input.files[0];
      const reader = new FileReader();

      reader.onload = (e: any) => {
        if (isMainImage) {
          // For main image
          this.mainArticle.imageUrl = e.target.result;
          console.log('Main Image URL:', this.mainArticle.imageUrl);
        } else {
          // For language image or new language dialog
          if (isNewLanguageDialog) {
            // Handle image for the new language dialog
            this.imageUrl = e.target.result;
            console.log('New Language Image URL:', this.imageUrl);
          } else {
            // Handle language-specific image
            const language = this.mainArticle.newsCategoryArticleLanguages?.find(
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

      reader.readAsDataURL(this.selectedArticleImage); // Read the file as a Data URL
    }
  }

  // Get the image URL for the language or main image
  getImageUrl(languageId: string, mainImage: boolean = false): string {
    if (mainImage) {
      return this.mainArticle.imageUrl ?? '../../../../../assets/media/upload-photo.jpg';
    } else {
      const language = this.mainArticle?.newsCategoryArticleLanguages?.find(
        (lang: any) => lang.id === languageId
      );
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


  ngOnDestroy() {
    this.subs.unsubscribe();
  }


}

