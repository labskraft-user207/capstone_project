import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreadminDashboardComponent } from './storeadmin-dashboard.component';

describe('StoreadminDashboardComponent', () => {
  let component: StoreadminDashboardComponent;
  let fixture: ComponentFixture<StoreadminDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreadminDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StoreadminDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
