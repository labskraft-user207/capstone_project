import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RedeempointsComponent } from './redeempoints.component';

describe('RedeempointsComponent', () => {
  let component: RedeempointsComponent;
  let fixture: ComponentFixture<RedeempointsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RedeempointsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RedeempointsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
