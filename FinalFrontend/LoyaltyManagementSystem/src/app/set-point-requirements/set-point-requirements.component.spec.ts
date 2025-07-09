import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetPointRequirementsComponent } from './set-point-requirements.component';

describe('SetPointRequirementsComponent', () => {
  let component: SetPointRequirementsComponent;
  let fixture: ComponentFixture<SetPointRequirementsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SetPointRequirementsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SetPointRequirementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
