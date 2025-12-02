import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TagesService } from 'src/app/modules/tages/services/tages.service';
@Component({
  selector: 'app-tag-filter',
  templateUrl: './tag-filter.component.html',
})
export class TagFilterComponent implements OnInit {

  isLoading = false;
  tags: { id: string; tagName: string; isActive: boolean, selected: boolean }[] = [];
  selectedTags: { id: string; tagName: string }[] = [];
  @Input() componentName? :string;
  @Output() filterChanged = new EventEmitter<string[]>();
  @Output() filterApplied = new EventEmitter<string[]>();

  constructor(private tagService: TagesService) { }

  ngOnInit() {
    this.loadTags();
  }

  loadTags() {
    this.isLoading = true;
    this.fetchTages();
  }

  fetchTages() {
    this.tagService.getAllTagesAccordingToUserLanguage().subscribe({
      next: (response) => {
        if (response.isSuccess && response.data) {
          this.tags = response.data.filter((tag: any) => tag.isActive);
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
      }
    });
  }

  onFilterApply(): void {
    const selectedTagIds = this.tags.filter(c => c.selected).map(tag => tag.id);
    this.filterApplied.emit(selectedTagIds);
  }

  onFilterReset(): void {
    this.tags.forEach(tag => {
      tag.selected = false;
    });
    this.filterApplied.emit([]);
  }  
}