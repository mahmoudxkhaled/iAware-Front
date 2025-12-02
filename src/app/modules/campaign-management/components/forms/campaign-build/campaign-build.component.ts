import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorageService } from 'src/app/core/Services/local-storage.service';
import introJs from 'intro.js';

@Component({
  selector: 'app-campaign-build',
  templateUrl: './campaign-build.component.html',
  styleUrl: './campaign-build.component.scss'
})
export class CampaignBuildComponent implements OnInit {

  campaignType: number;
  doNotShaowLessonsStepsAgain: boolean = false;
  doNotShaowTemplatesStepsAgain: boolean = false;
  introJS = introJs.tour();
  
  constructor(private localStorageService: LocalStorageService, private router: Router) { }
  
  ngOnInit(): void {
    const data = this.localStorageService.getItem('type');
    if (data != null) {
      this.campaignType = data;
    } else {
      this.router.navigate(['campaign-management/create/type']);
    }   
  }    
}