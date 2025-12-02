import { NgModule } from '@angular/core';
import { LeaderboardRoutingModule } from './leaderboard-routing.module';
import { SharedModule } from 'src/app/Shared/shared/shared.module';

@NgModule({
  declarations: [],
  imports: [
    SharedModule,
    LeaderboardRoutingModule,
  ]
})
export class LeaderboardModule { }