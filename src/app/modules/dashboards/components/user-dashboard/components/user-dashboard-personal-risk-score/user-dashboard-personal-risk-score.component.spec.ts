import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserDashboardPersonalRiskScoreComponent } from './user-dashboard-personal-risk-score.component';

describe('UserDashboardPersonalRiskScoreComponent', () => {
  let component: UserDashboardPersonalRiskScoreComponent;
  let fixture: ComponentFixture<UserDashboardPersonalRiskScoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserDashboardPersonalRiskScoreComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserDashboardPersonalRiskScoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
