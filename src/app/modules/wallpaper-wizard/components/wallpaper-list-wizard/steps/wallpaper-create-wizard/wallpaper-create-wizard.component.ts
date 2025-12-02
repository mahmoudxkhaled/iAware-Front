import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { finalize, Subscription } from 'rxjs';
import { LocalStorageService } from 'src/app/core/Services/local-storage.service';
import { TranslationService } from 'src/app/core/Services/translation.service';
import { ILanguageModel } from 'src/app/modules/language/models/ILanguageModel';
import { WallpaperLibrariesService } from 'src/app/modules/wallpaper-libraries/services/wallpaper-libraries.service';

@Component({
    selector: 'app-wallpaper-create-wizard',
    templateUrl: './wallpaper-create-wizard.component.html',
    styleUrl: './wallpaper-create-wizard.component.scss',
})
export class WallpaperCreateWizardComponent implements OnInit, AfterViewInit, OnDestroy {
    routeItems: MenuItem[] = [];
    activeIndex: number = 1;
    completed = 0;
    defaultLanguage: ILanguageModel[] = [];
    subs: Subscription = new Subscription();

    constructor(
        private localstorageService: LocalStorageService,
        private elRef: ElementRef,
        private renderer: Renderer2,
        private wallServ: WallpaperLibrariesService,
        private translate: TranslationService
    ) {}

    ngOnInit(): void {
        this.routeItems = [
            {
                label:  this.translate.getInstant('wallpaper-wizard.wallpaper-list-wizard.wallpaper-create-wizard.background'),
                routerLink: 'background',
                disabled: false,
            },
            {
                label:  this.translate.getInstant('wallpaper-wizard.wallpaper-list-wizard.wallpaper-create-wizard.character'),
                routerLink: 'character',
                disabled: false,
            },
            {
                label:  this.translate.getInstant('wallpaper-wizard.wallpaper-list-wizard.wallpaper-create-wizard.quote'),
                routerLink: 'quote',
                disabled: false,
            },
            {
                label:  this.translate.getInstant('wallpaper-wizard.wallpaper-list-wizard.wallpaper-create-wizard.schedule'),
                routerLink: 'preview',
                disabled: false,
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
            'selectedLanguage',
        ];
        data.forEach((c) => {
            this.localstorageService.removeItem(c);
        });
    }
}
