import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAllUsersPointsDetailsComponent } from './view-all-users-points-details.component';

describe('ViewAllUsersPointsDetailsComponent', () => {
  let component: ViewAllUsersPointsDetailsComponent;
  let fixture: ComponentFixture<ViewAllUsersPointsDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewAllUsersPointsDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewAllUsersPointsDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
