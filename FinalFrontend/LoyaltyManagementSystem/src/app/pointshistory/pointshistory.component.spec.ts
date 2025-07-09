import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PointshistoryComponent } from './pointshistory.component';

describe('PointshistoryComponent', () => {
  let component: PointshistoryComponent;
  let fixture: ComponentFixture<PointshistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PointshistoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PointshistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
