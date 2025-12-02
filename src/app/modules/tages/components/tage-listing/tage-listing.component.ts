import { Component } from '@angular/core';
import { ITagModel } from '../../models/ITagModel';
import { AbstractControl, FormArray, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subscription } from 'rxjs';
import { MessageService } from 'primeng/api';
import { TableLoadingService } from 'src/app/core/Services/table-loading.service';
import { TagesService } from '../../services/tages.service';
import { Table } from 'primeng/table';
import { ILanguageModel } from 'src/app/modules/language/models/ILanguageModel';
import { DropdownListDataSourceService } from 'src/app/core/Services/dropdown-list-data-source.service';
import { IPaginationModel } from 'src/app/core/Dtos/IPaginationModel';

@Component({
  selector: 'app-tage-listing',
  templateUrl: './tage-listing.component.html',
  styleUrl: './tage-listing.component.scss'
})
export class TageListingComponent {

  tableLoadingSpinner: boolean = true;
  tages: ITagModel[] = [];
  currentSelected: ITagModel;
  deleteDialog: boolean = false;
  editeDialog: boolean = false;
  activationDialog: boolean = false;
  addDialog: boolean = false;
  addForm: FormGroup;
  editForm: FormGroup;
  unsubscribe: Subscription[] = [];
  languages: ILanguageModel[] = [];
  availableLanguagesCache: { [index: number]: ILanguageModel[] } = {};
  trackByIndex = (index: number): number => index;
  totalRecords: number = 0;


  get tagLanguagesArray() {
    return this.addForm.get('tagLanguages') as FormArray;
  }

  get editTagLanguagesArray() {
    return this.editForm.get('tagLanguages') as FormArray;
  }

  constructor(
    private apiService: TagesService,
    private messageService: MessageService,
    private tableLoadingService: TableLoadingService,
    private dropdownListDataSourceService: DropdownListDataSourceService
  ) { }

  ngOnInit(): void {
    this.tableLoadingService.loading$.subscribe((isLoading) => {
      this.tableLoadingSpinner = isLoading;
    });

    this.fetchActiveLanguages();
    this.initFormListeners();
  }

  fetchTages() {
    this.tableLoadingService.show();
    this.unsubscribe.push(
      this.apiService.getAllTagesPagination(this.tagsPagiantion).subscribe((res) => {
        this.tages = res.data;
        console.log('tages', this.tages);
        this.totalRecords = res.totalRecords;
        this.tableLoadingService.hide();
      })
    );
  }

