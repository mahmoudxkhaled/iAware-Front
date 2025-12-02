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
import { IBlogCategory } from '../../models/IBlogs';
import { BlogCategoryService } from '../../services/blog-category.service';
import { DropdownListDataSourceService } from 'src/app/core/Services/dropdown-list-data-source.service';
@Component({
  selector: 'app-blog-category-list',
  templateUrl: './blog-category-list.component.html',
  styleUrl: './blog-category-list.component.scss'
})
export class BlogCategoryListComponent implements OnDestroy, OnInit {



  tableLoadingSpinner: boolean = true;
  subs: Subscription = new Subscription();
  submitted: boolean = false;

  actions = constants.pageActions;
  editBlogCategoryDialog: boolean = false;
  addBlogCategoryDialog: boolean = false;
  deletionBlogCategoryDialog: boolean = false;

  selectedCategory: IBlogCategory | null = null;


  pagePermessions: IAspNetPageItemModel[] = [];
  defaultLanguage: ILanguageModel[] = [];
  blogCategories: IBlogCategory[] = [];

  blogCategory: IBlogCategory;
  selectedLanguage: ILanguageModel;
  countOfActiveLanguages: Number;

  addBlogCategoryForm: FormGroup;

  selectedCategoryImage: File | null = null;

  activeLanguages: ILanguageModel[] = []

  imageUrl: string = '../../../../../assets/media/upload-photo.jpg';

  menuItems: MenuItem[] = [];

  constructor(
    private trainingServ: TrainingLessonService,
    private blogServ: BlogCategoryService,
    private messageService: MessageService,
    private formBuilder: FormBuilder,
    private router: Router,
    private ref: ChangeDetectorRef,
    private permessionService: PermessionsService,
    private translate: TranslationService,
    private tableLoadingService: TableLoadingService,
    private dropdownListDataSourceService: DropdownListDataSourceService
  ) {
    this.pagePermessions = this.permessionService.getPagePermessions(constants.pages.blogCategory);
    this.initBlogCategoryFormAndModel();
    this.getEnglishLanguageForAddForm()

  }


  ngOnInit() {
    this.tableLoadingService.loading$.subscribe((isLoading) => {
      this.tableLoadingSpinner = isLoading;
    });

    this.loadblogCategories();
    this.initBlogCategoryFormAndModel();

    const editBtn = {
      label: this.translate.getInstant('shared.actions.edit'),
      icon: 'pi pi-fw pi-pencil',
      command: () => this.editBlogCategory(this.blogCategory),
    };
    const deleteBtn = {
      label: this.translate.getInstant('shared.actions.delete'),
      icon: 'pi pi-fw pi-trash',
      command: () => this.deleteBlogCategory(this.blogCategory),
    };

    this.menuItems = [];
    this.menuItems.push(editBtn);
    this.menuItems.push(deleteBtn);

  }


  assigneCurrentSelect(blogCategory: IBlogCategory) {
    this.blogCategory = blogCategory;
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


  loadblogCategories() {
    this.tableLoadingService.show();
    this.subs.add(
      this.blogServ.getAllBlogCategories().subscribe((data) => {
        this.blogCategories = data.data;
        this.ref.detectChanges();
        this.tableLoadingService.hide();
      })
    );
  }



  //#region Add Blog Category

  saveAddBlogCategory() {
    this.submitted = true;
    if (this.addBlogCategoryForm.valid) {
      const formData = new FormData();
      formData.append('Title', this.addBlogCategoryForm.value.title);
      formData.append('LanguageId', this.addBlogCategoryForm.value.languageId);

      const categoryImageFile = this.selectedCategoryImage;
      console.log(categoryImageFile);
      if (categoryImageFile) {
        formData.append('ImageUrl', categoryImageFile, categoryImageFile.name);
      }

      this.subs.add(
        this.blogServ.addBlogCategory(formData).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'Blog Category Updated',
              life: 3000,
            });
            this.loadblogCategories();
            this.ref.detectChanges();
            this.initBlogCategoryFormAndModel();
            this.addBlogCategoryDialog = false;
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


  declineAddBlogCategoryDialog() {
    this.submitted = false;
    this.initBlogCategoryFormAndModel();
    this.addBlogCategoryDialog = false;
  }

  //#endregion

  //#region Edit Blog Category 
  editBlogCategory(blogCategory: IBlogCategory) {
    this.selectedCategory = blogCategory;
    this.editBlogCategoryDialog = true;
  }

  declineEditBlogCategory() {
    this.submitted = false;
    this.editBlogCategoryDialog = false;
  }

  //#endregion


  //#region Deletion

  deleteBlogCategory(BlogCategory: IBlogCategory) {
    this.deletionBlogCategoryDialog = true;
    this.blogCategory = { ...BlogCategory };
  }
  confirmDeletion() {
    this.deletionBlogCategoryDialog = false;
    this.subs.add(
      this.blogServ.deleteBlogCategoryById(this.blogCategory.id).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Successfully',
            detail: response.message,
            life: 3000,
          });
          this.loadblogCategories();
          this.ref.detectChanges();
          this.initBlogCategoryFormAndModel();
          this.deletionBlogCategoryDialog = false;
        },
      })
    );
  }

  declineDeletion() {
    this.deletionBlogCategoryDialog = false;
    this.initBlogCategoryFormAndModel();
  }

  //#endregion

  navigateToBlogCategoryPosts(id: string) {
    this.router.navigate([`/marketing/blogs/blog-post-list/${id}`])
  }

  initBlogCategoryFormAndModel() {

    this.blogCategory = {
      id: '',
      title: '',
      imageUrl: '',
      languageName: '',
      languageId: '',
      isActive: false,
    };

    const defaultLanguage = this.activeLanguages?.find((x: any) => x.code === 'en');
    this.addBlogCategoryForm = this.formBuilder.group({
      title: ['', Validators.required],
      imageUrl: [null],
      languageId: [defaultLanguage ? defaultLanguage.id : ''],
    });
  }


  CreateBlogCategory() {
    this.addBlogCategoryDialog = true;
    this.initBlogCategoryFormAndModel();

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
