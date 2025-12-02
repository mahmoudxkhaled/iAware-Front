import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WallpaperLibrariesRoutingModule } from './wallpaper-libraries-routing.module';
import { LibraryBackgroundComponent } from './components/library-background/library-background.component';
import { LibraryLanguageCharacterComponent } from './components/library-language-character/library-language-character.component';
import { LibraryLanguageQuoteComponent } from './components/library-language-quote/library-language-quote.component';
import { LibraryWallpaperComponent } from './components/library-wallpaper/library-wallpaper.component';
import { LibraryWallpaperLanguageComponent } from './components/library-wallpaper-language/library-wallpaper-language.component';
import { SharedModule } from 'src/app/Shared/shared/shared.module';
import { LibraryWallpaperIngredientsComponent } from './components/library-wallpaper-ingredients/library-wallpaper-ingredients.component';

@NgModule({
    declarations: [
        LibraryBackgroundComponent,
        LibraryLanguageCharacterComponent,
        LibraryLanguageQuoteComponent,
        LibraryWallpaperComponent,
        LibraryWallpaperLanguageComponent,
        LibraryWallpaperIngredientsComponent,
    ],
    imports: [SharedModule, WallpaperLibrariesRoutingModule],
    exports: [LibraryWallpaperIngredientsComponent],
})
export class WallpaperLibrariesModule {}
