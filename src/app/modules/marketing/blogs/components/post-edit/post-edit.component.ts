import { IBlogCategoryPostLanguage } from './../../models/IBlogs';
import { ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Table } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { ILanguageModel } from 'src/app/modules/language/models/ILanguageModel';
import { IAspNetPageItemModel } from 'src/app/modules/page-management/models/IAspNetPageItemModel';
import { finalize, Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TableLoadingService } from 'src/app/core/Services/table-loading.service';
import { IBlogCategoryPost } from '../../models/IBlogs';
import { BlogCategoryPostLanguageService } from '../../services/blog-category-post-language.service';
import { BlogCategoryPostService } from '../../services/blog-category-post.service';
import { ITagModel } from 'src/app/modules/tages/models/ITagModel';
@Component({
  selector: 'app-post-edit',
  templateUrl: './post-edit.component.html',
  styleUrl: './post-edit.component.scss'
})
export class PostEditComponent implements OnInit, OnChanges, OnDestroy {

  @Input() post: IBlogCategoryPost | null = null;
  tableLoadingSpinner: boolean = true;
  subs: Subscription = new Subscription();

  mainPost: IBlogCategoryPost;
  postLanguage: IBlogCategoryPostLanguage;

  activeLanguages: ILanguageModel[] = [];
  pagePermessions: IAspNetPageItemModel[] = [];
  defaultLanguage: ILanguageModel[] = [];
  tags: ITagModel[] = [];
  selectedTagIds: string[] = [];


  imageUrl: string = '../../../../../assets/media/upload-photo.jpg';

  postId: string;

  selectedLanguageId: string | null = null;

  addNewPostLanguageForm: FormGroup;
  editBlogCategoryPostLanguageForm: FormGroup;
  addBlogCategoryPostLanguageForm: FormGroup;

  activeTabIndex: number = 0;

  selectedPostImage: File | null = null;

  addNewPostLanguageDialog: boolean;
  switchActivationPostLanguageDialog: boolean = false;

