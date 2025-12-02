import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WallpaperWizardRoutingModule } from './wallpaper-wizard-routing.module';
import { SharedModule } from 'src/app/Shared/shared/shared.module';
import { LibraryQuoteWizardComponent } from './components/wallpaper-list-wizard/steps/library-quote-wizard/library-quote-wizard.component';
import { WallpaperListWizardComponent } from './components/wallpaper-list-wizard/wallpaper-list-wizard.component';
import { WallpaperCreateWizardComponent } from './components/wallpaper-list-wizard/steps/wallpaper-create-wizard/wallpaper-create-wizard.component';
import { LibraryCharacterWizardComponent } from './components/wallpaper-list-wizard/steps/library-character-wizard/library-character-wizard.component';
import { LibraryBackgroundWizardComponent } from './components/wallpaper-list-wizard/steps/library-background-wizard/library-background-wizard.component';
import { WallLangListWizComponent } from './components/wall-lang-list-wiz/wall-lang-list-wiz.component';
import { CharacterLangWizComponent } from './components/wall-lang-list-wiz/steps/character-lang-wiz/character-lang-wiz.component';
import { QuoteLangWizComponent } from './components/wall-lang-list-wiz/steps/quote-lang-wiz/quote-lang-wiz.component';
import { BackgroundLangWizComponent } from './components/wall-lang-list-wiz/steps/background-lang-wiz/background-lang-wiz.component';
import { WallCreateLangWizComponent } from './components/wall-lang-list-wiz/steps/wall-create-lang-wiz/wall-create-lang-wiz.component';
import { WallPreviewComponent } from './components/wallpaper-list-wizard/steps/wall-preview/wall-preview.component';
import { WallLangPreviewComponent } from './components/wall-lang-list-wiz/steps/wall-lang-preview/wall-lang-preview.component';

@NgModule({
    declarations: [
        WallpaperListWizardComponent,
        WallpaperCreateWizardComponent,
        LibraryBackgroundWizardComponent,
        LibraryCharacterWizardComponent,
        LibraryQuoteWizardComponent,
        WallPreviewComponent,
        WallLangListWizComponent,
        CharacterLangWizComponent,
        QuoteLangWizComponent,
        BackgroundLangWizComponent,
        WallCreateLangWizComponent,
        WallLangPreviewComponent,
    ],
    imports: [CommonModule, WallpaperWizardRoutingModule, SharedModule],
    exports: [WallpaperListWizardComponent],
})
export class WallpaperWizardModule {}
