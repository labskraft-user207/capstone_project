import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RewardscatalogComponent } from './rewardscatalog.component';

describe('RewardscatalogComponent', () => {
  let component: RewardscatalogComponent;
  let fixture: ComponentFixture<RewardscatalogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RewardscatalogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RewardscatalogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
