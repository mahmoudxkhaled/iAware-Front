import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LibraryBackgroundComponent } from './components/library-background/library-background.component';
import { LibraryLanguageCharacterComponent } from './components/library-language-character/library-language-character.component';
import { LibraryLanguageQuoteComponent } from './components/library-language-quote/library-language-quote.component';
import { LibraryWallpaperComponent } from './components/library-wallpaper/library-wallpaper.component';
import { LibraryWallpaperLanguageComponent } from './components/library-wallpaper-language/library-wallpaper-language.component';
import { LibraryWallpaperIngredientsComponent } from './components/library-wallpaper-ingredients/library-wallpaper-ingredients.component';

const routes: Routes = [
    {
        path: 'LibraryBackground',
        component: LibraryBackgroundComponent,
    },

    {
        path: 'LibraryLanguageCharacter',
        component: LibraryLanguageCharacterComponent,
    },

    {
        path: 'LibraryLanguageQuote',
        component: LibraryLanguageQuoteComponent,
    },
    {
        path: 'LibraryWallpaper',
        component: LibraryWallpaperComponent,
    },
    {
        path: 'LibraryWallpaperIngredients',
        component: LibraryWallpaperIngredientsComponent,
    },

    {
        path: ':id/:wallName',
        component: LibraryWallpaperLanguageComponent,
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class WallpaperLibrariesRoutingModule {}
