import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BlogCategoryListComponent } from './components/blog-category-list/blog-category-list.component';
import { BlogCategoryPostListComponent } from './components/blog-category-post-list/blog-category-post-list.component';

const routes: Routes = [
  { path: '', component: BlogCategoryListComponent },
  { path: 'blog-post-list/:id', component: BlogCategoryPostListComponent },
]


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BlogsRoutingModule { }
