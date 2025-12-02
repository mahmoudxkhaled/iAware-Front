import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GamesListComponent } from './components/games-list/games-list.component';
import { GameEditComponent } from './components/game-edit/game-edit.component';

const routes: Routes = [
    {
        path: '',
        component: GamesListComponent,
    },
    {
        path: 'edit',
        component: GameEditComponent,
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class GamificationRoutingModule {}
