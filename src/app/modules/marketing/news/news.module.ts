import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewsRoutingModule } from './news-routing.module';
import { NewsCategoryListComponent } from './components/news-category-list/news-category-list.component';
import { ArticleEditComponent } from './components/article-edit/article-edit.component';
import { NewsCategoryArticleListComponent } from './components/news-category-article-list/news-category-article-list.component';
import { NewsCategoryEditComponent } from './components/news-category-edit/news-category-edit.component';
import { SharedModule } from 'src/app/Shared/shared/shared.module';

@NgModule({
  declarations: [NewsCategoryListComponent, NewsCategoryArticleListComponent, ArticleEditComponent, NewsCategoryEditComponent],
  imports: [
    SharedModule,
    CommonModule,
    NewsRoutingModule
  ]
})
export class NewsModule { }
