import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-dashboard-training-progress',
  templateUrl: './user-dashboard-training-progress.component.html',
  styleUrls: ['./user-dashboard-training-progress.component.scss'],
})
export class UserDashboardTrainingProgressComponent implements OnChanges {
  @Input() totalAssignments!: number;
  @Input() completedAssignments!: number;
  @Input() progress!: number;

  constructor(private router: Router) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['progress'] && changes['progress'].currentValue !== changes['progress'].previousValue) {
      this.initiateLoader();
    }
  }

  initiateLoader(): void {
    const progressBar = document.querySelector('.progress-bar-inner') as HTMLElement | null;
    const progressPercentage = document.querySelector('.progress-percentage') as HTMLElement | null;

    if (!progressBar || !progressPercentage) {
      console.error('Progress bar or progress percentage element not found.');
      return;
    }

    let currentProgress = 0;
    const interval = setInterval(() => {
      if (currentProgress >= this.progress) {
        clearInterval(interval);
      } else {
        currentProgress += 1; // Increment for animation
        progressBar.style.width = `${currentProgress}%`;
        progressPercentage.textContent = `${Math.floor(currentProgress)}%`;
      }
    }, 10); // Animation speed
  }

  navigateToTraining(): void {
    this.router.navigate(['/training-campaign']);
  }
}