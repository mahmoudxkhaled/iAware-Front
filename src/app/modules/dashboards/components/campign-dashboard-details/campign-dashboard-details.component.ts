import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-campign-dashboard-details',
  templateUrl: './campign-dashboard-details.component.html',
  styleUrl: './campign-dashboard-details.component.scss'
})
export class CampignDashboardDetailsComponent implements OnInit {
  campaignId: string;

  constructor(private router: ActivatedRoute) { }

  ngOnInit(): void {
    const x = this.router.params.subscribe((params) => {
      this.campaignId = params['id'];
    });
  }

}