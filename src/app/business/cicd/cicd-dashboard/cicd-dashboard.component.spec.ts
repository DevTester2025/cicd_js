import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CicdDashboardComponent } from './cicd-dashboard.component';

describe('CicdDashboardComponent', () => {
  let component: CicdDashboardComponent;
  let fixture: ComponentFixture<CicdDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CicdDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CicdDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
