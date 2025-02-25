import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddeditRequestManagementComponent } from './addedit-request-management.component';

describe('AddeditRequestManagementComponent', () => {
  let component: AddeditRequestManagementComponent;
  let fixture: ComponentFixture<AddeditRequestManagementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddeditRequestManagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddeditRequestManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
