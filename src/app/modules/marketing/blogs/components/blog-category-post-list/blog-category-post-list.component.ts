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
import { IBlogCategoryPost } from '../../models/IBlogs';
import { BlogCategoryPostService } from '../../services/blog-category-post.service';
import { ITagModel } from 'src/app/modules/tages/models/ITagModel';
import { DropdownListDataSourceService } from 'src/app/core/Services/dropdown-list-data-source.service';
@Component({
  selector: 'app-blog-category-post-list',
  templateUrl: './blog-category-post-list.component.html',
  styleUrl: './blog-category-post-list.component.scss'
})
export class BlogCategoryPostListComponent implements OnInit, AfterViewChecked, OnDestroy {

  tableLoadingSpinner: boolean = true;
  subs: Subscription = new Subscription();

  actions = constants.pageActions;
  editBlogCategoryPostDialog: boolean = false;
  addBlogCategoryPostDialog: boolean = false;
  deletionBlogCategoryPostDialog: boolean = false;
  switchActivationBlogCategoryPostDialog: boolean = false;

  BlogCategoryPostId: string

  submitted: boolean = false;

  pagePermessions: IAspNetPageItemModel[] = [];
  defaultLanguage: ILanguageModel[] = [];
  blogCategoryPosts: IBlogCategoryPost[] = [];
  tags: ITagModel[] = [];
  selectedTagIds: string[] = []; // Holds the selected tag IDs

  blogCategoryPost: IBlogCategoryPost;
  selectedLanguage: ILanguageModel;

  editBlogCategoryPostForm: FormGroup;
  addBlogCategoryPostForm: FormGroup;

  selectedCategoryImage: File | null = null;


  imageUrl: string = '../../../../../assets/media/upload-photo.jpg';

  activeLanguages: ILanguageModel[] = []
  menuItems: MenuItem[] = [];

  sortField: string = '';

  selectedPost: IBlogCategoryPost | null = null;



  constructor(
    private trainingServ: TrainingLessonService,
    private blogServ: BlogCategoryPostService,
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
    this.pagePermessions = this.permessionService.getPagePermessions(constants.pages.blogCategoryPost);
    this.initBlogCategoryPostModelAndForm();
    this.getEnglishLanguageForAddForm()
  }

  ngAfterViewChecked(): void {
    this.ref.detectChanges();
  }

  ngOnInit() {
    this.route.params.subscribe((params) => {
      const id = params['id'];
      this.BlogCategoryPostId = id;
      this.loadPostsByCategory();
      this.loadAllTages()
    });

    this.tableLoadingService.loading$.subscribe((isLoading) => {
      this.tableLoadingSpinner = isLoading;
    });


    const editBtn = {
      label: this.translate.getInstant('shared.actions.edit'),
      icon: 'pi pi-fw pi-pencil',
      command: () => this.editBlogCategoryPost(this.blogCategoryPost),
    };
    const deleteBtn = {
      label: this.translate.getInstant('shared.actions.delete'),
      icon: 'pi pi-fw pi-trash',
      command: () => this.deleteBlogCategoryPost(this.blogCategoryPost),
    };


    this.menuItems = [];
    this.menuItems.push(deleteBtn);
    this.menuItems.push(editBtn);

  }

