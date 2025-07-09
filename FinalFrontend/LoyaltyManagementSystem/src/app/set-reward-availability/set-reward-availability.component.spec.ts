import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetRewardAvailabilityComponent } from './set-reward-availability.component';

describe('SetRewardAvailabilityComponent', () => {
  let component: SetRewardAvailabilityComponent;
  let fixture: ComponentFixture<SetRewardAvailabilityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SetRewardAvailabilityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SetRewardAvailabilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
