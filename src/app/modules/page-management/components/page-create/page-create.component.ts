import { Component, OnInit, OnDestroy } from '@angular/core';
import { IAspNetPageModel } from '../../models/IAspNetPageModel';
import { NgForm } from '@angular/forms';
import { PageService } from '../../services/page.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-page-create',
  templateUrl: './page-create.component.html',
  styleUrl: './page-create.component.scss'
})
export class PageCreateComponent implements OnDestroy {

  pageModel : IAspNetPageModel = {
    id: '',
    applicationUrl: '',
    displayInMenu: '',
    orderNo: 0,
    pageNameAr: '',
    pageNameEn: '',
    pageUrl: '',
    helpTextAr: '',
    helpTextEn: '',
    fontIconCode: '',
    isHeading: false,
    isActive: false,
    pageItems: [],
  }
  unsubscribe: Subscription[] = [];
  constructor(private apiService : PageService, private router : Router){}
 
  onSubmit(myForm: NgForm){
    if (myForm && myForm.invalid) {
      return;
    }
    const x = this.apiService.createAspNetPage(this.pageModel).subscribe({
      next: () => {
        this.router.navigateByUrl('/pages-managment')
      },
      error: (error) => {
        
      },
    });
    this.unsubscribe.push(x);
  }

  ngOnDestroy(): void {
    this.unsubscribe.forEach((u) => {
        u.unsubscribe();
    });
}
}