  assigneCurrentSelect(BlogCategoryPost: IBlogCategoryPost) {
    this.blogCategoryPost = BlogCategoryPost;
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
      this.blogServ.getAllTages().subscribe({
        next: (res) => {
          this.tags = res.data?.filter((t: ITagModel) => t.blogAllowed);
        },

      })
    );
  }

  loadPostsByCategory() {
    this.tableLoadingService.show();
    this.subs.add(
      this.blogServ.getPostsByCategoryId(this.BlogCategoryPostId).subscribe((data) => {
        this.blogCategoryPosts = data.data;
        this.ref.detectChanges();
        this.tableLoadingService.hide();
      })
    );
  }

  //#region Add Training Lesson

  addBlogCategoryPost() {
    this.initBlogCategoryPostModelAndForm();
    this.imageUrl = '../../../../../assets/media/upload-photo.jpg';
    this.selectedCategoryImage = null;
    this.addBlogCategoryPostDialog = true;
  }


  saveAddBlogCategoryPost() {
    this.submitted = true;

    if (this.addBlogCategoryPostForm.valid) {
      const formData = new FormData();
      formData.append('PostTitle', this.addBlogCategoryPostForm.value.postTitle);
      formData.append('LanguageId', this.addBlogCategoryPostForm.value.languageId);
      formData.append('PublishingDate', this.addBlogCategoryPostForm.value.publishingDate);
      formData.append('WriterName', this.addBlogCategoryPostForm.value.writerName);
      formData.append('PostDetailHtml', this.addBlogCategoryPostForm.value.postDetailHtml);
      formData.append('Description', this.addBlogCategoryPostForm.value.description);
      formData.append('BlogCategoryId', this.BlogCategoryPostId);

      this.addBlogCategoryPostForm.value.tags.forEach((tagId: string) => {
        formData.append('TagIds', tagId);
      });

      const categoryImageFile = this.selectedCategoryImage;
      if (categoryImageFile) {
        formData.append('ImageUrl', categoryImageFile, categoryImageFile.name);
      }

      this.subs.add(
        this.blogServ.addBlogCategoryPost(formData).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'Blog Category Post Added',
              life: 3000,
            });
            this.loadPostsByCategory();
            this.ref.detectChanges();
            this.initBlogCategoryPostModelAndForm();
            this.addBlogCategoryPostDialog = false;
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

  declineAddBlogCategoryPostDialog() {
    this.submitted = false;
    this.initBlogCategoryPostModelAndForm();
    this.addBlogCategoryPostDialog = false;
  }
  //#endregion


  //#region Edit Training Lesson

  editBlogCategoryPost(BlogCategoryPost: IBlogCategoryPost) {
    this.selectedPost = BlogCategoryPost;
    this.editBlogCategoryPostDialog = true;
  }
  formatDate(dateString: string | Date): string {
    if (!dateString) return '';

    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }

  declineEditBlogCategoryPost() {
    this.submitted = false;
    this.initBlogCategoryPostModelAndForm();
    this.editBlogCategoryPostDialog = false;
  }

  //#endregion

  //#region Deletion

  deleteBlogCategoryPost(BlogCategoryPost: IBlogCategoryPost) {
    this.deletionBlogCategoryPostDialog = true;
    this.blogCategoryPost = { ...BlogCategoryPost };
  }
  confirmDeletion() {
    this.deletionBlogCategoryPostDialog = false;
    this.subs.add(
      this.blogServ.deleteBlogCategoryPostById(this.blogCategoryPost.id).subscribe({
        next: (response: ApiResult) => {
          if (response.code !== 406) {
            this.messageService.add({
              severity: 'success',
              summary: 'Successfully',
              detail: response.message,
              life: 3000,
            });
            this.loadPostsByCategory();
            this.ref.detectChanges();
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Cannot delete because there are Blog category languages associated with this Blog category',
              life: 5000,
            });
            this.loadPostsByCategory();
            this.ref.detectChanges();
          }
        },
      })
    );
    this.initBlogCategoryPostModelAndForm();
    this.deletionBlogCategoryPostDialog = false;
  }
  declineDeletion() {
    this.deletionBlogCategoryPostDialog = false;
    this.initBlogCategoryPostModelAndForm();
  }

  //#endregion

  //#region Activation
  switchActivation(BlogCategoryPost: IBlogCategoryPost) {
    this.switchActivationBlogCategoryPostDialog = true;
    this.blogCategoryPost = { ...BlogCategoryPost };
  }

  declineActivation() {
    this.switchActivationBlogCategoryPostDialog = false;
    this.initBlogCategoryPostModelAndForm();
    this.loadPostsByCategory();
  }

  confirmtActivation() {
    this.toggleActivation(this.blogCategoryPost);
  }

  toggleActivation(BlogCategoryPost: IBlogCategoryPost) {
    if (BlogCategoryPost.isActive) {
      this.subs.add(
        this.blogServ.deactivateBlogCategoryPost(BlogCategoryPost.id).subscribe(() => {
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Blog Category Deactivated',
            life: 3000,
          });
          this.loadPostsByCategory();
          this.ref.detectChanges();
        })
      );
    } else {
      this.subs.add(
        this.blogServ.activateBlogCategoryPost(BlogCategoryPost.id).subscribe(() => {
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Blog Category Activated',
            life: 3000,
          });
          this.loadPostsByCategory();
          this.ref.detectChanges();
        })
      );
    }
    this.initBlogCategoryPostModelAndForm();
    this.switchActivationBlogCategoryPostDialog = false;
  }

  //#endregion

  navigateToBlogCategoryPostPosts(CategoryId: string) {
    this.router.navigate(['blog-post-list', CategoryId]);
  }

  initBlogCategoryPostModelAndForm() {

    this.blogCategoryPost = {
      id: '',
      postTitle: '',
      imageUrl: '',
      writerName: '',
      postDetailHtml: '',
      description: '',
      publishingDate: '',
      languageId: '',
      languageName: '',
      blogCategoryId: '',
      blogCategoryPostTags: [],
      tagIds: [],
      isActive: false,
    };

    const defaultLanguage = this.activeLanguages?.find((x: any) => x.code === 'en');
    this.addBlogCategoryPostForm = this.formBuilder.group({
      postTitle: ['', Validators.required],
      imageUrl: [''],
      writerName: '',
      postDetailHtml: '',
      description: '',
      publishingDate: [new Date().toISOString().split('T')[0]],  // Convert Date to a valid string format (yyyy-mm-dd)
      languageId: [defaultLanguage ? defaultLanguage.id : ''],
      blogCategoryId: '',
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
