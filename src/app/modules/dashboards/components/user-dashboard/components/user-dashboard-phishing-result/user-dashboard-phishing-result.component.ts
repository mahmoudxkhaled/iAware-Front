import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-user-dashboard-phishing-result',
  templateUrl: './user-dashboard-phishing-result.component.html',
  styleUrl: './user-dashboard-phishing-result.component.scss'
})
export class UserDashboardPhishingResultComponent {
  @Input() emailsDelivered!: number;
  @Input() emailsReported!: number;
  @Input() emailsReportedPercentage!: number;
  @Input() emailsFailures!: number;
  @Input() emailsFailuresPercentage!: number;
}