import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetpointAccumulationRulesComponent } from './setpoint-accumulation-rules.component';

describe('SetpointAccumulationRulesComponent', () => {
  let component: SetpointAccumulationRulesComponent;
  let fixture: ComponentFixture<SetpointAccumulationRulesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SetpointAccumulationRulesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SetpointAccumulationRulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
