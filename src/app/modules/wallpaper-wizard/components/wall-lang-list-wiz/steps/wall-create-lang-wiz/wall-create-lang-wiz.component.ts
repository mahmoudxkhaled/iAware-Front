import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Subscription } from 'rxjs';
import { LocalStorageService } from 'src/app/core/Services/local-storage.service';
import { TranslationService } from 'src/app/core/Services/translation.service';
import { ILanguageModel } from 'src/app/modules/language/models/ILanguageModel';

@Component({
    selector: 'app-wall-create-lang-wiz',
    templateUrl: './wall-create-lang-wiz.component.html',
    styleUrl: './wall-create-lang-wiz.component.scss',
})
export class WallCreateLangWizComponent implements OnInit, AfterViewInit, OnDestroy {
    routeItems: MenuItem[] = [];
    activeIndex: number = 1;
    completed = 0;
    defaultLanguage: ILanguageModel[] = [];
    subs: Subscription = new Subscription();

    constructor(
        private localstorageService: LocalStorageService,
        private elRef: ElementRef,
        private renderer: Renderer2, 
        private translate: TranslationService
    ) {}

    ngOnInit(): void {
        this.routeItems = [
            {
                label: this.translate.getInstant('wallpaper-wizard.wall-lang-list-wiz.wall-create-lang-wiz.background'),
                routerLink: 'background',
            },
            {
                label: this.translate.getInstant('wallpaper-wizard.wall-lang-list-wiz.wall-create-lang-wiz.character'),
                routerLink: 'character',
            },
            {
                label: this.translate.getInstant('wallpaper-wizard.wall-lang-list-wiz.wall-create-lang-wiz.quote'),
                routerLink: 'quote',
            },
            {
                label: this.translate.getInstant('wallpaper-wizard.wall-lang-list-wiz.wall-create-lang-wiz.schedule'),
                routerLink: 'schedule',
            },
        ];
    }

    ngAfterViewInit(): void {
        const elements = this.elRef.nativeElement.querySelectorAll('.p-steps-number');
        elements.forEach((element: HTMLElement) => {
            this.renderer.setProperty(element, 'innerHTML', '');
            this.renderer.setStyle(element, 'visibility', 'visible');
        });
    }

    ngOnDestroy(): void {
        const data = [
            'selectedQuote',
            'selectedBackground',
            'selectedCharacter',
            'wallLanguage',
            'WallpaperTitle',
            'selectedLanguageId',
            'isEditWallpaperLanguage',
            'WallpaperLangId',
        ];
        data.forEach((c) => {
            this.localstorageService.removeItem(c);
        });
    }
}