  submitted: boolean = false;
  constructor(
    private messageService: MessageService,
    private postLangServ: BlogCategoryPostLanguageService,
    private postServ: BlogCategoryPostService,
    private ref: ChangeDetectorRef,
    private tableLoadingService: TableLoadingService,
    private formBuilder: FormBuilder
  ) {
    this.initBlogCategoryPostLanguage();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['post'] && this.post) {
      this.postId = this.post.id;
      this.loadblogCategoryPostLanguages();
      this.imageUrl = this.post.imageUrl ?? '../../../../../assets/media/upload-photo.jpg';
    }
  }
  ngOnInit() {
    this.tableLoadingService.loading$.subscribe((isLoading) => {
      this.tableLoadingSpinner = isLoading;
    });
    this.loadAllTages()

  }

  loadblogCategoryPostLanguages() {
    this.tableLoadingService.show();
    this.postLangServ
      .getAllBlogCategoryPostLanguagesByPostId(this.postId)
      .pipe(
        finalize(() => {
          this.getActiveLanguageForAddForm();
          this.tableLoadingService.hide();

        })
      )
      .subscribe((response) => {
        this.mainPost = response.data;
        console.log(response.data)
        if (!this.mainPost.blogCategoryPostLanguages) {
          this.mainPost.blogCategoryPostLanguages = [];
        }
        this.mainPost.publishingDate = this.formatDate(this.mainPost.publishingDate);
        this.selectedTagIds = this.mainPost.tagIds;
      });
  }

  formatDate(dateString: string | Date): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }

  getActiveLanguageForAddForm() {
    this.postLangServ.getAllLanguagesWithoutFilters().subscribe({
      next: (res) => {
        this.activeLanguages = res.data;
        this.defaultLanguage = this.activeLanguages.filter((c) => c.code === 'en');

        if (this.mainPost) {
          // Create a set of existing language IDs, including the main post's language ID
          const existingLanguageIds = new Set([
            ...this.mainPost.blogCategoryPostLanguages?.map((c) => c.languageId) || [], // fallback to empty array if undefined
            this.mainPost.languageId
          ]);

          // Filter out languages that already exist in the main post or its categories
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
      this.postServ.getAllTages().subscribe({
        next: (res) => {
          this.tags = res.data?.filter((t: ITagModel) => t.blogAllowed);
        },

      })
    );
  }


  //#region Edit Main Post

  saveEditMainPost() {
    this.submitted = true;
    const formData = new FormData();

    formData.append('Id', this.mainPost.id);
    formData.append('PostTitle', this.mainPost.postTitle);
    formData.append('WriterName', this.mainPost.writerName);
    formData.append('PostDetailHtml', this.mainPost.postDetailHtml);
    formData.append('Description', this.mainPost.description);
    formData.append('PostTitle', this.mainPost.postTitle);
    formData.append('PublishingDate', this.mainPost.publishingDate);

    const uniqueTagIds = [...new Set(this.selectedTagIds)];  // Remove duplicates using a Set
    uniqueTagIds.forEach((tagId: string) => {
      formData.append('TagIds', tagId);
    });


    const PostImageFile = this.selectedPostImage;
    if (PostImageFile) {
      formData.append('ImageUrl', PostImageFile, PostImageFile.name);
    }

    this.subs.add(
      this.postServ.editBlogCategoryPost(formData).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Main Post Edited Successfully',
            life: 3000,
          });
          this.loadblogCategoryPostLanguages();
          this.ref.detectChanges();
        },
      })
    );
  }
  //#endregion

  //#region Activation Post Language

  switchPostLanguageActivation(postLanguage: IBlogCategoryPostLanguage) {
    this.switchActivationPostLanguageDialog = true;
    this.postLanguage = { ...postLanguage };
  }

  declinePostLanguageActivation() {
    this.switchActivationPostLanguageDialog = false;
    this.loadblogCategoryPostLanguages();
    this.ref.detectChanges();
  }

  confirmPostLanguageActivation() {
    this.togglePostLanguageActivation(this.postLanguage);
  }

  togglePostLanguageActivation(postLanguage: IBlogCategoryPostLanguage) {
    if (postLanguage.isActive) {
      this.subs.add(
        this.postLangServ
          .deactivateBlogCategoryPostLanguage(postLanguage.id)
          .pipe(
            finalize(() => {
              this.loadblogCategoryPostLanguages();
              this.ref.detectChanges();
              this.switchActivationPostLanguageDialog = false;
            })
          )
          .subscribe(() => {
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'Post Language Deactivated',
              life: 3000,
            });
          })
      );
    } else {
      this.subs.add(
        this.postLangServ
          .activateBlogCategoryPostLanguage(postLanguage.id)
          .pipe(
            finalize(() => {
              this.loadblogCategoryPostLanguages();
              this.ref.detectChanges();
              this.switchActivationPostLanguageDialog = false;
            })
          )
          .subscribe(() => {
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'Post Language Activated',
              life: 3000,
            });
          })
      );
    }
  }

  //#endregion


  //#region Delete Post Language

  deletePostLanguageDialog: boolean = false;
  deletePostLanguage(postLanguage: IBlogCategoryPostLanguage) {
    this.postLanguage = { ...postLanguage };
    this.deletePostLanguageDialog = true;
  }
  declinePostLanguageDeletion() {
    this.deletePostLanguageDialog = false;
  }

  confirmPostLanguageDeletion() {
    console.log('this.postLanguage.id', this.postLanguage.id)
    this.subs.add(
      this.postLangServ
        .deleteBlogCategoryPostLanguageById(this.postLanguage.id)
        .pipe(
          finalize(() => {
            this.loadblogCategoryPostLanguages();
            this.ref.detectChanges();
            this.deletePostLanguageDialog = false;
          })
        )
        .subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Info',
              detail: 'Post Language Deleted Successfully',
              life: 3000,
            });
          },
        })
    );
  }

  //#endregion



  //#region Add New Post Language

  addNewPostLanguage() {
    this.initBlogCategoryPostForm()
    this.imageUrl = '../../../../../assets/media/upload-photo.jpg';
    this.addNewPostLanguageDialog = true;
  }
  declineAddNewPostLanguage() {
    this.addNewPostLanguageDialog = false;
  }
  saveAddNewPostLanguage() {
    this.submitted = true;
    if (this.addBlogCategoryPostLanguageForm.valid) {
      const formData = new FormData();

      formData.append('PostTitle', this.addBlogCategoryPostLanguageForm.value.postTitle);
      formData.append('WriterName', this.addBlogCategoryPostLanguageForm.value.writerName);
      formData.append('PostDetailHtml', this.addBlogCategoryPostLanguageForm.value.postDetailHtml);
      formData.append('Description', this.addBlogCategoryPostLanguageForm.value.description);
      formData.append('LanguageId', this.addBlogCategoryPostLanguageForm.value.languageId);
      formData.append('BlogCategoryPostId', this.postId);

      const postImageFile = this.selectedPostImage;
      console.log(postImageFile);
      if (postImageFile) {
        formData.append('ImageUrl', postImageFile, postImageFile.name);
      }

      this.subs.add(
        this.postLangServ.addBlogCategoryPostLanguage(formData).pipe(finalize(() => {
          this.loadblogCategoryPostLanguages();
          this.addNewPostLanguageDialog = false;

        })).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'Post Added Successfully',
              life: 3000,
            });
            // this.initBlogCategoryPostForm()
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

  //#region Edit Post Language
  saveEditPostLanguage(postLanguage: IBlogCategoryPostLanguage) {
    this.submitted = true;

    const formData = new FormData();

    formData.append('Id', postLanguage.id);
    formData.append('PostTitle', postLanguage.postTitle);
    formData.append('WriterName', postLanguage.writerName);
    formData.append('PostDetailHtml', postLanguage.postDetailHtml);
    formData.append('Description', postLanguage.description);
    formData.append('LanguageId', postLanguage.languageId);
    formData.append('BlogCategoryPostId', this.postId);

    const postImageFile = this.selectedPostImage;
    console.log(postImageFile);
    if (postImageFile) {
      formData.append('ImageUrl', postImageFile, postImageFile.name);
    }

    this.subs.add(
      this.postLangServ.editBlogCategoryPostLanguage(formData).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Post Language Edited Successfully',
            life: 3000,
          });
          this.ref.detectChanges();
        },
        error: (err) => {
          console.error('Error editing post language:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'An error occurred while updating the post language',
            life: 3000,
          });
        },
      })
    );
  }

  //#endregion

  //#region Helpers


  initBlogCategoryPostLanguage() {
    this.post = {
      id: '',
      postTitle: '',
      imageUrl: '',
      isActive: true,
      languageId: '',
      blogCategoryId: '',
      writerName: '',
      languageName: '',
      postDetailHtml: '',
      description: '',
      publishingDate: '',
      tagIds: [],
      blogCategoryPostLanguages: [],

    };
  }


  initBlogCategoryPostForm() {
    this.addBlogCategoryPostLanguageForm = this.formBuilder.group({
      postTitle: '',
      imageUrl: '',
      writerName: '',
      postDetailHtml: '',
      description: '',
      languageId: '',
      blogCategoryId: '',
      isActive: 'true',
    });


    this.editBlogCategoryPostLanguageForm = this.formBuilder.group({
      id: '',
      postTitle: '',
      imageUrl: '',
      writerName: '',
      postDetailHtml: '',
      description: '',
      publishingDate: new Date(),
      languageId: '',
      blogCategoryId: '',
      isActive: 'true',
    });
  }


  // A unified function for selecting the image
  triggerImageUpload(postLanguage?: any, isMainImage: boolean = false, isNewLanguageDialog: boolean = false): void {
    // Determine which input field to trigger
    const fileInput = document.getElementById(
      isMainImage ? 'PostMainImage' :
        isNewLanguageDialog ? 'NewPostLanguageImage' :
          'PostLanguageImage'
    ) as HTMLInputElement;

    fileInput.click();
    // Set the selectedLanguageId only if it's not the main image and not in the new language dialog
    if (!isMainImage && !isNewLanguageDialog) {
      this.selectedLanguageId = postLanguage?.id || null;
    }
  }


  handleImageSelection(event: Event, isMainImage: boolean = false, isNewLanguageDialog: boolean = false): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.selectedPostImage = input.files[0];
      const reader = new FileReader();

      reader.onload = (e: any) => {
        if (isMainImage) {
          // For main image
          this.mainPost.imageUrl = e.target.result;
          console.log('Main Image URL:', this.mainPost.imageUrl);
        } else {
          // For language image or new language dialog
          if (isNewLanguageDialog) {
            // Handle image for the new language dialog
            this.imageUrl = e.target.result;
            console.log('New Language Image URL:', this.imageUrl);
          } else {
            // Handle language-specific image
            const language = this.mainPost.blogCategoryPostLanguages?.find(
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

      reader.readAsDataURL(this.selectedPostImage); // Read the file as a Data URL
    }
  }

  // Get the image URL for the language or main image
  getImageUrl(languageId: string, mainImage: boolean = false): string {
    if (mainImage) {
      return this.mainPost.imageUrl ?? '../../../../../assets/media/upload-photo.jpg';
    } else {
      const language = this.mainPost?.blogCategoryPostLanguages?.find(
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




}

