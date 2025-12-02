import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-training-category-lessons',
  templateUrl: './training-category-lessons.component.html',
  styleUrl: './training-category-lessons.component.scss'
})
export class TrainingCategoryLessonsComponent {
  categoryId : string;
  constructor(private route: ActivatedRoute){
    this.route.params.subscribe((params) => {
      const id = params['id'];
      this.categoryId = id;
    });
  }
}