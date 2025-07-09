import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignBonusPointsComponent } from './assign-bonus-points.component';

describe('AssignBonusPointsComponent', () => {
  let component: AssignBonusPointsComponent;
  let fixture: ComponentFixture<AssignBonusPointsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignBonusPointsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignBonusPointsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
