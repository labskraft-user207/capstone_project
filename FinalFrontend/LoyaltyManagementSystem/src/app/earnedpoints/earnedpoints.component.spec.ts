import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EarnedpointsComponent } from './earnedpoints.component';

describe('EarnedpointsComponent', () => {
  let component: EarnedpointsComponent;
  let fixture: ComponentFixture<EarnedpointsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EarnedpointsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EarnedpointsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
