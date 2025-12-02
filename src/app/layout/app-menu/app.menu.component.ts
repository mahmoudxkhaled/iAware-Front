import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { PermessionsService } from '../../core/Services/permessions.service';
import { TranslationService } from '../../core/Services/translation.service';
import { IAspNetPageItemModel } from '../../modules/page-management/models/IAspNetPageItemModel';
import { constants } from '../../core/constatnts/constatnts';

@Component({
    selector: 'app-menu',
    templateUrl: './app.menu.component.html',
})
export class AppMenuComponent implements OnInit {
    model: any[] = [];
    currentPages: any;
    currentPermessions: IAspNetPageItemModel[] = [];
    iAwarePages = constants.pages;
    iAwareActions = constants.pageActions;

    constructor(private permessionService: PermessionsService, private translate: TranslationService) {
        this.currentPermessions = this.permessionService.getCurrentPermessions();
        this.currentPages = [...new Set(this.currentPermessions?.map((r) => r.aspNetPageName))];
    }

    ngOnInit(): void {
        this.buildMenu();
        this.translate.getCurrentLang().subscribe(() => {
            this.onLangChange();
        });
    }
    onLangChange(): void {
        this.buildMenu();
    }

    buildMenu() {
        this.model = [

        ];
    }

    hassPermession(pageName: string): boolean {
        return this.currentPages.includes(pageName);
    }
}