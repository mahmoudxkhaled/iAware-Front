import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LibraryBackgroundWizardComponent } from './components/wallpaper-list-wizard/steps/library-background-wizard/library-background-wizard.component';
import { LibraryCharacterWizardComponent } from './components/wallpaper-list-wizard/steps/library-character-wizard/library-character-wizard.component';
import { LibraryQuoteWizardComponent } from './components/wallpaper-list-wizard/steps/library-quote-wizard/library-quote-wizard.component';
import { WallpaperCreateWizardComponent } from './components/wallpaper-list-wizard/steps/wallpaper-create-wizard/wallpaper-create-wizard.component';
import { WallpaperListWizardComponent } from './components/wallpaper-list-wizard/wallpaper-list-wizard.component';
import { WallLangListWizComponent } from './components/wall-lang-list-wiz/wall-lang-list-wiz.component';
import { WallCreateLangWizComponent } from './components/wall-lang-list-wiz/steps/wall-create-lang-wiz/wall-create-lang-wiz.component';
import { BackgroundLangWizComponent } from './components/wall-lang-list-wiz/steps/background-lang-wiz/background-lang-wiz.component';
import { CharacterLangWizComponent } from './components/wall-lang-list-wiz/steps/character-lang-wiz/character-lang-wiz.component';
import { QuoteLangWizComponent } from './components/wall-lang-list-wiz/steps/quote-lang-wiz/quote-lang-wiz.component';
import { WallPreviewComponent } from './components/wallpaper-list-wizard/steps/wall-preview/wall-preview.component';
import { WallLangPreviewComponent } from './components/wall-lang-list-wiz/steps/wall-lang-preview/wall-lang-preview.component';

const routes: Routes = [
    { path: '', component: WallpaperListWizardComponent },
    {
        path: 'create',
        component: WallpaperCreateWizardComponent,
        children: [
            {
                path: '',
                redirectTo: 'wallpapers',
                pathMatch: 'full',
            },
            {
                path: 'background',
                component: LibraryBackgroundWizardComponent,
            },
            {
                path: 'character',
                component: LibraryCharacterWizardComponent,
            },
            {
                path: 'quote',
                component: LibraryQuoteWizardComponent,
            },
            {
                path: 'preview',
                component: WallPreviewComponent,
            },
        ],
    },
    { path: ':id/:wallName/:where', component: WallLangListWizComponent },

    {
        path: ':id/:wallName/createWallpaperLanguage',
        component: WallCreateLangWizComponent,

        children: [
            { path: 'background', component: BackgroundLangWizComponent },
            { path: 'character', component: CharacterLangWizComponent },
            { path: 'quote', component: QuoteLangWizComponent },
            { path: 'preview', component: WallLangPreviewComponent },
        ],
    },
];
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class WallpaperWizardRoutingModule {}
