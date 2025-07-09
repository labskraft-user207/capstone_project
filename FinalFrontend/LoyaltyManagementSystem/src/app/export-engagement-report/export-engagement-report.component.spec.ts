import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportEngagementReportComponent } from './export-engagement-report.component';

describe('ExportEngagementReportComponent', () => {
  let component: ExportEngagementReportComponent;
  let fixture: ComponentFixture<ExportEngagementReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExportEngagementReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExportEngagementReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
