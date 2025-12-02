import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/Shared/shared/shared.module';
import { BlogsRoutingModule } from './blogs-routing.module';
import { BlogCategoryEditComponent } from './components/blog-category-edit/blog-category-edit.component';
import { BlogCategoryListComponent } from './components/blog-category-list/blog-category-list.component';
import { BlogCategoryPostListComponent } from './components/blog-category-post-list/blog-category-post-list.component';
import { PostEditComponent } from './components/post-edit/post-edit.component';


@NgModule({
  declarations:
    [BlogCategoryListComponent,
      BlogCategoryPostListComponent,
      PostEditComponent,
      BlogCategoryEditComponent],

  imports: [SharedModule,
    CommonModule,
    BlogsRoutingModule
  ]
})
export class BlogsModule { }
