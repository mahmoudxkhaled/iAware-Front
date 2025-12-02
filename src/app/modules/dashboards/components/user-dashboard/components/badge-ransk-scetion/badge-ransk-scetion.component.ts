import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-badge-ransk-scetion',
  templateUrl: './badge-ransk-scetion.component.html',
  styleUrl: './badge-ransk-scetion.component.scss'
})
export class BadgeRanskScetionComponent {

  @Input() userTeanatUnitRankedNumber! : number
  @Input() usersBadgesEarnedNumber! : number

  constructor(private router : Router) { }

  navigateToLeaderboard(){
    this.router.navigate(['/leaderboard']);
  }

  navigateToHowLearnBadge() {
    const queryParams = { tapIndex: 1 };
    this.router.navigate(['/users/profile'], { queryParams });
  }
}