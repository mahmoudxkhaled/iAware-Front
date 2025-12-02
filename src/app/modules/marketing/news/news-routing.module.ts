import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NewsCategoryListComponent } from './components/news-category-list/news-category-list.component';
import { NewsCategoryArticleListComponent } from './components/news-category-article-list/news-category-article-list.component';

const routes: Routes = [
  { path: '', component: NewsCategoryListComponent },
  { path: 'news-article-list/:id', component: NewsCategoryArticleListComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NewsRoutingModule { }
