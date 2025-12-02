import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/Shared/shared/shared.module';
import { GamesListComponent } from './components/games-list/games-list.component';
import { GamificationRoutingModule } from './gamification-routing.module';
import { GameEditComponent } from './components/game-edit/game-edit.component';

@NgModule({
    declarations: [GamesListComponent, GameEditComponent],
    imports: [CommonModule, GamificationRoutingModule, SharedModule],
})
export class GamificationModule {}
