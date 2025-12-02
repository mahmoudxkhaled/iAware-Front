import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SupportRoutingModule } from './support-routing.module';
import { SharedModule } from 'src/app/Shared/shared/shared.module';
import { CategoryComponent } from './components/category/category.component';
import { StatusComponent } from './components/status/status.component';
import { SubjectComponent } from './components/subject/subject.component';

@NgModule({
    declarations: [CategoryComponent, StatusComponent, SubjectComponent],
    imports: [SharedModule, SupportRoutingModule],
})
export class SupportModule {}
