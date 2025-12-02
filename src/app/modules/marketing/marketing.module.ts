import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NewsRoutingModule } from './news/news-routing.module';
import { BlogsRoutingModule } from './blogs/blogs-routing.module';
import { MarketingRoutingModule } from './marketing-routing.module';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MarketingRoutingModule,
  ]
})
export class MarketingModule { }