  tagsPagiantion: IPaginationModel = {
    page: 0,
    size: 10,
    searchQuery: ''
  };
  lazyLoadTags(event: any) {
    this.tagsPagiantion.searchQuery = event.globalFilter || '';
    this.tagsPagiantion.page = Math.floor(event.first / event.rows);
    this.tagsPagiantion.size = event.rows;
    this.fetchTages();
    this.scrollToTop();
  }

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  fetchActiveLanguages() {
    this.dropdownListDataSourceService.getActiveLanguages().subscribe({
      next: (result) => {
        this.languages = result.data;
      },
      error: (error) => { },
    });
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  navigateToCreate() {
    this.initiateAddForm();
    this.addDialog = true;
  }

  openEditDialog(tag: ITagModel) {
    this.initiateEditForm();
    this.editeDialog = true;
    this.currentSelected = tag;

    this.editForm.patchValue({
      id: tag.id,
      tagName: tag.tagName,
      priorityNumber: tag.priorityNumber,
      blogAllowed: tag.blogAllowed,
      gameAllowed: tag.gameAllowed,
      newsAllowed: tag.newsAllowed,
      phishingAllowed: tag.phishingAllowed,
      trainingAllowed: tag.trainingAllowed,
      wallpaperAllowed: tag.wallpaperAllowed
    });

    if (tag.tagLanguages) {
      tag.tagLanguages.forEach(lang => {
        this.editTagLanguagesArray.push(
          new FormGroup({
            tagName: new FormControl(lang.tagName, Validators.required),
            languageId: new FormControl(lang.languageId, Validators.required)
          })
        );
      });
    }
  }

  private initFormListeners(): void {
    const addFormSub = this.addForm?.get('tagLanguages')?.valueChanges
      .pipe(debounceTime(100), distinctUntilChanged())
      .subscribe(() => this.updateAvailableLanguagesCache(this.addForm));

    const editFormSub = this.editForm?.get('tagLanguages')?.valueChanges
      .pipe(debounceTime(100), distinctUntilChanged())
      .subscribe(() => this.updateAvailableLanguagesCache(this.editForm));

    if (addFormSub) this.unsubscribe.push(addFormSub);
    if (editFormSub) this.unsubscribe.push(editFormSub);
  }

  private updateAvailableLanguagesCache(form: FormGroup): void {
    const formArray = form?.get('tagLanguages') as FormArray;
    if (!formArray) return;

    formArray.controls.forEach((control, index) => {
      this.availableLanguagesCache[index] = this.calculateAvailableLanguages(form, index);
    });
  }

  private calculateAvailableLanguages(form: FormGroup, index: number): ILanguageModel[] {
    const allSelections = (form.get('tagLanguages') as FormArray).value;
    return this.languages.filter(language =>
      !allSelections.some((sel: any, i: number) => i !== index && sel.languageId === language.id)
    );
  }

  getAvailableLanguages(form: FormGroup, index: number): ILanguageModel[] {
    return this.availableLanguagesCache[index] || [];
  }

  openDeleteDialog(Tag: ITagModel) {
    this.deleteDialog = true;
    this.currentSelected = Tag;
  }

  hideDialog() {
    this.deleteDialog = false;
    this.editeDialog = false;
    this.activationDialog = false;
    this.addDialog = false;
  }

  initiateAddForm() {
    this.addForm = new FormGroup({
      tagName: new FormControl<string>('', [Validators.required]),
      priorityNumber: new FormControl<number>(0, [Validators.required]),
      blogAllowed: new FormControl<boolean>(false),
      gameAllowed: new FormControl<boolean>(false),
      newsAllowed: new FormControl<boolean>(false),
      phishingAllowed: new FormControl<boolean>(false),
      trainingAllowed: new FormControl<boolean>(false),
      wallpaperAllowed: new FormControl<boolean>(false),
      tagLanguages: new FormArray<FormGroup>([], [this.hasDuplicateLanguages()])
    });
  }

  initiateEditForm() {
    this.editForm = new FormGroup({
      id: new FormControl<string>(''),
      tagName: new FormControl<string>(''),
      priorityNumber: new FormControl<number>(0),
      blogAllowed: new FormControl<boolean>(false),
      gameAllowed: new FormControl<boolean>(false),
      newsAllowed: new FormControl<boolean>(false),
      phishingAllowed: new FormControl<boolean>(false),
      trainingAllowed: new FormControl<boolean>(false),
      wallpaperAllowed: new FormControl<boolean>(false),
      tagLanguages: new FormArray<FormGroup>([], [this.hasDuplicateLanguages()])
    });
  }

  addTagLanguage(form: FormGroup) {
    const languagesArray = form.get('tagLanguages') as FormArray;
    const existingIds = languagesArray.value.map((l: any) => l.languageId);
    const availableLanguage = this.languages.find(l => !existingIds.includes(l.id));

    if (availableLanguage) {
      languagesArray.push(this.createLanguageGroup(availableLanguage.id));
      this.updateAvailableLanguagesCache(form);
    }
  }

  removeTagLanguage(form: FormGroup, index: number) {
    (form.get('tagLanguages') as FormArray).removeAt(index);
    this.updateAvailableLanguagesCache(form);
  }

  private createLanguageGroup(languageId: string): FormGroup {
    const arr = new FormGroup({
      tagName: new FormControl<string>(''),
      languageId: new FormControl<string>(languageId)
    });
    return arr;
  }

  addTag() {

    const formValue = {
      ...this.addForm.value,
      tagLanguages: this.addForm.value.tagLanguages
    };

    const x = this.apiService.addTag(formValue).subscribe({
      next: (res) => {
        this.fetchTages();
        this.hideDialog();
        this.initiateAddForm();
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Tag added successfully',
        });
      },
      error: (error) => { },
    });
    this.unsubscribe.push(x);
  }

  editTag() {
    const formValue = {
      ...this.editForm.value,
      tagLanguages: this.editForm.value.tagLanguages
    };
    const x = this.apiService.editTag(formValue).subscribe({
      next: (res) => {
        this.fetchTages();
        this.hideDialog();
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Tag updated successfully',
        });
      },
    });
    this.unsubscribe.push(x);
  }

  deleteTag() {
    const x = this.apiService.deleteTag(this.currentSelected.id!).subscribe({
      next: (res) => {
        this.fetchTages();
        this.deleteDialog = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Tag deleted successfully',
          life: 3000,
        });
      },
      error: (error) => { },
    });
    this.unsubscribe.push(x);
  }

  hasDuplicateLanguages(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const languages = (control as FormArray).value;
      const languageIds = languages.map((l: any) => l.languageId);
      return new Set(languageIds).size !== languageIds.length
        ? { duplicateLanguages: true }
        : null;
    };
  }

  canAddMoreLanguages(form: FormGroup): boolean {
    const currentCount = (form.get('tagLanguages') as FormArray).length;
    return currentCount < this.languages.length;
  }

  ngOnDestroy(): void {
    this.unsubscribe.forEach((u) => {
      u.unsubscribe();
    });
  }
}