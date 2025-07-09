import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateManageRewardsComponent } from './create-manage-rewards.component';

describe('CreateManageRewardsComponent', () => {
  let component: CreateManageRewardsComponent;
  let fixture: ComponentFixture<CreateManageRewardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateManageRewardsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateManageRewardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
